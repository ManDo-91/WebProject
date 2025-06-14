// Function to create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-badge">New</div>
            <a href="pages/shop/productsviewer.html?id=${product._id}">
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
            <button class="add-to-cart" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
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
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch products from backend
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const allProducts = await response.json();
        
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

        // Check if user is admin and show/hide the admin link
        checkAdminStatus();

        // Check if user is logged in and show welcome message
        checkUserLogin();

        // Initialize user panel functionality
        initUserPanel();
    } catch (error) {
        console.error('Error loading products:', error);
        // Display error message to user
        const newArrivalsSection = document.getElementById('new-arrivals');
        const bestSellersSection = document.getElementById('best-sellers');
        if (newArrivalsSection) {
            newArrivalsSection.innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
        }
        if (bestSellersSection) {
            bestSellersSection.innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
        }
    }
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

// Check if user is admin and show/hide the admin link
function checkAdminStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const adminLink = document.getElementById('adminLink');
    
    if (currentUser && currentUser.role === 'admin') {
        adminLink.style.display = 'block';
    } else {
        adminLink.style.display = 'none';
    }
}

// Handle user panel functionality
function initUserPanel() {
    const loginIcon = document.getElementById('login-icon');
    const userPanel = document.getElementById('userPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Toggle panel visibility
    loginIcon.addEventListener('click', function(e) {
        if (currentUser) {
            e.preventDefault();
            userPanel.style.display = userPanel.style.display === 'none' ? 'block' : 'none';
        }
    });

    // Close panel when clicking outside
    document.addEventListener('click', function(e) {
        if (!loginIcon.contains(e.target) && !userPanel.contains(e.target)) {
            userPanel.style.display = 'none';
        }
    });

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    // Update panel user info
    if (currentUser) {
        document.getElementById('panelUserName').textContent = currentUser.name;
        document.getElementById('panelUserEmail').textContent = currentUser.email;

        // Show/hide admin links
        const adminLinks = document.querySelectorAll('.admin-only');
        adminLinks.forEach(link => {
            link.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
        });
    }
}

// Update checkUserLogin function
function checkUserLogin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const welcomeMessage = document.getElementById('welcome-message');
    const userName = document.getElementById('user-name');
    const loginIcon = document.getElementById('login-icon');
    const userPanel = document.getElementById('userPanel');
    
    if (currentUser) {
        // Show welcome message
        welcomeMessage.style.display = 'block';
        userName.textContent = currentUser.name;
        
        // Update login icon to show logged in state
        loginIcon.innerHTML = `<i class="fas fa-user-check"></i>`;
        loginIcon.href = '#'; // Remove login link when logged in
        
        // Update panel user info
        document.getElementById('panelUserName').textContent = currentUser.name;
        document.getElementById('panelUserEmail').textContent = currentUser.email;
    } else {
        // Hide welcome message and panel
        welcomeMessage.style.display = 'none';
        userPanel.style.display = 'none';
        
        // Reset login icon
        loginIcon.innerHTML = `<i class="fas fa-user"></i>`;
        loginIcon.href = 'pages/auth/login.html';
    }
} 