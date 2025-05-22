export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // CORS headers for Webflow
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, JobId');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const jobId = req.headers['jobid'];
  const AGENCY_SLUG = 'skys-the-limit-staffing';
  const BEARER_TOKEN = '00eec6549ea1dc3cc215ad33483ce488fe012a33c9e4d2c96d6d48c38050299fe69e6591b34961f81ec24e32f590a4db7ea313e6b2e100c9a764d1a337b83c4095d3d20a4abe060da296c4e3dfcec8e59b4284c21e99d3de71a8a523a8a9333ecd1e3172e53bf6bd639a1917648a0a278f8414de681aa37b081f51560f4b2843';

  if (!jobId) {
    return res.status(400).json({ error: 'Missing job ID' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    const response = await fetch(
      `https://app.loxo.co/api/${AGENCY_SLUG}/jobs/${jobId}/apply`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': req.headers['content-type'],
        },
        body: rawBody,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Loxo API Error:', errorText);
      return res.status(500).json({ error: 'Loxo API Error', detail: errorText });
    }

    const data = await response.json();
    console.log('✅ Apply Success:', data);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Server Error:', error.message);
    return res.status(500).json({ error: 'Server Error', detail: error.message });
  }
}
