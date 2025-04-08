window.addEventListener('load', function() {
            setTimeout(function() {
                document.body.classList.remove('loading');
                document.querySelector('.loader-wrapper').style.opacity = '0';
                
                setTimeout(function() {
                    document.querySelector('.loader-wrapper').style.display = 'none';
                }, 500);
            }, 3000);
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
        showNotification('Product added to cart');
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

// Quick View Modal
function createQuickViewModal() {
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-body">
                <div class="modal-image">
                    <img src="" alt="Product Image">
                </div>
                <div class="modal-info">
                    <h2></h2>
                    <p class="description"></p>
                    <div class="rating"></div>
                    <div class="price"></div>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close modal when clicking the close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    return modal;
}

// Add quick view functionality to product cards
productCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('add-to-cart')) {
            const modal = document.querySelector('.quick-view-modal') || createQuickViewModal();
            const modalImage = modal.querySelector('.modal-image img');
            const modalTitle = modal.querySelector('h2');
            const modalDescription = modal.querySelector('.description');
            const modalRating = modal.querySelector('.rating');
            const modalPrice = modal.querySelector('.price');
            
            // Populate modal with product data
            modalImage.src = card.querySelector('img').src;
            modalTitle.textContent = card.querySelector('h3').textContent;
            modalDescription.textContent = card.querySelector('.description').textContent;
            modalRating.innerHTML = card.querySelector('.rating').innerHTML;
            modalPrice.textContent = card.querySelector('.price').textContent;
            
            modal.style.display = 'flex';
        }
    });
});

// Add styles for quick view modal
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .quick-view-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
    }
    
    .modal-content {
        background-color: var(--white);
        padding: 2rem;
        border-radius: 15px;
        max-width: 800px;
        width: 90%;
        position: relative;
    }
    
    .close-modal {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-color);
    }
    
    .modal-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
    
    .modal-image img {
        width: 100%;
        height: 400px;
        object-fit: cover;
        border-radius: 10px;
    }
    
    .modal-info h2 {
        color: var(--text-color);
        margin-bottom: 1rem;
    }
    
    .modal-info .description {
        color: var(--light-text);
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    
    .modal-info .rating {
        color: var(--accent-color);
        margin-bottom: 1rem;
    }
    
    .modal-info .price {
        color: var(--primary-color);
        font-weight: bold;
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
    }
    
    @media (max-width: 768px) {
        .modal-body {
            grid-template-columns: 1fr;
        }
        
        .modal-image img {
            height: 300px;
        }
    }
`;
document.head.appendChild(modalStyles);

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

    if (product) {
        const productCard = document.querySelector(`[data-product="${product}"]`);
        if (productCard) {
            productCard.click(); // Trigger quick view modal
        }
    }
}

// Call the function when the page loads
if (window.location.pathname.includes('products.html')) {
    handleProductPageParams();
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

// Initialize animations when the page loads
if (window.location.pathname.includes('products.html')) {
    initProductAnimations();
}

// Enhanced Quick View Modal Animation
function showQuickViewModal(productCard) {
    const modal = document.querySelector('.quick-view-modal') || createQuickViewModal();
    modal.classList.add('show');
    
    // Animate modal content
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.transform = 'translateY(0)';
    modalContent.style.opacity = '1';
    
    // Populate modal with product data
    const modalImage = modal.querySelector('.modal-image img');
    const modalTitle = modal.querySelector('h2');
    const modalDescription = modal.querySelector('.description');
    const modalRating = modal.querySelector('.rating');
    const modalPrice = modal.querySelector('.price');
    
    modalImage.src = productCard.querySelector('img').src;
    modalTitle.textContent = productCard.querySelector('h3').textContent;
    modalDescription.textContent = productCard.querySelector('.description').textContent;
    modalRating.innerHTML = productCard.querySelector('.rating').innerHTML;
    modalPrice.textContent = productCard.querySelector('.price').textContent;
}

function hideQuickViewModal(modal) {
    modal.classList.remove('show');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.transform = 'translateY(50px)';
    modalContent.style.opacity = '0';
}

// Update quick view modal event listeners
productCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('add-to-cart')) {
            showQuickViewModal(card);
        }
    });
});

// Enhanced filter animations
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
        
        if (showByCategory && showByPrice) {
            card.style.display = 'block';
            setTimeout(() => {
                card.classList.add('visible');
            }, 100);
        } else {
            card.classList.remove('visible');
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Enhanced sort animation
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
    
    // Animate sorting
    products.forEach((product, index) => {
        product.style.transitionDelay = `${index * 0.1}s`;
        productsGrid.appendChild(product);
    });
}

// Image Animation Observer
const animateOnScroll = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe collection cards
    document.querySelectorAll('.collection-card').forEach(card => {
        observer.observe(card);
    });

    // Observe product cards
    document.querySelectorAll('.product-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
};

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
});

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
        showNotification('تمت إضافة المنتج إلى سلة التسوق');
    });

    // Buy Now Button
    const buyNowBtn = document.querySelector('.buy-now-btn');
    buyNowBtn?.addEventListener('click', () => {
        // Redirect to checkout page
        // window.location.href = 'checkout.html';
        showNotification('جارٍ التوجيه إلى صفحة الدفع...');
    });

    // Wishlist Button
    const wishlistBtn = document.querySelector('.wishlist-btn');
    wishlistBtn?.addEventListener('click', () => {
        wishlistBtn.classList.toggle('active');
        if (wishlistBtn.classList.contains('active')) {
            showNotification('تمت إضافة المنتج إلى قائمة الرغبات');
        } else {
            showNotification('تمت إزالة المنتج من قائمة الرغبات');
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
                    // Prevent default action to demonstrate animation
                    e.preventDefault();
                    
                    // Add click animation
                    this.classList.add('button-click');
                    
                    // Show notification
                    showNotification('تمت إضافة المنتج إلى السلة!');
                    
                    // Remove animation class after animation completes
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
                    // Prevent default action to demonstrate animation
                    e.preventDefault();
                    
                    // Add click animation
                    this.classList.add('button-click');
                    
                    // Show notification
                    showNotification('تمت إضافة المنتج إلى السلة!');
                    
                    // Remove animation class after animation completes
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
