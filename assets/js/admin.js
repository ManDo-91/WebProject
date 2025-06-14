// Check if user is logged in as admin
function checkAdminAuth() {
    const adminData = JSON.parse(localStorage.getItem('currentUser'));
    if (!adminData || adminData.role !== 'admin') {
        window.location.href = '../auth/admin-login.html';
        return;
    }
    return adminData;
}

// Update admin information in the dashboard
function updateAdminInfo() {
    const adminData = checkAdminAuth();
    if (adminData) {
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement) {
            adminNameElement.textContent = adminData.fullname;
        }
    }
}

// Handle logout
function handleLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = '../auth/admin-login.html';
        });
    }
}

// Update dashboard stats (fetch real data from backend)
function updateDashboardStats() {
    const adminData = checkAdminAuth();
    fetch('http://localhost:5000/api/admin/stats', {
        headers: {
            'x-user-email': adminData.email
        }
    })
    .then(res => res.json())
    .then(stats => {
        const statMap = {
            totalSales: stats.totalRevenue,
            totalOrders: stats.orderCount,
            totalCustomers: stats.userCount,
            totalProducts: stats.productCount,
            averageOrderValue: stats.orderCount ? (stats.totalRevenue / stats.orderCount).toFixed(2) : 0
        };
        Object.keys(statMap).forEach(stat => {
            const element = document.querySelector(`[data-stat="${stat}"]`);
            if (element) {
                element.textContent = formatStatValue(stat, statMap[stat]);
            }
        });
    });
}

// Format stat values based on their type
function formatStatValue(stat, value) {
    switch (stat) {
        case 'totalSales':
            return `$${value.toLocaleString()}`;
        case 'averageOrderValue':
            return `$${value}`;
        default:
            return value.toLocaleString();
    }
}

// Update recent activity (in a real application, this would fetch data from an API)
function updateRecentActivity() {
    // This is mock data - in a real application, you would fetch this from your backend
    const activities = [
        {
            type: 'order',
            title: 'New order #12345',
            time: '2 minutes ago',
            icon: 'shopping-cart'
        },
        {
            type: 'customer',
            title: 'New customer registration',
            time: '15 minutes ago',
            icon: 'user'
        },
        {
            type: 'product',
            title: 'Product stock updated',
            time: '1 hour ago',
            icon: 'box'
        }
    ];

    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <li class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </li>
        `).join('');
    }
}

// Initialize dashboard
function initDashboard() {
    checkAdminAuth();
    updateAdminInfo();
    handleLogout();
    updateDashboardStats();
    updateRecentActivity();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard); 