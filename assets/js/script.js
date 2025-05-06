window.addEventListener('load', function() {
    document.body.classList.remove('loading');
    document.querySelector('.loader-wrapper').style.opacity = '0';
    setTimeout(function() {
        document.querySelector('.loader-wrapper').style.display = 'none';
    }, 500);
});
let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');

// Update cart count
function updateCartCount() {
    cartCountElement.textContent = cartCount;
}

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        header.style.backgroundColor = 'var(--white)';
        header.style.boxShadow = 'none';
    }
});

// Add animation effects to cards on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.product-card, .collection-card, .benefit-item').forEach(el => {
    observer.observe(el);
});

// Add products to cart
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        cartCount++;
        updateCartCount();
    });
});

// Show notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add icon based on type
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    notification.insertBefore(icon, notification.firstChild);

    document.body.appendChild(notification);

    // Add styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 5px;
            background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease forwards;
        }

        .notification i {
            font-size: 1.2rem;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animation effects to buttons
document.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('mouseover', () => {
        el.style.transform = 'translateY(-2px)';
    });
    
    el.addEventListener('mouseout', () => {
        el.style.transform = 'translateY(0)';
    });
});

// Live search
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const title = product.querySelector('h3').textContent.toLowerCase();
            const description = product.querySelector('.description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    });
}

// Validate subscription form
const subscribeForm = document.querySelector('.subscribe-form');
if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = subscribeForm.querySelector('input[type="email"]').value;
        
        if (validateEmail(email)) {
            showNotification('Successfully subscribed!');
            subscribeForm.reset();
        } else {
            showNotification('Please enter a valid email address');
        }
    });
}

// Validate email
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Here you would typically send the form data to a server
        // For now, we'll just show a success message
        showNotification('Thank you for your message! We will get back to you soon.', 'success');
        contactForm.reset();
    });
}

// FAQ Section Animation
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });

    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Map Section Animation
const mapSection = document.querySelector('.map-section');
if (mapSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    const mapContainer = mapSection.querySelector('.map-container');
    mapContainer.style.opacity = '0';
    mapContainer.style.transform = 'translateY(20px)';
    mapContainer.style.transition = 'all 0.6s ease';
    observer.observe(mapContainer);
}

// Products Page Functionality
const categoryFilter = document.getElementById('category');
const priceFilter = document.getElementById('price');
const sortFilter = document.getElementById('sort');
const productCards = document.querySelectorAll('.product-card');

if (categoryFilter && priceFilter && sortFilter) {
    // Filter by category
    categoryFilter.addEventListener('change', filterProducts);
    
    // Filter by price
    priceFilter.addEventListener('change', filterProducts);
    
    // Sort products
    sortFilter.addEventListener('change', sortProducts);
}

function filterProducts() {
    const selectedCategory = categoryFilter.value;
    const selectedPrice = priceFilter.value;
    
    productCards.forEach(card => {
        const price = parseFloat(card.querySelector('.price').textContent.replace('$', ''));
        const category = card.dataset.category || 'all';
        
        let showByCategory = selectedCategory === 'all' || category === selectedCategory;
        let showByPrice = true;
        
        switch(selectedPrice) {
            case 'under-50':
                showByPrice = price < 50;
                break;
            case '50-100':
                showByPrice = price >= 50 && price <= 100;
                break;
            case '100-200':
                showByPrice = price > 100 && price <= 200;
                break;
            case 'over-200':
                showByPrice = price > 200;
                break;
            default:
                showByPrice = true;
        }
        
        card.style.display = showByCategory && showByPrice ? 'block' : 'none';
    });
}

function sortProducts() {
    const productsGrid = document.querySelector('.products-grid');
    const products = Array.from(productCards);
    
    products.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.price').textContent.replace('$', ''));
        const priceB = parseFloat(b.querySelector('.price').textContent.replace('$', ''));
        
        switch(sortFilter.value) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'newest':
                const dateA = new Date(a.dataset.date || 0);
                const dateB = new Date(b.dataset.date || 0);
                return dateB - dateA;
            default:
                return 0;
        }
    });
    
    // Clear and re-append sorted products
    products.forEach(product => productsGrid.appendChild(product));
}

