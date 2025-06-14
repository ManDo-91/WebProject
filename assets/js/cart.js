document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const cartCount = document.querySelector('.cart-count');
    const checkoutButton = document.querySelector('.checkout-button');

    // Global cart variable and functions
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const SHIPPING_COST = 50; // EGP - Default shipping cost

    // Global functions
    function updateCartCount() {
        if (cartCount) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    window.removeFromCart = function(productId) {
        const itemIndex = cart.findIndex(item => item._id === productId);
        if (itemIndex !== -1) {
            const itemName = cart[itemIndex].name;
            cart.splice(itemIndex, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            showNotification(`${itemName} removed from cart`, 'error');
            updateCartCount();
            displayCartItems();
            updateCheckoutButton();
        }
    };

    window.updateQuantity = function(productId, change) {
        const item = cart.find(item => item._id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
                removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                displayCartItems();
                showNotification(`Quantity updated to ${newQuantity}`);
                updateCheckoutButton();
            }
        }
    };

    // Calculate cart totals
    function calculateTotals() {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? SHIPPING_COST : 0;
        const total = subtotal + shipping;
        
        return {
            subtotal,
            shipping,
            total
        };
    }

    // Function to update shipping cost
    function updateShippingCost(newCost) {
        SHIPPING_COST = newCost;
        displayCartItems();
    }

    // Update checkout button state
    function updateCheckoutButton() {
        if (checkoutButton) {
            checkoutButton.disabled = cart.length === 0;
            if (!checkoutButton.disabled) {
                checkoutButton.onclick = function() {
                    window.location.href = 'checkout.html';
                };
            } else {
                checkoutButton.onclick = null;
            }
        }
    }

    // Display cart items
    function displayCartItems() {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                    <a href="products.html" class="continue-shopping">Continue Shopping</a>
                </div>
            `;
            updateCartSummary();
            updateCheckoutButton();
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="../${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>EGP ${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item._id}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item._id}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        updateCartSummary();
        updateCheckoutButton();
    }

    // Update Cart Summary
    function updateCartSummary() {
        const totals = calculateTotals();
        
        if (subtotalElement) subtotalElement.textContent = `EGP ${totals.subtotal.toFixed(2)}`;
        if (shippingElement) shippingElement.textContent = `EGP ${totals.shipping.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `EGP ${totals.total.toFixed(2)}`;
    }

    // Initialize
    updateCartCount();
    if (cartItemsContainer) {
        displayCartItems();
    }
    updateCheckoutButton();

    // Make addToCart function available globally
    window.addToCart = function(productId) {
        // Retrieve the full product object using the globally available getProductById from products.js
        const productToAdd = getProductById(productId);

        if (!productToAdd) {
            console.error('Product not found for ID:', productId);
            showNotification('Error adding product to cart.', 'error');
            return;
        }

        // Check if item already exists in cart using _id
        const existingItem = cart.find(item => item._id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
            showNotification(`${productToAdd.name} quantity increased!`);
        } else {
            // Ensure the image path is correct for the cart page
            // Assuming productToAdd.image is like 'assets/images/product.jpg'
            const cartImagePath = productToAdd.image.startsWith('../../') ? productToAdd.image : `../../${productToAdd.image}`;
            
            cart.push({
                _id: productToAdd._id, // Use MongoDB's _id
                name: productToAdd.name,
                price: parseFloat(productToAdd.price),
                image: cartImagePath,
                quantity: 1
            });
            showNotification(`${productToAdd.name} added to cart!`);
        }
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Update cart display if on cart page
        if (cartItemsContainer) {
            displayCartItems();
        }
        
        // Update checkout button state
        updateCheckoutButton();
    };
});
