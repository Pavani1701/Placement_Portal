// Load jobs on page load
window.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:5000/api/jobs')
    .then(response => response.json())
    .then(data => {
      const jobsContainer = document.getElementById('jobsList');
      jobsContainer.innerHTML = ''; // Clear existing jobs

      data.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.classList.add('job');

        jobCard.innerHTML = `
          <h3>${job.title}</h3>
          <p><strong>Company:</strong> ${job.company}</p>
          <p>${job.description}</p>
          <p><strong>Deadline:</strong> ${new Date(job.deadline).toLocaleDateString()}</p>
          <p><strong>Eligibility:</strong> ${job.eligibility}</p>
          <button onclick="selectJob('${job._id}', '${job.title}')">Apply</button>
          <button onclick="deleteJob('${job._id}')">Delete</button>
        `;

        jobsContainer.appendChild(jobCard);
      });
    })
    .catch(error => {
      console.error('Error fetching jobs:', error);
    });
});

// Set job info into the application form when Apply is clicked
function selectJob(jobId, jobTitle) {
  document.getElementById('jobId').value = jobId;
  document.getElementById('jobTitleDisplay').textContent = `Applying for: ${jobTitle}`;
  document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
}

// Handle application form submission
document.getElementById('applicationForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const studentName = document.getElementById('name').value;
  const studentEmail = document.getElementById('email').value;
  const jobId = document.getElementById('jobId').value;

  fetch('http://localhost:5000/api/jobs/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ studentName, studentEmail, jobId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      document.getElementById('successMessage').style.display = 'block';
      document.getElementById('applicationForm').reset();
      document.getElementById('jobTitleDisplay').textContent = '';
      setTimeout(() => {
        document.getElementById('successMessage').style.display = 'none';
      }, 2000);
    } else {
      alert(data.error || 'Failed to submit application.');
    }
  })
  .catch(error => {
    console.error('Error submitting application:', error);
  });
});
// Admin job posting form submission
document.getElementById('jobForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('jobTitle').value;
  const company = document.getElementById('company').value;
  const description = document.getElementById('description').value;
  const deadline = document.getElementById('deadline').value;
  const eligibility = document.getElementById('eligibility').value;

  const jobData = { title, company, description, deadline, eligibility };

  fetch('http://localhost:5000/api/jobs/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jobData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      document.getElementById('jobPostMessage').style.display = 'block';
      document.getElementById('jobForm').reset();
      setTimeout(() => {
        document.getElementById('jobPostMessage').style.display = 'none';
      }, 2000);

      // Optional: scroll to job list and refresh
      window.location.hash = "#jobs";
      setTimeout(() => location.reload(), 1000);
    } else {
      alert(data.error || 'Failed to post job');
    }
  })
  .catch(err => {
    console.error('Error posting job:', err);
  });
});

document.getElementById('adminLoginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('adminEmail').value;

  const password = document.getElementById('adminPassword').value;
console.log("Email:", email, "Password:", password);
  fetch('http://localhost:5000/api/auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message === 'Admin login successful') {
      document.getElementById('adminPanel').style.display = 'block';
      document.getElementById('admin-login').style.display = 'none';
      loadApplications();
    } else {
      document.getElementById('loginError').style.display = 'block';
    }
  })
  .catch(err => {
    console.error('Login failed:', err);
  });
});
function deleteJob(jobId) {
  if (!confirm('Are you sure you want to delete this job?')) return;

  fetch(`http://localhost:5000/api/jobs/${jobId}`, {
    method: 'DELETE'
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || 'Job deleted');
    location.reload(); // Refresh job list
  })
  .catch(err => {
    console.error('Error deleting job:', err);
  });
}
function loadApplications() {
  fetch('http://localhost:5000/api/applications')
    .then(res => res.json())
    .then(applications => {
      const container = document.getElementById('applicationsList');
      container.innerHTML = '';

      if (applications.length === 0) {
        container.innerHTML = '<p>No applications submitted yet.</p>';
        return;
      }

      applications.forEach(app => {
        const el = document.createElement('div');
        el.style.border = '1px solid #ccc';
        el.style.margin = '10px 0';
        el.style.padding = '10px';
        el.innerHTML = `
          <p><strong>Name:</strong> ${app.studentName}</p>
          <p><strong>Email:</strong> ${app.studentEmail}</p>
          <p><strong>Job ID:</strong> ${app.jobId}</p>
          <p><strong>Submitted:</strong> ${new Date(app.createdAt).toLocaleString()}</p>
        `;
        container.appendChild(el);
      });
    })
    .catch(err => {
      console.error('Error loading applications:', err);
    });
}


