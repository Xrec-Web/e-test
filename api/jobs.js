export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const AGENCY_SLUG = 'skys-the-limit-staffing';
  const BEARER_TOKEN = 'Bearer 00eec6549ea1dc3cc215ad33483ce488fe012a33c9e4d2c96d6d48c38050299fe69e6591b34961f81ec24e32f590a4db7ea313e6b2e100c9a764d1a337b83c4095d3d20a4abe060da296c4e3dfcec8e59b4284c21e99d3de71a8a523a8a9333ecd1e3172e53bf6bd639a1917648a0a278f8414de681aa37b081f51560f4b2843';

  try {
    const url = `https://api.loxo.co/api/v1/company/${AGENCY_SLUG}/jobs`;
    console.log('🌍 Fetching:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: BEARER_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Loxo responded with:', response.status, errorText);
      return res.status(response.status).json({ error: 'Loxo error', status: response.status, detail: errorText });
    }

    const data = await response.json();
    console.log('✅ Loxo job data received:', Array.isArray(data.results) ? data.results.length : 'no results key');
    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Server crashed:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