// Pagination
const pageButtons = document.querySelectorAll('.page-btn');
pageButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        pageButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        // Here you would typically load the corresponding page of products
        // For now, we'll just show a notification
        showNotification('Loading products...', 'success');
    });
});

// Handle URL parameters for products page
function handleProductPageParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const product = urlParams.get('product');

    if (category) {
        const categoryFilter = document.getElementById('category');
        if (categoryFilter) {
            categoryFilter.value = category;
            filterProducts();
        }
    }
}

// Initialize animations when the page loads
if (window.location.pathname.includes('products.html')) {
    initProductAnimations();
}

// Products Page Animations
function initProductAnimations() {
    // Animate product cards on scroll
    const productCards = document.querySelectorAll('.product-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    productCards.forEach(card => observer.observe(card));

    // Animate filters section
    const filtersSection = document.querySelector('.products-filters');
    if (filtersSection) {
        filtersSection.classList.add('visible');
    }

    // Animate hero section
    const heroSection = document.querySelector('.products-hero');
    if (heroSection) {
        heroSection.classList.add('visible');
    }

    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Product Details Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Thumbnail Image Switching
    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.querySelector('.main-image img');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            // Add active class to clicked thumbnail
            thumb.classList.add('active');
            // Update main image
            mainImage.src = thumb.src;
            mainImage.alt = thumb.alt;
        });
    });

    // Quantity Controls
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');

    minusBtn?.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    plusBtn?.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
            quantityInput.value = currentValue + 1;
        }
    });

    // Add to Cart Button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    addToCartBtn?.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        const currentCount = parseInt(cartCount.textContent);
        cartCount.textContent = currentCount + quantity;
        
        // Show notification
    });

    // Buy Now Button
    const buyNowBtn = document.querySelector('.buy-now-btn');
    buyNowBtn?.addEventListener('click', () => {
        // Redirect to checkout page
        // window.location.href = 'checkout.html';
    });

    // Wishlist Button
    const wishlistBtn = document.querySelector('.wishlist-btn');
    wishlistBtn?.addEventListener('click', () => {
        wishlistBtn.classList.toggle('active');
        if (wishlistBtn.classList.contains('active')) {
        } else {
        }
    });
});

