// api/verify-payment.js
// Weryfikuje czy Checkout Session została opłacona
// Wywoływany przez przeglądarkę po powrocie ze Stripe

const https = require('https')

function stripeGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.stripe.com',
      path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY
      }
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) })
        } catch (e) { resolve({ status: res.statusCode, data }) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://aikurs.github.io')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed')

  const sessionId = req.query.session_id

  if (!sessionId) {
    return res.status(400).json({ error: 'Brak session_id' })
  }

  try {
    const result = await stripeGet('/v1/checkout/sessions/' + sessionId)

    if (result.status !== 200) {
      return res.status(400).json({ error: 'Nie znaleziono sesji' })
    }

    const session = result.data
    const paid = session.payment_status === 'paid'

    return res.status(200).json({
      paid,
      email: session.customer_email || session.customer_details?.email,
      status: session.payment_status
    })

  } catch (err) {
    console.error('Verify error:', err)
    return res.status(500).json({ error: err.message })
  }
}
