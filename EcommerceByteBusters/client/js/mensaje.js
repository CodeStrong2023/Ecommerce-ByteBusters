document.getElementById('contactForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar el envío del formulario de forma tradicional

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries()); // Convertir a objeto

    try {
        const response = await fetch('https://ecommerce-bytebusters-production.up.railway.app/clientes/mensaje', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message); // Mensaje de éxito
        } else {
            const error = await response.json();
            alert(error.error); // Mensaje de error
        }
    } catch (error) {
        console.error("Error al registrar:", error);
        alert("Ocurrió un error al registrar su mensaje.");
    }
});