// Notification Function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Product Details Loading
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        // هنا يمكنك إضافة طلب API لجلب تفاصيل المنتج من قاعدة البيانات
        // في هذا المثال، سنستخدم بيانات ثابتة للمنتج
        const productData = {
            'royal-oud': {
                name: 'Royal Oud',
                price: 199.99,
                originalPrice: 249.99,
                description: 'A rich and sophisticated oriental fragrance that combines the warmth of oud with precious woods and spices.',
                details: {
                    volume: '100ml',
                    type: 'Eau de Parfum',
                    gender: 'Unisex',
                    family: 'Oriental',
                    longevity: '8-12 hours'
                },
                notes: {
                    top: ['Bergamot', 'Cardamom', 'Pink Pepper'],
                    middle: ['Rose', 'Amber', 'Saffron'],
                    base: ['Oud', 'Sandalwood', 'Vanilla']
                },
                images: [
                    'https://images.wallpapersden.com/image/download/beach-night-hd_bWtqbmmUmZqaraWkpJRoZWWtaGVl.jpg',
                    'https://via.placeholder.com/300x300',
                    'https://via.placeholder.com/300x300',
                    'https://via.placeholder.com/300x300'
                ],
                reviews: [
                    {
                        user: 'John Doe',
                        rating: 5,
                        date: '2 days ago',
                        text: 'Absolutely love this fragrance! The oud note is perfectly balanced with the sweet vanilla base.'
                    },
                    {
                        user: 'Jane Smith',
                        rating: 4,
                        date: '1 week ago',
                        text: 'Beautiful scent, very luxurious. The packaging is elegant and the bottle looks great on my vanity.'
                    }
                ]
            }
        };

        const product = productData[productId];
        if (product) {
            // تحديث عنوان الصفحة
            document.title = `${product.name} - LUXE Perfumes`;
            
            // تحديث الصور
            const mainImage = document.querySelector('.main-image img');
            const thumbnails = document.querySelectorAll('.thumbnail-images img');
            
            mainImage.src = product.images[0];
            mainImage.alt = product.name;
            
            thumbnails.forEach((thumb, index) => {
                if (product.images[index]) {
                    thumb.src = product.images[index];
                    thumb.alt = `${product.name} View ${index + 1}`;
                }
            });

            // تحديث معلومات المنتج
            document.querySelector('.product-header h1').textContent = product.name;
            document.querySelector('.current-price').textContent = `$${product.price}`;
            document.querySelector('.original-price').textContent = `$${product.originalPrice}`;
            document.querySelector('.product-description p').textContent = product.description;

            // تحديث التفاصيل
            const detailsList = document.querySelector('.product-details ul');
            detailsList.innerHTML = Object.entries(product.details)
                .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                .join('');

            // تحديث مكونات العطر
            document.querySelector('.note-group:nth-child(1) p').textContent = product.notes.top.join(', ');
            document.querySelector('.note-group:nth-child(2) p').textContent = product.notes.middle.join(', ');
            document.querySelector('.note-group:nth-child(3) p').textContent = product.notes.base.join(', ');

            // تحديث المراجعات
            const reviewsList = document.querySelector('.reviews-list');
            reviewsList.innerHTML = product.reviews
                .map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <img src="https://via.placeholder.com/50" alt="User Avatar">
                                <div>
                                    <h4>${review.user}</h4>
                                    <div class="stars">
                                        ${Array(5).fill().map((_, i) => 
                                            `<i class="fas fa-${i < review.rating ? 'star' : 'far fa-star'}"></i>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>
                            <span class="review-date">${review.date}</span>
                        </div>
                        <p class="review-text">${review.text}</p>
                    </div>
                `).join('');
        }
    }
}

// تحميل تفاصيل المنتج عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('product-details.html')) {
        loadProductDetails();
    }
});

// Loading animation
window.addEventListener('load', () => {
    // Show loading container
    document.body.classList.remove('content-loaded');
    
    // Add content-loaded class after a delay to hide the loading animation
    setTimeout(() => {
        document.body.classList.add('content-loaded');
    }, 2400); // Match this with the animation duration
});

// Best Sellers Section Animations
document.addEventListener('DOMContentLoaded', function() {
    const bestSellersSection = document.querySelector('.best-sellers');
    const bestSellersCards = document.querySelectorAll('.best-sellers .product-card');
    
    if (bestSellersSection) {
        // Create intersection observer for the section
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class to the section
                    bestSellersSection.classList.add('animate-section');
                    
                    // Animate each card with a delay
                    bestSellersCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate-card');
                        }, 200 * index); // Stagger the animations
                    });
                    
                    // Stop observing once animation is triggered
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        // Start observing the section
        sectionObserver.observe(bestSellersSection);
        
        // Add hover effects to product cards
        bestSellersCards.forEach(card => {
            // Add hover effect for the entire card
            card.addEventListener('mouseenter', function() {
                this.classList.add('card-hover');
                
                // Animate the badge
                const badge = this.querySelector('.product-badge');
                if (badge) {
                    badge.classList.add('badge-pulse');
                }
                
                // Animate the image
                const image = this.querySelector('img');
                if (image) {
                    image.classList.add('image-zoom');
                }
                
                // Animate the price
                const price = this.querySelector('.price');
                if (price) {
                    price.classList.add('price-highlight');
                }
                
                // Animate the button
                const button = this.querySelector('.add-to-cart');
                if (button) {
                    button.classList.add('button-pulse');
                }
            });
            
            // Remove hover effects when mouse leaves
            card.addEventListener('mouseleave', function() {
                this.classList.remove('card-hover');
                
                const badge = this.querySelector('.product-badge');
                if (badge) {
                    badge.classList.remove('badge-pulse');
                }
                
                const image = this.querySelector('img');
                if (image) {
                    image.classList.remove('image-zoom');
                }
                
                const price = this.querySelector('.price');
                if (price) {
                    price.classList.remove('price-highlight');
                }
                
                const button = this.querySelector('.add-to-cart');
                if (button) {
                    button.classList.remove('button-pulse');
                }
            });
            
            // Add click effect to the add to cart button
            const addToCartBtn = card.querySelector('.add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    this.classList.add('button-click');
                    setTimeout(() => {
                        this.classList.remove('button-click');
                    }, 500);
                });
            }
        });
    }
});

