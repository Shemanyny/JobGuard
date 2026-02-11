// js/auth-signup.js
// Sign up page functionality

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.form');
  
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form inputs
    const firstName = form.querySelector('input[type="text"]').value.trim();
    const lastName = form.querySelectorAll('input[type="text"]')[1].value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;
    const termsCheckbox = form.querySelector('input[type="checkbox"]');
    
    // Clear any previous error messages
    clearErrors();
    
    // Validation
    if (!firstName || !lastName || !email || !password) {
      showError('Please fill in all fields', 'error-message');
      return;
    }
    
    if (!termsCheckbox.checked) {
      showError('Please agree to the terms of service', 'error-message');
      return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address', 'error-message');
      return;
    }
    
    // Validate password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
    if (password.length < 8) {
      showError('Password must be at least 8 characters long', 'error-message');
      return;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      showError('Password must contain uppercase, lowercase, and number', 'error-message');
      return;
    }
    
    // Get submit button
    const submitBtn = form.querySelector('.submit');
    showLoading(submitBtn, 'Creating Account...');
    
    try {
      // Call register API
      const response = await registerUser({
        firstName,
        lastName,
        email,
        password
      });
      
      if (response.success) {
        showSuccess('Account created successfully! Redirecting...', 'success-message');
        
        // Redirect to check-job page after 1 second
        setTimeout(() => {
          window.location.href = 'check-job.html';
        }, 1000);
      }
    } catch (error) {
      showError(error.message || 'Registration failed. Please try again.', 'error-message');
      hideLoading(submitBtn);
    }
  });
  
  // Add error/success message containers if they don't exist
  function ensureMessageContainers() {
    const authCard = document.querySelector('.auth-card');
    if (!authCard) return;
    
    if (!document.getElementById('error-message')) {
      const errorDiv = document.createElement('div');
      errorDiv.id = 'error-message';
      errorDiv.style.cssText = 'display:none; background:#fee; border:1px solid #fcc; color:#c33; padding:10px; border-radius:5px; margin-bottom:15px;';
      authCard.insertBefore(errorDiv, authCard.firstChild);
    }
    
    if (!document.getElementById('success-message')) {
      const successDiv = document.createElement('div');
      successDiv.id = 'success-message';
      successDiv.style.cssText = 'display:none; background:#efe; border:1px solid #cfc; color:#3c3; padding:10px; border-radius:5px; margin-bottom:15px;';
      authCard.insertBefore(successDiv, authCard.firstChild);
    }
  }
  
  function clearErrors() {
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) errorMsg.style.display = 'none';
  }
  
  ensureMessageContainers();
  
  // Password visibility toggle
  const passwordField = form.querySelector('.password-field');
  if (passwordField) {
    const passwordInput = passwordField.querySelector('input[type="password"]');
    const eyeIcon = passwordField.querySelector('.eye');
    
    if (eyeIcon && passwordInput) {
      eyeIcon.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          eyeIcon.textContent = '🙈';
        } else {
          passwordInput.type = 'password';
          eyeIcon.textContent = '👁️';
        }
      });
    }
  }
});

/**
 * Handle Google OAuth Authentication
 * This function is called when user clicks "Continue with Google" button
 */
window.handleGoogleAuth = function() {
  // Redirect to backend Google OAuth endpoint
  // Backend will handle the OAuth flow with Google
  window.location.href = `${API_CONFIG.BASE_URL}/auth/google`;
};
