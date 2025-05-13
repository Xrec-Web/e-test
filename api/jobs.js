export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const AGENCY_SLUG = process.env.URL_SLUG;
  const RAW_TOKEN = process.env.BEARER_TOKEN;
  const BEARER_TOKEN = `Bearer ${RAW_TOKEN}`;

  // 🔍 Debug: Log values to Vercel function logs
  console.log('🔍 ENV DEBUG - AGENCY_SLUG:', AGENCY_SLUG);
  console.log('🔍 ENV DEBUG - RAW_TOKEN:', RAW_TOKEN ? RAW_TOKEN.slice(0, 12) + '...' : 'undefined');

  // If either value is missing, return 500 with clear message
  if (!AGENCY_SLUG || !RAW_TOKEN) {
    return res.status(500).json({
      error: 'Missing environment variables',
      detail: { AGENCY_SLUG, RAW_TOKEN },
    });
  }

  try {
    const url = `https://api.loxo.co/api/v1/company/${AGENCY_SLUG}/jobs`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: BEARER_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error('❌ Loxo error:', response.status, raw);
      return res.status(response.status).json({ error: 'Loxo API error', detail: raw });
    }

    const data = JSON.parse(raw);
    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Server crash:', err.message);
    return res.status(500).json({ error: 'fetch failed', detail: err.message });
  }
}
