export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, JobId');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🔐 Hardcoded for testing — remove this for production!
  const BEARER_TOKEN = 'Bearer 00eec6549ea1dc3cc215ad33483ce488fe012a33c9e4d2c96d6d48c38050299fe69e6591b34961f81ec24e32f590a4db7ea313e6b2e100c9a764d1a337b83c4095d3d20a4abe060da296c4e3dfcec8e59b4284c21e99d3de71a8a523a8a9333ecd1e3172e53bf6bd639a1917648a0a278f8414de681aa37b081f51560f4b2843';
  const URL_SLUG = 'empowered-recruitment'; // Update if different

  try {
    const response = await fetch(`https://api.loxo.co/api/v1/company/${URL_SLUG}/jobs`, {
      headers: {
        Authorization: BEARER_TOKEN,
      },
    });

    if (!response.ok) {
      console.error('❌ Loxo API returned error:', response.status);
      return res.status(response.status).json({ error: 'Failed to fetch jobs' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
