// Global jobId accessible across the script
let jobId = '';

const fetchData = async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  jobId = urlParams.get('id');

  if (!jobId) {
    window.location.href = 'https://empoweredrecruitment-ec87a032a3d444380f.webflow.io/explore-jobs';
    return;
  }

  try {
    const response = await fetch(`https://e-test-nu.vercel.app/api/job?id=${jobId}`, {
      method: 'GET',
      headers: { accept: 'application/json' },
    });

    const data = await response.json();

    if (!data || !data.title) {
      window.location.href = 'https://empoweredrecruitment-ec87a032a3d444380f.webflow.io/explore-jobs';
      return;
    }

    // Remove skeleton loaders
    document.querySelectorAll('[ms-code-skeleton]').forEach((element) => {
      const skeleton = element.querySelector('.skeleton-loader');
      if (skeleton) element.removeChild(skeleton);
    });

    document.querySelector('[data-element="job-title"]').textContent = data.title;
    document.querySelector('[data-element="job-city"]').textContent = data.city || '—';
    document.querySelector('[data-element="job-description"]').innerHTML = data.description || '';
    document.querySelector('[data-element="job-category"]').textContent = data.category?.name || 'Others';
    document.querySelector('[data-element="job-type"]').textContent = data.job_type?.name || '—';
    document.querySelector('[data-element="job-salary"]').textContent = data.salary || '—';

    const owner = data.owners?.[0];
    const ownerPhoto = document.querySelector('[data-element="owner-photo"]');
    const fallbackPhoto = 'https://uploads-ssl.webflow.com/66782c28be38686013eaecc8/66977e1201992d31e243ec13_taylen-erickson.webp';
    if (owner) {
      document.querySelector('[data-element="owner"]').textContent = owner.name || '';
      if (ownerPhoto) {
        ownerPhoto.src = owner.avatar_original_url || fallbackPhoto;
        ownerPhoto.srcset = `${ownerPhoto.src} 1x, ${ownerPhoto.src} 2x`;
      }
    }
  } catch (error) {
    console.error('❌ Failed to fetch job:', error);
  }
};

fetchData();

// Application Form Logic
document.addEventListener('DOMContentLoaded', () => {
  // Add Skeleton Loaders
  document.querySelectorAll('[ms-code-skeleton]').forEach((element) => {
    const skeletonDiv = document.createElement('div');
    skeletonDiv.classList.add('skeleton-loader');
    element.style.position = 'relative';
    element.appendChild(skeletonDiv);
  });

  // Add File Input for FilePond
  const uploadTarget = document.querySelector('[ms-code-file-upload-input="fileToUpload"]');
  if (!uploadTarget) {
    console.error('❌ File upload container not found.');
    return;
  }

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.name = 'fileToUpload';
  fileInput.id = 'fileToUpload';
  fileInput.required = true;
  uploadTarget.appendChild(fileInput);

  const pond = FilePond.create(fileInput, {
    credits: false,
    name: 'fileToUpload',
    storeAsFile: true,
  });

  // Submit handler
  Webflow.push(function () {
    document.getElementById('wf-form-Job-Apply-Form').addEventListener('submit', async (e) => {
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

      $('.submit-button-apply-job').val('Please Wait...').attr('disabled', true);

      try {
        const res = await fetch('https://e-test-nu.vercel.app/api/apply', {
          method: 'POST',
          headers: { accept: 'application/json', JobId: jobId },
          body: form,
        });

        const result = await res.json();

        if (res.ok && result.success === true) {
          $('.modal-apply-jobs').hide();
          Toastify({
            text: 'Your application was successfully sent!',
            duration: 2000,
            gravity: 'top',
            position: 'center',
            style: { background: '#527853', color: '#FFFFFF' },
          }).showToast();
          pond.removeFile();
          document.getElementById('wf-form-Job-Apply-Form').reset();
        } else {
          console.error('❌ Failed response:', result);
          alert('Submission failed. Please try again.');
        }
      } catch (err) {
        console.error('❌ Submit error:', err);
        alert('An error occurred while submitting your application.');
      } finally {
        $('.submit-button-apply-job').val('Submit').attr('disabled', false);
      }
    });
  });

  // Copy Job URL
  const copyBtn = document.querySelector('.copy-url');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const tempInput = document.createElement('input');
      tempInput.value = window.location.href;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      const tooltip = $('.tooltip-copy-url');
      tooltip.addClass('active');
      setTimeout(() => tooltip.removeClass('active'), 2000);
    });
  }

  // Modal open button
  const applyBtn = document.querySelector('.apply-jobs.w-button');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const modal = document.querySelector('.modal-apply-jobs');
      if (modal) modal.style.display = 'grid';
    });
  }
});
