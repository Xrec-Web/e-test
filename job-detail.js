const fetchData = async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const jobId = urlParams.get('id');

  if (!jobId) {
    window.location.href = 'https://empoweredrecruitment-ec87a032a3d444380f.webflow.io/explore-jobs';
  }

  let fetchJob = async () => {
    try {
      const response = await fetch(
        `https://e-test-nu.vercel.app/api/job?id=${jobId}`
      );
      const data = await response.json();

      const skeletonElements = document.querySelectorAll('[ms-code-skeleton]');

      skeletonElements.forEach((element) => {
        // Get delay from the attribute
        let delay = element.getAttribute('ms-code-skeleton');

        // If attribute value is not a number, set default delay as 2000ms
        if (isNaN(delay)) {
          delay = 2000;
        }

        setTimeout(() => {
          // Remove the skeleton loader div after delay
          const skeletonDiv = element.querySelector('.skeleton-loader');
          element.removeChild(skeletonDiv);
        }, delay);
      });

      return data;
    } catch (error) {
      return [];
    }
  };

  const job = await fetchJob();

  document.querySelector('#jobDetail [data-element="job-title"]').textContent =
    job.title;
  document.querySelector('#jobDetail [data-element="job-city"]').textContent =
    job.city;
  document.querySelector(
    '#jobDetail [data-element="job-description"]'
  ).innerHTML = job.description;
  // document.querySelector('#jobDetail [data-element="email"]').textContent = job.owners[0].email;
  document.querySelector('#jobDetail [data-element="phone"]').textContent =
    job.owners[0].phone;
  const phoneElement = document.querySelector(
    '#jobDetail [data-element="phone-link"]'
  );
  phoneElement.href = job.owners[0].phone
    ? `tel:${job.owners[0].phone}`
    : 'tel:0423384865';
  document.querySelector('[data-element="owner"]').textContent =
    job.owners[0].name ?? '-';
  document
    .querySelector('[data-element="owner-photo"]')
    .setAttribute(
      'src',
      job.owners[0].avatar_original_url !==
        '/profile_pictures/thumb/missing.png'
        ? job.owners[0].avatar_original_url
        : 'https://cdn.prod.website-files.com/66ab275c686b101e83985ce0/66d08d1235678a512fbcc506_Screenshot%202024-08-30%20at%2012.59.28%E2%80%AFam.webp'
    );
  document.querySelector(
    '#jobDetail [data-element="job-category"]'
  ).textContent = job.category === null ? 'Others' : job.category.name;
  document.querySelector('#jobDetail [data-element="job-type"]').textContent =
    job.job_type.name;
  document.querySelector('#jobDetail [data-element="job-salary"]').textContent =
    `${parseFloat(job.salary_min)}k - ${parseFloat(
      job.salary_max
    )}k AUD / year`;
  // document.querySelector('#jobDetail [data-element="job-date"]').textContent =
  //  moment(job.published_at).startOf("day").fromNow();
  // document.querySelector('#jobDetail [data-element="job-due-date"]').textContent = job.published_end_date ? moment(job.published_end_date).format("LL") : "-";
};

fetchData();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const jobId = urlParams.get('id');

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
        return false; // Explicitly return false to stop further processing
      }
  
      const form = new FormData();
      form.append('email', document.getElementById('Email').value);
      form.append('name', document.getElementById('Name').value);
      form.append('phone', document.getElementById('Phone').value);
      form.append('linkedin', document.getElementById('LinkedIn').value);
      form.append('resume', file.file, file.file.name); // Ensure the file is sent with a name
  
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          JobId: jobId, // Send Job ID via header
        },
        body: form,
      };
  
      // Disable the submit button while processing
      $('.submit-button-apply-job')
        .val('Please Wait...')
        .css('cursor', 'not-allowed')
        .attr('disabled', true);
  
      try {
        const response = await fetch(
          'https://e-test-nu.vercel.app/api/apply',
          options
        );
  
        // Parse the response as JSON
        const responseData = await response.json();
  
        // Check the success property in the parsed response
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
          alert('Failed to submit the form. Please try again.');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while submitting the form. Please try again.');
      } finally {
        // Re-enable the submit button after processing
        $('.submit-button-apply-job')
          .val('Submit')
          .css('cursor', 'pointer')
          .attr('disabled', false);
      }
  
      return false; // Explicitly return false to prevent Webflow behavior
    });
  });
});

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

// Copy Url Button
document.getElementById('copy-url').addEventListener('click', function () {
  var currentUrl = window.location.href;
  // Create a temporary input element
  var tempInput = document.createElement('input');
  tempInput.setAttribute('value', currentUrl);
  document.body.appendChild(tempInput);
  // Select the input
  tempInput.select();
  // Copy the selected text
  document.execCommand('copy');
  // Remove the input from the body
  document.body.removeChild(tempInput);

  // Get the tooltip element
  var exampleElement = $('.interaction-copy');
  // Add the class after a delay (e.g., 0 milliseconds for immediate execution)
  setTimeout(function () {
    exampleElement.addClass('active');
  }, 0);
  // Remove the class after 3 seconds
  setTimeout(function () {
    exampleElement.removeClass('active');
  }, 2000);
});

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
