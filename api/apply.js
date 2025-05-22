export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, JobId');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const jobId = req.headers['jobid'];
  const AGENCY_SLUG = 'skys-the-limit-staffing';

  // 🔒 Use the correct working token format — BASIC
  const BASIC_TOKEN = 'Basic d95e9dff9ee06655b068ffe53cb13d3423d3f1acbe43e6fb1552e28fc408bedffc0629fd30dd9dfbaa9dfbdd67ed56ce69a39cbcac4a5b42d065c9c17b78626c5a565850cf1bcf40191f2b554da02daaf320f85523aebef238e2882d2c43c046ae6c9eda6bb2f6dd7fc1cf10dc6d089ba61343acfedfd60e6bdc506e8683c1fd';

  if (!jobId) {
    return res.status(400).json({ error: 'Missing job ID' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    console.log("📦 File size:", rawBody.length, "bytes");
    console.log("📩 Posting to:", `https://app.loxo.co/api/${AGENCY_SLUG}/jobs/${jobId}/apply`);

    const response = await fetch(
      `https://app.loxo.co/api/${AGENCY_SLUG}/jobs/${jobId}/apply`,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authorization: BASIC_TOKEN,
          'Content-Type': req.headers['content-type'],
        },
        body: rawBody,
      }
    );

    const contentType = response.headers.get("content-type");
    const responseText = await response.text();

    if (!response.ok) {
      console.error("❌ Loxo response error:", response.status, responseText);
      return res.status(500).json({ error: "Loxo API Error", detail: responseText });
    }

    console.log("✅ Loxo responded successfully:", contentType);
    return res.status(200).json({ success: true, data: responseText });
  } catch (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({ error: 'Proxy Error', detail: error.message });
  }
}
