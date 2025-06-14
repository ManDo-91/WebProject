let allProducts = []; // Store fetched products globally

// Function to create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-badge">New</div>
            <a href="productsviewer.html?id=${product._id}">
                <img src="../../${product.image}" alt="${product.name}">
            </a>
            <h3>${product.name}</h3>
            <p class="description">${product.description}</p>
            <div class="rating">
                ${Array(5).fill().map((_, i) => 
                    `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : 
                        i === Math.floor(product.rating) && product.rating % 1 !== 0 ? '-half-alt' : ''}"></i>`
                ).join('')}
                <span>(${product.rating})</span>
            </div>
            <div class="price">EGP ${product.price.toFixed(2)}</div>
            <button class="add-to-cart" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
                Add to Cart
            </button>
        </div>
    `;
}

// Function to display products
function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = products.map(createProductCard).join('');
    }
}

// Function to filter products
async function filterProducts() {
    try {
        const category = document.querySelector('.category-list a.active')?.dataset.category || 'all';
        const maxPrice = parseInt(document.getElementById('price-filter').value);
        const searchQuery = document.getElementById('search-input').value.toLowerCase();

        // Fetch all products from backend
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        allProducts = await response.json(); // Update global allProducts

        let productsToDisplay = allProducts;

        // Apply category filter
        if (category !== 'all') {
            productsToDisplay = productsToDisplay.filter(product => product.category === category);
        }

        // Apply price filter
        productsToDisplay = productsToDisplay.filter(product => product.price <= maxPrice);

        // Apply search filter
        if (searchQuery) {
            productsToDisplay = productsToDisplay.filter(product => 
                product.name.toLowerCase().includes(searchQuery) || 
                product.description.toLowerCase().includes(searchQuery)
            );
        }

        displayProducts(productsToDisplay);
    } catch (error) {
        console.error('Error filtering products:', error);
        showError('Failed to load products. Please try again later.');
    }
}

// Updated function to get a product by its MongoDB _id
function getProductById(id) {
    return allProducts.find(product => product._id === id);
}

// Function to show error message
function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Set up event listeners
        const categoryLinks = document.querySelectorAll('.category-list a');
        const priceFilter = document.getElementById('price-filter');
        const priceValue = document.getElementById('price-value');
        const searchInput = document.getElementById('search-input');

        // Handle category clicks
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                categoryLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                filterProducts();
            });
        });

        // Handle price filter
        if (priceFilter && priceValue) {
            priceFilter.addEventListener('input', function() {
                priceValue.textContent = `EGP ${this.value}`;
                filterProducts();
            });
        }

        // Handle search input
        if (searchInput) {
            searchInput.addEventListener('input', filterProducts);
        }

        // Handle URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        const categoryParam = urlParams.get('category');

        if (searchParam) {
            searchInput.value = searchParam;
        }

        if (categoryParam) {
            const categoryLink = document.querySelector(`.category-list a[data-category="${categoryParam}"]`);
            if (categoryLink) {
                categoryLinks.forEach(l => l.classList.remove('active'));
                categoryLink.classList.add('active');
            }
        }

        // Initial product load
        await filterProducts();

    } catch (error) {
        console.error('Error initializing products page:', error);
        showError('Failed to load products. Please try again later.');
    }
});

// Export functions for use in other files
window.productFunctions = {
    getProductById,
    filterProducts,
    showError
};