// Add CSS animations dynamically
function addBestSellersAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        /* Best Sellers Section Animations */
        .best-sellers {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .best-sellers.animate-section {
            opacity: 1;
            transform: translateY(0);
        }
        
        .best-sellers .product-card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease;
        }
        
        .best-sellers .product-card.animate-card {
            opacity: 1;
            transform: translateY(0);
        }
        
        .best-sellers .product-card.card-hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
        
        .best-sellers .product-badge {
            transition: transform 0.3s ease, background-color 0.3s ease;
        }
        
        .best-sellers .product-badge.badge-pulse {
            animation: badgePulse 1s infinite;
        }
        
        @keyframes badgePulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .best-sellers .product-card img {
            transition: transform 0.5s ease;
        }
        
        .best-sellers .product-card .image-zoom {
            transform: scale(1.05);
        }
        
        .best-sellers .product-card .price {
            transition: color 0.3s ease, transform 0.3s ease;
        }
        
        .best-sellers .product-card .price-highlight {
            color: var(--accent-color);
            transform: scale(1.1);
        }
        
        .best-sellers .product-card .add-to-cart {
            transition: background-color 0.3s ease, transform 0.3s ease;
        }
        
        .best-sellers .product-card .button-pulse {
            animation: buttonPulse 1.5s infinite;
        }
        
        .best-sellers .product-card .button-click {
            animation: buttonClick 0.5s;
        }
        
        @keyframes buttonPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes buttonClick {
            0% { transform: scale(1); }
            50% { transform: scale(0.95); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// Call the function to add animations
addBestSellersAnimations();

// New Arrivals Section Animations
document.addEventListener('DOMContentLoaded', function() {
    const newArrivalsSection = document.querySelector('.new-arrivals');
    const newArrivalsCards = document.querySelectorAll('.new-arrivals .product-card');
    
    if (newArrivalsSection) {
        // Create intersection observer for the section
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class to the section
                    newArrivalsSection.classList.add('animate-section');
                    
                    // Animate each card with a delay
                    newArrivalsCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate-card');
                        }, 200 * index); // Stagger the animations
                    });
                    
                    // Stop observing once animation is triggered
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        // Start observing the section
        sectionObserver.observe(newArrivalsSection);
        
        // Add hover effects to product cards
        newArrivalsCards.forEach(card => {
            // Add hover effect for the entire card
            card.addEventListener('mouseenter', function() {
                this.classList.add('card-hover');
                
                // Animate the badge
                const badge = this.querySelector('.product-badge');
                if (badge) {
                    badge.classList.add('badge-pulse');
                }
                
                // Animate the image
                const image = this.querySelector('img');
                if (image) {
                    image.classList.add('image-zoom');
                }
                
                // Animate the price
                const price = this.querySelector('.price');
                if (price) {
                    price.classList.add('price-highlight');
                }
                
                // Animate the button
                const button = this.querySelector('.add-to-cart');
                if (button) {
                    button.classList.add('button-pulse');
                }
            });
            
            // Remove hover effects when mouse leaves
            card.addEventListener('mouseleave', function() {
                this.classList.remove('card-hover');
                
                const badge = this.querySelector('.product-badge');
                if (badge) {
                    badge.classList.remove('badge-pulse');
                }
                
                const image = this.querySelector('img');
                if (image) {
                    image.classList.remove('image-zoom');
                }
                
                const price = this.querySelector('.price');
                if (price) {
                    price.classList.remove('price-highlight');
                }
                
                const button = this.querySelector('.add-to-cart');
                if (button) {
                    button.classList.remove('button-pulse');
                }
            });
            
            // Add click effect to the add to cart button
            const addToCartBtn = card.querySelector('.add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    this.classList.add('button-click');
                    setTimeout(() => {
                        this.classList.remove('button-click');
                    }, 500);
                });
            }
        });
    }
});

