document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Handle admin login form submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            if (!email || !password) {
                showError('Please fill in all fields');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    if (data.user && data.user.role === 'admin') {
                        localStorage.setItem('currentUser', JSON.stringify(data.user));
                        localStorage.setItem('token', data.token);
                        if (remember) {
                            localStorage.setItem('rememberedEmail', email);
                            localStorage.setItem('rememberedPassword', password);
                        } else {
                            localStorage.removeItem('rememberedEmail');
                            localStorage.removeItem('rememberedPassword');
                        }
                        window.location.href = '../admin/admin-dashboard.html';
                    } else {
                        showError('Access denied: Not an admin account');
                    }
                } else {
                    showError(data.message || 'Invalid credentials');
                }
            } catch (error) {
                showError('An error occurred during login. Please try again.');
            }
        });
    }

    // Load remembered credentials if they exist
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    if (rememberedEmail && rememberedPassword) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('password').value = rememberedPassword;
        document.getElementById('remember').checked = true;
    }
});

// Error message handling
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
} 
