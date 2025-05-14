let jobId = '';
// const modalWrapper = document.querySelector("#fs-modal-1-popup");
// const modalCloseIcon = document.querySelector(".fs_modal-1_close-2");

// modalCloseIcon.addEventListener("click", () => {
//   modalWrapper.classList.remove("active");
// });

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsfilter',
  async (filtersInstances) => {
    // Get the filters instance
    const [filtersInstance] = filtersInstances;
    // Get the list instance
    const { listInstance } = filtersInstance;
    // Save a copy the template element
    const [item] = listInstance.items;
    const itemTemplateElement = item.element;
    // Fetch the external data
    const jobs = await fetchJobs();
    // Remove the placeholder items
    listInstance.clearItems();
    // Create the items from the external data
    const newItems = jobs.results.map((job) =>
      createItem(job, 'jobData.description', itemTemplateElement)
    );

    listInstance.addItems(newItems);

    // Get the radio template element
    const filtersContractTemplateElement = filtersInstance.form.querySelector(
      '[data-element="filter-contract"]'
    );
    const filtersDepartementTemplateElement =
      filtersInstance.form.querySelector('[data-element="filter-departement"]');
    if (!filtersContractTemplateElement) return;
    if (!filtersDepartementTemplateElement) return;

    // Get the parent element of the radios
    const filtersWrapperElement = filtersContractTemplateElement.parentElement;
    const filtersWrapperElementDepartement =
      filtersDepartementTemplateElement.parentElement;
    if (!filtersWrapperElement) return;
    if (!filtersWrapperElementDepartement) return;

    // Remove the template radio element
    filtersContractTemplateElement.remove();
    filtersDepartementTemplateElement.remove();

    // Collect all the categories of the products
    const jobTypes = collectJobType(jobs.results);
    const departementList = collectDepartement(jobs.results);

    for (const jobtype of jobTypes) {
      const newFilter = createFilter(jobtype, filtersContractTemplateElement);
      if (!newFilter) continue;

      filtersWrapperElement.append(newFilter);
    }

    for (const departement of departementList) {
      const newFilter = createFilter(
        departement,
        filtersDepartementTemplateElement
      );
      if (!newFilter) continue;

      filtersWrapperElementDepartement.append(newFilter);
    }

    filtersInstance.storeFiltersData();
  },
]);

let fetchJobs = async () => {
  try {
    const response = await fetch(
      'https://e-test-nu.vercel.app/api/jobs'
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
};

let fetchJob = (jobId, element) => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
  };

  fetch(
    'https://e-test-nu.vercel.app/api/jobs?id=' +
      jobId,
    options
  )
    .then((response) => response.json())
    .then((data) => {
      if (element) element.innerHTML = data.description;
    })
    .catch((err) => {
      return err;
    });
};

var createItem = (job, jobDescription, templateElement) => {
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

  if (urlLink)
    urlLink.href = 'https://empoweredrecruitment.webflow.io/job?id=' + job.id;
  if (title) title.textContent = job.title;
  if (jobType) jobType.textContent = job.job_type.name;
  if (jobCategory)
    jobCategory.textContent = job.category.name ? job.category.name : 'Others';
  if (salary) salary.textContent = `${job.salary.replace(/\/year/g, '')}`;
  if (location) location.textContent = job.city;
  if (publishedAt)
    publishedAt.textContent = moment(job.published_at).startOf('day').fromNow();
  if (description) fetchJob(job.id, description);

  if (btnApplyJob) {
    btnApplyJob.setAttribute(
      'onclick',
      `document.querySelector('.modal-apply-jobs').style.display = 'grid'; jobId=${job.id};`
    );
  }

  return newItem;
};

const collectJobType = (products) => {
  const jobTypeCounts = {};

  for (const { job_type } of products) {
    const jobTypeName = job_type.name;

    if (!jobTypeCounts[jobTypeName]) {
      jobTypeCounts[jobTypeName] = 1;
    } else {
      jobTypeCounts[jobTypeName]++;
    }
  }

  const result = Object.keys(jobTypeCounts).map((name) => ({
    name,
    total: jobTypeCounts[name],
  }));

  return result;
};

const collectDepartement = (products) => {
  const jobDepartementCounts = {};

  for (const { category } of products) {
    const jobDepartementName = category.name;

    if (!jobDepartementCounts[jobDepartementName]) {
      jobDepartementCounts[jobDepartementName] = 1;
    } else {
      jobDepartementCounts[jobDepartementName]++;
    }
  }

  const result = Object.keys(jobDepartementCounts).map((name) => ({
    name,
    total: jobDepartementCounts[name],
  }));

  console.log(result);
  return result;
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
  if (count) {
    count.textContent = value.total;
  }

  return newFilter;
};

// Skeleton Loading Animation
window.addEventListener('DOMContentLoaded', (event) => {
  const skeletonElements = document.querySelectorAll('[ms-code-skeleton]');

  skeletonElements.forEach((element) => {
    // Create a skeleton div
    const skeletonDiv = document.createElement('div');
    skeletonDiv.classList.add('skeleton-loader');

    // Add the skeleton div to the current element
    element.style.position = 'relative';
    element.appendChild(skeletonDiv);
  });
});

// Membership Form File Uploader
const forms = document.querySelectorAll('form[ms-code-file-upload="form"]');

forms.forEach((form) => {
  form.setAttribute('enctype', 'multipart/form-data');
  const uploadInputs = form.querySelectorAll('[ms-code-file-upload-input]');

  uploadInputs.forEach((uploadInput) => {
    const inputName = uploadInput.getAttribute('ms-code-file-upload-input');

    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('name', inputName);
    fileInput.setAttribute('id', inputName);
    fileInput.setAttribute('required', '');

    uploadInput.appendChild(fileInput);
  });
});

// Apply Job Function
document.addEventListener('DOMContentLoaded', function () {
  const inputElement = document.querySelector(
    'input[type="file"][name="fileToUpload"]'
  );
  const pond = FilePond.create(inputElement, {
    credits: false,
    name: 'fileToUpload',
    storeAsFile: true,
  });

  Webflow.push(function () {
    $('#wf-form-Job-Apply-Form').submit(async function (e) {
      e.preventDefault();

      const file = pond.getFile();
      if (!file) {
        alert('Please upload a resume.');
        return;
      }

      const form = new FormData();
      form.append('email', document.getElementById('email-job').value);
      form.append('name', document.getElementById('name-job').value);
      form.append('phone', document.getElementById('phone-job').value);
      form.append('linkedin', document.getElementById('linkedin-job').value);
      form.append('resume', file.file, file.file.name); // Pastikan file dikirim dengan nama

      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          JobId: jobId, // Kirim Job ID via header
        },
        body: form,
      };

      $('.submit-button-apply-job')
        .val('Please Wait...')
        .css('cursor', 'not-allowed')
        .attr('disabled', true);

      fetch(
        'https://e-test-nu.vercel.app/api/apply',
        options
      )
        .then((response) => {
          $('.close-modal-button').trigger('click');
          Toastify({
            text: 'Your application was successfully sent!',
            duration: 2000,
            gravity: 'top',
            position: 'center',
            style: { background: '#527853', color: '#FFFFFF' },
          }).showToast();
          pond.removeFile();
          $('#wf-form-Job-Apply-Form').trigger('reset');
          $('.submit-button-apply-job')
            .val('Submit')
            .css('cursor', 'pointer')
            .attr('disabled', false);
        })
        .catch((err) => console.error(err));
    });
  });
});
