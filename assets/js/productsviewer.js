// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to display product details
async function displayProductDetails(product) {
    if (!product) {
        showError('Product data is invalid');
        return;
    }

    try {
        // Show loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }

        // Update page title
        document.title = `${product.name || 'Product'} - Scentify`;

        // Update product details
        const productContainer = document.querySelector('.product-container');
        if (!productContainer) {
            throw new Error('Product container not found');
        }

        // Create product HTML
        const productHTML = `
            <div class="product-gallery">
                <div class="main-image">
                    <img src="/${product.image}" alt="${product.name}" onerror="this.src='../../../assets/images/placeholder.jpg'">
                </div>
                <div class="thumbnail-gallery">
                    ${product.images ? product.images.map(img => `
                        <div class="thumbnail" onclick="changeMainImage('${img}')">
                            <img src="/${img}" alt="${product.name}" onerror="this.src='../../../assets/images/placeholder.jpg'">
                        </div>
                    `).join('') : ''}
                </div>
            </div>
            <div class="product-details">
                <div class="product-header">
                    <h1 class="product-title">${product.name}</h1>
                    <div class="product-rating">
                        <div class="stars" id="ratingStars">
                            ${generateStarRating(product.rating || 0)}
                        </div>
                        <span class="review-count">(${product.reviews || 0} reviews)</span>
                        <button class="rate-product-btn" onclick="showRatingModal()">
                            <i class="fas fa-star"></i> Rate this product
                        </button>
                    </div>
                </div>
                <div class="product-price-section">
                    <div class="product-price">
                        ${product.comparePrice ? `
                            <span class="compare-price">EGP ${product.comparePrice.toFixed(2)}</span>
                        ` : ''}
                        <span class="current-price">EGP ${product.price.toFixed(2)}</span>
                    </div>
                    ${product.comparePrice ? `
                        <span class="discount-badge">-${Math.round((1 - product.price / product.comparePrice) * 100)}%</span>
                    ` : ''}
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button type="button" class="quantity-btn minus" id="decreaseQuantity">-</button>
                        <input type="number" id="productQuantity" value="1" min="1" max="99">
                        <button type="button" class="quantity-btn plus" id="increaseQuantity">+</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                </div>
                <div class="product-meta">
                    <div class="meta-item">
                        <i class="fas fa-truck"></i>
                        <span>Free shipping on orders over EGP 1000</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-undo"></i>
                        <span>30-day return policy</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>2-year warranty</span>
                    </div>
                </div>
                <div class="product-share">
                    <span>Share:</span>
                    <div class="share-buttons">
                        <button onclick="shareProduct('facebook')"><i class="fab fa-facebook-f"></i></button>
                        <button onclick="shareProduct('twitter')"><i class="fab fa-twitter"></i></button>
                        <button onclick="shareProduct('pinterest')"><i class="fab fa-pinterest-p"></i></button>
                    </div>
                </div>
            </div>
        `;

        productContainer.innerHTML = productHTML;

        // Initialize quantity controls
        initializeQuantityControls();

        // Load related products if category exists
        if (product.category) {
            await loadRelatedProducts(product.category);
        }

    } catch (error) {
        console.error('Error loading product details:', error);
        const productContainer = document.querySelector('.product-container');
        if (productContainer) {
            productContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${error.message}</p>
                    <button onclick="window.location.href='Products.html'" class="back-to-shop-btn">
                        Back to Shop
                    </button>
                </div>
            `;
        }
        showError(error.message || 'Please try again later.');
    } finally {
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Function to initialize quantity controls
function initializeQuantityControls() {
    const quantityInput = document.getElementById('productQuantity');
    const decreaseBtn = document.getElementById('decreaseQuantity');
    const increaseBtn = document.getElementById('increaseQuantity');

    if (!quantityInput || !decreaseBtn || !increaseBtn) return;

    // Set initial value
    quantityInput.value = '1';

    // Function to update quantity
    function updateQuantity(change) {
        const currentValue = parseInt(quantityInput.value) || 1;
        const newValue = currentValue + change;
        
        if (newValue >= 1 && newValue <= 99) {
            quantityInput.value = newValue;
        }
    }

    // Function to validate quantity
    function validateQuantity() {
        let value = parseInt(quantityInput.value) || 1;
        if (value < 1) {
            value = 1;
        } else if (value > 99) {
            value = 99;
        }
        quantityInput.value = value;
    }

    // Add event listeners
    decreaseBtn.addEventListener('click', () => updateQuantity(-1));
    increaseBtn.addEventListener('click', () => updateQuantity(1));
    quantityInput.addEventListener('change', validateQuantity);
    quantityInput.addEventListener('input', validateQuantity);
}

// Function to load related products
async function loadRelatedProducts(category) {
    try {
        const suggestionsContainer = document.querySelector('.suggestions-container');
        if (!suggestionsContainer) return;

        // Show loading state
        suggestionsContainer.innerHTML = '<div class="loading-spinner"></div>';

        // Fetch related products from the same category
        const response = await fetch(`/api/products?category=${category}&limit=8`);
        if (!response.ok) throw new Error('Failed to fetch related products');
        
        const products = await response.json();
        
        if (!products || products.length === 0) {
            suggestionsContainer.innerHTML = '<p class="no-products">No related products found</p>';
            return;
        }

        // Generate HTML for related products
        const productsHTML = `
            <div class="related-products-header">
                <h2>Related Products</h2>
            </div>
            <div class="slider-controls">
                <button class="slider-btn prev-btn" onclick="slideProducts('prev')">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="products-slider">
                    <div class="products-track">
                        ${products.map(product => `
                            <div class="product-card">
                                <div class="product-image">
                                    <img src="/${product.image}" alt="${product.name}" onerror="this.src='../../../assets/images/placeholder.jpg'">
                                    ${product.isNew ? '<span class="product-badge new">New</span>' : ''}
                                    ${product.discount ? `<span class="product-badge discount">-${product.discount}%</span>` : ''}
                                </div>
                                <div class="product-info">
                                    <h3 class="product-name">${product.name}</h3>
                                    <div class="product-rating">
                                        <div class="stars">
                                            ${generateStarRating(product.rating)}
                                        </div>
                                        <span class="review-count">(${product.reviews || 0})</span>
                                    </div>
                                    <div class="product-price">
                                        ${product.comparePrice ? `
                                            <span class="compare-price">EGP ${product.comparePrice.toFixed(2)}</span>
                                        ` : ''}
                                        <span class="current-price">EGP ${product.price.toFixed(2)}</span>
                                    </div>
                                    <div class="product-actions">
                                        <button class="view-product-btn" onclick="window.location.href='productsviewer.html?id=${product._id}'">
                                            <i class="fas fa-eye"></i>
                                            View Details
                                        </button>
                                        <button class="quick-add-btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
                                            <i class="fas fa-shopping-cart"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <button class="slider-btn next-btn" onclick="slideProducts('next')">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;

        suggestionsContainer.innerHTML = productsHTML;
        initializeSlider();

    } catch (error) {
        console.error('Error loading related products:', error);
        const suggestionsContainer = document.querySelector('.suggestions-container');
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = '<p class="error-message">Failed to load related products</p>';
        }
    }
}

// Slider functionality
let currentSlide = 0;
let slideWidth = 0;
let slidesToShow = 4;

function initializeSlider() {
    const track = document.querySelector('.products-track');
    const cards = document.querySelectorAll('.product-card');
    if (!track || !cards.length) return;

    // Calculate slide width based on container width
    const container = document.querySelector('.products-slider');
    if (container) {
        slideWidth = container.offsetWidth / slidesToShow;
        cards.forEach(card => {
            card.style.width = `${slideWidth}px`;
        });
    }

    // Set initial position
    updateSliderPosition();
}

function slideProducts(direction) {
    const track = document.querySelector('.products-track');
    const cards = document.querySelectorAll('.product-card');
    if (!track || !cards.length) return;

    if (direction === 'next' && currentSlide < cards.length - slidesToShow) {
        currentSlide++;
    } else if (direction === 'prev' && currentSlide > 0) {
        currentSlide--;
    }

    updateSliderPosition();
}

function updateSliderPosition() {
    const track = document.querySelector('.products-track');
    if (!track) return;

    track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    
    // Update button states
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide >= document.querySelectorAll('.product-card').length - slidesToShow;
}

// Handle window resize
window.addEventListener('resize', () => {
    const container = document.querySelector('.products-slider');
    if (container) {
        slideWidth = container.offsetWidth / slidesToShow;
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.style.width = `${slideWidth}px`;
        });
        updateSliderPosition();
    }
});

// Function to show error message
function showError(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } else {
        console.error('Toast element not found:', message);
    }
}

// Add new functions for enhanced features
function changeMainImage(imagePath) {
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.src = `/${imagePath}`;
    }
}

function generateStarRating(rating) {
    const stars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return Array(5).fill().map((_, i) => 
        `<i class="fas fa-star${i < stars ? '' : hasHalfStar ? '-half-alt' : ''}"></i>`
    ).join('');
}

function calculateDiscount(price, comparePrice) {
    const discount = ((comparePrice - price) / comparePrice) * 100;
    return Math.round(discount);
}

function shareProduct(platform) {
    const url = window.location.href;
    const title = document.querySelector('.product-title').textContent;
    let shareUrl;

    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            break;
        case 'pinterest':
            const image = document.getElementById('main-product-image').src;
            shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(title)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Load product details
async function loadProductDetails() {
    const productId = getUrlParameter('id');
    if (!productId) {
        showError('Product ID is missing');
        return;
    }

    try {
        showLoading();
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Product not found');
            } else {
                throw new Error('Failed to fetch product details');
            }
        }

        const product = await response.json();
        if (!product) {
            throw new Error('Product data is invalid');
        }

        displayProductDetails(product);
    } catch (error) {
        console.error('Error loading product details:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Show loading state
function showLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

// Hide loading state
function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});

function addToCart(productId, productName, productPrice, productImage) {
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item._id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            _id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show success animation
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    addToCartBtn.classList.add('add-to-cart-success');
    setTimeout(() => {
        addToCartBtn.classList.remove('add-to-cart-success');
    }, 500);
    
    // Update cart count
    updateCartCount();
}

// Rating Modal HTML
function createRatingModal() {
    const modalHTML = `
        <div class="rating-modal" id="ratingModal">
            <div class="rating-modal-content">
                <span class="close-modal" onclick="closeRatingModal()">&times;</span>
                <h2>Rate this product</h2>
                <div class="rating-error" style="display: none;"></div>
                <div class="rating-stars-container">
                    <div class="rating-stars" id="userRatingStars">
                        <i class="far fa-star" data-rating="1"></i>
                        <i class="far fa-star" data-rating="2"></i>
                        <i class="far fa-star" data-rating="3"></i>
                        <i class="far fa-star" data-rating="4"></i>
                        <i class="far fa-star" data-rating="5"></i>
                    </div>
                    <span class="rating-text">Select your rating</span>
                </div>
                <textarea id="reviewText" placeholder="Write your review (optional)" rows="4"></textarea>
                <button class="submit-rating-btn" onclick="submitRating()">Submit Rating</button>
            </div>
        </div>
    `;

    // Add modal to body if it doesn't exist
    if (!document.getElementById('ratingModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        initializeRatingStars();
    }
}

function showRatingModal() {
    createRatingModal();
    const modal = document.getElementById('ratingModal');
    modal.style.display = 'flex';
}

function closeRatingModal() {
    const modal = document.getElementById('ratingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function initializeRatingStars() {
    const stars = document.querySelectorAll('#userRatingStars i');
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            updateStars(stars, rating);
        });

        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            updateStars(stars, selectedRating);
            document.querySelector('.rating-text').textContent = `You selected ${selectedRating} star${selectedRating > 1 ? 's' : ''}`;
        });
    });

    document.getElementById('userRatingStars').addEventListener('mouseleave', function() {
        updateStars(stars, selectedRating);
    });
}

function updateStars(stars, rating) {
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.className = 'fas fa-star';
        } else {
            star.className = 'far fa-star';
        }
    });
}

async function submitRating() {
    const stars = document.querySelectorAll('#userRatingStars i.fas');
    const rating = stars.length;
    const review = document.getElementById('reviewText').value.trim();
    const submitBtn = document.querySelector('.submit-rating-btn');
    const errorMsg = document.querySelector('.rating-error');

    if (rating === 0) {
        errorMsg.textContent = 'Please select a rating';
        errorMsg.style.display = 'block';
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        errorMsg.style.display = 'none';

        // Get user email from localStorage
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            throw new Error('Please login to rate this product');
        }

        const productId = new URLSearchParams(window.location.search).get('id');
        if (!productId) {
            throw new Error('Product ID not found');
        }

        const response = await fetch('/api/products/rate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': userEmail
            },
            body: JSON.stringify({
                productId,
                rating,
                review
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit rating');
        }

        // Update the displayed rating and review count
        const ratingDisplay = document.querySelector('.product-rating .stars');
        const reviewCount = document.querySelector('.review-count');
        
        if (ratingDisplay && reviewCount) {
            ratingDisplay.innerHTML = generateStarRating(data.averageRating);
            reviewCount.textContent = `(${data.totalReviews} ${data.totalReviews === 1 ? 'review' : 'reviews'})`;
        }

        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'rating-success';
        successMsg.textContent = 'Rating submitted successfully!';
        document.querySelector('.rating-modal-content').prepend(successMsg);

        // Close modal after 1.5 seconds
        setTimeout(() => {
            closeRatingModal();
        }, 1500);

    } catch (error) {
        errorMsg.textContent = error.message;
        errorMsg.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Rating';
    }
} 
