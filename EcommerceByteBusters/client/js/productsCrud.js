document.getElementById('addProductForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('productName', document.getElementById('productName').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('quanty', document.getElementById('quanty').value);
    formData.append('img', document.getElementById('img').files[0]); // Cargar la imagen

    try {
        const response = await fetch('https://ecommerce-bytebusters-production.up.railway.app/clientes/add', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Producto agregado con éxito');
        } else {
            alert('Error al agregar el producto');
        }
    } catch (error) {
        console.error('Error de conexión', error);
    }
});

// para html addProduct - vendedor