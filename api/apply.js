// api/apply.js
import formidable from 'formidable-serverless';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const BEARER_TOKEN = process.env.BEARER_TOKEN;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const jobId = req.headers.jobid;
  if (!jobId || !BEARER_TOKEN) {
    return res.status(400).json({ error: 'Missing Job ID or token' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing failed' });

    const formData = new FormData();
    formData.append('email', fields.email);
    formData.append('name', fields.name);
    formData.append('phone', fields.phone);
    formData.append('linkedin', fields.linkedin);
    formData.append('resume', files.resume.filepath, {
      filename: files.resume.originalFilename,
      contentType: files.resume.mimetype,
    });

    try {
      const response = await fetch(`https://api.loxo.co/api/v1/job/${jobId}/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      res.status(200).json({ message: 'Application sent', data });
    } catch (error) {
      res.status(500).json({ error: 'Submission failed' });
    }
  });
}
