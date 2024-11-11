document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Obtener los productos desde el backend
        const response = await fetch('https://ecommerce-bytebusters-production.up.railway.app/clientes/products');
        if (response.ok) {
            const products = await response.json();
            const tableBody = document.querySelector('#productosTable tbody');
            const defaultImg = '/uploads/ByteBustersIcon.png'; // Ruta de la imagen por defecto

            // Agregar los productos a la tabla
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.productName}</td>
                    <td>${product.price}</td>
                    <td>${product.quanty}</td>
                    <td><img src="${product.img ? product.img : defaultImg}" alt="${product.productName}" width="50" height="50" onerror="this.onerror=null;this.src='${defaultImg}';"></td>
                `;
                tableBody.appendChild(row);
            });

            // Agregar funcionalidad a los botones "Agregar al carrito"
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', (event) => {
                    const productId = event.target.getAttribute('data-id');
                    addToCart(productId);
                });
            });

            // Actualizar el contador de productos en el carrito
            updateCartCounter();
        } else {
            alert('Error al obtener los productos');
        }
    } catch (error) {
        console.error('Error al cargar los productos', error);
    }
});

// Función para agregar productos al carrito
const addToCart = (productId) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    fetch(`https://ecommerce-bytebusters-production.up.railway.app/clientes/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            const existingProduct = cart.find(item => item.id === productId);
            if (existingProduct) {
                existingProduct.quanty += 1;
            } else {
                cart.push({ ...product, quanty: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            alert('Producto agregado al carrito');
            updateCartCounter();
        })
        .catch(error => {
            console.error('Error al agregar producto al carrito', error);
        });
};

// Función para actualizar el contador del carrito
const updateCartCounter = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cart-counter').textContent = cart.reduce((total, item) => total + item.quanty, 0);
};

const displayCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = '';  // Limpiar contenido previo del modal

    cart.forEach(item => {
        const productDiv = document.createElement('div');
        productDiv.className = 'cart-item';
        productDiv.innerHTML = `
            <p><strong>${item.productName}</strong> - ${item.quanty} x $${item.price}</p>
        `;
        modalBody.appendChild(productDiv);
    });

    // Mostrar el modal
    document.getElementById('modal-container').style.display = 'flex';  // Asegúrate de que esto esté en el lugar correcto
};

// Cerrar el modal
document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('modal-container').style.display = 'none';
});
