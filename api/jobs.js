export default async function handler(req, res) {
  // ✅ Allow cross-origin requests from anywhere (or restrict to Webflow domain if preferred)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, JobId');

  // ✅ Handle preflight (CORS pre-check)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BEARER_TOKEN = process.env.BEARER_TOKEN;
  const URL_SLUG = process.env.URL_SLUG;

  if (!BEARER_TOKEN || !URL_SLUG) {
    return res.status(400).json({ error: 'Missing environment variables' });
  }

  try {
    const response = await fetch(`https://api.loxo.co/api/v1/company/${URL_SLUG}/jobs`, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch jobs' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
