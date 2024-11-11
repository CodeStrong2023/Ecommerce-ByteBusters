document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar el envío del formulario de forma tradicional

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries()); // Convertir a objeto

    try {
        const response = await fetch('https://ecommerce-bytebusters-production.up.railway.app/clientes/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem("token", result.token); // Guardar el token en localStorage
            localStorage.setItem("clienteId", result.clienteId); // Guardar el clienteId en localStorage
            alert("Inicio de sesión exitoso"); // Mensaje de éxito

            // Redirigir al URL proporcionado en la respuesta
            window.location.href = result.redirectUrl;
        } else {
            const error = await response.json();
            alert(error.error); // Mensaje de error
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Ocurrió un error al iniciar sesión.");
    }
});
