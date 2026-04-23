import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env["MYSQL_HOST"] || "91.99.159.222",
  user: process.env["MYSQL_USER"] || "u30197_5NaUGTXiBa",
  password: process.env["MYSQL_PASSWORD"] || "7xo4nT4eFLBcs@3C+TkVQm.c",
  database: process.env["MYSQL_DATABASE"] || "s30197_aimbot",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let initialized = false;

export async function initDB(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, verified BOOLEAN DEFAULT true, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS subscriptions (email VARCHAR(255) PRIMARY KEY, active BOOLEAN DEFAULT false, planTitle VARCHAR(50), expiryDate DATETIME, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS orders (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL, planId VARCHAR(50), planTitle VARCHAR(50), price INT, senderNumber VARCHAR(20), trxId VARCHAR(50) UNIQUE, paymentMethod VARCHAR(20), status VARCHAR(20) DEFAULT 'pending', createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS price_history (id INT AUTO_INCREMENT PRIMARY KEY, price INT, recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS app_settings (\`key\` VARCHAR(64) PRIMARY KEY, value TEXT, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`,
    );
  } catch {
    // ignore init errors so server still serves health
  }
}
