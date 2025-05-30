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
    console.log('Fetching job ID:', id); // 👈 log the ID

    const response = await fetch(
      `https://app.loxo.co/api/axiom-talent/jobs/${id}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          authorization:
            'Basic 8f4998dbcf4615d2c28f8063040d916e49e44d2aca927b5abbef53d7746754e31e49f4aa385ff40368ec86ec1b1e95fddd23c5cb0e7f349259eab2ff83ec9f0f70185b2c56c962e1f432c619a1dad40c3bf76e157c6a6d18c9521452e8d72390c4de9e496fa87236728b9a77cb8a7bd5a0334f795745700526fdc83eb68a3afa',
        },
      }
    );

    const responseBody = await response.text(); // 👈 catch non-JSON error bodies
    if (!response.ok) {
      console.error(`❌ Failed to fetch job ${id}:`, response.status, responseBody);
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const data = JSON.parse(responseBody);
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error in /api/job:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
