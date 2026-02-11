document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Fetch alerts data
    const response = await getAlerts(10);
    
    if (response.success && response.data.alerts) {
      updateAlertsUI(response.data.alerts);
    }
  } catch (error) {
    console.error('Error loading alerts:', error);
  }
  
  // Setup load more button
  setupLoadMore();
  
  // Update auth UI
  updateAuthUI();
});

/**
 * Update alerts UI with real data
 */
function updateAlertsUI(alerts) {
  const alertList = document.querySelector('.alert-list');
  if (!alertList) return;
  
  // Clear existing alerts except first 2 (keep as examples if no data)
  if (alerts.length > 0) {
    alertList.innerHTML = '';
  }
  
  // Count high priority alerts
  const highPriorityCount = alerts.filter(a => a.riskLevel === 'high').length;
  const priorityBadge = document.querySelector('.priority');
  if (priorityBadge) {
    priorityBadge.textContent = `${highPriorityCount} High Priority`;
  }
  
  // Map warning flag types to readable names
  const flagTypeNames = {
    'fake_recruiter': 'Fake Recruiter',
    'phishing': 'Phishing',
    'advance_fee': 'Advance Fee',
    'data_harvesting': 'Data Harvesting',
    'mlm_disguised': 'MLM Scheme',
    'unrealistic_salary': 'Unrealistic Salary',
    'pressure_tactics': 'Urgency Tactics',
    'suspicious_email': 'Suspicious Email',
    'upfront_payment': 'Upfront Payment',
    'personal_info_request': 'Info Request',
    'no_company_presence': 'No Online Presence'
  };
  
  // Create alert cards
  alerts.forEach(alert => {
    const card = createAlertCard(alert, flagTypeNames);
    alertList.appendChild(card);
  });
}

/**
 * Create alert card element
 */
function createAlertCard(alert, flagTypeNames) {
  const card = document.createElement('div');
  card.className = 'alert-card';
  
  // Determine primary warning flag type
  const primaryFlag = alert.warningFlags && alert.warningFlags.length > 0 
    ? alert.warningFlags[0].type 
    : 'phishing';
  const flagTypeName = flagTypeNames[primaryFlag] || 'Warning';
  
  // Format time
  const timeAgo = getTimeAgo(new Date(alert.detectedAt));
  
  // Risk level class
  const riskClass = alert.riskLevel === 'high' ? 'high' : 'medium';
  
  card.innerHTML = `
    <div class="alert-head">
      <div>
        <div class="chips">
          <span class="chip ${riskClass}">${capitalize(alert.riskLevel)} Risk</span>
          <span class="chip type">${flagTypeName}</span>
        </div>
        <div class="alert-title">${alert.jobTitle || 'Suspicious Job Posting'}</div>
        <div class="alert-desc">
          ${getAlertDescription(alert)}
        </div>
        
        <div class="meta-row">
          <div class="meta-item">
            <span class="mini-ic">🏢</span>
            <span>${alert.company || 'Unknown Company'}</span>
          </div>
          <div class="meta-item">
            <span class="mini-ic">📍</span>
            <span>${alert.location || 'Remote'}</span>
          </div>
          <div class="meta-item">
            <span class="mini-ic">⏱</span>
            <span>${timeAgo}</span>
          </div>
        </div>
      </div>
      
      <a class="view" href="#" onclick="viewAlertDetails('${alert.id}'); return false;">
        <span>View Details</span>
        <span class="ext">↗</span>
      </a>
    </div>
  `;
  
  return card;
}

/**
 * Get alert description from warning flags
 */
function getAlertDescription(alert) {
  if (alert.warningFlags && alert.warningFlags.length > 0) {
    return alert.warningFlags[0].description;
  }
  
  return `Scam probability: ${alert.scamProbability}%. Multiple red flags detected.`;
}

/**
 * Setup load more button
 */
function setupLoadMore() {
  const loadBtn = document.querySelector('.load-btn');
  let offset = 10;
  
  if (loadBtn) {
    loadBtn.addEventListener('click', async function() {
      showLoading(loadBtn, 'Loading...');
      
      try {
        const response = await getAlerts(10);
        
        if (response.success && response.data.alerts.length > 0) {
          updateAlertsUI(response.data.alerts);
          offset += 10;
        } else {
          loadBtn.textContent = 'No more alerts';
          loadBtn.disabled = true;
        }
      } catch (error) {
        console.error('Error loading more alerts:', error);
      } finally {
        hideLoading(loadBtn);
      }
    });
  }
}

/**
 * View alert details (redirect to appropriate result page)
 */
window.viewAlertDetails = function(alertId) {
  if (!isAuthenticated()) {
    window.location.href = 'sign-in.html';
    return;
  }
  
  localStorage.setItem('lastScanId', alertId);
  // Redirect to check-job page which will then fetch and redirect to appropriate result page
  window.location.href = 'check-job.html?viewScan=' + alertId;
};

/**
 * Get time ago string
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}