const fetchData = async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const jobId = urlParams.get('id');

  if (!jobId) {
    window.location.href = 'https://empoweredrecruitment-ec87a032a3d444380f.webflow.io/explore-jobs';
    return;
  }

  const fetchJob = async () => {
    try {
      const response = await fetch(`https://e-test-nu.vercel.app/api/job?id=${jobId}`, {
        method: 'GET',
        headers: { accept: 'application/json' },
      });

      const data = await response.json();

      const skeletonElements = document.querySelectorAll('[ms-code-skeleton]');
      skeletonElements.forEach((element) => {
        let delay = element.getAttribute('ms-code-skeleton');
        delay = isNaN(delay) ? 2000 : parseInt(delay);
        setTimeout(() => {
          const skeletonDiv = element.querySelector('.skeleton-loader');
          if (skeletonDiv) element.removeChild(skeletonDiv);
        }, delay);
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch job:', error);
      return {};
    }
  };

  const job = await fetchJob();

  if (!job.title) return;

  document.querySelector('[data-element="job-title"]').textContent = job.title;
  document.querySelector('[data-element="job-city"]').textContent = job.city;
  document.querySelector('[data-element="job-description"]').innerHTML = job.description;

  const owner = job.owners?.[0];
  if (owner) {
    document.querySelector('[data-element="owner"]').textContent = owner.name;
    const ownerPhoto = document.querySelector('[data-element="owner-photo"]');
    const fallbackPhoto = 'https://uploads-ssl.webflow.com/66782c28be38686013eaecc8/66977e1201992d31e243ec13_taylen-erickson.webp';

    ownerPhoto.src = owner.avatar_original_url || fallbackPhoto;
    ownerPhoto.srcset = `${ownerPhoto.src} 1x, ${ownerPhoto.src} 2x`;
  }

  document.querySelector('[data-element="job-category"]').textContent =
    job.category?.name || 'Others';
  document.querySelector('[data-element="job-type"]').textContent =
    job.job_type?.name || '';
  document.querySelector('[data-element="job-salary"]').textContent = job.salary || '';
};

fetchData();

// Apply Job Form Submission
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const jobId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', function () {
  const inputElement = document.querySelector('input[type="file"][name="fileToUpload"]');
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
      form.append('resume', file.file, file.file.name);

      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          JobId: jobId,
        },
        body: form,
      };

      $('.submit-button-apply-job')
        .val('Please Wait...')
        .css('cursor', 'not-allowed')
        .attr('disabled', true);

      fetch('https://e-test-nu.vercel.app/api/apply', options)
        .then(() => {
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

// Filepond input binding (for CMS-driven form)
const forms = document.querySelectorAll('form[ms-code-file-upload="form"]');
forms.forEach((form) => {
  form.setAttribute('enctype', 'multipart/form-data');
  const uploadInputs = form.querySelectorAll('[ms-code-file-upload-input]');

  uploadInputs.forEach((uploadInput) => {
    const inputName = uploadInput.getAttribute('ms-code-file-upload-input');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = inputName;
    fileInput.id = inputName;
    fileInput.required = true;
    uploadInput.appendChild(fileInput);
  });
});

// Copy Job URL Button
const copyBtn = document.querySelector('.copy-url');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const currentUrl = window.location.href;
    const tempInput = document.createElement('input');
    tempInput.value = currentUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    const tooltip = $('.tooltip-copy-url');
    setTimeout(() => tooltip.addClass('active'), 0);
    setTimeout(() => tooltip.removeClass('active'), 2000);
  });
}

// Skeleton placeholders
window.addEventListener('DOMContentLoaded', () => {
  const skeletonElements = document.querySelectorAll('[ms-code-skeleton]');
  skeletonElements.forEach((element) => {
    const skeletonDiv = document.createElement('div');
    skeletonDiv.classList.add('skeleton-loader');
    element.style.position = 'relative';
    element.appendChild(skeletonDiv);
  });
});

// Open modal for Apply Job
const applyBtn = document.querySelector('.apply-jobs.w-button');
if (applyBtn) {
  applyBtn.addEventListener('click', () => {
    document.querySelector('.modal-apply-jobs').style.display = 'grid';
  });
}
