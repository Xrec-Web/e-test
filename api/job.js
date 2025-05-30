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
        authorization: 'Basic 8f4998dbcf46...YOUR-TOKEN-HERE...', // keep secure via env var later
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
