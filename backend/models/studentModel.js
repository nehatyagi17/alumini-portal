import pool from '../config/db.js';

export class Student {
  constructor(studentData) {
    this.id = studentData.id;
    this.course = studentData.course;
    this.department = studentData.department;
    this.year_of_study = studentData.year_of_study;
  }

  static async create(studentData) {
    const { id, course, department, year_of_study } = studentData;
    
    const query = `
      INSERT INTO students (id, course, department, year_of_study)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [id, course, department, year_of_study];
    const result = await pool.query(query, values);
    return new Student(result.rows[0]);
  }

  static async findById(id) {
    const query = `
      SELECT s.*, u.name, u.email 
      FROM students s
      JOIN users u ON s.id = u.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateProfile(id, updateData) {
    const { course, department, year_of_study } = updateData;
    
    const query = `
      UPDATE students 
      SET course = $1, department = $2, year_of_study = $3
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [course, department, year_of_study, id];
    const result = await pool.query(query, values);
    return result.rows[0] ? new Student(result.rows[0]) : null;
  }

  static async getAll() {
    const query = `
      SELECT s.*, u.name, u.email, u.created_at
      FROM students s
      JOIN users u ON s.id = u.id
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  toJSON() {
    return {
      id: this.id,
      course: this.course,
      department: this.department,
      year_of_study: this.year_of_study
    };
  }
}
