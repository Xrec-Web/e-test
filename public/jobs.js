const fetchJobs = async () => {
  try {
    const response = await fetch('https://e-test-nu.vercel.app/api/jobs');
    const data = await response.json();
    return data;
  } catch (error) {
    return { results: [] };
  }
};

const createItem = (job, jobDescription, templateElement) => {
  const newItem = templateElement.cloneNode(true);

  const urlLink = newItem.querySelector('[data-element="url-link"]');
  const title = newItem.querySelector('[data-element="title"]');
  const jobType = newItem.querySelector('[data-element="job-type"]');
  const jobCategory = newItem.querySelector('[data-element="job-category"]');
  const salary = newItem.querySelector('[data-element="salary"]');
  const location = newItem.querySelector('[data-element="location"]');
  const publishedAt = newItem.querySelector('[data-element="publishedAt"]');
  const description = newItem.querySelector('[data-element="job-description"]');
  const btnApplyJob = newItem.querySelector('[data-element="apply-now"]');

  // ✅ Use staging domain
  if (urlLink) urlLink.href = `https://empoweredrecruitment-ec87a032a3d444380f.webflow.io/job?id=${job.id}`;
  if (title) title.textContent = job.title;
  if (jobType) jobType.textContent = job.job_type.name;
  if (jobCategory) jobCategory.textContent = job.category?.name || 'Others';
  if (salary) salary.textContent = job.salary.replace(/\/year/g, '');
  if (location) location.textContent = job.city;
  if (publishedAt) publishedAt.textContent = moment(job.published_at).startOf('day').fromNow();
  if (description) fetchJob(job.id, description);

  if (btnApplyJob) {
    btnApplyJob.onclick = () => {
      document.querySelector('.modal-apply-jobs').style.display = 'grid';
      jobId = job.id;
    };
  }

  return newItem;
};
