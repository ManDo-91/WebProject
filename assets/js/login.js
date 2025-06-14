document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember').checked;

            // Clear previous error
            showError('');

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Store user data
                    localStorage.setItem('currentUser', JSON.stringify(data));
                    
                    if (rememberMe) {
                        localStorage.setItem('rememberedEmail', email);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }

                    // Show welcome message
                    const welcomeMessage = document.getElementById('welcome-message');
                    const userName = document.getElementById('user-name');
                    if (welcomeMessage && userName) {
                        userName.textContent = data.name;
                        welcomeMessage.style.display = 'block';
                    }

                    // Redirect based on role
                    if (data.isAdmin) {
                        window.location.href = '../admin/admin-dashboard.html';
                    } else {
                        window.location.href = '../../index.html';
                    }
                } else {
                    showError(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Error during login:', error);
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

// Function to display error messages
function showError(message) {
    const errorMessageDiv = document.getElementById('errorMessage');
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = message ? 'block' : 'none';
    }
}

// Function to show welcome message
function showWelcomeMessage(name) {
    // Create welcome message element
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
        <div class="welcome-content">
            <h2>Welcome, ${name}!</h2>
            <p>You have successfully logged in.</p>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .welcome-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            text-align: center;
            animation: fadeIn 0.5s ease-in-out;
        }
        .welcome-content h2 {
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -60%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(welcomeDiv);
} 