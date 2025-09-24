const mysql = require('mysql2/promise');

// Parse DATABASE_URL if provided (for Render deployment)
function parseConnectionString(connectionString) {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    port: parseInt(url.port) || 3306,
    ssl: { rejectUnauthorized: false }
  };
}

const config = process.env.DATABASE_URL
  ? parseConnectionString(process.env.DATABASE_URL)
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'care_worker_training',
      port: process.env.DB_PORT || 3306,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

let pool;

async function createConnection() {
  try {
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('Database connection pool created successfully');
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

async function getConnection() {
  if (!pool) {
    await createConnection();
  }
  return pool;
}

module.exports = {
  createConnection,
  getConnection
};