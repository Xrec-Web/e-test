// File: /api/job.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Replace with your Webflow.io URL in production
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const jobId = req.query.id;
  if (!jobId) {
    return res.status(400).json({
      error: 'Missing required parameters',
      detail: { jobId },
    });
  }

  const AGENCY_SLUG = process.env.URL_SLUG;
  const BEARER_TOKEN = process.env.BEARER_TOKEN;

  if (!AGENCY_SLUG || !BEARER_TOKEN) {
    return res.status(500).json({
      error: 'Missing required environment variables',
      detail: {
        AGENCY_SLUG,
        tokenSet: !!BEARER_TOKEN,
      },
    });
  }

  try {
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/job/${jobId}`, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Loxo API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Failed to fetch job', detail: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({
      error: 'Unable to load job details. Please try again later.',
      detail: error.message,
    });
  }
}
