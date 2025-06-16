document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../../pages/auth/login.html';
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../pages/auth/login.html';
        return;
    }

    const userEmail = currentUser.email ? currentUser.email.toLowerCase() : '';
    console.log('Orders Page Debug: Sending email in header:', userEmail);

    fetch('http://localhost:5000/api/orders', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'x-user-email': userEmail
        }
    })
    .then(res => res.json())
    .then(orders => {
        if (!orders.length) {
            document.getElementById('noOrders').style.display = 'block';
            return;
        }

        const ordersGrid = document.getElementById('ordersGrid');
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            
            let statusClass = 'status-pending';
            switch(order.status.toLowerCase()) {
                case 'processing':
                    statusClass = 'status-processing';
                    break;
                case 'shipped':
                    statusClass = 'status-shipped';
                    break;
                case 'delivered':
                    statusClass = 'status-delivered';
                    break;
                case 'cancelled':
                    statusClass = 'status-cancelled';
                    break;
            }

            orderCard.innerHTML = `
                <div class="order-header">
                    <span class="order-id">Order #${order._id.slice(-6)}</span>
                    <span class="order-date">${orderDate}</span>
                </div>
                <div class="order-body">
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <img src="/${item.product?.image}" 
                                     alt="/${item.product?.name || 'Product'}" 
                                     class="item-image">
                                <div class="item-details">
                                    <div class="item-name">${item.product?.name || 'Product'}</div>
                                    <div class="item-meta">
                                        Quantity: ${item.quantity} × $${item.price.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="order-footer">
                    <div class="order-total">Total: $${order.total.toFixed(2)}</div>
                    <div class="order-status ${statusClass}">${order.status}</div>
                </div>
            `;

            ordersGrid.appendChild(orderCard);
        });
    })
    .catch(error => {
        console.error('Error fetching orders:', error);
        document.getElementById('noOrders').style.display = 'block';
    });
}); 
