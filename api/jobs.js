export default async function handler(req, res) {
  const AGENCY_SLUG = process.env.URL_SLUG;
  const BEARER_TOKEN = process.env.BEARER_TOKEN;

  try {
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs`, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
}
