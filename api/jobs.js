export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // for testing; restrict in prod
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // TEMP: Hardcoded values for testing
 const AGENCY_SLUG = process.env.URL_SLUG;
  const BEARER_TOKEN = `Bearer ${process.env.BEARER_TOKEN}`;

  try {
    const url = `https://api.loxo.co/api/v1/company/${AGENCY_SLUG}/jobs`;
    const response = await fetch(url, {
      headers: {
        Authorization: BEARER_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ Loxo returned error:', response.status, errorBody);
      return res.status(response.status).json({ error: 'Loxo fetch failed', detail: errorBody });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Server error:', err.message);
    return res.status(500).json({ error: 'Unable to load job listings. Please try again later.', detail: err.message });
  }
}
