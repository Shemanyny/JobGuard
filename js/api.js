// /js/api.js
/**
 * Make an API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} API response
 */
async function apiRequest(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  const token = getAuthToken();
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Merge options
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Make a GET request
 */
async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * Make a POST request
 */
async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Make a PUT request
 */
async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Make a DELETE request
 */
async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

/**
 * Upload file with form data
 */
async function apiUpload(endpoint, formData) {
  const url = getApiUrl(endpoint);
  const token = getAuthToken();
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData // Don't set Content-Type, browser will set it with boundary
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    
    return data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

// ============================================
// AUTH API FUNCTIONS
// ============================================

/**
 * Extract and normalize user data from API response
 */
function extractUserData(userData) {
  // Handle nested user object
  const user = userData.user || userData;
  
  // Normalize field names (handle different naming conventions)
  return {
    id: user.id || user._id,
    firstName: user.firstName || user.firstname || user.first_name || '',
    lastName: user.lastName || user.lastname || user.last_name || '',
    email: user.email || '',
    role: user.role || 'user'
  };
}

/**
 * Register a new user
 */
async function registerUser(userData) {
  const response = await apiPost(API_CONFIG.ENDPOINTS.REGISTER, userData);
  
  // Save token and user data
  if (response.success && response.data.token) {
    setAuthToken(response.data.token);
    const normalizedUser = extractUserData(response.data);
    setUser(normalizedUser);
  }
  
  return response;
}

/**
 * Login user
 */
async function loginUser(credentials) {
  const response = await apiPost(API_CONFIG.ENDPOINTS.LOGIN, credentials);
  
  // Save token and user data
  if (response.success && response.data.token) {
    setAuthToken(response.data.token);
    const normalizedUser = extractUserData(response.data);
    setUser(normalizedUser);
  }
  
  return response;
}

/**
 * Logout user
 */
async function logoutUser() {
  try {
    await apiPost(API_CONFIG.ENDPOINTS.LOGOUT);
  } finally {
    removeAuthToken();
    window.location.href = 'sign-in.html';
  }
}

/**
 * Get current user
 */
async function getCurrentUser() {
  return apiGet(API_CONFIG.ENDPOINTS.GET_ME);
}

// ============================================
// JOB SCAN API FUNCTIONS
// ============================================

/**
 * Create a job scan
 */
async function createJobScan(jobData) {
  return apiPost(API_CONFIG.ENDPOINTS.CREATE_JOB_SCAN, jobData);
}

/**
 * Upload job file
 */
async function uploadJobFile(formData) {
  return apiUpload(API_CONFIG.ENDPOINTS.CREATE_JOB_SCAN, formData);
}

/**
 * Get all job scans
 */
async function getJobScans(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${API_CONFIG.ENDPOINTS.GET_JOB_SCANS}?${queryString}`
    : API_CONFIG.ENDPOINTS.GET_JOB_SCANS;
  
  return apiGet(endpoint);
}

/**
 * Get single job scan
 */
async function getJobScan(id) {
  return apiGet(`${API_CONFIG.ENDPOINTS.GET_JOB_SCAN}/${id}`);
}

/**
 * Delete job scan
 */
async function deleteJobScan(id) {
  return apiDelete(`${API_CONFIG.ENDPOINTS.DELETE_JOB_SCAN}/${id}`);
}

/**
 * Report a job
 */
async function reportJob(id, reason) {
  return apiPost(`${API_CONFIG.ENDPOINTS.REPORT_JOB}/${id}/report`, { reason });
}

// ============================================
// ANALYTICS API FUNCTIONS
// ============================================

/**
 * Get public stats
 */
async function getPublicStats() {
  return apiGet(API_CONFIG.ENDPOINTS.PUBLIC_STATS);
}

/**
 * Get trends data
 */
async function getTrends() {
  return apiGet(API_CONFIG.ENDPOINTS.TRENDS);
}

/**
 * Get alerts
 */
async function getAlerts(limit = 10) {
  return apiGet(`${API_CONFIG.ENDPOINTS.ALERTS}?limit=${limit}`);
}

/**
 * Get user analytics
 */
async function getUserAnalytics(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString 
    ? `${API_CONFIG.ENDPOINTS.USER_ANALYTICS}?${queryString}`
    : API_CONFIG.ENDPOINTS.USER_ANALYTICS;
  
  return apiGet(endpoint);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Show loading state
 */
function showLoading(element, text = 'Loading...') {
  if (element) {
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.textContent = text;
  }
}

/**
 * Hide loading state
 */
function hideLoading(element) {
  if (element && element.dataset.originalText) {
    element.disabled = false;
    element.textContent = element.dataset.originalText;
  }
}

/**
 * Show error message
 */
function showError(message, elementId = null) {
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        element.style.display = 'none';
      }, 5000);
    }
  } else {
    alert(message);
  }
}

/**
 * Show success message
 */
function showSuccess(message, elementId = null) {
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        element.style.display = 'none';
      }, 3000);
    }
  } else {
    alert(message);
  }
}

/**
 * Protect routes - redirect if not authenticated
 */
function protectRoute() {
  if (!isAuthenticated()) {
    window.location.href = 'sign-in.html';
  }
}

/**
 * Update UI based on auth status
 */
function updateAuthUI() {
  const user = getUser();
  const isAuth = isAuthenticated();
  
  console.log('UpdateAuthUI - isAuth:', isAuth, 'user:', user);
  
  // Update navigation buttons
  const navRight = document.querySelector('.nav-right');
  const mobileActions = document.querySelector('.mobile-actions');
  
  if (isAuth && user && user.firstName) {
    // User is logged in - show user menu with proper name
    const userMenu = `
      <span style="margin-right: 1rem; color: #1e3a8a;">
        Welcome, ${user.firstName}!
      </span>
      <a href="check-job.html" class="btn btn-outline">Check Job</a>
      <button onclick="logoutUser()" class="btn btn-solid">Logout</button>
    `;
    
    if (navRight) navRight.innerHTML = userMenu;
    if (mobileActions) mobileActions.innerHTML = userMenu;
  } else if (isAuth) {
    // User is logged in but name is missing - try to fetch user data
    console.warn('User is authenticated but firstName is missing. User data:', user);
    
    // Show a generic welcome message
    const userMenu = `
      <span style="margin-right: 1rem; color: #1e3a8a;">
        Welcome!
      </span>
      <a href="check-job.html" class="btn btn-outline">Check Job</a>
      <button onclick="logoutUser()" class="btn btn-solid">Logout</button>
    `;
    
    if (navRight) navRight.innerHTML = userMenu;
    if (mobileActions) mobileActions.innerHTML = userMenu;
    
    // Try to fetch fresh user data from API
    getCurrentUser().then(response => {
      if (response.success && response.data) {
        const normalizedUser = extractUserData(response.data);
        setUser(normalizedUser);
        // Refresh UI with updated user data
        updateAuthUI();
      }
    }).catch(err => {
      console.error('Failed to fetch user data:', err);
    });
  }
}