// api/stripe-webhook.js
const https = require('https')
const crypto = require('crypto')

function verifyStripeSignature(payload, signature, secret) {
  const parts = signature.split(',')
  const timestamp = parts.find(p => p.startsWith('t=')).slice(2)
  const v1 = parts.find(p => p.startsWith('v1=')).slice(3)
  const signedPayload = `${timestamp}.${payload}`
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(v1, 'hex'),
    Buffer.from(expected, 'hex')
  )
}

async function firebaseRequest(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const body = data ? JSON.stringify(data) : null
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${projectId}/databases/(default)/documents${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
      }
    }
    const req = https.request(options, res => {
      let responseData = ''
      res.on('data', chunk => responseData += chunk)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(responseData) })
        } catch (e) { resolve({ status: res.statusCode, data: responseData }) }
      })
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

async function getFirebaseToken() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  const jwt = require('jsonwebtoken')
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }
  const assertion = jwt.sign(payload, serviceAccount.private_key, { algorithm: 'RS256' })

  return new Promise((resolve, reject) => {
    const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${assertion}`
    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        const parsed = JSON.parse(data)
        parsed.access_token ? resolve(parsed.access_token) : reject(new Error('Token error: ' + data))
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function findUserByEmail(email) {
  const token = await getFirebaseToken()
  const projectId = process.env.FIREBASE_PROJECT_ID

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'uczniowie' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'email' },
            op: 'EQUAL',
            value: { stringValue: email }
          }
        },
        limit: 1
      }
    })
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const results = JSON.parse(data)
          if (results[0] && results[0].document) {
            const name = results[0].document.name
            const uid = name.split('/').pop()
            resolve(uid)
          } else {
            resolve(null)
          }
        } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function activateUser(uid, tier, paymentId) {
  const token = await getFirebaseToken()
  const now = new Date().toISOString()
  const result = await firebaseRequest(
    'PATCH',
    `/uczniowie/${uid}?updateMask.fieldPaths=paid&updateMask.fieldPaths=approved&updateMask.fieldPaths=tier&updateMask.fieldPaths=paymentId&updateMask.fieldPaths=paidAt`,
    {
      fields: {
        paid:      { booleanValue: true },
        approved:  { booleanValue: true },
        tier:      { integerValue: tier || 2 },
        paymentId: { stringValue: paymentId || '' },
        paidAt:    { timestampValue: now }
      }
    },
    token
  )
  return result
}

// =============================================
// GŁÓWNY HANDLER — format Vercel
// =============================================
export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const signature = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let stripeEvent
  try {
    const rawBody = await getRawBody(req)
    if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
      console.error('Nieprawidłowy podpis Stripe!')
      return res.status(401).send('Invalid signature')
    }
    stripeEvent = JSON.parse(rawBody)
  } catch (err) {
    console.error('Błąd weryfikacji:', err.message)
    return res.status(400).send('Webhook error: ' + err.message)
  }

  if (stripeEvent.type !== 'checkout.session.completed' &&
      stripeEvent.type !== 'payment_intent.succeeded') {
    return res.status(200).send('Event ignored: ' + stripeEvent.type)
  }

  try {
    const session = stripeEvent.data.object
    const email = session.customer_email ||
                  session.customer_details?.email ||
                  session.receipt_email

    if (!email) {
      console.error('Brak emaila w sesji:', session.id)
      return res.status(200).send('No email in session')
    }

    console.log('Płatność od:', email, '| Sesja:', session.id)

    const uid = await findUserByEmail(email)

    if (!uid) {
      console.warn('Nie znaleziono użytkownika dla emaila:', email)
      const token = await getFirebaseToken()
      await firebaseRequest('PATCH',
        `/platnosci_oczekujace/${session.id}`,
        {
          fields: {
            email:     { stringValue: email },
            sessionId: { stringValue: session.id },
            amount:    { integerValue: session.amount_total || 0 },
            createdAt: { timestampValue: new Date().toISOString() },
            status:    { stringValue: 'pending_user' }
          }
        },
        token
      )
      return res.status(200).send('Payment saved, user not found yet')
    }

    const result = await activateUser(uid, 2, session.id)

    if (result.status === 200) {
      console.log('✓ Aktywowano:', uid, email)
      return res.status(200).json({ success: true, uid, email })
    } else {
      console.error('Błąd Firestore:', result.data)
      return res.status(500).send('Firestore error')
    }

  } catch (err) {
    console.error('Błąd handlera:', err)
    return res.status(500).send('Server error: ' + err.message)
  }
}

// Vercel wymaga raw body do weryfikacji podpisu Stripe
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => data += chunk)
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}
