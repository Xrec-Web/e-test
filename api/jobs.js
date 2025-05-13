export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://empoweredrecruitment-ec87a032a3d444380f.webflow.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const AGENCY_SLUG = 'skys-the-limit-staffing';
  const BEARER_TOKEN = 'Bearer 00eec6549ea1dc3...'; // still secure since this is server-side

  try {
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs`, {
      headers: {
        Authorization: BEARER_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
