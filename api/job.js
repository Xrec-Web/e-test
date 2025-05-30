
export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  try {
    const response = await fetch(
      `https://app.loxo.co/api/axiom-talet/jobs/${id}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          authorization:
            'Basic 8f4998dbcf4615d2c28f8063040d916e49e44d2aca927b5abbef53d7746754e31e49f4aa385ff40368ec86ec1b1e95fddd23c5cb0e7f349259eab2ff83ec9f0f70185b2c56c962e1f432c619a1dad40c3bf76e157c6a6d18c9521452e8d72390c4de9e496fa87236728b9a77cb8a7bd5a0334f795745700526fdc83eb68a3afa',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch job details');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
