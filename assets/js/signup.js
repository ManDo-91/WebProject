// Password validation functions
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password)
    };

    // Update UI for each requirement
    Object.keys(requirements).forEach(req => {
        const element = document.getElementById(req);
        if (element) {
            const icon = element.querySelector('i');
            if (requirements[req]) {
                element.classList.add('valid');
                element.classList.remove('invalid');
                icon.className = 'fas fa-check';
            } else {
                element.classList.add('invalid');
                element.classList.remove('valid');
                icon.className = 'fas fa-times';
            }
        }
    });

    return Object.values(requirements).every(Boolean);
}

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const adminKeyGroup = document.getElementById('adminKeyGroup');

    // Show/hide admin key input based on email
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const isAdminEmail = this.value.toLowerCase().includes('admin');
            if (adminKeyGroup) {
                adminKeyGroup.style.display = isAdminEmail ? 'block' : 'none';
            }
        });
    }

    // Real-time password validation
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value);
        });
    }

    // Confirm password validation
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const confirmPassword = this.value;
            
            if (password !== confirmPassword) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const terms = document.getElementById('terms').checked;
            const adminKey = document.getElementById('adminKey')?.value.trim();

            // Clear previous error
            showError('');

            // Validate all fields
            if (!fullname || !email || !password || !confirmPassword) {
                showError('Please fill in all fields');
                return;
            }

            if (!validatePassword(password)) {
                showError('Password does not meet requirements');
                return;
            }

            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }

            if (!terms) {
                showError('Please agree to the Terms & Conditions');
                return;
            }

            // If trying to register as admin, validate admin key
            const isAdminEmail = email.includes('admin');
            if (isAdminEmail && !adminKey) {
                showError('Admin registration key is required for admin accounts');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fullname,
                        email,
                        password,
                        adminKey: isAdminEmail ? adminKey : undefined
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Store user data
                    localStorage.setItem('currentUser', JSON.stringify(data));
                    alert('Account created successfully! Please log in.');
                    window.location.href = 'login.html';
                } else {
                    showError(data.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Error during registration:', error);
                showError('An error occurred during registration. Please try again.');
            }
        });
    }
});

// Function to show error messages
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
} 
