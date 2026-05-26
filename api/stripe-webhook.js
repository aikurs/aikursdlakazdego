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

async function getFirebaseToken() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  const jwt = require('jsonwebtoken')
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase',
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

async function firestoreRequest(method, path, data, token) {
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

// Tworzy użytkownika w Firebase Auth i zwraca uid
async function createFirebaseAuthUser(email, name, token) {
  return new Promise((resolve, reject) => {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const body = JSON.stringify({
      email,
      displayName: name,
      password: crypto.randomBytes(16).toString('hex'),
      emailVerified: false,
      disabled: false
    })
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/projects/${projectId}/accounts`,
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
          const parsed = JSON.parse(data)
          if (parsed.localId) {
            resolve({ uid: parsed.localId, created: true })
          } else if (parsed.error?.message === 'EMAIL_EXISTS') {
            resolve({ uid: null, created: false, exists: true })
          } else {
            reject(new Error('Firebase Auth error: ' + JSON.stringify(parsed)))
          }
        } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// Pobierz uid istniejącego użytkownika po emailu z Firebase Auth
async function getUidByEmail(email, token) {
  return new Promise((resolve, reject) => {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const body = JSON.stringify({ email: [email] })
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/projects/${projectId}/accounts:lookup`,
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
          const parsed = JSON.parse(data)
          if (parsed.users && parsed.users[0]) {
            resolve(parsed.users[0].localId)
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

// Wyślij email z resetem hasła przez Firebase Auth REST API
async function sendPasswordResetEmail(email) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.FIREBASE_API_KEY
    const body = JSON.stringify({
      requestType: 'PASSWORD_RESET',
      email
    })
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:sendOobCode?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.email) {
            console.log('✓ Email z hasłem wysłany do:', email)
            resolve(parsed)
          } else {
            console.error('Email error:', JSON.stringify(parsed))
            resolve(null) // nie rzucaj błędu — konto już jest utworzone
          }
        } catch (e) { resolve(null) }
      })
    })
    req.on('error', e => { console.error('Email request error:', e); resolve(null) })
    req.write(body)
    req.end()
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const signature = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let rawBody = ''
  await new Promise((resolve, reject) => {
    req.on('data', chunk => rawBody += chunk)
    req.on('end', resolve)
    req.on('error', reject)
  })

  let stripeEvent
  try {
    if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
      console.error('Nieprawidłowy podpis Stripe!')
      return res.status(401).send('Invalid signature')
    }
    stripeEvent = JSON.parse(rawBody)
  } catch (err) {
    console.error('Błąd weryfikacji:', err.message)
    return res.status(400).send('Webhook error: ' + err.message)
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    return res.status(200).send('Event ignored: ' + stripeEvent.type)
  }

  const session = stripeEvent.data.object
  const email = session.metadata?.user_email || session.customer_email || session.customer_details?.email
  const name  = session.metadata?.user_name || 'Użytkownik'

  if (!email) {
    console.error('Brak emaila w sesji:', session.id)
    return res.status(200).send('No email in session')
  }

  console.log('✓ Płatność od:', email, '| Sesja:', session.id)

  try {
    const token = await getFirebaseToken()

    // Sprawdź czy użytkownik już istnieje w Firebase Auth
    let uid = await getUidByEmail(email, token)
    let isNewUser = false

    if (!uid) {
      // Utwórz nowe konto
      const result = await createFirebaseAuthUser(email, name, token)
      if (result.created) {
        uid = result.uid
        isNewUser = true
        console.log('✓ Utworzono konto Firebase Auth:', uid)
      } else if (result.exists) {
        // Konto istnieje — pobierz uid ponownie
        uid = await getUidByEmail(email, token)
        console.log('Konto już istnieje, uid:', uid)
      }
    }

    if (!uid) {
      console.error('Nie udało się ustalić uid dla:', email)
      return res.status(500).send('Could not determine user uid')
    }

    // Zapisz do Firestore
    const firestoreResult = await firestoreRequest(
      'PATCH',
      `/uczniowie/${uid}?updateMask.fieldPaths=email&updateMask.fieldPaths=name&updateMask.fieldPaths=paid&updateMask.fieldPaths=approved&updateMask.fieldPaths=tier&updateMask.fieldPaths=paymentId&updateMask.fieldPaths=paidAt&updateMask.fieldPaths=completed&updateMask.fieldPaths=streak`,
      {
        fields: {
          email:     { stringValue: email },
          name:      { stringValue: name },
          paid:      { booleanValue: true },
          approved:  { booleanValue: true },
          tier:      { integerValue: 2 },
          paymentId: { stringValue: session.id },
          paidAt:    { timestampValue: new Date().toISOString() },
          completed: { arrayValue: { values: [] } },
          streak:    { integerValue: 0 }
        }
      },
      token
    )

    console.log('✓ Firestore status:', firestoreResult.status, 'dla:', uid)

    // Odczekaj 2 sekundy — Firebase musi "zarejestrować" nowe konto
    // zanim będzie można wysłać email z resetem hasła
    await new Promise(r => setTimeout(r, 2000))

    // Wyślij email z linkiem do ustawienia hasła
    await sendPasswordResetEmail(email)

    return res.status(200).json({ success: true, uid, email, newUser: isNewUser })

  } catch (err) {
    console.error('Błąd handlera:', err)
    return res.status(500).send('Server error: ' + err.message)
  }
}
