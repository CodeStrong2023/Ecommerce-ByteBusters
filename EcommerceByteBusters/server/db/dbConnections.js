import mysql from "mysql2/promise";
import config from "../../config.js";

const pool = mysql.createPool({
  host: config.db.host || 'localhost',
  user: config.db.user || 'root',
  password: config.db.password || 'admin',
  database: config.db.database || 'constructora',
  connectTimeout: 60000,
});


export default pool;

