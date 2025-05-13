document.addEventListener('DOMContentLoaded', () => {
  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
    'cmsfilter',
    async (filtersInstances) => {
      console.log('🔥 CMS Filter initialized');

      const [filtersInstance] = filtersInstances;
      const { listInstance } = filtersInstance;

      if (!listInstance || !listInstance.items?.length) {
        console.warn('⚠️ No CMS items found. Aborting.');
        return;
      }

      const [item] = listInstance.items;
      if (!item || !item.element) {
        console.error('❌ No template item found in listInstance.');
        return;
      }

      const itemTemplateElement = item.element;

      // Fetch data
      const jobs = await fetchJobs();
      if (!jobs.results?.length) {
        console.warn('⚠️ No jobs received from API.');
        return;
      }

      // Remove existing CMS items
      listInstance.clearItems();

      // Create new items
      const newItems = jobs.results.map((job) =>
        createItem(job, 'jobData.description', itemTemplateElement)
      ).filter(Boolean); // skip nulls

      listInstance.addItems(newItems);

      // Filters
      const filtersContractTemplateElement = filtersInstance.form.querySelector('[data-element="filter-contract"]');
      const filtersDepartementTemplateElement = filtersInstance.form.querySelector('[data-element="filter-departement"]');

      if (!filtersContractTemplateElement || !filtersDepartementTemplateElement) {
        console.warn('⚠️ Filter template elements missing.');
        return;
      }

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
});

const fetchJobs = async () => {
  try {
    console.log('📡 Fetching jobs from API...');
    const response = await fetch('https://e-test-nu.vercel.app/api/jobs');
    const data = await response.json();
    console.log('✅ Jobs received:', data.results?.length);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch jobs:', error);
    return { results: [] };
  }
};

const createItem = (job, jobDescription, templateElement) => {
  if (!job?.title) return null;

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

  // Use staging URL
  if (urlLink) urlLink.href = `https://empoweredrecruitment-ec87a032a3d444380f.webflow.io/job?id=${job.id}`;
  if (title) title.textContent = job.title;
  if (jobType) jobType.textContent = job.job_type?.name || '';
  if (jobCategory) jobCategory.textContent = job.category?.name || 'Others';
  if (salary) salary.textContent = job.salary?.replace(/\/year/g, '') || '';
  if (location) location.textContent = job.city || '';
  if (publishedAt && job.published_at) {
    publishedAt.textContent = moment(job.published_at).startOf('day').fromNow();
  }

  if (description) {
    // Optional async full description fetch (can be removed if not needed)
    fetch(`https://e-test-nu.vercel.app/api/job?id=${job.id}`)
      .then((res) => res.json())
      .then((data) => {
        description.innerHTML = data.description || '';
      })
      .catch(() => {
        description.innerHTML = '';
      });
  }

  if (btnApplyJob) {
    btnApplyJob.addEventListener('click', () => {
      document.querySelector('.modal-apply-jobs').style.display = 'grid';
      window.jobId = job.id;
    });
  }

  return newItem;
};

const collectJobType = (jobs) => {
  const counts = {};
  for (const { job_type } of jobs) {
    const name = job_type?.name || 'Unknown';
    counts[name] = (counts[name] || 0) + 1;
  }
  return Object.entries(counts).map(([name, total]) => ({ name, total }));
};

const collectDepartement = (jobs) => {
  const counts = {};
  for (const { category } of jobs) {
    const name = category?.name || 'Other';
    counts[name] = (counts[name] || 0) + 1;
  }
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

// Skeleton loading
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[ms-code-skeleton]').forEach((element) => {
    const skeletonDiv = document.createElement('div');
    skeletonDiv.classList.add('skeleton-loader');
    element.style.position = 'relative';
    element.appendChild(skeletonDiv);
  });
});
