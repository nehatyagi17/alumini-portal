import bcrypt from 'bcryptjs';
import pool from './config/db.js';

async function run() {
  try {
    const hash = await bcrypt.hash('alumni123', 10);
    const email = 'john.doe@example.com';
    
    // Update password
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);
    
    // Set as claimed and verified
    await pool.query('UPDATE alumni_profiles SET profile_type = $1, is_verified = $2 WHERE id = (SELECT id FROM users WHERE email = $3)', ['claimed', true, email]);
    
    console.log('Alumni account ready!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

run();
