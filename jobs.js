let jobId = '';
const modalWrapper = document.querySelector('#fs-modal-1-popup');
const modalCloseIcon = document.querySelector('.fs_modal-1_close-2');

modalCloseIcon.addEventListener('click', () => {
  modalWrapper.classList.remove('active');
});

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsfilter',
  async (filtersInstances) => {
    // Get the filters instance
    const [filtersInstance] = filtersInstances;
    console.log(filtersInstances);

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
    const filtersLocationTemplateElement = filtersInstance.form.querySelector(
      '[data-element="filter-location"]'
    );

    if (!filtersContractTemplateElement) return;
    if (!filtersLocationTemplateElement) return;

    // Get the parent element of the radios
    const filtersWrapperElement = filtersContractTemplateElement.parentElement;
    const filtersWrapperLocationElement =
      filtersLocationTemplateElement.parentElement;
    if (!filtersWrapperElement) return;
    if (!filtersWrapperLocationElement) return;

    // Remove the template radio element
    filtersContractTemplateElement.remove();
    filtersLocationTemplateElement.remove();

    // Collect all the categories of the products
    const jobTypes = collectJobType(jobs.results);
    const jobLocation = collectLocation(jobs.results);

    for (const jobtype of jobTypes) {
      const newFilter = createFilter(jobtype, filtersContractTemplateElement);
      if (!newFilter) continue;

      filtersWrapperElement.append(newFilter);
    }

    for (const jobcity of jobLocation) {
      const newFilter = createFilter(jobcity, filtersLocationTemplateElement);
      if (!newFilter) continue;

      filtersWrapperLocationElement.append(newFilter);
    }

    filtersInstance.storeFiltersData();
  },
]);

let fetchJobs = async () => {
  try {
    const response = await fetch(
      'https://w-scripts.vercel.app/api/loxo/rover/jobs'
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

  fetch('https://w-scripts.vercel.app/api/loxo/rover/job?id=' + jobId, options)
    .then((response) => response.json())
    .then((data) => {
      if (element) element.innerHTML = data.description_text;
    })
    .catch((err) => {
      return null;
    });
};

var createItem = (job, jobDescription, templateElement) => {
  const newItem = templateElement.cloneNode(true);

  const urlLink = newItem.querySelector('[data-element="url-link"]');
  const title = newItem.querySelector('[data-element="title"]');
  const jobType = newItem.querySelector('[data-element="job-type"]');
  const location = newItem.querySelector('[data-element="location"]');
  const description = newItem.querySelector('[data-element="job-description"]');
  const salaryMax = newItem.querySelector('[data-element="salary-max"]');
  const publishedAt = newItem.querySelector('[data-element="publishedAt"');
  const button = newItem.querySelector('[apply-button]');

  const iconJob = Array.from(
    newItem.querySelectorAll('[data-element="job-icon"]')
  );

  if (urlLink)
    urlLink.href = 'https://www.roverrecruitment.com.au/job?id=' + job.id;
  if (title) title.textContent = job.title;
  if (jobType) jobType.textContent = job.job_type.name;
  if (location) location.textContent = job.city;
  if (description) fetchJob(job.id, description);
  if (salaryMax) salaryMax.textContent = job.salary_max;
  if (publishedAt) publishedAt.textContent = job.published_at;
  if (button) button.setAttribute('apply-button', job.id);
  if (iconJob) {
    iconJob.map((icon) => {
      const removeSkeleton = icon.querySelector('.skeleton-loader');

      if (removeSkeleton) removeSkeleton.remove();
    });
  }

  // Open Modal Function
  button.addEventListener('click', () => {
    jobId = job.id;
    modalWrapper.classList.add('active');
  });

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

const collectLocation = (products) => {
  const jobLocationCounts = {};

  for (const { city } of products) {
    const jobLocationName = city;

    if (!jobLocationCounts[jobLocationName]) {
      jobLocationCounts[jobLocationName] = 1;
    } else {
      jobLocationCounts[jobLocationName]++;
    }
  }

  const result = Object.keys(jobLocationCounts).map((name) => ({
    name,
    total: jobLocationCounts[name],
  }));

  return result;
};

const createFilter = (value, templateElement) => {
  const newFilter = templateElement.cloneNode(true);

  const label = newFilter.querySelector('span');
  const input = newFilter.querySelector('input');
  if (!label || !input) return;

  label.textContent = value.name;
  input.value = value.name;
  input.id = 'select-' + value.name;

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

//

// Filepond Client
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
    $('#wf-form-Form-Apply-Job').submit(async function (e) {
      e.preventDefault(); // Prevent default form submission
      e.stopPropagation(); // Stop the event from propagating further
  
      const file = pond.getFile();
      if (!file) {
        alert('Please upload a resume.');
        return;
      }
  
      const form = new FormData();
      form.append('email', document.getElementById('Email').value);
      form.append('name', document.getElementById('Name').value);
      form.append('phone', document.getElementById('Phone').value);
      form.append('linkedin', document.getElementById('LinkedIn').value);
      form.append('resume', file.file, file.file.name);
  
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          JobId: jobId, // Send Job ID via header
        },
        body: form,
      };
  
      $('.submit-button-apply-job')
        .val('Please Wait...')
        .css('cursor', 'not-allowed')
        .attr('disabled', true);
  
      try {
        const response = await fetch(
          'https://w-scripts.vercel.app/api/loxo/rover/apply',
          options
        );

        const responseData = await response.json();
  
        // Log the FormData contents
        for (let [key, value] of form.entries()) {
          console.log(`${key}:`, value);
        }
  
        if (responseData.success === true) {
          $('.fs_modal-1_close-2').trigger('click');
  
          Toastify({
            text: 'Your application was successfully sent!',
            duration: 2000,
            gravity: 'top',
            position: 'center',
            style: { background: '#527853', color: '#FFFFFF' },
          }).showToast();
  
          pond.removeFile();
          $('#wf-form-Form-Apply-Job').trigger('reset');
        } else {
          console.error('Failed to submit the form:', responseData);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        $('.submit-button-apply-job')
          .val('Submit')
          .css('cursor', 'pointer')
          .attr('disabled', false);
      }
  
      return false; // Explicitly return false to prevent Webflow behavior
    });
  });
});
