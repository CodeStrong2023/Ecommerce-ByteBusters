document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar el envío del formulario de forma tradicional

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries()); // Convertir a objeto

    try {
        const response = await fetch('http://localhost:8080/clientes/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem("token", result.token); // Guardar el token en localStorage
            alert("Inicio de sesión exitoso"); // Mensaje de éxito
            // Aquí podrías redirigir al usuario a otra página, por ejemplo:
            window.location.href = '/'; // Ejemplo de redirección a otra página
        } else {
            const error = await response.json();
            alert(error.error); // Mensaje de error
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Ocurrió un error al iniciar sesión.");
    }
});
