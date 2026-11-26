const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!apiKey || !Number.isInteger(listId) || listId < 1) {
    return res.status(503).json({ error: 'Subscription service is not configured.' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const consent = req.body?.consent === true;
  if (!EMAIL_PATTERN.test(email) || email.length > 254 || !consent) {
    return res.status(400).json({ error: 'Enter a valid email and agree to receive product updates.' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
        attributes: { EMAIL: email }
      })
    });

    if (response.ok || response.status === 204) {
      return res.status(200).json({ ok: true });
    }

    const details = await response.json().catch(() => ({}));
    if (response.status === 400 && /already exists/i.test(details.message || '')) {
      return res.status(200).json({ ok: true });
    }
    console.error('Brevo contact creation failed:', response.status, details.code || 'unknown');
    return res.status(502).json({ error: 'We could not save your subscription. Please try again later.' });
  } catch (error) {
    console.error('Brevo request failed:', error.message);
    return res.status(502).json({ error: 'We could not reach the subscription service. Please try again later.' });
  }
};
