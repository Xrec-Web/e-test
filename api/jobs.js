export default async function handler(req, res) {
  const { method } = req;

  // ✅ Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    // Preflight request
    return res.status(200).end();
  }

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const response = await fetch(
      'https://app.loxo.co/api/axiom-talent/jobs?published_at_sort=desc&status=active&per_page=100',
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          authorization: `Basic f8600b3f24ebbf8b8e32f16b0b3d1307870fdf58f3686b2cf62843a7df7b1929892eacd1af24d64f9e01711b98a4f0aecba4a7a415122b12aec4a81d3c0908eeca92f9086fb74df476db66bdb9311fdc001dc0dd2e640646bf40f8a6d240876ea5da6011fdaa28ca65b333a8b8e156af2b16a80435c8f8a2196ee850f26ec589`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
