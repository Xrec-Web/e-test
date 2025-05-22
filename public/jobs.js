let jobId = '';

const fetchJobs = async () => {
  try {
    const response = await fetch('https://e-test-nu.vercel.app/api/jobs');
    const data = await response.json();
    console.log('📦 Jobs response:', data);
    return Array.isArray(data.results) ? data.results : [];
  } catch (error) {
    console.error('❌ Failed to fetch job listings:', error);
    return [];
  }
};

const fetchJobDescription = async (jobId, element) => {
  try {
    const res = await fetch(`https://e-test-nu.vercel.app/api/job?id=${jobId}`, {
      method: 'GET',
      headers: { accept: 'application/json' },
    });

    if (!res.ok) {
      console.warn(`⚠️ Job detail fetch failed for ID: ${jobId}`);
      return;
    }

    const data = await res.json();
    if (element && data?.description) {
      element.innerHTML = data.description;
    } else {
      console.warn(`⚠️ No description found for job ID: ${jobId}`);
    }
  } catch (err) {
    console.error('❌ Error fetching job detail:', err);
  }
};

const createItem = (job, templateElement) => {
  if (!job?.id || !job?.title) return null;

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

  if (urlLink) urlLink.href = `https://empoweredrecruitment.webflow.io/job?id=${job.id}`;
  if (title) title.textContent = job.title;
  if (jobType) jobType.textContent = job.job_type?.name || '—';
  if (jobCategory) jobCategory.textContent = job.category?.name || 'Others';
  if (salary) salary.textContent = job.salary || '—';
  if (location) location.textContent = job.city || '—';
  if (publishedAt) publishedAt.textContent = moment(job.published_at).format('DD MMM YYYY');

  if (description) fetchJobDescription(job.id, description);

  if (btnApplyJob) {
    btnApplyJob.addEventListener('click', () => {
      const modal = document.querySelector('.modal-apply-jobs');
      if (modal) modal.style.display = 'grid';
      jobId = job.id;
    });
  }

  return newItem;
};

const collectJobType = (jobs) => {
  const counts = {};
  jobs.forEach(({ job_type }) => {
    const name = job_type?.name;
    if (name) counts[name] = (counts[name] || 0) + 1;
  });
  return Object.entries(counts).map(([name, total]) => ({ name, total }));
};

const collectDepartment = (jobs) => {
  const counts = {};
  jobs.forEach(({ category }) => {
    const name = category?.name;
    if (name) counts[name] = (counts[name] || 0) + 1;
  });
  return Object.entries(counts).map(([name, total]) => ({ name, total }));
};

const createFilter = (value, templateElement) => {
  const newFilter = templateElement.cloneNode(true);
  const label = newFilter.querySelector('span');
  const input = newFilter.querySelector('input');
  const count = newFilter.querySelector('p');

  if (!label || !input) return null;

  label.textContent = value.name;
  input.value = value.name;
  input.id = 'radio-' + value.name;
  if (count) count.textContent = value.total;

  return newFilter;
};

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsfilter',
  async (filtersInstances) => {
    const [filtersInstance] = filtersInstances;
    const { listInstance } = filtersInstance;
    const [item] = listInstance.items;
    const itemTemplateElement = item.element;

    const jobs = await fetchJobs();
    if (!Array.isArray(jobs)) {
      console.warn('⚠️ No jobs array returned from API.');
      return;
    }

    listInstance.clearItems();
    const newItems = jobs.map((job) => createItem(job, itemTemplateElement)).filter(Boolean);
    listInstance.addItems(newItems);

    const contractTemplate = filtersInstance.form.querySelector('[data-element="filter-contract"]');
    const departmentTemplate = filtersInstance.form.querySelector('[data-element="filter-departement"]');

    if (!contractTemplate || !departmentTemplate) {
      console.warn('⚠️ Missing filter template elements in Webflow.');
      return;
    }

    const contractWrapper = contractTemplate.parentElement;
    const departmentWrapper = departmentTemplate.parentElement;

    contractTemplate.remove();
    departmentTemplate.remove();

    const jobTypes = collectJobType(jobs);
    const departments = collectDepartment(jobs);

    jobTypes.forEach((type) => {
      const newFilter = createFilter(type, contractTemplate);
      if (newFilter) contractWrapper.appendChild(newFilter);
    });

    departments.forEach((dept) => {
      const newFilter = createFilter(dept, departmentTemplate);
      if (newFilter) departmentWrapper.appendChild(newFilter);
    });

    filtersInstance.storeFiltersData();
  },
]);

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[ms-code-skeleton]').forEach((element) => {
    const skeleton = document.createElement('div');
    skeleton.classList.add('skeleton-loader');
    element.style.position = 'relative';
    element.appendChild(skeleton);
  });
});
