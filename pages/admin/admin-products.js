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

    let editingProductId = null;

    // Load categories
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

    function showError(message) {
        alert(message);
    }

    function showSuccess(message) {
        alert(message);
    }

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
                        <td>$${product.price.toFixed(2)}</td>
                        <td>${product.category?.name || ''}</td>
                        <td>${product.images && product.images.length > 0 ? `<img src="${product.images[0]}" alt="" style="width:50px;">` : ''}</td>
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
                    productModal.style.display = 'block';
                    
                    document.getElementById('productId').value = product._id;
                    document.getElementById('productName').value = product.name;
                    document.getElementById('productDescription').value = product.description || '';
                    document.getElementById('productPrice').value = product.price;
                    document.getElementById('productCategory').value = product.category?._id || product.category || '';
                    
                    // Clear previous image inputs for edit
                    document.getElementById('productImages').value = '';

                    // Display existing images
                    const imagesPreviewContainer = document.getElementById('imagesPreviewContainer');
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

    addProductBtn.addEventListener('click', function() {
        editingProductId = null;
        modalTitle.textContent = 'Add Product';
        productModal.style.display = 'block';
        productForm.reset();
        document.getElementById('imagesPreviewContainer').innerHTML = ''; // Clear image previews
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

            showSuccess(`Product ${editingProductId ? 'updated' : 'added'} successfully!`);
            productModal.style.display = 'none';
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            showError(`Error: ${error.message}`);
        }
    });

    // Image preview handler
    document.getElementById('productImages').addEventListener('change', function(e) {
        const previewContainer = document.getElementById('imagesPreviewContainer');
        previewContainer.innerHTML = ''; // Clear previous previews

        if (this.files) {
            Array.from(this.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('product-image-preview-thumbnail');
                    previewContainer.appendChild(img);
                }
                reader.readAsDataURL(file);
            });
        }
    });

    // Initial load
    loadCategories();
    fetchProducts();
}); 