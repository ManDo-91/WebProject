// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to display product details
async function displayProductDetails() {
    const productId = getUrlParameter('id');
    if (!productId) {
        showError('Product ID not found');
        return;
    }

    try {
        // Show loading overlay
        document.getElementById('loading-overlay').style.display = 'flex';

        // Fetch product details from backend
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }
        const product = await response.json();

        // Update page title
        document.title = `${product.name} - Scentify`;

        // Update product details
        const productContainer = document.querySelector('.product-container');
        productContainer.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-badge">New</div>
            </div>
            <div class="product-details">
                <h1 class="product-title">${product.name}</h1>
                <div class="product-rating">
                    <div class="stars">
                        ${Array(5).fill().map((_, i) => 
                            `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : 
                                i === Math.floor(product.rating) && product.rating % 1 !== 0 ? '-half-alt' : ''}"></i>`
                        ).join('')}
                    </div>
                    <span>(${product.rating})</span>
                </div>
                <div class="product-price">EGP ${product.price.toFixed(2)}</div>
                <p class="product-description">${product.description}</p>
                <ul class="product-features">
                    ${Object.entries(product.specs || {}).map(([key, value]) => 
                        `<li><i class="fas fa-check"></i> ${key}: ${value}</li>`
                    ).join('')}
                </ul>
                <div class="quantity-selector">
                    <button onclick="updateQuantity(-1)">-</button>
                    <input type="number" id="quantity" value="1" min="1" readonly>
                    <button onclick="updateQuantity(1)">+</button>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
                    Add to Cart
                </button>
            </div>
        `;

        // Load related products
        await loadRelatedProducts(product.category);

    } catch (error) {
        console.error('Error loading product details:', error);
        showError('Failed to load product details. Please try again later.');
    } finally {
        // Hide loading overlay
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

// Function to update quantity
function updateQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    const newQuantity = Math.max(1, parseInt(quantityInput.value) + change);
    quantityInput.value = newQuantity;
}

// Function to load related products
async function loadRelatedProducts(category) {
    try {
        const response = await fetch(`http://localhost:5000/api/products?category=${category}`);
        if (!response.ok) {
            throw new Error('Failed to fetch related products');
        }
        const products = await response.json();

        // Filter out current product and get up to 4 related products
        const relatedProducts = products
            .filter(p => p._id !== getUrlParameter('id'))
            .slice(0, 4);

        const relatedGrid = document.querySelector('.related-grid');
        if (relatedGrid) {
            relatedGrid.innerHTML = relatedProducts.map(product => `
                <div class="product-card">
                    <a href="productsviewer.html?id=${product._id}">
                        <img src="${product.image}" alt="${product.name}">
                    </a>
                    <h3>${product.name}</h3>
                    <div class="price">EGP ${product.price.toFixed(2)}</div>
                    <button class="add-to-cart" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
                        Add to Cart
                    </button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

// Function to show error message
function showError(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    displayProductDetails();
}); 