// File: /api/job.js

export default async function handler(req, res) {
  // CORS headers to allow Webflow access
  res.setHeader('Access-Control-Allow-Origin', 'https://empoweredrecruitment-ec87a032a3d444380f.webflow.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight (OPTIONS)
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Environment variables
  const AGENCY_SLUG = process.env.AGENCY_SLUG;
  const BEARER_TOKEN = process.env.LOXO_BEARER_TOKEN;

  if (!AGENCY_SLUG || !BEARER_TOKEN) {
    return res.status(500).json({
      error: 'Missing environment variables',
      detail: {
        AGENCY_SLUG_PRESENT: !!AGENCY_SLUG,
        BEARER_TOKEN_PRESENT: !!BEARER_TOKEN,
      },
    });
  }

  const jobId = req.query.id;

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  try {
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Loxo API responded with status ${response.status}`,
        detail: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error fetching job detail:', error.message);
    return res.status(500).json({
      error: 'Server error',
      detail: error.message,
    });
  }
}
