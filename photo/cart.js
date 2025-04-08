document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cartItemsList = document.querySelector('.cart-items-list');
    const subtotalElement = document.querySelector('.subtotal');
    const shippingElement = document.querySelector('.shipping');
    const discountElement = document.querySelector('.discount');
    const totalPriceElement = document.querySelector('.total-price');
    const applyCouponBtn = document.getElementById('apply-coupon');
    const couponCodeInput = document.getElementById('coupon-code');
    const cartCount = document.querySelector('.cart-count');

    // Cart State
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let discount = 0;
    const shippingCost = 50;

    // Coupon Codes
    const couponCodes = {
        'MANDO10': 0.1,  // 10% off
        'MANDO20': 0.2,  // 20% off
        'FREEMANDO': -shippingCost  // Free shipping
    };

    // Render Cart Items
    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            updateCartSummary();
            return;
        }

        cartItemsList.innerHTML = '';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div class="cart-product">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-product-info">
                        <h4>${item.name}</h4>
                        <p>${item.description}</p>
                    </div>
                </div>
                <div class="cart-price">${item.price.toFixed(2)} EGP</div>
                <div class="cart-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <div class="cart-total">${itemTotal.toFixed(2)} EGP</div>
                <div class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </div>
            `;
            cartItemsList.appendChild(cartItem);
        });

        // Add event listeners
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', updateQuantity);
        });

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', removeItem);
        });

        updateCartSummary();
    }

    // Update Quantity
    function updateQuantity(e) {
        const productId = parseInt(e.target.getAttribute('data-id'));
        const item = cart.find(item => item.id === productId);
        
        if (e.target.classList.contains('plus')) {
            item.quantity += 1;
        } else if (e.target.classList.contains('minus')) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                // Remove item if quantity is 0
                cart = cart.filter(item => item.id !== productId);
            }
        }
        
        saveCart();
        renderCartItems();
    }

    // Remove Item
    function removeItem(e) {
        const productId = parseInt(e.currentTarget.getAttribute('data-id'));
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCartItems();
    }

    // Apply Coupon
    applyCouponBtn.addEventListener('click', function() {
        const code = couponCodeInput.value.trim().toUpperCase();
        
        if (couponCodes.hasOwnProperty(code)) {
            discount = couponCodes[code];
            couponCodeInput.style.borderColor = '#4CAF50';
            updateCartSummary();
            showNotification('Coupon applied successfully!', 'success');
        } else {
            couponCodeInput.style.borderColor = '#ff6b6b';
            showNotification('Invalid coupon code', 'error');
        }
    });

    // Update Cart Summary
    function updateCartSummary() {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Calculate discount amount
        let discountAmount = 0;
        if (typeof discount === 'number') {
            if (discount > 0) {
                // Percentage discount
                discountAmount = subtotal * discount;
            } else {
                // Fixed amount discount (like free shipping)
                discountAmount = Math.abs(discount);
            }
        }
        
        // Calculate shipping
        let shipping = shippingCost;
        if (discount < 0) { // This is our free shipping coupon
            shipping = 0;
        }
        
        const total = subtotal + shipping - discountAmount;
        
        subtotalElement.textContent = `${subtotal.toFixed(2)} EGP`;
        shippingElement.textContent = `${shipping.toFixed(2)} EGP`;
        discountElement.textContent = `-${discountAmount.toFixed(2)} EGP`;
        totalPriceElement.textContent = `${total.toFixed(2)} EGP`;
        
        // Update cart count in header
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Save Cart to LocalStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

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
    renderCartItems();
});