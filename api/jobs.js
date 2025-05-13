export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Restrict in prod
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const AGENCY_SLUG = process.env.URL_SLUG;
  const RAW_TOKEN = process.env.BEARER_TOKEN;
  const BEARER_TOKEN = `Bearer ${RAW_TOKEN}`;

  // 🔍 DEBUG LOGGING
  console.log("🔍 URL_SLUG:", AGENCY_SLUG || 'undefined');
  console.log("🔍 BEARER_TOKEN is set?", !!RAW_TOKEN);

  if (!AGENCY_SLUG || !RAW_TOKEN) {
    return res.status(500).json({
      error: 'Missing environment variables',
      detail: { AGENCY_SLUG, BEARER_TOKEN_EXISTS: !!RAW_TOKEN },
    });
  }

  try {
    const url = `https://api.loxo.co/api/v1/company/${AGENCY_SLUG}/jobs`;
    const response = await fetch(url, {
      headers: {
        Authorization: BEARER_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error('❌ Loxo API Error:', response.status, raw);
      return res.status(response.status).json({ error: 'Loxo fetch failed', detail: raw });
    }

    const data = JSON.parse(raw);
    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Server error:', err.message);
    return res.status(500).json({ error: 'Unable to load job listings. Please try again later.', detail: err.message });
  }
}
