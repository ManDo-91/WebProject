document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '../auth/admin-login.html';
        return;
    }

    const apiUrl = 'http://localhost:5000/api/products';
    const productsTable = document.getElementById('productsTableContainer');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const categorySelect = document.getElementById('productCategory');
    const imagesPreviewContainer = document.getElementById('imagesPreviewContainer');

    let editingProductId = null;

    function showError(message) {
        alert(message);
    }

    function showSuccess(message) {
        alert(message);
    }

    // Function to load categories into the dropdown
    async function loadCategories() {
        try {
            const response = await fetch('http://localhost:5000/api/categories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const categories = await response.json();
            categorySelect.innerHTML = '<option value="">Select a category</option>';
            categories.forEach(category => {
                categorySelect.innerHTML += `<option value="${category._id}">${category.name}</option>`;
            });
        } catch (error) {
            console.error('Error loading categories:', error);
            showError('Failed to load categories. Please try again.');
        }
    }

    // Function to fetch and display products
    async function fetchProducts() {
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const products = await response.json();
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            products.forEach(product => {
                html += `
                    <tr>
                        <td>${product.name}</td>
                        <td>${product.description || ''}</td>
                        <td>$${product.price ? product.price.toFixed(2) : '0.00'}</td>
                        <td>${product.category?.name || product.category || ''}</td>
                        <td>${product.mainImage ? `<img src="${product.mainImage}" alt="" class="product-image-thumbnail">` : ''}</td>
                        <td class="action-buttons">
                            <button class="action-button edit-button" data-id="${product._id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="action-button delete-button" data-id="${product._id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
            productsTable.innerHTML = html;
            attachActionButtons();
        } catch (error) {
            console.error('Error fetching products:', error);
            showError('Failed to load products. Please try again.');
        }
    }

    // Attach event listeners to edit and delete buttons
    function attachActionButtons() {
        document.querySelectorAll('.edit-button').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                try {
                    const response = await fetch(`${apiUrl}/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch product details');
                    }

                    const product = await response.json();
                    editingProductId = id;
                    modalTitle.textContent = 'Edit Product';
                    productModal.style.display = 'flex';
                    
                    document.getElementById('productId').value = product._id;
                    document.getElementById('productName').value = product.name;
                    document.getElementById('productDescription').value = product.description || '';
                    document.getElementById('productPrice').value = product.price;
                    document.getElementById('productCategory').value = product.category?._id || product.category || '';
                    
                    // Clear previous image inputs for edit
                    document.getElementById('productImages').value = '';

                    // Display existing images
                    imagesPreviewContainer.innerHTML = ''; // Clear previous previews
                    if (product.images && product.images.length > 0) {
                        product.images.forEach(imageUrl => {
                            const img = document.createElement('img');
                            img.src = imageUrl;
                            img.classList.add('product-image-preview-thumbnail');
                            imagesPreviewContainer.appendChild(img);
                        });
                    }
                } catch (error) {
                    console.error('Error fetching product details:', error);
                    showError('Failed to load product details. Please try again.');
                }
            });
        });

        document.querySelectorAll('.delete-button').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this product?')) {
                    try {
                        const response = await fetch(`${apiUrl}/${id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        if (!response.ok) {
                            throw new Error('Failed to delete product');
                        }

                        showSuccess('Product deleted successfully');
                        fetchProducts();
                    } catch (error) {
                        console.error('Error deleting product:', error);
                        showError('Failed to delete product. Please try again.');
                    }
                }
            });
        });
    }

    // Event listeners for modal
    addProductBtn.addEventListener('click', function() {
        editingProductId = null;
        modalTitle.textContent = 'Add Product';
        productModal.style.display = 'flex'; // Use flex to center modal
        productForm.reset();
        imagesPreviewContainer.innerHTML = ''; // Clear image previews
    });

    closeModalBtn.addEventListener('click', function() {
        productModal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', function() {
        productModal.style.display = 'none';
    });

    // Form submission handler
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            console.log('Starting product submission...');
            
            const formData = new FormData();
            const productName = document.getElementById('productName').value;
            const productDescription = document.getElementById('productDescription').value;
            const productPrice = document.getElementById('productPrice').value;
            const productCategory = document.getElementById('productCategory').value;
            
            const imageFiles = document.getElementById('productImages').files;

            // Validate required fields
            if (!productName || !productDescription || !productPrice || !productCategory) {
                showError('Please fill in all required fields');
                return;
            }

            // Only require images on new product creation
            if (!editingProductId && imageFiles.length === 0) {
                showError('Please upload at least one image for the new product');
                return;
            }

            // Validate file types
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                if (!file.type.startsWith('image/')) {
                    showError(`File "${file.name}" is not an image. Please upload only image files.`);
                    return;
                }
                if (file.size > 5 * 1024 * 1024) { // 5MB
                    showError(`File "${file.name}" is too large. Maximum file size is 5MB.`);
                    return;
                }
            }

            // Add required fields
            formData.append('name', productName.trim());
            formData.append('description', productDescription.trim());
            formData.append('price', parseFloat(productPrice));
            formData.append('category', productCategory);
            
            // Handle image uploads
            if (imageFiles.length > 0) {
                // Set the first image as mainImage
                formData.append('mainImage', imageFiles[0]);
                
                // Add all images to the images array
                for (let i = 0; i < imageFiles.length; i++) {
                    formData.append('images', imageFiles[i]);
                }
            }

            let url = apiUrl;
            let method = 'POST';

            if (editingProductId) {
                url = `${apiUrl}/${editingProductId}`;
                method = 'PUT';
            }

            console.log(`Submitting product with method: ${method} to URL: ${url}`);
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save product');
            }

            const result = await response.json();
            console.log('Product saved successfully:', result);

            showSuccess(`Product ${editingProductId ? 'updated' : 'added'} successfully!`);
            productModal.style.display = 'none';
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            showError(`Error: ${error.message}`);
        }
    });

    // Function to get the full image URL
    function getImageUrl(path) {
        if (!path) return '../../assets/images/placeholder.jpg';
        if (path.startsWith('http')) return path;
        return `http://localhost:5000${path}`;
    }

    // Function to display products in the table
    function displayProducts(products) {
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = '';

        products.forEach(product => {
            const imageUrl = getImageUrl(product.mainImage || (product.images && product.images[0]));
            console.log('Product image URL:', imageUrl);
            
            // Calculate average rating
            const avgRating = product.ratings && product.ratings.length > 0
                ? (product.ratings.reduce((sum, rating) => sum + (rating.rate || 0), 0) / product.ratings.length).toFixed(1)
                : '0.0';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="product-info">
                        <img src="${imageUrl}" 
                             alt="${product.name}" 
                             class="product-thumbnail"
                             onerror="this.src='../../assets/images/placeholder.jpg'">
                        <span>${product.name}</span>
                    </div>
                </td>
                <td>${product.category?.name || 'Uncategorized'}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${avgRating} ⭐</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-button" data-id="${product._id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-button" data-id="${product._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Image preview handler
    document.getElementById('productImages').addEventListener('change', function(e) {
        const previewContainer = document.getElementById('imagesPreviewContainer');
        previewContainer.innerHTML = ''; // Clear previous previews

        if (this.files) {
            Array.from(this.files).forEach(file => {
                console.log('Processing preview for file:', file.name);
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('product-image-preview-thumbnail');
                    previewContainer.appendChild(img);
                }
                reader.onerror = function(error) {
                    console.error('Error reading file:', error);
                }
                reader.readAsDataURL(file);
            });
        }
    });

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '../auth/admin-login.html';
    });

    // Initial load
    loadCategories();
    fetchProducts();
}); 
