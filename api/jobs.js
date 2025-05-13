// api/job.js
export default async function handler(req, res) {
  const { id } = req.query;
  const BEARER_TOKEN = process.env.BEARER_TOKEN;
  const URL_SLUG = process.env.URL_SLUG;

  if (!id || !BEARER_TOKEN || !URL_SLUG) {
    return res.status(400).json({ error: 'Missing required data or env variables' });
  }

  try {
    const response = await fetch(`https://api.loxo.co/api/v1/job/${id}`, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch job' });
    }

    const data = await response.json();
    res.status(200).json(data.data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}
