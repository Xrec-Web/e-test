export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Replace with your Webflow domain in production
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const AGENCY_SLUG = process.env.URL_SLUG;
  const RAW_TOKEN = process.env.BEARER_TOKEN;
  const BEARER_TOKEN = `Bearer ${RAW_TOKEN}`;

  console.log("🌱 SLUG:", AGENCY_SLUG);
  console.log("🌱 TOKEN SET:", !!RAW_TOKEN);

  if (!AGENCY_SLUG || !RAW_TOKEN) {
    return res.status(500).json({
      error: 'Missing environment variables',
      detail: { AGENCY_SLUG, BEARER_TOKEN_EXISTS: !!RAW_TOKEN },
    });
  }

  try {
    const url = `https://app.loxo.co/api/${AGENCY_SLUG}/jobs`;

    const response = await fetch(url, {
      headers: {
        Authorization: BEARER_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error('❌ Loxo responded with error:', response.status, raw);
      return res.status(response.status).json({
        error: 'Loxo fetch failed',
        detail: raw,
      });
    }

    const data = JSON.parse(raw);
    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Server crash:', err.message);
    return res.status(500).json({
      error: 'fetch failed',
      detail: err.message,
    });
  }
}
