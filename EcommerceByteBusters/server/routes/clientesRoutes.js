import express from "express";
import pool from "../db/dbConnections.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config.js";
import multer from 'multer';
import path from 'path';

const JWT_SECRET = config.jwtSecret;
const router = express.Router();

// Configuración para la carga de imágenes usando multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directorio para guardar las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para las imágenes
    }
});

const upload = multer({ storage });  // Middleware de carga de archivos

// Ruta para registrar un cliente
router.post("/register", async (req, res) => {
    const { usuario, password, telefono, email } = req.body;
    try {
        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `INSERT INTO clientes (usuario, password, telefono, email) VALUES (?, ?, ?, ?)`;
        await pool.execute(query, [usuario, hashedPassword, telefono, email]);
        res.status(201).json({ message: "Cliente registrado con éxito" });
    } catch (error) {
        console.error("Error al registrar cliente:", error);
        res.status(500).json({ error: "Error al registrar cliente" });
    }
});

// Ruta para iniciar sesión
router.post("/login", async (req, res) => {
    const { usuario, password } = req.body;
    try {
        const [rows] = await pool.execute(`SELECT * FROM clientes WHERE usuario = ?`, [usuario]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const token = jwt.sign({ id: user.id, usuario: user.usuario, rol: user.rol }, JWT_SECRET, { expiresIn: "1h" });

        // Redirigir según el rol del usuario
        if (user.rol === 'vendedor') {
            res.json({ token, clienteId: user.id, redirectUrl: '/add' });
        } else {
            res.json({ token, clienteId: user.id, redirectUrl: '/' });
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});



// Ruta para registrar los mensajes del formulario de contacto
router.post('/mensaje', async (req, res) => {
    const { nombre, correo, mensaje } = req.body;
    if (!nombre || !correo || !mensaje) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        const query = 'INSERT INTO mensajes (nombre, correo, mensaje) VALUES (?, ?, ?)';
        await pool.execute(query, [nombre, correo, mensaje]);
        res.status(200).json({ message: 'Mensaje guardado correctamente.' });
    } catch (error) {
        console.error('Error al guardar el mensaje:', error);
        res.status(500).json({ message: 'Error al guardar el mensaje.' });
    }
});

// Ruta para obtener todos los clientes
router.get("/delete", async (req, res) => {
    try {
        const [rows] = await pool.execute(`SELECT * FROM clientes`);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ error: "Error al obtener clientes" });
    }
});

// Ruta para obtener un cliente por ID
router.get("/mostrar/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute(`SELECT * FROM clientes WHERE id = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        } else {
            return res.json(rows[0]);
        }
    } catch (error) {
        console.error("Error al obtener cliente:", error);
        return res.status(500).json({ error: "Error al obtener cliente" });
    }
});

// Ruta para actualizar un cliente
router.put("/modificar/:id", async (req, res) => {
    const { id } = req.params;
    const { usuario, password, telefono, email } = req.body;

    try {
        let query;
        let values;

        if (password) {
            // Si hay un password nuevo, lo encriptamos y lo incluimos en la consulta
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            query = `UPDATE clientes SET usuario = ?, password = ?, telefono = ?, email = ? WHERE id = ?`;
            values = [usuario, hashedPassword, telefono, email, id];
        } else {
            // Si no se envía password, actualizamos solo los otros campos
            query = `UPDATE clientes SET usuario = ?, telefono = ?, email = ? WHERE id = ?`;
            values = [usuario, telefono, email, id];
        }

        const [result] = await pool.execute(query, values);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: "Cliente no encontrado" });
        } else {
            res.json({ message: "Cliente actualizado con éxito" });
        }
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        res.status(500).json({ error: "Error al actualizar cliente" });
    }
});


// Ruta para eliminar un cliente
router.delete("/deleteUser/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.execute(`DELETE FROM clientes WHERE id = ?`, [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: "Cliente no encontrado" });
        } else {
            res.json({ message: "Cliente eliminado con éxito" });
        }
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        res.status(500).json({ error: "Error al eliminar cliente" });
    }
});

//--------------------------Rutas de productos


// Crear un producto
router.post('/add', upload.single('img'), async (req, res) => {
    const { productName, price, quanty } = req.body;
    const defaultImgPath = '/assets/default.jpg'; // Ruta de la imagen por defecto
    const imgPath = req.file ? `/uploads/${req.file.filename}` : '/uploads/ByteBustersIcon.png'; // Guardar la ruta de la imagen o usar la imagen por defecto

    try {
        const [result] = await pool.query(
            "INSERT INTO productos (productName, price, quanty, img) VALUES (?, ?, ?, ?)",
            [productName, price, quanty, imgPath]
        );
        res.status(201).json({ id: result.insertId, productName, price, quanty, img: imgPath });
    } catch (err) {
        console.error("Error al crear el producto:", err);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});


// Obtener todos los productos
router.get('/products', async (req, res) => {

    try {
        const [products] = await pool.query("SELECT * FROM productos");
        const productsWithImageURL = products.map(product => ({
            ...product,
            img: `http://localhost:8080${product.img}`  // Asegúrate de que esta sea la ruta correcta
        }));
        res.status(200).json(productsWithImageURL);
    } catch (err) {
        console.error("Error al obtener los productos:", err);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Ruta para obtener un producto por ID (GET)
router.get('/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.execute('SELECT * FROM productos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// Actualizar un producto
router.put('/products/update/:id', upload.single('img'), async (req, res) => {
    const { id } = req.params;
    const { productName, price, quanty } = req.body;

    let imgPath = null;// Inicializamos imgPath con el valor de la imagen que viene en la base de datos (por defecto se mantiene la actual)

    // Si la imagen no se carga, mantiene la imagen anterior
    if (req.file) {
        imgPath = `/uploads/${req.file.filename}`;
    }

    // Aseguramos que los valores de productName, price y quanty no sean undefined
    // Si no se proporcionan, dejamos el valor actual del producto en la base de datos
    const updates = [];
    const values = [];

    // Verificar si productName fue proporcionado
    if (productName) {
        updates.push('productName = ?');
        values.push(productName);
    }

    // Verificar si price fue proporcionado
    if (price) {
        updates.push('price = ?');
        values.push(price);
    }

    // Verificar si quanty fue proporcionado
    if (quanty) {
        updates.push('quanty = ?');
        values.push(quanty);
    }

    // Verificar si imgPath fue proporcionado (es decir, si se subió una nueva imagen o se pasó una nueva URL)
    if (imgPath !== null) {
        updates.push('img = ?');
        values.push(imgPath);
    }

    // Agregar el ID al final de los valores para la cláusula WHERE
    values.push(id);

    // Si no se proporcionaron datos para actualizar, respondemos con un error
    if (updates.length === 0) {
        return res.status(400).json({ error: "No se proporcionaron datos para actualizar." });
    }

    // Crear la consulta SQL para actualizar los campos que se proporcionaron
    const query = `
        UPDATE productos 
        SET ${updates.join(', ')}
        WHERE id = ?
    `;

    try {
        // Ejecutamos la consulta de actualización
        const [result] = await pool.execute(query, values);

        // Si no se encontraron filas afectadas, devolvemos un error 404
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Responder con éxito si se realizó la actualización
        res.status(200).json({ message: "Producto actualizado con éxito" });
    } catch (err) {
        console.error("Error al actualizar el producto:", err);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});


// Eliminar un producto
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM productos WHERE id = ?", [id]);
        res.status(200).json({ message: 'Producto eliminado con éxito' });
    } catch (err) {
        console.error("Error al eliminar el producto:", err);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

export default router;
