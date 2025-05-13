document.addEventListener('DOMContentLoaded', () => {
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

      document.querySelectorAll('[ms-code-skeleton]').forEach((element) => {
        let delay = element.getAttribute('ms-code-skeleton');
        delay = isNaN(delay) ? 2000 : parseInt(delay);
        setTimeout(() => {
          const skeletonDiv = element.querySelector('.skeleton-loader');
          if (skeletonDiv) element.removeChild(skeletonDiv);
        }, delay);
      });

      return data;
    } catch (error) {
      console.error('❌ Error fetching job:', error);
      return {};
    }
  };

  const renderJob = async () => {
    const job = await fetchJob();
    console.log('📦 Job loaded:', job);

    if (!job?.title) {
      window.location.href = 'https://empoweredrecruitment-ec87a032a3d444380f.webflow.io/explore-jobs';
      return;
    }

    const setText = (selector, value) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = value;
    };

    setText('[data-element="job-title"]', job.title);
    setText('[data-element="job-city"]', job.city);
    const descEl = document.querySelector('[data-element="job-description"]');
    if (descEl) descEl.innerHTML = job.description;

    const owner = job.owners?.[0];
    if (owner) {
      setText('[data-element="owner"]', owner.name);

      const ownerPhoto = document.querySelector('[data-element="owner-photo"]');
      const fallbackPhoto = 'https://uploads-ssl.webflow.com/66782c28be38686013eaecc8/66977e1201992d31e243ec13_taylen-erickson.webp';

      if (ownerPhoto) {
        ownerPhoto.src = owner.avatar_original_url || fallbackPhoto;
        ownerPhoto.srcset = `${ownerPhoto.src} 1x, ${ownerPhoto.src} 2x`;
      }
    }

    setText('[data-element="job-category"]', job.category?.name || 'Others');
    setText('[data-element="job-type"]', job.job_type?.name || '');
    setText('[data-element="job-salary"]', job.salary || '');
  };

  renderJob();

  // Apply Job Form
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
        .catch((err) => console.error('❌ Error submitting form:', err));
    });
  });

  // Filepond Input (CMS-driven)
  document.querySelectorAll('form[ms-code-file-upload="form"]').forEach((form) => {
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

  // Copy Job URL
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

  // Skeleton Loading
  document.querySelectorAll('[ms-code-skeleton]').forEach((element) => {
    const skeletonDiv = document.createElement('div');
    skeletonDiv.classList.add('skeleton-loader');
    element.style.position = 'relative';
    element.appendChild(skeletonDiv);
  });

  // Open Apply Modal
  const applyBtn = document.querySelector('.apply-jobs.w-button');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      document.querySelector('.modal-apply-jobs').style.display = 'grid';
    });
  }
});
