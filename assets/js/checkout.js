document.addEventListener('DOMContentLoaded', function() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Update cart count in header
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Display cart items in order summary
    const summaryItems = document.querySelector('.summary-items');
    if (summaryItems) {
        if (cart.length === 0) {
            summaryItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            return;
        }

        summaryItems.innerHTML = cart.map(item => `
            <div class="summary-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="summary-item-info">
                    <div class="summary-item-name">${item.name}</div>
                    <div class="summary-item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="summary-item-price">EGP ${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');

        // Calculate and update totals
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = 50; // Fixed shipping cost
        const total = subtotal + shipping;

        document.querySelector('.subtotal').textContent = `EGP ${subtotal.toFixed(2)}`;
        document.querySelector('.shipping').textContent = `EGP ${shipping.toFixed(2)}`;
        document.querySelector('.total-price').textContent = `EGP ${total.toFixed(2)}`;
    }

    // Handle form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            const email = document.getElementById('email').value;
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const address = document.getElementById('address').value;
            const city = document.getElementById('city').value;
            const country = document.getElementById('country').value;
            const state = document.getElementById('state').value;
            const zip = document.getElementById('zip').value;
            const phone = document.getElementById('phone').value;

            if (!email || !firstName || !lastName || !address || !city || !country || !state || !zip || !phone) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            // Process payment (currently simulated)
            const paymentMethod = document.querySelector('.payment-tab.active').getAttribute('data-tab');
            if (paymentMethod === 'credit-card') {
                const cardNumber = document.getElementById('card-number').value;
                const cardName = document.getElementById('card-name').value;
                const expiry = document.getElementById('expiry').value;
                const cvv = document.getElementById('cvv').value;

                if (!cardNumber || !cardName || !expiry || !cvv) {
                    showNotification('Please fill in all credit card details', 'error');
                    return;
                }
            }
            
            // --- NEW: Send order to backend API ---
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser || !currentUser.email) {
                showNotification('You must be logged in to place an order', 'error');
                return;
            }

            if (cart.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }

            // Prepare order items for the backend (only productId and quantity needed for now)
            const orderItems = cart.map(item => ({
                productId: item._id, // Assuming _id is available from product object
                quantity: item.quantity
            }));

            try {
                const response = await fetch('http://localhost:5000/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-email': currentUser.email // Send user email for authentication
                    },
                    body: JSON.stringify({ items: orderItems })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.removeItem('cart');
                    showNotification('Order placed successfully!', 'success');
                    
                    // Redirect to orders page after 2 seconds
                    setTimeout(() => {
                        window.location.href = '../account/orders.html'; // Redirect to user's orders page
                    }, 2000);
                } else {
                    showNotification(data.message || 'Failed to place order', 'error');
                }
            } catch (error) {
                console.error('Error placing order:', error);
                showNotification('An error occurred. Please try again.', 'error');
            }

            // --- END NEW --- 

            // // OLD: Clear cart and show success message (moved inside try/catch)
            // localStorage.removeItem('cart');
            // showNotification('Order placed successfully!', 'success');
            
            // // OLD: Redirect to home page after 2 seconds (moved inside try/catch)
            // setTimeout(() => {
            //     window.location.href = 'index.html';
            // }, 2000);
        });
    }

    // Handle payment method tabs
    const paymentTabs = document.querySelectorAll('.payment-tab');
    paymentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            paymentTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all content
            document.querySelectorAll('.payment-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Handle shipping method change
    const shippingMethods = document.querySelectorAll('input[name="shipping"]');
    shippingMethods.forEach(method => {
        method.addEventListener('change', function() {
            const shippingCost = this.value === 'standard' ? 50 : 200;
            document.querySelector('.shipping').textContent = `EGP ${shippingCost.toFixed(2)}`;
            updateTotal();
        });
    });

    // Function to update total
    function updateTotal() {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = parseInt(document.querySelector('.shipping').textContent.replace('EGP ', ''));
        const total = subtotal + shipping;
        document.querySelector('.total-price').textContent = `EGP ${total.toFixed(2)}`;
    }

    // Function to show notifications
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});
