// client/listProducts.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Solicitar los productos al backend
        const response = await fetch('https://ecommerce-bytebusters-production.up.railway.app/clientes/products');
        if (response.ok) {
            const products = await response.json();
            const tableBody = document.querySelector('#productosTable tbody');

            // Agregar los productos a la tabla
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.productName}</td>
                    <td>${product.price}</td>
                    <td>${product.quanty}</td>
                    <td><img src="${product.img}" alt="${product.productName}" width="50" height="50"></td>
                    <td>
                        <button onclick="deleteProduct(${product.id})">Eliminar</button>
                        <button onclick="editProduct(${product.id})">Editar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            alert('Error al obtener los productos');
        }
    } catch (error) {
        console.error('Error al cargar los productos', error);
    }
});

// Función para editar un producto
function editProduct(id, productName, price, quanty, img) {
    // Solicitar los datos del producto desde el servidor
    fetch(`https://ecommerce-bytebusters-production.up.railway.app/clientes/products/${id}`)
        .then(response => response.json())
        .then(product => {
            // Mostrar el formulario de edición
            const editForm = document.getElementById('editProductoForm');
            editForm.style.display = 'block';

            // Rellenar los campos del formulario con los datos del producto
            document.getElementById('editProductId').value = product.id;           // Establecer el ID del producto
            document.getElementById('editProductName').value = product.productName; // Establecer el nombre del producto
            document.getElementById('editProductPrice').value = product.price;     // Establecer el precio del producto
            document.getElementById('editProductQuanty').value = product.quanty;   // Establecer la cantidad del producto

            // Mostrar la imagen actual en el formulario de edición
            const imgContainer = document.getElementById('imgContainer');
            const imgPreview = document.getElementById('imgPreview');
            if (product.img) {
                imgContainer.style.display = 'block';  // Mostrar el contenedor de la imagen
                imgPreview.src = product.img;         // Establecer la URL de la imagen
            } else {
                imgContainer.style.display = 'none';  // Ocultar si no hay imagen
            }
        })
        .catch(error => console.error('Error al obtener el producto:', error));

    // Manejar el envío del formulario de edición
    const form = document.getElementById('editForm');
    form.onsubmit = async function (event) {
        event.preventDefault();

        // Obtener los datos del formulario
        const formData = new FormData();
        formData.append('productName', document.getElementById('editProductName').value);
        formData.append('price', document.getElementById('editProductPrice').value);
        formData.append('quanty', document.getElementById('editProductQuanty').value);

        const fileInput = document.getElementById('editProductImg');
        if (fileInput.files.length > 0) {
            formData.append('img', fileInput.files[0]);  // Si se selecciona una nueva imagen
        } else {
            formData.append('img', img);  // Mantener la imagen actual si no se selecciona una nueva
        }

        try {
            const response = await fetch(`https://ecommerce-bytebusters-production.up.railway.app/clientes/products/update/${id}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                alert('Producto actualizado con éxito');
                location.reload();  // Recargar la página para reflejar los cambios
            } else {
                alert('Error al actualizar el producto');
            }
        } catch (error) {
            console.error('Error de conexión', error);
        }
    };
}

// Función para cancelar la edición
function cancelEdit() {
    const editForm = document.getElementById('editProductoForm');
    editForm.style.display = 'none';  // Ocultar el formulario de edición
}

// Función para eliminar un producto
async function deleteProduct(id) {
    try {
        const response = await fetch(`https://ecommerce-bytebusters-production.up.railway.app/clientes/delete/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Producto eliminado con éxito');
            location.reload();  // Recargar la página para actualizar la lista
        } else {
            alert('Error al eliminar el producto');
        }
    } catch (error) {
        console.error('Error de conexión', error);
    }
}

// para html showProducts - vendedor