// api/create-checkout.js
// Tworzy Stripe Checkout Session z danymi użytkownika w metadata

const https = require('https')

function stripeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(data).toString()
    const options = {
      hostname: 'api.stripe.com',
      path,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
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
    req.write(body)
    req.end()
  })
}

export default async function handler(req, res) {
  // CORS — pozwól GitHub Pages wywoływać ten endpoint
  res.setHeader('Access-Control-Allow-Origin', 'https://aikurs.github.io')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  let body = ''
  await new Promise((resolve, reject) => {
    req.on('data', chunk => body += chunk)
    req.on('end', resolve)
    req.on('error', reject)
  })

  let parsed
  try { parsed = JSON.parse(body) }
  catch (e) { return res.status(400).json({ error: 'Invalid JSON' }) }

  const { name, email } = parsed

  if (!name || !email) {
    return res.status(400).json({ error: 'Brak imienia lub emaila' })
  }

  // Utwórz Checkout Session w Stripe
  const result = await stripeRequest('/v1/checkout/sessions', {
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': 'pln',
    'line_items[0][price_data][product_data][name]': 'AI DLA KAŻDEGO 2026 – Tier 2',
    'line_items[0][price_data][unit_amount]': '5000', // 50 zł w groszach
    'line_items[0][quantity]': '1',
    'mode': 'payment',
    'customer_email': email,
    'metadata[user_name]': name,
    'metadata[user_email]': email,
    // Po płatności Stripe wróci na register.html z ?payment=success
    'success_url': 'https://aikurs.github.io/aikursdlakazdego/register.html?payment=success&session_id={CHECKOUT_SESSION_ID}',
    'cancel_url': 'https://aikurs.github.io/aikursdlakazdego/register.html?payment=cancel',
  })

  if (result.status !== 200) {
    console.error('Stripe error:', result.data)
    return res.status(500).json({ error: 'Błąd Stripe: ' + (result.data?.error?.message || 'nieznany') })
  }

  return res.status(200).json({ url: result.data.url })
}
