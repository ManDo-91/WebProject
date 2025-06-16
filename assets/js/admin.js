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

// Handle add product form submission
function handleAddProduct() {
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const adminData = checkAdminAuth();
            if (!adminData) return;

            const formData = new FormData();
            formData.append('name', document.getElementById('productName').value);
            formData.append('category', document.getElementById('productCategory').value);
            formData.append('price', document.getElementById('productPrice').value);
            formData.append('stock', document.getElementById('productStock').value);
            formData.append('description', document.getElementById('productDescription').value);
            
            const imageFile = document.getElementById('productImage').files[0];
            if (imageFile) {
                formData.append('images', imageFile);
            }

            try {
                const response = await fetch('http://localhost:5000/api/products', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Product added successfully!');
                    closeAddProductModal();
                    addProductForm.reset();
                    // Refresh the products list if on the products page
                    if (typeof loadProducts === 'function') {
                        loadProducts();
                    }
                } else {
                    alert(data.message || 'Error adding product');
                }
            } catch (error) {
                console.error('Error adding product:', error);
                alert('Error adding product. Please try again.');
            }
        });
    }
}

// Show add product modal
function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Close add product modal
function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Format stat values based on their type
function formatStatValue(stat, value) {
    if (value === undefined || value === null) {
        return stat.includes('Value') ? '$0' : '0';
    }

    switch (stat) {
        case 'totalSales':
            return `$${Number(value).toLocaleString()}`;
        case 'averageOrderValue':
            return `$${Number(value).toFixed(2)}`;
        default:
            return Number(value).toLocaleString();
    }
}

// Update dashboard stats (fetch real data from backend)
function updateDashboardStats() {
    const adminData = checkAdminAuth();
    if (!adminData) return;

    fetch('http://localhost:5000/api/admin/stats', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-user-email': adminData.email,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Failed to fetch stats');
        }
        return res.json();
    })
    .then(stats => {
        const statMap = {
            totalSales: stats.totalRevenue || 0,
            totalOrders: stats.orderCount || 0,
            totalCustomers: stats.userCount || 0,
            totalProducts: stats.productCount || 0,
            averageOrderValue: stats.orderCount ? (stats.totalRevenue / stats.orderCount).toFixed(2) : 0
        };
        Object.keys(statMap).forEach(stat => {
            const element = document.querySelector(`[data-stat="${stat}"]`);
            if (element) {
                element.textContent = formatStatValue(stat, statMap[stat]);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching dashboard stats:', error);
        // Set default values on error
        const statMap = {
            totalSales: 0,
            totalOrders: 0,
            totalCustomers: 0,
            totalProducts: 0,
            averageOrderValue: 0
        };
        Object.keys(statMap).forEach(stat => {
            const element = document.querySelector(`[data-stat="${stat}"]`);
            if (element) {
                element.textContent = formatStatValue(stat, statMap[stat]);
            }
        });
    });
}

// Update recent activity
async function updateRecentActivity() {
    const adminData = checkAdminAuth();
    if (!adminData) return;

    try {
        const response = await fetch('http://localhost:5000/api/admin/activity', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'x-user-email': adminData.email,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recent activity');
        }

        const activities = await response.json();
        displayActivities(activities);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        // Display default activities on error
        const defaultActivities = [
            {
                type: 'info',
                title: 'No recent activity available',
                time: 'Just now',
                icon: 'info-circle'
            }
        ];
        displayActivities(defaultActivities);
    }
}

// Display activities in the UI
function displayActivities(activities) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;

    if (!Array.isArray(activities) || activities.length === 0) {
        activityList.innerHTML = `
            <li class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-title">No recent activity</div>
                    <div class="activity-time">Just now</div>
                </div>
            </li>
        `;
        return;
    }

    activityList.innerHTML = activities.map(activity => `
        <li class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-title">${activity.title || 'Activity'}</div>
                <div class="activity-time">${formatActivityTime(activity.time)}</div>
            </div>
        </li>
    `).join('');
}

// Get appropriate icon for activity type
function getActivityIcon(type) {
    const iconMap = {
        order: 'shopping-cart',
        customer: 'user',
        product: 'box',
        sale: 'dollar-sign',
        info: 'info-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle'
    };
    return iconMap[type] || 'circle';
}

// Format activity time
function formatActivityTime(time) {
    if (!time) return 'Just now';
    
    try {
        const date = new Date(time);
        if (isNaN(date.getTime())) {
            return time; // Return original string if not a valid date
        }

        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (days < 7) {
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    } catch (error) {
        console.error('Error formatting time:', error);
        return time; // Return original string on error
    }
}

// Initialize dashboard
function initDashboard() {
    checkAdminAuth();
    updateAdminInfo();
    handleLogout();
    updateDashboardStats();
    updateRecentActivity();
    handleAddProduct();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard); 
