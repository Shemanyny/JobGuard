
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Fetch trends data
    const trendsResponse = await getTrends();
    const statsResponse = await getPublicStats();
    
    if (trendsResponse.success) {
      updateTrendsChart(trendsResponse.data.monthlyTrends);
      updateScamDistribution(trendsResponse.data.scamTypeDistribution);
    }
    
    if (statsResponse.success && statsResponse.data.stats) {
      updateStats(statsResponse.data.stats);
    }
  } catch (error) {
    console.error('Error loading trends data:', error);
  }
  
  // Update auth UI
  updateAuthUI();
});

/**
 * Update statistics cards with real data
 */
function updateStats(stats) {
  const statValues = document.querySelectorAll('.stat .value');
  
  if (statValues.length >= 4) {
    // Scam Jobs Detected
    statValues[0].textContent = formatNumber(stats.highRisk || 0);
    
    // Jobs Verified Safe
    statValues[1].textContent = formatNumber(stats.lowRisk || 0);
    
    // Flagged for Review
    statValues[2].textContent = formatNumber(stats.mediumRisk || 0);
    
    // Total Users/Scans
    statValues[3].textContent = formatNumber(stats.totalScans || 0);
  }
}

/**
 * Update trends chart with real monthly data
 */
function updateTrendsChart(monthlyData) {
  if (!monthlyData || monthlyData.length === 0) return;
  
  const bars = document.querySelectorAll('.bar-col');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Create a map of month data
  const dataMap = {};
  monthlyData.forEach(item => {
    const monthName = months[item._id.month - 1];
    dataMap[monthName] = {
      total: item.totalScans,
      scams: item.scamsDetected,
      safe: item.safeJobs
    };
  });
  
  // Find max value for scaling
  const maxValue = Math.max(...monthlyData.map(d => d.totalScans));
  
  // Update each bar
  bars.forEach((barCol, index) => {
    const monthLabel = barCol.querySelector('.m-label').textContent;
    const data = dataMap[monthLabel];
    
    if (data) {
      const bar = barCol.querySelector('.bar');
      const percentage = (data.total / maxValue) * 100;
      bar.style.height = `${Math.max(percentage, 5)}%`;
      
      // Color based on scam ratio
      const scamRatio = data.total > 0 ? data.scams / data.total : 0;
      const tint = barCol.querySelector('.tint');
      
      if (scamRatio > 0.3) {
        bar.classList.remove('green');
        bar.classList.add('red');
        tint.classList.remove('green');
        tint.classList.add('red');
      } else {
        bar.classList.remove('red');
        bar.classList.add('green');
        tint.classList.remove('red');
        tint.classList.add('green');
      }
    }
  });
}

/**
 * Update scam type distribution with real data
 */
function updateScamDistribution(scamTypes) {
  if (!scamTypes || scamTypes.length === 0) return;
  
  const distItems = document.querySelectorAll('.dist > div');
  
  // Calculate total for percentages
  const total = scamTypes.reduce((sum, item) => sum + item.count, 0);
  
  // Map scam type IDs to display names
  const typeNames = {
    'fake_recruiter': 'Fake Recruiters',
    'phishing': 'Phishing Jobs',
    'advance_fee': 'Advance Fee',
    'data_harvesting': 'Data Harvesting',
    'mlm_disguised': 'MLM Disguised',
    'unrealistic_salary': 'Unrealistic Salaries',
    'pressure_tactics': 'Pressure Tactics',
    'suspicious_email': 'Suspicious Emails'
  };
  
  // Update existing items with real data
  scamTypes.slice(0, 5).forEach((type, index) => {
    if (distItems[index]) {
      const percentage = Math.round((type.count / total) * 100);
      const name = typeNames[type._id] || type._id;
      
      const distName = distItems[index].querySelector('.dist-name');
      const pct = distItems[index].querySelector('.pct');
      const fill = distItems[index].querySelector('.fill');
      
      if (distName) distName.textContent = name;
      if (pct) pct.textContent = `${percentage}%`;
      if (fill) fill.style.width = `${percentage}%`;
    }
  });
}

/**
 * Format number with K/M suffix
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}