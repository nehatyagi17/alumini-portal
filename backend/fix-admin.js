import bcrypt from 'bcryptjs';
import pool from './config/db.js';

async function run() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    const result = await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'admin@alumni-portal.com']);
    console.log('Admin password updated successfully! Rows affected:', result.rowCount);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

run();
