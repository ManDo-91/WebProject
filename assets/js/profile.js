document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../../pages/auth/login.html';
        return;
    }

    // Fetch profile info
    fetch('http://localhost:5000/api/profile', {
        headers: {
            'x-user-email': currentUser.email
        }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('fullname').value = data.fullname;
        document.getElementById('email').value = data.email;
        document.getElementById('role').value = data.role;
    });

    // Update profile info
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const fullname = document.getElementById('fullname').value;
        fetch('http://localhost:5000/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': currentUser.email
            },
            body: JSON.stringify({ fullname })
        })
        .then(res => res.json())
        .then(data => {
            if (data.fullname) {
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('errorMessage').style.display = 'none';
            } else {
                document.getElementById('successMessage').style.display = 'none';
                document.getElementById('errorMessage').textContent = data.message || 'Error updating profile';
                document.getElementById('errorMessage').style.display = 'block';
            }
        });
    });

    // Change password
    document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        fetch('http://localhost:5000/api/profile/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': currentUser.email
            },
            body: JSON.stringify({ oldPassword, newPassword })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Password updated') {
                document.getElementById('passwordSuccess').style.display = 'block';
                document.getElementById('passwordError').style.display = 'none';
            } else {
                document.getElementById('passwordSuccess').style.display = 'none';
                document.getElementById('passwordError').textContent = data.message || 'Error changing password';
                document.getElementById('passwordError').style.display = 'block';
            }
        });
    });
}); 