export default async function handler(req, res) {
  // CORS headers — restrict to Webflow in production
  res.setHeader('Access-Control-Allow-Origin', '*'); // Change to your Webflow domain in production
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 🔐 Use environment variables
  const AGENCY_SLUG = process.env.URL_SLUG;
  const RAW_TOKEN = process.env.BEARER_TOKEN;
  const BEARER_TOKEN = `Bearer ${RAW_TOKEN}`;

  // Debug logs (only in dev or staging)
  console.log("🔐 AGENCY_SLUG:", AGENCY_SLUG);
  console.log("🔐 BEARER_TOKEN (start):", RAW_TOKEN?.slice(0, 15) + '...');

  // Safety check
  if (!AGENCY_SLUG || !RAW_TOKEN) {
    return res.status(500).json({
      error: 'Missing environment variables. Please set URL_SLUG and BEARER_TOKEN in Vercel.',
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

    const rawText = await response.text();

    if (!response.ok) {
      console.error('❌ Loxo returned error:', response.status, rawText);
      return res.status(response.status).json({
        error: 'Loxo fetch failed',
        detail: rawText,
      });
    }

    const data = JSON.parse(rawText);
    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Server error:', err.message);
    return res.status(500).json({
      error: 'Unable to load job listings. Please try again later.',
      detail: err.message,
    });
  }
}
