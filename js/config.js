const API_CONFIG = {
  // Base URL of the API
  BASE_URL: 'https://jobguard-api.onrender.com/api/v1',
  
  // Endpoints
  ENDPOINTS: {
    // Auth endpoints
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    GET_ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgotpassword',
    RESET_PASSWORD: '/auth/resetpassword',
    
    // Job endpoints
    CREATE_JOB_SCAN: '/jobs',
    GET_JOB_SCANS: '/jobs',
    GET_JOB_SCAN: '/jobs',
    DELETE_JOB_SCAN: '/jobs',
    REPORT_JOB: '/jobs',
    PUBLIC_STATS: '/jobs/stats',
    
    // Analytics endpoints
    TRENDS: '/analytics/trends',
    ALERTS: '/analytics/alerts',
    USER_ANALYTICS: '/analytics/user'
  },
  
  // Request timeout
  TIMEOUT: 30000, // 30 seconds
  
  // Storage keys
  STORAGE: {
    TOKEN: 'jobguard_token',
    USER: 'jobguard_user'
  }
};

// Helper function to get full URL
function getApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Helper function to get auth token
function getAuthToken() {
  return localStorage.getItem(API_CONFIG.STORAGE.TOKEN);
}

// Helper function to set auth token
function setAuthToken(token) {
  localStorage.setItem(API_CONFIG.STORAGE.TOKEN, token);
}

// Helper function to remove auth token
function removeAuthToken() {
  localStorage.removeItem(API_CONFIG.STORAGE.TOKEN);
  localStorage.removeItem(API_CONFIG.STORAGE.USER);
}

// Helper function to get user data
function getUser() {
  const userStr = localStorage.getItem(API_CONFIG.STORAGE.USER);
  return userStr ? JSON.parse(userStr) : null;
}

// Helper function to set user data
function setUser(user) {
  localStorage.setItem(API_CONFIG.STORAGE.USER, JSON.stringify(user));
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getAuthToken();
}