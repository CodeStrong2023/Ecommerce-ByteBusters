const shopContent = document.getElementById("shopContent");
const cart = []; // Carrito. Array vacío

async function fetchProducts() {
    try {
        const response = await fetch('https://ecommerce-bytebusters-production.up.railway.app/clientes/products');
        const products = await response.json();

        displayProductsIndex(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
    }
}

function displayProductsIndex(products) {
    products.forEach(product => {
        const content = document.createElement("div");
        content.className = "card";
        const defaultImg = "https://ecommerce-bytebusters-production.up.railway.app/assets/ByteBustersIcon.png"; // Ruta de la imagen por defecto
        const productImg = product.img ? product.img : defaultImg;

        content.innerHTML = `
        <img src="${productImg}">
        <h3>${product.productName}</h3>
        <p class="price">${product.price}$</p>
        `;
        shopContent.append(content);

        const buyButton = document.createElement("button");
        buyButton.innerText = "Buy";

        content.append(buyButton);

        buyButton.addEventListener("click", () => {
            const repeat = cart.some((repeatProduct) => repeatProduct.id === product.id);

            if (repeat) {
                cart.map((prod) => {
                    if (prod.id === product.id) {
                        prod.quanty++;
                        displayCartCounterIndex();
                    }
                });
            } else {
                cart.push({
                    id: product.id,
                    productName: product.productName,
                    price: product.price,
                    quanty: product.quanty,
                    img: product.img,
                });
                displayCartCounterIndex();
            }
            console.log(cart);
        });
    });
}

function displayCartCounterIndex() {
    // Actualiza el contador del carrito aquí
    const cartCounter = document.getElementById("cart-counter");
    
    // Calcula la cantidad total de productos en el carrito
    const totalQuanty = cart.reduce((acc, product) => acc + product.quanty, 0);
    
    if (totalQuanty !== 0) {
        cartCounter.style.display = 'block';
    }
    // Actualiza el contador en el DOM
    cartCounter.innerText = totalQuanty;
}

fetchProducts();
