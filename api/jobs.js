// /api/job.js
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Change to specific domain in production
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Extract job ID from query
  const jobId = req.query.id;

  if (!jobId) {
    return res.status(400).json({
      error: 'Missing required parameters',
      detail: { id: false },
    });
  }

  // Loxo setup (hardcoded for now)
  const AGENCY_SLUG = 'skys-the-limit-staffing';
  const BEARER_TOKEN =
    'Bearer 00eec6549ea1dc3cc215ad33483ce488fe012a33c9e4d2c96d6d48c38050299fe69e6591b34961f81ec24e32f590a4db7ea313e6b2e100c9a764d1a337b83c4095d3d20a4abe060da296c4e3dfcec8e59b4284c21e99d3de71a8a523a8a9333ecd1e3172e53bf6bd639a1917648a0a278f8414de681aa37b081f51560f4b2843';

  try {
    // Get full job list (Loxo doesn't offer single job lookup by ID directly)
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs`, {
      headers: {
        Authorization: BEARER_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'Failed to fetch jobs', detail: errorText });
    }

    const data = await response.json();

    // Find the specific job by ID
    const job = data.results.find((job) => job.id.toString() === jobId.toString());

    if (!job) {
      return res.status(404).json({ error: 'Job not found', id: jobId });
    }

    return res.status(200).json(job);
  } catch (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({
      error: 'Server error',
      detail: err.message || 'Unknown error',
    });
  }
}
