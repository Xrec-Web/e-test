// File: /api/apply.js

import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Required for formidable to handle files
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://empoweredrecruitment-ec87a032a3d444380f.webflow.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, JobId');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const jobId = req.headers['jobid'];
  const basicAuth = process.env.LOXO_BASIC_AUTH;

  if (!jobId || !basicAuth) {
    return res.status(400).json({ error: 'Missing Job ID or Auth token' });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Form parsing error:', err);
      return res.status(400).json({ error: 'Invalid form data' });
    }

    const { name, email, phone, linkedin } = fields;
    const resume = files.resume;

    if (!resume?.filepath) {
      return res.status(400).json({ error: 'Resume file missing' });
    }

    try {
      const loxoForm = new FormData();
      loxoForm.append('email', email);
      loxoForm.append('name', name);
      loxoForm.append('phone', phone);
      loxoForm.append('linkedin', linkedin);
      loxoForm.append('resume', fs.createReadStream(resume.filepath), resume.originalFilename);

      const response = await fetch(`https://app.loxo.co/api/skys-the-limit-staffing/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          accept: 'application/json',
        },
        body: loxoForm,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Loxo apply error:', response.status, text);
        return res.status(response.status).json({ error: 'Failed to apply', detail: text });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Server error:', error);
      return res.status(500).json({ error: 'Application error', detail: error.message });
    }
  });
}
