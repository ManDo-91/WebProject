document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../../pages/auth/login.html';
        return;
    }

    const userEmail = currentUser.email ? currentUser.email.toLowerCase() : '';
    console.log('Orders Page Debug: Sending email in header:', userEmail);

    fetch('http://localhost:5000/api/orders', {
        headers: {
            'x-user-email': userEmail
        }
    })
    .then(res => res.json())
    .then(orders => {
        if (!orders.length) {
            document.getElementById('noOrders').style.display = 'block';
            return;
        }
        let html = `<table><thead><tr>`;
        if (currentUser.isAdmin) {
            html += `<th>User</th>`;
        }
        html += `<th>Order ID</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>`;
        orders.forEach(order => {
            html += `<tr>`;
            if (currentUser.isAdmin) {
                html += `<td>${order.user ? order.user.fullname + ' (' + order.user.email + ')' : 'N/A'}</td>`;
            }
            html += `<td>${order._id}</td>`;
            html += `<td class="order-items">`;
            if (order.items && order.items.length) {
                html += '<ul>';
                order.items.forEach(item => {
                    html += `<li>${item.product && item.product.name ? item.product.name : 'Product'} x ${item.quantity} ($${item.price})</li>`;
                });
                html += '</ul>';
            } else {
                html += 'No items';
            }
            html += `</td>`;
            html += `<td>$${order.total.toFixed(2)}</td>`;
            html += `<td class="status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</td>`;
            html += `</tr>`;
        });
        html += `</tbody></table>`;
        document.getElementById('ordersTableContainer').innerHTML = html;
    });
}); 