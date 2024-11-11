import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de .env en process.env

const config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'constructora',
  },
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
  mercadoPagoToken: process.env.ACCESS_TOKEN || 'default_mercadopago_token',
  port: process.env.PORT || 8080, // Puerto por defecto si no está definido
};

export default config;


