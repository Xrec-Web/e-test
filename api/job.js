export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') return res.status(200).end();
  if (method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!id) return res.status(400).json({ error: 'Job ID is required' });

  try {
    console.log(`📦 Fetching job details for ID: ${id}`);

    const response = await fetch(`https://app.loxo.co/api/axiom-talent/jobs/${id}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: 'Basic f8600b3f24ebbf8b8e32f16b0b3d1307870fdf58f3686b2cf62843a7df7b1929892eacd1af24d64f9e01711b98a4f0aecba4a7a415122b12aec4a81d3c0908eeca92f9086fb74df476db66bdb9311fdc001dc0dd2e640646bf40f8a6d240876ea5da6011fdaa28ca65b333a8b8e156af2b16a80435c8f8a2196ee850f26ec589', // keep secure via env var later
      },
    });

    const text = await response.text(); // get raw text (whether HTML or JSON)

    if (!response.ok) {
      console.error(`❌ Loxo fetch error: ${response.status} ${text}`);
      return res.status(response.status).json({ error: `Loxo error: ${text}` });
    }

    let data;
    try {
      data = JSON.parse(text); // try parse
    } catch (parseErr) {
      console.error('❌ Failed to parse Loxo response as JSON:', parseErr.message);
      return res.status(500).json({ error: 'Invalid JSON from Loxo API' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Unhandled server error in /api/job:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
