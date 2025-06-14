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

    let editingProductId = null;

    function fetchProducts() {
        fetch(apiUrl)
            .then(res => res.json())
            .then(products => {
                let html = `<table><thead><tr><th>Name</th><th>Description</th><th>Price</th><th>Image</th><th>Actions</th></tr></thead><tbody>`;
                products.forEach(product => {
                    html += `<tr>
                        <td>${product.name}</td>
                        <td>${product.description || ''}</td>
                        <td>$${product.price.toFixed(2)}</td>
                        <td>${product.image ? `<img src="${product.image}" alt="" style="width:50px;">` : ''}</td>
                        <td class="action-buttons">
                            <button class="action-button edit-button" data-id="${product._id}"><i class="fas fa-edit"></i> Edit</button>
                            <button class="action-button delete-button" data-id="${product._id}"><i class="fas fa-trash"></i> Delete</button>
                        </td>
                    </tr>`;
                });
                html += `</tbody></table>`;
                productsTable.innerHTML = html;
                attachActionButtons();
            });
    }

    function attachActionButtons() {
        document.querySelectorAll('.edit-button').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                fetch(`${apiUrl}`)
                    .then(res => res.json())
                    .then(products => {
                        const product = products.find(p => p._id === id);
                        if (product) {
                            editingProductId = id;
                            modalTitle.textContent = 'Edit Product';
                            productModal.style.display = 'block';
                            document.getElementById('productId').value = product._id;
                            document.getElementById('productName').value = product.name;
                            document.getElementById('productDescription').value = product.description || '';
                            document.getElementById('productPrice').value = product.price;
                            document.getElementById('productImage').value = product.image || '';
                        }
                    });
            });
        });
        document.querySelectorAll('.delete-button').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this product?')) {
                    fetch(`${apiUrl}/${id}`, {
                        method: 'DELETE',
                        headers: { 'x-user-email': currentUser.email }
                    })
                    .then(() => fetchProducts());
                }
            });
        });
    }

    addProductBtn.addEventListener('click', function() {
        editingProductId = null;
        modalTitle.textContent = 'Add Product';
        productModal.style.display = 'block';
        productForm.reset();
    });

    closeModalBtn.addEventListener('click', function() {
        productModal.style.display = 'none';
    });
    cancelBtn.addEventListener('click', function() {
        productModal.style.display = 'none';
    });

    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const image = document.getElementById('productImage').value;
        const method = editingProductId ? 'PUT' : 'POST';
        const url = editingProductId ? `${apiUrl}/${editingProductId}` : apiUrl;
        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': currentUser.email
            },
            body: JSON.stringify({ name, description, price, image })
        })
        .then(() => {
            productModal.style.display = 'none';
            fetchProducts();
        });
    });

    // Close modal on outside click
    window.onclick = function(event) {
        if (event.target === productModal) {
            productModal.style.display = 'none';
        }
    };

    fetchProducts();
}); 