document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const summaryItems = document.querySelector('.summary-items');
    const subtotalElement = document.querySelector('.subtotal');
    const shippingElement = document.querySelector('.shipping');
    const discountElement = document.querySelector('.discount');
    const totalPriceElement = document.querySelector('.total-price');
    const cartCount = document.querySelector('.cart-count');
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const checkoutForm = document.getElementById('checkoutForm');
    const shippingMethods = document.querySelectorAll('input[name="shipping"]');

    // Cart State
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const discount = 0; // Could load from localStorage if applied on cart page
    let shippingCost = 50;

    // Payment Tabs
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

    // Shipping Method Change
    shippingMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'standard') {
                shippingCost = 50;
            } else if (this.value === 'express') {
                shippingCost = 200;
            }
            updateOrderSummary();
        });
    });

    // Render Order Summary
    function renderOrderSummary() {
        if (cart.length === 0) {
            summaryItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            updateOrderSummary();
            return;
        }

        summaryItems.innerHTML = '';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const summaryItem = document.createElement('div');
            summaryItem.classList.add('summary-item');
            summaryItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="summary-item-info">
                    <div class="summary-item-name">${item.name}</div>
                    <div class="summary-item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="summary-item-price">${itemTotal.toFixed(2)} EGP</div>
            `;
            summaryItems.appendChild(summaryItem);
        });

        updateOrderSummary();
    }

    // Update Order Summary
    function updateOrderSummary() {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const total = subtotal + shippingCost - discount;
        
        subtotalElement.textContent = `${subtotal.toFixed(2)} EGP`;
        shippingElement.textContent = `${shippingCost.toFixed(2)} EGP`;
        discountElement.textContent = `-${discount.toFixed(2)} EGP`;
        totalPriceElement.textContent = `${total.toFixed(2)} EGP`;
        
        // Update cart count in header
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Form Submission
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // In a real app, you would validate the form and process payment
        // For this demo, we'll just show a success message
        showNotification('Order placed successfully!', 'success');
        
        // Clear the cart
        localStorage.removeItem('cart');
        
        // Redirect to confirmation page in a real app
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    });

    // Show Notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Initialize
    renderOrderSummary();
});