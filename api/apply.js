export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Izinkan semua domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, JobId'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    const response = await fetch(
      `https://app.loxo.co/api/axiom-talent/jobs/${req.headers['jobid']}/apply`,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authorization:
            'Basic f8600b3f24ebbf8b8e32f16b0b3d1307870fdf58f3686b2cf62843a7df7b1929892eacd1af24d64f9e01711b98a4f0aecba4a7a415122b12aec4a81d3c0908eeca92f9086fb74df476db66bdb9311fdc001dc0dd2e640646bf40f8a6d240876ea5da6011fdaa28ca65b333a8b8e156af2b16a80435c8f8a2196ee850f26ec589',
          'Content-Type': req.headers['content-type'],
        },
        body: rawBody,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Loxo API Error:', errorText);
      throw new Error(`Failed to apply: ${errorText}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API Call Failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
