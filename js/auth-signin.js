// js/auth-signin.js
// Sign in page functionality

document.addEventListener('DOMContentLoaded', function() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const continueBtn = document.querySelector('.primary');
  const googleBtn = document.querySelector('.google-btn');
  
  // Handle form submission
  if (continueBtn) {
    continueBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      // Clear previous errors
      clearErrors();
      
      // Validation
      if (!email || !password) {
        showError('Please enter both email and password', 'error-message');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError('Please enter a valid email address', 'error-message');
        return;
      }
      
      showLoading(continueBtn, 'Signing In...');
      
      try {
        const response = await loginUser({ email, password });
        
        if (response.success) {
          showSuccess('Login successful! Redirecting...', 'success-message');
          
          // Redirect to check-job page
          setTimeout(() => {
            window.location.href = 'check-job.html';
          }, 1000);
        }
      } catch (error) {
        let errorMessage = 'Login failed. Please check your credentials.';
        
        if (error.message.includes('locked')) {
          errorMessage = 'Your account has been locked due to multiple failed login attempts. Please try again later.';
        } else if (error.message.includes('credentials')) {
          errorMessage = 'Invalid email or password';
        }
        
        showError(errorMessage, 'error-message');
        hideLoading(continueBtn);
      }
    });
  }
  
  // Handle Google OAuth
  if (googleBtn) {
    googleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Redirect to backend Google OAuth endpoint
      window.location.href = `${API_CONFIG.BASE_URL}/auth/google`;
    });
  }
  
  // Enter key to submit
  [emailInput, passwordInput].forEach(input => {
    if (input) {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          continueBtn.click();
        }
      });
    }
  });
  
  // Add error/success message containers
  function ensureMessageContainers() {
    const card = document.querySelector('.card');
    if (!card) return;
    
    if (!document.getElementById('error-message')) {
      const errorDiv = document.createElement('div');
      errorDiv.id = 'error-message';
      errorDiv.style.cssText = 'display:none; background:#fee; border:1px solid #fcc; color:#c33; padding:10px; border-radius:5px; margin:15px 0;';
      const title = card.querySelector('.title');
      if (title) {
        title.after(errorDiv);
      }
    }
    
    if (!document.getElementById('success-message')) {
      const successDiv = document.createElement('div');
      successDiv.id = 'success-message';
      successDiv.style.cssText = 'display:none; background:#efe; border:1px solid #cfc; color:#3c3; padding:10px; border-radius:5px; margin:15px 0;';
      const title = card.querySelector('.title');
      if (title) {
        title.after(successDiv);
      }
    }
  }
  
  function clearErrors() {
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) errorMsg.style.display = 'none';
  }
  
  ensureMessageContainers();
});
