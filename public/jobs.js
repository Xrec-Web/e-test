let jobId = '';

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsfilter',
  async (filtersInstances) => {
    const [filtersInstance] = filtersInstances;
    const { listInstance } = filtersInstance;
    const [item] = listInstance.items;
    const itemTemplateElement = item.element;

    const jobs = await fetchJobs();
    if (!Array.isArray(jobs.results)) {
      console.warn('⚠️ No jobs received from API.');
      return;
    }

    listInstance.clearItems();

    const newItems = jobs.results.map((job) =>
      createItem(job, 'jobData.description', itemTemplateElement)
    ).filter(Boolean);

    listInstance.addItems(newItems);

    const filtersContractTemplateElement = filtersInstance.form.querySelector('[data-element="filter-contract"]');
    const filtersDepartementTemplateElement = filtersInstance.form.querySelector('[data-element="filter-departement"]');
    if (!filtersContractTemplateElement || !filtersDepartementTemplateElement) return;

    const filtersWrapperElement = filtersContractTemplateElement.parentElement;
    const filtersWrapperElementDepartement = filtersDepartementTemplateElement.parentElement;

    filtersContractTemplateElement.remove();
    filtersDepartementTemplateElement.remove();

    const jobTypes = collectJobType(jobs.results);
    const departementList = collectDepartement(jobs.results);

    for (const jobtype of jobTypes) {
      const newFilter = createFilter(jobtype, filtersContractTemplateElement);
      if (newFilter) filtersWrapperElement.append(newFilter);
    }

    for (const departement of departementList) {
      const newFilter = createFilter(departement, filtersDepartementTemplateElement);
      if (newFilter) filtersWrapperElementDepartement.append(newFilter);
    }

    filtersInstance.storeFiltersData();
  },
]);

const fetchJobs = async () => {
  try {
    const response = await fetch('https://e-test-nu.vercel.app/api/jobs');
    const data = await response.json();
    console.log('📦 jobs response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    return { results: [] };
  }
};

const fetchJob = (jobId, element) => {
  fetch(`https://e-test-nu.vercel.app/api/jobs?id=${jobId}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
  })
    .then((response) => response.json())
    .then((data) => {
      if (element) element.innerHTML = data.description;
    })
    .catch((err) => console.error('❌ Error fetching job detail:', err));
};

const createItem = (job, jobDescription, templateElement) => {
  if (!job || !job.title || !job.id) return null;

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
  if (jobType) jobType.textContent = job.job_type.name;
  if (jobCategory) jobCategory.textContent = job.category.name || 'Others';
  if (salary) salary.textContent = job.salary.replace(/\\/year/g, '');
  if (location) location.textContent = job.city;
  if (publishedAt) publishedAt.textContent = moment(job.published_at).startOf('day').fromNow();
  if (description) fetchJob(job.id, description);

  if (btnApplyJob) {
    btnApplyJob.addEventListener('click', () => {
      const modal = document.querySelector('.modal-apply-jobs');
      if (modal) modal.style.display = 'grid';
      jobId = job.id;
    });
  }

  return newItem;
};

const collectJobType = (products) => {
  const jobTypeCounts = {};
  for (const { job_type } of products) {
    const name = job_type.name;
    jobTypeCounts[name] = (jobTypeCounts[name] || 0) + 1;
  }
  return Object.entries(jobTypeCounts).map(([name, total]) => ({ name, total }));
};

const collectDepartement = (products) => {
  const jobDepartementCounts = {};
  for (const { category } of products) {
    const name = category.name;
    jobDepartementCounts[name] = (jobDepartementCounts[name] || 0) + 1;
  }
  return Object.entries(jobDepartementCounts).map(([name, total]) => ({ name, total }));
};

const createFilter = (value, templateElement) => {
  const newFilter = templateElement.cloneNode(true);
  const label = newFilter.querySelector('span');
  const input = newFilter.querySelector('input');
  const count = newFilter.querySelector('p');
  if (!label || !input) return;
  label.textContent = value.name;
  input.value = value.name;
  input.id = 'radio-' + value.name;
  if (count) count.textContent = value.total;
  return newFilter;
};

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[ms-code-skeleton]').forEach((element) => {
    const skeletonDiv = document.createElement('div');
    skeletonDiv.classList.add('skeleton-loader');
    element.style.position = 'relative';
    element.appendChild(skeletonDiv);
  });
});
