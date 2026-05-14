        // Validate JWT format
        function isValidJWT(token) {
            const parts = token.split('.');
            return parts.length === 3 && parts.every(part => part.length > 0);
        }

        document.addEventListener('DOMContentLoaded', function() {
            // 1. Get token from URL query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const error = urlParams.get('error');

            // Validate token format (basic JWT check)
            if (token && !isValidJWT(token)) {
                console.error('Invalid token format');
                window.location.href = 'sign-in.html';
                return;
            }

            if (error) {
                console.error('Login error:', error);
                window.location.href = 'sign-in.html';
                return;
            }

            if (token) {
                try {
                    // 2. Save token to localStorage using the CORRECT key
                    localStorage.setItem('jobguard_token', token);
                    
                    // 3. Decode JWT token to extract user info
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                        atob(base64).split('').map(function(c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join('')
                    );
                    
                    const decodedToken = JSON.parse(jsonPayload);
                    console.log('Decoded token:', decodedToken);
                    
                    // 4. Extract user info from token
                    // The token payload structure may vary based on your backend
                    // Common structures are: { id, firstName, lastName, email } or { user: {...} }
                    let user = null;
                    
                    if (decodedToken.user) {
                        // If user info is nested under 'user' property
                        user = decodedToken.user;
                    } else if (decodedToken.id || decodedToken._id) {
                        // If user info is at root level
                        user = {
                            id: decodedToken.id || decodedToken._id,
                            firstName: decodedToken.firstName || decodedToken.firstname || decodedToken.first_name,
                            lastName: decodedToken.lastName || decodedToken.lastname || decodedToken.last_name,
                            email: decodedToken.email
                        };
                    }
                    
                    // 5. Save user info to localStorage
                    if (user && user.firstName) {
                        localStorage.setItem('jobguard_user', JSON.stringify(user));
                        console.log('User info saved:', user);
                    } else {
                        console.error('Unable to extract user info from token. Token payload:', decodedToken);
                        // Still save what we have
                        localStorage.setItem('jobguard_user', JSON.stringify(decodedToken));
                    }
                    
                    // 6. Redirect to check-job page
                    setTimeout(() => {
                        window.location.href = 'check-job.html';
                    }, 500);
                    
                } catch (e) {
                    console.error('Error processing token:', e);
                    document.getElementById('error-msg').textContent = 'Error processing login. Please try again.';
                    document.getElementById('error-msg').style.display = 'block';
                    
                    // Still try to redirect after showing error
                    setTimeout(() => {
                        window.location.href = 'sign-in.html';
                    }, 3000);
                }
            } else {
                // No token found
                console.error('No token in URL');
                window.location.href = 'sign-in.html';
            }
        });