// Add CSS animations dynamically for New Arrivals
function addNewArrivalsAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        /* New Arrivals Section Animations */
        .new-arrivals {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .new-arrivals.animate-section {
            opacity: 1;
            transform: translateY(0);
        }
        
        .new-arrivals .product-card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease;
        }
        
        .new-arrivals .product-card.animate-card {
            opacity: 1;
            transform: translateY(0);
        }
        
        .new-arrivals .product-card.card-hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
        
        .new-arrivals .product-badge {
            transition: transform 0.3s ease, background-color 0.3s ease;
        }
        
        .new-arrivals .product-badge.badge-pulse {
            animation: badgePulse 1s infinite;
        }
        
        .new-arrivals .product-card img {
            transition: transform 0.5s ease;
        }
        
        .new-arrivals .product-card .image-zoom {
            transform: scale(1.05);
        }
        
        .new-arrivals .product-card .price {
            transition: color 0.3s ease, transform 0.3s ease;
        }
        
        .new-arrivals .product-card .price-highlight {
            color: var(--accent-color);
            transform: scale(1.1);
        }
        
        .new-arrivals .product-card .add-to-cart {
            transition: background-color 0.3s ease, transform 0.3s ease;
        }
        
        .new-arrivals .product-card .button-pulse {
            animation: buttonPulse 1.5s infinite;
        }
        
        .new-arrivals .product-card .button-click {
            animation: buttonClick 0.5s;
        }
    `;
    document.head.appendChild(style);
}

// Call the function to add animations
addNewArrivalsAnimations();

// Sample products data
const products = [
    {
        id: 1,
        name: "Royal Oud",
        category: "mens",
        price: 1200,
        image: "images/products/royal-oud.jpg",
        placeholder: "https://via.placeholder.com/300x300?text=Royal+Oud",
        description: "A luxurious oriental fragrance with notes of oud, sandalwood, and spices.",
        rating: 4.8,
        reviews: 128,
        specs: {
            "Volume": "100ml",
            "Type": "Eau de Parfum",
            "Gender": "Men",
            "Longevity": "8-12 hours"
        }
    },
    {
        id: 2,
        name: "Rose Gold",
        category: "womens",
        price: 950,
        image: "images/products/rose-gold.jpg",
        placeholder: "https://via.placeholder.com/300x300?text=Rose+Gold",
        description: "An elegant floral fragrance featuring rose, jasmine, and vanilla notes.",
        rating: 4.7,
        reviews: 95,
        specs: {
            "Volume": "100ml",
            "Type": "Eau de Parfum",
            "Gender": "Women",
            "Longevity": "6-8 hours"
        }
    },
    {
        id: 3,
        name: "Amber Noir",
        category: "luxury",
        price: 1800,
        image: "images/products/amber-noir.jpg",
        placeholder: "https://via.placeholder.com/300x300?text=Amber+Noir",
        description: "A sophisticated blend of amber, musk, and precious woods.",
        rating: 4.9,
        reviews: 156,
        specs: {
            "Volume": "100ml",
            "Type": "Eau de Parfum",
            "Gender": "Unisex",
            "Longevity": "10-12 hours"
        }
    },
    {
        id: 4,
        name: "Citrus Breeze",
        category: "mens",
        price: 750,
        image: "images/products/citrus-breeze.jpg",
        placeholder: "https://via.placeholder.com/300x300?text=Citrus+Breeze",
        description: "A refreshing citrus fragrance perfect for everyday wear.",
        rating: 4.5,
        reviews: 82,
        specs: {
            "Volume": "100ml",
            "Type": "Eau de Toilette",
            "Gender": "Men",
            "Longevity": "4-6 hours"
        }
    },
    {
        id: 5,
        name: "Velvet Orchid",
        category: "womens",
        price: 1100,
        image: "images/products/velvet-orchid.jpg",
        placeholder: "https://via.placeholder.com/300x300?text=Velvet+Orchid",
        description: "A rich and sensual fragrance with orchid and honey notes.",
        rating: 4.6,
        reviews: 112,
        specs: {
            "Volume": "100ml",
            "Type": "Eau de Parfum",
            "Gender": "Women",
            "Longevity": "6-8 hours"
        }
    },
    {
        id: 6,
        name: "Royal Collection",
        category: "luxury",
        price: 2000,
        image: "images/products/royal-collection.jpg",
        placeholder: "https://via.placeholder.com/300x300?text=Royal+Collection",
        description: "Our most exclusive fragrance with rare and precious ingredients.",
        rating: 5.0,
        reviews: 45,
        specs: {
            "Volume": "100ml",
            "Type": "Parfum",
            "Gender": "Unisex",
            "Longevity": "12+ hours"
        }
    },
    {
        id: 7,
        name: "Ocean Mist",
        category: "mens",
        price: 850,
        image: "images/products/ocean-mist.jpg",
        placeholder: "https://via.placeholder.com/300x300?text=Ocean+Mist",
        description: "A fresh aquatic fragrance inspired by the ocean breeze.",
        rating: 4.4,
        reviews: 78,
        specs: {
            "Volume": "100ml",
            "Type": "Eau de Toilette",
            "Gender": "Men",
            "Longevity": "4-6 hours"
        }
    },
    {
        id: 8,
        name: "Floral Dream",
        category: "womens",
        price: 900,
        image: "images/products/floral-dream.jpg",
        placeholder: "https://via.placeholder.com/300x300?text=Floral+Dream",
        description: "A delicate blend of spring flowers and soft musk.",
        rating: 4.7,
        reviews: 103,
        specs: {
            "Volume": "100ml",
            "Type": "Eau de Parfum",
            "Gender": "Women",
            "Longevity": "6-8 hours"
    }
    }
];

function displayProducts(category = 'all', maxPrice = 2000) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    // Filter products based on category and price
    const filteredProducts = products.filter(product => {
        const categoryMatch = category === 'all' || product.category === category;
        const priceMatch = product.price <= maxPrice;
        return categoryMatch && priceMatch;
    });

    // Clear existing products
    productsGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">No products found matching your criteria</div>';
        return;
    }

    // Display filtered products
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-badge">${product.category === 'luxury' ? 'Luxury' : 'New'}</div>
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='${product.placeholder}';">
                <div class="product-overlay">
                    <button class="add-to-cart" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
            </div>
            </div>
            <div class="product-info">
            <h3>${product.name}</h3>
            <p class="description">${product.description}</p>
                <div class="product-meta">
            <div class="rating">
                ${Array(5).fill().map((_, i) => 
                    `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : 
                            i === Math.floor(product.rating) && product.rating % 1 !== 0 ? '-half-alt' : ''}"></i>`
                ).join('')}
                <span>(${product.reviews})</span>
            </div>
                    <div class="price">EGP ${product.price}</div>
        </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });

    // Add event listeners to new add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            const product = products.find(p => p.id === parseInt(productId));
            if (product) {
                addToCart(productId, product.name, product.price, product.image);
                showNotification('Product added to cart');
    }
});
    });
}

