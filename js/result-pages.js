document.addEventListener('DOMContentLoaded', async function() {
  // Protect this route
  protectRoute();
  
  // Get the last scan ID from localStorage
  const scanId = localStorage.getItem('lastScanId');
  
  if (!scanId) {
    // No scan ID, redirect to check-job page
    window.location.href = 'check-job.html';
    return;
  }
  
  try {
    // Fetch scan details
    const response = await getJobScan(scanId);
    
    if (response.success && response.data.jobScan) {
      const scan = response.data.jobScan;
      
      // Update page content based on scan results
      updatePageContent(scan);
      
      // Setup report button if on high-risk page
      setupReportButton(scanId);
    }
  } catch (error) {
    console.error('Error loading scan results:', error);
    showError('Failed to load scan results', 'error-message');
  }
  
  // Update auth UI
  updateAuthUI();
});

/**
 * Update page content with scan results
 */
function updatePageContent(scan) {
  // Update scam probability
  const percentElements = document.querySelectorAll('.percent');
  percentElements.forEach(el => {
    el.textContent = `${scan.scamProbability}%`;
  });
  
  // Update warning signs count
  const bigNumElements = document.querySelectorAll('.big-num');
  const warningCount = scan.warningFlags ? scan.warningFlags.filter(f => f.detected).length : 0;
  bigNumElements.forEach(el => {
    el.textContent = warningCount;
  });
  
  // Update alert list with actual warnings
  const alertList = document.querySelector('.alert-list');
  if (alertList && scan.warningFlags) {
    alertList.innerHTML = '';
    
    const detectedFlags = scan.warningFlags.filter(f => f.detected);
    detectedFlags.forEach(flag => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="dot"></span><span>${flag.description}</span>`;
      alertList.appendChild(li);
    });
  }
  
  // Update status box (for high-risk page)
  const statusText = document.querySelector('.status-text ul');
  if (statusText && scan.warningFlags) {
    statusText.innerHTML = '';
    
    const detectedFlags = scan.warningFlags.filter(f => f.detected);
    detectedFlags.slice(0, 3).forEach(flag => {
      const li = document.createElement('li');
      li.textContent = flag.description;
      statusText.appendChild(li);
    });
  }
  
  // Add company name and job title if available
  const title = document.querySelector('.title');
  if (title && scan.companyName) {
    const companyInfo = document.createElement('p');
    companyInfo.style.cssText = 'font-size: 1rem; margin-top: 10px; color: #64748b;';
    companyInfo.textContent = `Company: ${scan.companyName}`;
    if (scan.jobTitle) {
      companyInfo.textContent += ` | Position: ${scan.jobTitle}`;
    }
    title.after(companyInfo);
  }
}

/**
 * Setup report button functionality
 */
function setupReportButton(scanId) {
  const reportBtn = document.querySelector('.stat-right');
  
  if (reportBtn && reportBtn.textContent.includes('Report')) {
    reportBtn.addEventListener('click', async function() {
      const reason = prompt('Please describe why you\'re reporting this job (minimum 10 characters):');
      
      if (!reason || reason.length < 10) {
        alert('Please provide a detailed reason (at least 10 characters)');
        return;
      }
      
      showLoading(reportBtn, 'Reporting...');
      
      try {
        const response = await reportJob(scanId, reason);
        
        if (response.success) {
          alert('Thank you! This job has been reported successfully.');
          reportBtn.textContent = 'Reported ✓';
          reportBtn.disabled = true;
        }
      } catch (error) {
        alert('Failed to report job. Please try again.');
        hideLoading(reportBtn);
      }
    });
  }
}