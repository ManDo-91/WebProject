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

        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const terms = document.getElementById('terms').checked;

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

            // Here you would typically make an API call to your backend to register the user
            // For now, we'll just simulate a successful signup and store basic user data
            const userData = {
                fullname,
                email,
                password, // In a real application, you would hash the password before storing
                role: 'user'
            };
            localStorage.setItem('registeredUser', JSON.stringify(userData));
            
            // Show success message or redirect
            alert('Account created successfully! Please log in.'); // Simple alert for demo
            window.location.href = 'login.html'; // Redirect to login page
        });
    }

    // Error message handling (keep this function if used only on signup page, otherwise move to a common file)
    function showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        }
    }
}); 