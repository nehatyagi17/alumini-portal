import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export class User {
  constructor(userData) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password_hash = userData.password_hash;
    this.role = userData.role;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  static async create(userData) {
    const { name, email, password, role } = userData;
    const password_hash = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `;
    
    const values = [name, email, password_hash, role];
    const result = await pool.query(query, values);
    return new User(result.rows[0]);
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async updatePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 12);
    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, role, updated_at
    `;
    const result = await pool.query(query, [password_hash, id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async updateProfile(id, updateData) {
    const { name } = updateData;
    const query = `
      UPDATE users 
      SET name = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, role, updated_at
    `;
    const result = await pool.query(query, [name, id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [id]);
  }

  async validatePassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}
