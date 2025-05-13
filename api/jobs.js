export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // or Webflow domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  const BEARER_TOKEN = 'Bearer YOUR_TOKEN';
  if (!id) return res.status(400).json({ error: 'Missing job ID' });

  try {
    const response = await fetch(`https://app.loxo.co/api/jobs/${id}`, {
      headers: {
        Authorization: BEARER_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Loxo single job fetch error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Job not found', details: errorText });
    }

    const job = await response.json();
    return res.status(200).json(job);
  } catch (err) {
    console.error('❌ Server error fetching job:', err);
    return res.status(500).json({ error: 'Unable to fetch job details.' });
  }
}
