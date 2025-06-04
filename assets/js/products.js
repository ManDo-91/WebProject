// Products data
const products = {
    // Men's Fragrances
    'royal-oud': {
        id: 'royal-oud',
        name: 'Royal Oud',
        price: 999.99,
        category: "mens",
        image: 'assets/images/royal-oud.jpg',
        images: [
            'assets/images/royal-oud.jpg',
            'assets/images/royal-oud-2.jpg',
            'assets/images/royal-oud-3.jpeg'
        ],
        description: 'A rich and luxurious oriental fragrance that combines rare oud wood with exotic spices.',
        rating: 4.8,
        reviews: 128,
        specs: {
            'Fragrance Family': 'Oriental Woody',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    'versace-eros': {
        id: 'versace-eros',
        name: 'Versace Eros',
        price: 799.99,
        category: "mens",
        image: 'assets/images/versace-eros.jpg',
        images: [
            'assets/images/versace-eros.jpg',
            'assets/images/versace-eros-2.jpg',
            'assets/images/versace-eros-3.jpg'
        ],
        description: 'A fresh and sensual fragrance with mint, green apple, and vanilla notes.',
        rating: 4.6,
        reviews: 312,
        specs: {
            'Fragrance Family': 'Aromatic Fougere',
            'Concentration': 'Eau de Toilette',
            'Size': '100ml'
        }
    },
    'amber-wood': {
        id: 'amber-wood',
        name: 'Amber Wood',
        price: 899.99,
        category: "mens",
        image: 'assets/images/amber-wood.png',
        images: [
            'assets/images/amber-wood.jpg',
            'assets/images/amber-wood-2.jpg',
            'assets/images/amber-wood-3.jpg'
        ],
        description: 'A warm and woody fragrance with amber notes that creates a sophisticated aura.',
        rating: 4.7,
        reviews: 95,
        specs: {
            'Fragrance Family': 'Woody Oriental',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    'dior-sauvage': {
        id: 'dior-sauvage',
        name: 'Dior Sauvage',
        price: 899.99,
        category: "mens",
        image: 'assets/images/dior-sauvage.jpg',
        images: [
            'assets/images/dior-sauvage.jpg',
            'assets/images/dior-sauvage-2.jpg',
            'assets/images/dior-sauvage-3.jpg'
        ],
        description: 'A radically fresh composition with powerful woody notes.',
        rating: 4.8,
        reviews: 425,
        specs: {
            'Fragrance Family': 'Aromatic Fougere',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },

    // Women's Fragrances
    'galatea': {
        id: 'galatea',
        name: 'Galatea',
        price: 899.99,
        category: "womens",
        image: 'assets/images/galatea.jpeg',
        images: [
            'assets/images/galatea.jpeg',
            'assets/images/galatea-2.jpeg',
            'assets/images/galatea-3.jpeg'
        ],
        description: 'An elegant floral fragrance with notes of jasmine, rose, and white musk.',
        rating: 4.7,
        reviews: 156,
        specs: {
            'Fragrance Family': 'Floral',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    'vanilla-dreams': {
        id: 'vanilla-dreams',
        name: 'Vanilla Dreams',
        price: 799.99,
        category: "womens",
        image: 'assets/images/vanilla-dreams.jpg',
        images: [
            'assets/images/vanilla-dreams.jpg',
            'assets/images/vanilla-dreams-2.jpg',
            'assets/images/vanilla-dreams-3.jpg'
        ],
        description: 'A sweet and comforting vanilla-based fragrance with hints of warm amber and musk.',
        rating: 4.7,
        reviews: 112,
        specs: {
            'Fragrance Family': 'Oriental Vanilla',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    'spring-blossom': {
        id: 'spring-blossom',
        name: 'Spring Blossom',
        price: 599.99,
        category: "womens",
        image: 'assets/images/spring-blossom.jpeg',
        images: [
            'assets/images/spring-blossom.jpg',
            'assets/images/spring-blossom-2.jpg',
            'assets/images/spring-blossom-3.jpg'
        ],
        description: 'A fresh and floral spring-inspired scent that captures the essence of blooming gardens.',
        rating: 4.5,
        reviews: 89,
        specs: {
            'Fragrance Family': 'Floral',
            'Concentration': 'Eau de Toilette',
            'Size': '100ml'
        }
    },
    'chanel-coco': {
        id: 'chanel-coco',
        name: 'Chanel Coco Mademoiselle',
        price: 999.99,
        category: "womens",
        image: 'assets/images/chanel-coco.jpeg',
        images: [
            'assets/images/chanel-coco.jpeg',
            'assets/images/chanel-coco-2.jpeg',
            'assets/images/chanel-coco-3.jpeg'
        ],
        description: 'A modern oriental fragrance with a fresh and vibrant character.',
        rating: 4.9,
        reviews: 289,
        specs: {
            'Fragrance Family': 'Oriental',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },

    // Luxury Fragrances
    'creed-aventus': {
        id: 'creed-aventus',
        name: 'Creed Aventus',
        price: 1299.99,
        category: "luxury",
        image: 'assets/images/creed-aventus.jpeg',
        images: [
            'assets/images/creed-aventus.jpeg',
            'assets/images/creed-aventus-2.jpeg',
            'assets/images/creed-aventus-3.jpeg'
        ],
        description: 'A bold and sophisticated fragrance with notes of pineapple, blackcurrant, and birch.',
        rating: 4.9,
        reviews: 245,
        specs: {
            'Fragrance Family': 'Fruity Woody',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    'kingdom': {
        id: 'kingdom',
        name: 'Kingdom',
        price: 1099.99,
        category: "luxury",
        image: 'assets/images/kingdom.jpg',
        images: [
            'assets/images/kingdom.jpg',
            'assets/images/kingdom-2.jpg',
            'assets/images/kingdom-3.jpg'
        ],
        description: 'A regal oriental fragrance with notes of amber, oud, and precious woods.',
        rating: 4.8,
        reviews: 189,
        specs: {
            'Fragrance Family': 'Oriental Woody',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    'tom-ford-tobacco-vanille': {
        id: 'tom-ford-tobacco-vanille',
        name: 'Tom Ford Tobacco Vanille',
        price: 1199.99,
        category: "luxury",
        image: 'assets/images/tobacco-vanille.jpg',
        images: [
            'assets/images/tobacco-vanille.jpg',
            'assets/images/tobacco-vanille-2.jpg',
            'assets/images/tobacco-vanille-3.jpg'
        ],
        description: 'A modern take on an old-world men\'s club with a smooth oriental base.',
        rating: 4.9,
        reviews: 278,
        specs: {
            'Fragrance Family': 'Oriental',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    'baccarat-rouge': {
        id: 'baccarat-rouge',
        name: 'Baccarat Rouge 540',
        price: 1499.99,
        category: "luxury",
        image: 'assets/images/baccarat-rouge.jpeg',
        images: [
            'assets/images/baccarat-rouge.jpeg',
            'assets/images/baccarat-rouge-2.jpeg',
            'assets/images/baccarat-rouge-3.jpeg'
        ],
        description: 'A unique and sophisticated fragrance with notes of saffron, ambergris, and cedar.',
        rating: 4.9,
        reviews: 198,
        specs: {
            'Fragrance Family': 'Oriental',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    }
};

// Function to get all products
function getAllProducts() {
    return Object.values(products);
}

// Function to get products by category
function getProductsByCategory(category) {
    return Object.values(products).filter(product => product.category === category);
}

// Function to get product by ID
function getProductById(id) {
    return products[id];
}

// Function to get random suggestions
function getRandomSuggestions(currentProductId, count = 4) {
    const productIds = Object.keys(products).filter(id => id !== currentProductId);
    const shuffled = productIds.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(id => products[id]);
}

// Function to filter products by price range
function filterProductsByPrice(maxPrice) {
    return Object.values(products).filter(product => product.price <= maxPrice);
}

// Function to search products
function searchProducts(query) {
    query = query.toLowerCase();
    return Object.values(products).filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
    );
}

// Loading state management
const showLoading = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading products...</p>
            </div>
        `;
    }
};

const hideLoading = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        const spinner = element.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }
};

// Error handling
const showError = (elementId, message) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button onclick="retryLoading('${elementId}')" class="retry-button">
                    Try Again
                </button>
            </div>
        `;
    }
};

// Product loading functions
function loadProducts(sectionId, category = null) {
    showLoading(sectionId);
    
    try {
        let productsToDisplay;
        if (category) {
            productsToDisplay = getProductsByCategory(category);
        } else {
            productsToDisplay = getAllProducts();
        }
        displayProductsInSection(sectionId, productsToDisplay);
    } catch (error) {
        console.error('Error loading products:', error);
        showError(sectionId, 'Unable to load products. Please try again later.');
    } finally {
        hideLoading(sectionId);
    }
}

// Retry function
function retryLoading(sectionId) {
    loadProducts(sectionId);
}

// Initialize products on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load new arrivals
    loadProducts('new-arrivals');
    
    // Load best sellers
    loadProducts('best-sellers');
    
    // Load featured products if on products page
    const featuredSection = document.getElementById('featured-products');
    if (featuredSection) {
        loadProducts('featured-products');
    }
});

// Product card creation with error handling
function createProductCard(product) {
    try {
        return `
            <div class="product-card" role="article">
                ${product.isNew ? '<div class="product-badge" aria-label="New product">New</div>' : ''}
                <a href="productsviewer.html?id=${product.id}" aria-label="View details of ${product.name}">
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         loading="lazy"
                         onerror="this.src='assets/images/placeholder.jpg'">
                </a>
                <h3>${product.name}</h3>
                <p class="description">${product.description}</p>
                <div class="rating" role="img" aria-label="Rating: ${product.rating} out of 5 stars">
                    ${Array(5).fill().map((_, i) => 
                        `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : 
                            i === Math.floor(product.rating) && product.rating % 1 !== 0 ? '-half-alt' : ''}"
                         aria-hidden="true"></i>`
                    ).join('')}
                    <span>(${product.rating})</span>
                </div>
                <div class="price">EGP ${product.price.toFixed(2)}</div>
                <button class="add-to-cart" 
                        onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')"
                        aria-label="Add ${product.name} to cart">
                    Add to Cart
                </button>
            </div>
        `;
    } catch (error) {
        console.error('Error creating product card:', error);
        return `
            <div class="product-card error">
                <p>Unable to display product</p>
            </div>
        `;
    }
}

// Display products with error handling
function displayProductsInSection(sectionId, products) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    if (!Array.isArray(products) || products.length === 0) {
        section.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>No products found</p>
            </div>
        `;
        return;
    }
    
    try {
        section.innerHTML = products.map(createProductCard).join('');
    } catch (error) {
        console.error('Error displaying products:', error);
        showError(sectionId, 'Error displaying products. Please try again later.');
    }
}

// Export functions for use in other files
window.productFunctions = {
    getAllProducts,
    getProductsByCategory,
    getProductById,
    getRandomSuggestions,
    filterProductsByPrice,
    searchProducts,
    loadProducts,
    displayProductsInSection,
    createProductCard
};

// Also expose the products object for direct access
window.products = products;