// Initialize products page
function initProductsPage() {
    // Get category from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'all';
    
    // Get price filter value
    const priceFilter = document.getElementById('price-filter');
    const maxPrice = priceFilter ? parseInt(priceFilter.value) : 2000;
    
    // Display products
    displayProducts(category, maxPrice);
    
    // Add event listeners for filters
    const categoryLinks = document.querySelectorAll('.category-list a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            displayProducts(category, maxPrice);
            
            // Update active state
            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Add event listener for price filter
    if (priceFilter) {
        priceFilter.addEventListener('input', (e) => {
            const maxPrice = parseInt(e.target.value);
            document.getElementById('price-value').textContent = `EGP ${maxPrice}`;
            displayProducts(category, maxPrice);
        });
    }
}

// Call initProductsPage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('products-grid')) {
        initProductsPage();
    }
});

// Initialize cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const SHIPPING_COST = 50; // EGP

// Make functions globally accessible
window.addToCart = function(productId, productName, productPrice, productImage) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            image: productImage,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${productName} added to cart!`);
};

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount();
    showNotification('Item removed from cart');
};

window.updateQuantity = function(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCartItems();
            updateCartCount();
        }
    }
};

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart
    updateCartCount();
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }

    // Initialize featured collections
    initFeaturedCollections();

    // Initialize products page if present
    if (document.getElementById('products-grid')) {
        initProductsPage();
    }

    // Initialize product viewer if present
    if (document.getElementById('product-container')) {
        displayProductDetails();
    }
});

// Product Display Functions
function displayProducts(category = 'all', maxPrice = 2000) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    const filteredProducts = products.filter(product => {
        const matchesCategory = category === 'all' || product.category.toLowerCase().includes(category);
        const matchesPrice = product.price <= maxPrice;
        return matchesCategory && matchesPrice;
    });

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">No products found matching your criteria</div>';
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-badge">${product.category === 'luxury' ? 'Luxury' : 'New'}</div>
            <a href="productsviewer.html?id=${product.id}">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.parentElement.querySelector('.product-name-fallback').style.display='block';">
                    <div class="product-name-fallback">${product.name}</div>
                </div>
            </a>
            <h3>${product.name}</h3>
            <p class="description">${product.description}</p>
            <div class="rating">
                ${Array(5).fill().map((_, i) => 
                    `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : 
                    i === Math.floor(product.rating) && product.rating % 1 !== 0 ? '-half-alt' : ''}"></i>`
                ).join('')}
                <span>(${product.reviews})</span>
            </div>
            <div class="price">EGP ${product.price.toFixed(2)}</div>
            <button class="add-to-cart" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')">
                Add to Cart
            </button>
        </div>
    `).join('');
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        updateCartSummary();
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>EGP ${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    updateCartSummary();
}

function updateCartSummary() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = cart.length > 0 ? SHIPPING_COST : 0;
    const total = subtotal + shipping;

    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');

    if (subtotalElement) subtotalElement.textContent = `EGP ${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `EGP ${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `EGP ${total.toFixed(2)}`;
}

// Product Slider Functions
const productsPerPage = 3;
let currentSlide = {
    'new-arrivals': 0,
    'best-sellers': 0
};

function slideProducts(section, direction) {
    const grid = document.getElementById(section);
    const products = grid.children;
    const totalSlides = Math.ceil(products.length / productsPerPage);
    
    if (direction === 1) {
        currentSlide[section] = (currentSlide[section] + 1) % totalSlides;
    } else {
        currentSlide[section] = (currentSlide[section] - 1 + totalSlides) % totalSlides;
    }
    
    const offset = currentSlide[section] * productsPerPage * 320;
    grid.style.transform = `translateX(-${offset}px)`;
    
    updateDots(section);
}

function updateDots(section) {
    const grid = document.getElementById(section);
    const dots = document.querySelector(`#${section} .slider-dots`);
    const totalSlides = Math.ceil(grid.children.length / productsPerPage);
    
    dots.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = `dot ${i === currentSlide[section] ? 'active' : ''}`;
        dot.onclick = () => {
            currentSlide[section] = i;
            const offset = i * productsPerPage * 320;
            grid.style.transform = `translateX(-${offset}px)`;
            updateDots(section);
        };
        dots.appendChild(dot);
    }
}

