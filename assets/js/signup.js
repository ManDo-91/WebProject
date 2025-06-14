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
    // Signup form handling
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const emailInput = document.getElementById('email');
        const adminKeyGroup = document.getElementById('adminKeyGroup');
        const errorMessage = document.getElementById('errorMessage');

        // Show/hide admin key field based on email
        emailInput.addEventListener('input', function() {
            const isAdminEmail = this.value.toLowerCase().includes('admin');
            adminKeyGroup.style.display = isAdminEmail ? 'block' : 'none';
            if (!isAdminEmail) {
                document.getElementById('adminKey').value = ''; // Clear admin key if not admin email
            }
        });

        // Real-time password validation
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value);
        });

        // Confirm password validation
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const confirmPassword = this.value;
            
            if (password !== confirmPassword) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });

        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const terms = document.getElementById('terms').checked;
            const adminKey = document.getElementById('adminKey').value.trim();

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
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
        if (message) {
            // Make the error message visible for a few seconds
            errorElement.style.opacity = '1';
            setTimeout(() => {
                errorElement.style.opacity = '0';
                // Optionally hide it completely after transition
                setTimeout(() => { errorElement.style.display = 'none'; }, 500); 
            }, 5000); // Show for 5 seconds
        }
    }
} 