// File: /api/jobs.js

export default async function handler(req, res) {
  // Allow Webflow to access this API
  res.setHeader('Access-Control-Allow-Origin', 'https://empoweredrecruitment-ec87a032a3d444380f.webflow.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Environment variables
  const AGENCY_SLUG = process.env.AGENCY_SLUG;
  const BEARER_TOKEN = process.env.LOXO_BEARER_TOKEN;

  if (!AGENCY_SLUG || !BEARER_TOKEN) {
    return res.status(500).json({
      error: 'Missing environment variables',
      detail: {
        AGENCY_SLUG: !!AGENCY_SLUG,
        BEARER_TOKEN_SET: !!BEARER_TOKEN,
      },
    });
  }

  const jobId = req.query.id;

  const endpoint = jobId
    ? `https://app.loxo.co/api/${AGENCY_SLUG}/jobs/${jobId}`
    : `https://app.loxo.co/api/${AGENCY_SLUG}/jobs`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Loxo API error ${response.status}`,
        detail: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Server error:', err.message);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