// Product Viewer Functions
function displayProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const product = products[productId];

    if (!product) {
        document.getElementById('product-container').innerHTML = '<h2>Product not found</h2>';
        return;
    }

    document.title = `${product.name} - Scentify`;
    
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = `
        <div class="product-images">
            <div class="thumbnail-container">
                ${product.images.map((img, index) => `
                    <img src="${img}" alt="${product.name} - View ${index + 1}" 
                         class="thumbnail ${index === 0 ? 'active' : ''}"
                         onclick="changeMainImage('${img}')">
                `).join('')}
            </div>
            <img src="${product.image}" alt="${product.name}" class="main-image" id="main-image">
        </div>
        <div class="product-details">
            <h1 class="product-title">${product.name}</h1>
            <div class="product-badges">
                <span class="badge new">New</span>
                <span class="badge best-seller">Best Seller</span>
            </div>
            <div class="product-rating">
                ${Array(5).fill().map((_, i) => 
                    `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : 
                        i === Math.floor(product.rating) && product.rating % 1 !== 0 ? '-half-alt' : ''}"></i>`
                ).join('')}
                <span>(${product.reviews} reviews)</span>
            </div>
            <div class="product-price">EGP ${product.price.toFixed(2)}</div>
            <p class="product-description">${product.description}</p>
            <div class="product-actions">
                <button class="add-to-cart" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')">
                    Add to Cart
                </button>
                <button class="wishlist">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="product-specs">
                ${Object.entries(product.specs).map(([label, value]) => `
                    <div class="spec-item">
                        <span class="spec-label">${label}</span>
                        <span class="spec-value">${value}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    displaySuggestions(productId);
}

function changeMainImage(src) {
    document.getElementById('main-image').src = src;
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src === src) {
            thumb.classList.add('active');
        }
    });
}

function getRandomSuggestions(currentProductId, count = 4) {
    const productIds = Object.keys(products).filter(id => id !== currentProductId);
    const shuffled = productIds.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(id => products[id]);
}

function displaySuggestions(currentProductId) {
    const suggestions = getRandomSuggestions(currentProductId);
    const suggestionsGrid = document.getElementById('suggestions-grid');
    
    suggestionsGrid.innerHTML = suggestions.map(product => `
        <div class="suggestion-card">
            <a href="productsviewer.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}" class="suggestion-image">
                <div class="suggestion-details">
                    <h3 class="suggestion-name">${product.name}</h3>
                    <div class="suggestion-price">EGP ${product.price.toFixed(2)}</div>
                    <div class="suggestion-rating">
                        ${Array(5).fill().map((_, i) => 
                            `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : 
                                i === Math.floor(product.rating) && product.rating % 1 !== 0 ? '-half-alt' : ''}"></i>`
                        ).join('')}
                        <span>(${product.reviews})</span>
                    </div>
                </div>
            </a>
        </div>
    `).join('');
}

// Initialize product-related functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize products page
    if (document.getElementById('products-grid')) {
        displayProducts();
        
        // Category filter
        document.querySelectorAll('.category-list a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('.category-list a.active').classList.remove('active');
                link.classList.add('active');
                const category = link.getAttribute('data-category');
                displayProducts(category);
            });
        });

        // Price filter
        const priceFilter = document.getElementById('price-filter');
        if (priceFilter) {
            priceFilter.addEventListener('input', (e) => {
                const maxPrice = parseInt(e.target.value);
                document.getElementById('price-value').textContent = `EGP ${maxPrice}`;
                const category = document.querySelector('.category-list a.active').getAttribute('data-category');
                displayProducts(category, maxPrice);
            });
        }
    }

    // Initialize product viewer page
    if (document.getElementById('product-container')) {
        displayProductDetails();
    }

    // Initialize sliders
    if (document.querySelector('.products-slider')) {
        updateDots('new-arrivals');
        updateDots('best-sellers');
    }
});

// Make functions available globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.slideProducts = slideProducts;
window.changeMainImage = changeMainImage;

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

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initFeaturedCollections();
    // ... rest of your initialization code ...
});
