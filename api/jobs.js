const fetchJobs = async () => {
  const AGENCY_SLUG = 'skys-the-limit-staffing'; // Your agency slug
  const BEARER_TOKEN = 'Bearer 00eec6549ea1dc3cc215ad33483ce488fe012a33c9e4d2c96d6d48c38050299fe69e6591b34961f81ec24e32f590a4db7ea313e6b2e100c9a764d1a337b83c4095'; // ⚠️ Exposed in frontend

  try {
    const response = await fetch(`https://app.loxo.co/api/${AGENCY_SLUG}/jobs`, {
      headers: {
        Authorization: BEARER_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Loxo API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    console.log('✅ Jobs received:', data.results?.length);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch jobs:', error);
    return { results: [] };
  }
};
