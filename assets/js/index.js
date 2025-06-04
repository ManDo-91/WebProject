// Function to create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-badge">New</div>
            <a href="pages/shop/productsviewer.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
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
            <button class="add-to-cart" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')">
                Add to Cart
            </button>
        </div>
    `;
}

// Function to display products in a section
function displayProductsInSection(sectionId, products) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.innerHTML = products.map(createProductCard).join('');
    }
}

// Slider functionality
let currentSlide = {
    'new-arrivals': 0,
    'best-sellers': 0
};

// Store all products for pagination
let allBestSellers = [];
let allNewArrivals = [];
let currentBestSellerPage = 0;
let currentNewArrivalPage = 0;
const productsPerPage = 6;

// Animation functions
function animateSection(sectionId, direction) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Add animation classes
    section.classList.add('animating');
    section.classList.add(direction === 1 ? 'slide-out-left' : 'slide-out-right');

    // Remove animation classes after animation completes
    setTimeout(() => {
        section.classList.remove('animating');
        section.classList.remove('slide-out-left', 'slide-out-right');
    }, 500);
}

function displayProductsWithAnimation(sectionId, products, direction) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Start animation
    animateSection(sectionId, direction);

    // Update content after a small delay
    setTimeout(() => {
        section.innerHTML = products.map(createProductCard).join('');
        
        // Add fade-in animation to new products
        const productCards = section.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = `translateX(${direction === 1 ? '50px' : '-50px'})`;
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateX(0)';
            }, 50 * index); // Stagger the animations
        });
    }, 250);
}

function slideProducts(section, direction) {
    if (section === 'best-sellers') {
        // Handle best sellers pagination
        const totalPages = Math.ceil(allBestSellers.length / productsPerPage);
        currentBestSellerPage = (currentBestSellerPage + direction + totalPages) % totalPages;
        
        const start = currentBestSellerPage * productsPerPage;
        const end = start + productsPerPage;
        const currentPageProducts = allBestSellers.slice(start, end);
        
        displayProductsWithAnimation('best-sellers', currentPageProducts, direction);
        updatePaginationDots('best-sellers');
    } else if (section === 'new-arrivals') {
        // Handle new arrivals pagination
        const totalPages = Math.ceil(allNewArrivals.length / productsPerPage);
        currentNewArrivalPage = (currentNewArrivalPage + direction + totalPages) % totalPages;
        
        const start = currentNewArrivalPage * productsPerPage;
        const end = start + productsPerPage;
        const currentPageProducts = allNewArrivals.slice(start, end);
        
        displayProductsWithAnimation('new-arrivals', currentPageProducts, direction);
        updatePaginationDots('new-arrivals');
    }
}

function updatePaginationDots(section) {
    const totalPages = Math.ceil(section === 'best-sellers' ? allBestSellers.length : allNewArrivals.length) / productsPerPage;
    const dotsContainer = document.querySelector(`.${section} .slider-dots`);
    const currentPage = section === 'best-sellers' ? currentBestSellerPage : currentNewArrivalPage;
    
    if (dotsContainer) {
        // Create dots based on total pages
        dotsContainer.innerHTML = Array(totalPages).fill().map((_, index) => 
            `<span class="dot ${index === currentPage ? 'active' : ''}" 
                  onclick="slideProducts('${section}', ${index - currentPage})"></span>`
        ).join('');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Load all products
    const allProducts = window.productFunctions.getAllProducts();
    
    // Setup new arrivals
    allNewArrivals = allProducts.slice(-12).reverse(); // Get last 12 products
    const firstPageNewArrivals = allNewArrivals.slice(0, productsPerPage);
    displayProductsWithAnimation('new-arrivals', firstPageNewArrivals, 1);

    // Setup best sellers
    allBestSellers = [...allProducts]
        .sort((a, b) => b.rating - a.rating);
    const firstPageBestSellers = allBestSellers.slice(0, productsPerPage);
    displayProductsWithAnimation('best-sellers', firstPageBestSellers, 1);

    // Initialize pagination dots for both sections
    updatePaginationDots('new-arrivals');
    updatePaginationDots('best-sellers');

    // Initialize featured collections
    initFeaturedCollections();

    // Initialize search functionality
    initSearch();
});

// Initialize Featured Collections
function initFeaturedCollections() {
    const collectionCards = document.querySelectorAll('.collection-card');
    
    collectionCards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            const img = card.querySelector('img');
            if (img) img.style.transform = 'scale(1.05)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            const img = card.querySelector('img');
            if (img) img.style.transform = 'scale(1)';
        });

        // Add click effect
        const link = card.querySelector('.collection-link');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href) window.location.href = href;
            });
        }
    });
}

// Search functionality
function initSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    if (searchInput && searchButton) {
        // Function to handle search
        const handleSearch = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (searchTerm) {
                // Use the productFunctions.searchProducts to get matching products
                const searchResults = window.productFunctions.searchProducts(searchTerm);
                
                // Redirect to products page with search results
                const searchParams = new URLSearchParams();
                searchParams.set('search', searchTerm);
                window.location.href = `pages/shop/Products.html?${searchParams.toString()}`;
            }
        };

        // Add event listeners
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
} 