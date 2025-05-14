import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const allowedOrigin = 'https://empoweredrecruitment-ec87a032a3d444380f.webflow.io';

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, JobId');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const jobId = req.headers['jobid'];
  const agencySlug = process.env.AGENCY_SLUG;
  const bearerToken = process.env.LOXO_BEARER_TOKEN;

  if (!jobId || !agencySlug || !bearerToken) {
    return res.status(400).json({
      error: 'Missing jobId or environment variables',
      detail: {
        jobId: !!jobId,
        AGENCY_SLUG: !!agencySlug,
        LOXO_BEARER_TOKEN: !!bearerToken,
      },
    });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Error parsing form data:', err);
      return res.status(400).json({ error: 'Invalid form data' });
    }

    const { name, email, phone, linkedin } = fields;
    const resume = files.resume;

    if (!resume?.filepath) {
      return res.status(400).json({ error: 'Resume file missing' });
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('linkedin', linkedin);
      formData.append('resume', fs.createReadStream(resume.filepath), resume.originalFilename);

      const response = await fetch(`https://app.loxo.co/api/${agencySlug}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Loxo API Error:', text);
        return res.status(response.status).json({ error: 'Loxo API failed', detail: text });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Server error:', error);
      return res.status(500).json({ error: 'Server error', detail: error.message });
    }
  });
}
