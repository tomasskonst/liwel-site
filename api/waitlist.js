// Vercel serverless function: adds a waitlist signup to a Brevo contact list.
// Set these in Vercel > Project > Settings > Environment Variables:
//   BREVO_API_KEY   your Brevo API key (Brevo > SMTP & API > API keys)
//   BREVO_LIST_ID   the numeric id of the list signups should join (Brevo > Contacts > Lists)
//   BREVO_COUNTRY_ATTRIBUTE  optional: name of a text contact attribute to store the country in, e.g. COUNTRY

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  // Honeypot: real people never fill this hidden field.
  if (body.company) { return res.status(200).json({ ok: true }); }

  const email = String(body.email || '').trim().toLowerCase();
  const firstName = String(body.firstName || '').trim().slice(0, 60);
  const country = String(body.country || '').trim().slice(0, 60);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (body.consent !== true) {
    return res.status(400).json({ error: 'Consent required' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!apiKey || !listId) {
    console.error('Waitlist: BREVO_API_KEY or BREVO_LIST_ID is not set');
    return res.status(500).json({ error: 'Waitlist is not configured' });
  }

  const attributes = {};
  if (firstName) attributes.FIRSTNAME = firstName;
  if (country && process.env.BREVO_COUNTRY_ATTRIBUTE) attributes[process.env.BREVO_COUNTRY_ATTRIBUTE] = country;

  try {
    const r = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, attributes, listIds: [listId], updateEnabled: true })
    });
    if (r.status === 201 || r.status === 204) {
      return res.status(200).json({ ok: true });
    }
    const text = await r.text();
    console.error('Waitlist: Brevo responded', r.status, text);
    return res.status(502).json({ error: 'Could not add contact' });
  } catch (err) {
    console.error('Waitlist: request failed', err);
    return res.status(502).json({ error: 'Could not add contact' });
  }
};
