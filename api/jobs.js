export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Use Webflow domain in prod
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const jobId = req.query.id;
  const AGENCY_SLUG = process.env.URL_SLUG;
  const RAW_TOKEN = process.env.BEARER_TOKEN;

  if (!AGENCY_SLUG || !RAW_TOKEN) {
    return res.status(500).json({
      error: 'Missing environment variables',
      detail: {
        AGENCY_SLUG: !!AGENCY_SLUG,
        BEARER_TOKEN_SET: !!RAW_TOKEN,
      },
    });
  }

  if (!jobId) {
    return res.status(400).json({
      error: 'Missing required parameters',
      detail: { id: false },
    });
  }

  try {
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${RAW_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Loxo API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Failed to fetch job', detail: errorText });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('❌ Server error:', err.message);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
