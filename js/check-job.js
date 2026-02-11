document.addEventListener('DOMContentLoaded', function() {
  // Protect this route - require authentication
  protectRoute();
  
  const jobLinkInput = document.querySelector('.link-row input');
  const goButton = document.querySelector('.go');
  const fileInput = document.getElementById('jobFile');
  const uploadLabel = document.querySelector('.upload');
  const analyzeButton = document.querySelector('.analyze');
  
  let selectedFile = null;
  
  // Handle quick analyze with go button
  if (goButton) {
    goButton.addEventListener('click', function() {
      const jobInput = jobLinkInput.value.trim();
      
      if (!jobInput) {
        showError('Please enter a job URL or description', 'error-message');
        return;
      }
      
      analyzeJob(jobInput);
    });
  }
  
  // Handle file selection
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      
      if (file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          showError('File size must be less than 5MB', 'error-message');
          fileInput.value = '';
          return;
        }
        
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 
                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                             'text/plain'];
        
        if (!allowedTypes.includes(file.type)) {
          showError('Only PDF, DOC, DOCX, and TXT files are allowed', 'error-message');
          fileInput.value = '';
          return;
        }
        
        selectedFile = file;
        
        // Update upload label to show file name
        const uploadText = uploadLabel.querySelector('.upload-text strong');
        if (uploadText) {
          uploadText.textContent = `Selected: ${file.name}`;
        }
      }
    });
  }
  
  // Handle main analyze button
  if (analyzeButton) {
    analyzeButton.addEventListener('click', async function() {
      const jobInput = jobLinkInput.value.trim();
      
      // Validate: Either text input or file must be provided
      if (!jobInput && !selectedFile) {
        showError('Please provide a job URL, description, or upload a file', 'error-message');
        return;
      }
      
      showLoading(analyzeButton, 'Analyzing Job...');
      
      try {
        let response;
        
        if (selectedFile) {
          // Upload file
          const formData = new FormData();
          formData.append('jobFile', selectedFile);
          
          if (jobInput) {
            // Check if it's a URL or description
            const urlRegex = /^https?:\/\/.+/i;
            if (urlRegex.test(jobInput)) {
              formData.append('jobUrl', jobInput);
              formData.append('jobDescription', jobInput); // Also send as description
            } else {
              formData.append('jobDescription', jobInput);
            }
          } else {
            // If only file, add a placeholder description
            formData.append('jobDescription', 'Job posting uploaded via file');
          }
          
          response = await uploadJobFile(formData);
        } else {
          // Text only analysis
          const urlRegex = /^https?:\/\/.+/i;
          const data = {};
          
          if (urlRegex.test(jobInput)) {
            data.jobUrl = jobInput;
            data.jobDescription = jobInput; // Also send as description to satisfy validation
          } else {
            data.jobDescription = jobInput;
          }
          
          response = await createJobScan(data);
        }
        
        if (response.success) {
          // Store scan result and redirect to results page
          const scanId = response.data.jobScan.id;
          localStorage.setItem('lastScanId', scanId);
          
          // Redirect based on risk level
          const riskLevel = response.data.jobScan.riskLevel;
          switch (riskLevel) {
            case 'high':
              window.location.href = 'high-risk.html';
              break;
            case 'medium':
              window.location.href = 'medium-risk.html';
              break;
            default:
              window.location.href = 'low-risk.html';
          }
        }
      } catch (error) {
        showError(error.message || 'Analysis failed. Please try again.', 'error-message');
        hideLoading(analyzeButton);
      }
    });
  }
  
  // Helper function for quick analyze
  async function analyzeJob(jobInput) {
    showLoading(goButton, '→');
    
    try {
      // Determine if input is URL or description
      const urlRegex = /^https?:\/\/.+/i;
      const data = {};
      
      if (urlRegex.test(jobInput)) {
        data.jobUrl = jobInput;
        data.jobDescription = jobInput; // Also send as description to satisfy validation
      } else {
        data.jobDescription = jobInput;
      }
      
      const response = await createJobScan(data);
      
      if (response.success) {
        const scanId = response.data.jobScan.id;
        localStorage.setItem('lastScanId', scanId);
        
        const riskLevel = response.data.jobScan.riskLevel;
        switch (riskLevel) {
          case 'high':
            window.location.href = 'high-risk.html';
            break;
          case 'medium':
            window.location.href = 'medium-risk.html';
            break;
          default:
            window.location.href = 'low-risk.html';
        }
      }
    } catch (error) {
      showError(error.message || 'Analysis failed. Please try again.', 'error-message');
      hideLoading(goButton);
    }
  }
  
  // Add message containers
  function ensureMessageContainers() {
    const checkCard = document.querySelector('.check-card');
    if (!checkCard) return;
    
    if (!document.getElementById('error-message')) {
      const errorDiv = document.createElement('div');
      errorDiv.id = 'error-message';
      errorDiv.style.cssText = 'display:none; background:#fee; border:1px solid #fcc; color:#c33; padding:10px; border-radius:5px; margin:15px 0;';
      const cardHead = checkCard.querySelector('.card-head');
      if (cardHead) {
        cardHead.after(errorDiv);
      }
    }
  }
  
  ensureMessageContainers();
  
  // Update UI for logged in user
  updateAuthUI();
});