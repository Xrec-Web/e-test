export const config = {
  api: {
    bodyParser: false, // Required for streaming multipart/form-data
  },
};

export default async function handler(req, res) {
  // ✅ CORS headers for Webflow
  res.setHeader('Access-Control-Allow-Origin', 'https://empoweredrecruitment-ec87a032a3d444380f.webflow.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, JobId');

  // ✅ Handle preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const AGENCY_SLUG = process.env.AGENCY_SLUG;
  const BEARER_TOKEN = process.env.LOXO_BEARER_TOKEN;
  const jobId = req.headers['jobid'];

  // ✅ Log incoming headers for debugging
  console.log("📩 Incoming apply request");
  console.log("👉 Job ID:", jobId);
  console.log("👉 Content-Type:", req.headers['content-type']);

  if (!AGENCY_SLUG || !BEARER_TOKEN || !jobId) {
    console.error("❌ Missing environment variable or header");
    return res.status(400).json({
      error: 'Missing required headers or environment variables',
      detail: {
        AGENCY_SLUG: !!AGENCY_SLUG,
        BEARER_TOKEN: !!BEARER_TOKEN,
        JOB_ID: !!jobId,
      },
    });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    // ✅ Log size of form submission
    console.log("📦 Received file/form body size:", rawBody.length, "bytes");

    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': req.headers['content-type'],
      },
      body: rawBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Loxo API Error:', errorText);
      return res.status(500).json({ error: `Loxo API error`, detail: errorText });
    }

    const responseData = await response.json();
    console.log("✅ Application successfully submitted to Loxo.");
    return res.status(200).json({ success: true, response: responseData });
  } catch (error) {
    console.error('❌ Proxy Server Error:', error.message);
    return res.status(500).json({ error: 'Proxy server error', detail: error.message });
  }
}
