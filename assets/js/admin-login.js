document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Handle admin login form submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            // Basic validation
            if (!email || !password) {
                showError('Please fill in all fields');
                return;
            }

            // Get admin data from localStorage
            const adminData = JSON.parse(localStorage.getItem('adminData'));
            
            // Check if admin exists and credentials match
            if (adminData && adminData.email === email && adminData.password === password) {
                // Store admin session
                localStorage.setItem('currentUser', JSON.stringify({
                    role: 'admin',
                    email: email,
                    name: adminData.fullname,
                    position: adminData.position,
                    department: adminData.department
                }));

                // Handle remember me
                if (remember) {
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberedPassword', password);
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberedPassword');
                }

                // Redirect to admin dashboard
                window.location.href = '../admin/dashboard.html';
            } else {
                showError('Invalid admin credentials');
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
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }
} 