document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../../pages/auth/login.html';
        return;
    }

    document.getElementById('settingsForm').addEventListener('submit', function(e) {
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
                document.getElementById('settingsSuccess').style.display = 'block';
                document.getElementById('settingsError').style.display = 'none';
            } else {
                document.getElementById('settingsSuccess').style.display = 'none';
                document.getElementById('settingsError').textContent = data.message || 'Error changing password';
                document.getElementById('settingsError').style.display = 'block';
            }
        });
    });
}); 