import pool from '../config/db.js';

export class InteractionRequest {
  constructor(interactionData) {
    this.id = interactionData.id;
    this.student_id = interactionData.student_id;
    this.alumni_id = interactionData.alumni_id;
    this.status = interactionData.status;
    this.created_at = interactionData.created_at;
  }

  static async create(interactionData) {
    const { student_id, alumni_id } = interactionData;
    
    const query = `
      INSERT INTO interaction_requests (student_id, alumni_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const values = [student_id, alumni_id];
    const result = await pool.query(query, values);
    return new InteractionRequest(result.rows[0]);
  }

  static async findById(id) {
    const query = `
      SELECT ir.*, 
             su.name as student_name, su.email as student_email,
             au.name as alumni_name, au.email as alumni_email
      FROM interaction_requests ir
      JOIN users su ON ir.student_id = su.id
      JOIN users au ON ir.alumni_id = au.id
      WHERE ir.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByStudentAndAlumni(student_id, alumni_id) {
    const query = `
      SELECT ir.*, 
             su.name as student_name, su.email as student_email,
             au.name as alumni_name, au.email as alumni_email
      FROM interaction_requests ir
      JOIN users su ON ir.student_id = su.id
      JOIN users au ON ir.alumni_id = au.id
      WHERE ir.student_id = $1 AND ir.alumni_id = $2
    `;
    const result = await pool.query(query, [student_id, alumni_id]);
    return result.rows[0];
  }

  static async getByStudentId(student_id) {
    const query = `
      SELECT ir.*, 
             su.name as student_name, su.email as student_email,
             au.name as alumni_name, au.email as alumni_email,
             ap.company, ap.position, ap.domain
      FROM interaction_requests ir
      JOIN users su ON ir.student_id = su.id
      JOIN users au ON ir.alumni_id = au.id
      JOIN alumni_profiles ap ON au.id = ap.id
      WHERE ir.student_id = $1
      ORDER BY ir.created_at DESC
    `;
    const result = await pool.query(query, [student_id]);
    return result.rows;
  }

  static async getByAlumniId(alumni_id) {
    const query = `
      SELECT ir.*, 
             su.name as student_name, su.email as student_email,
             au.name as alumni_name, au.email as alumni_email,
             s.course as student_course, s.year_of_study
      FROM interaction_requests ir
      JOIN users su ON ir.student_id = su.id
      JOIN users au ON ir.alumni_id = au.id
      JOIN students s ON su.id = s.id
      WHERE ir.alumni_id = $1
      ORDER BY ir.created_at DESC
    `;
    const result = await pool.query(query, [alumni_id]);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE interaction_requests 
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0] ? new InteractionRequest(result.rows[0]) : null;
  }

  static async getAcceptedConnections(user_id, user_role) {
    let query;
    
    if (user_role === 'student') {
      query = `
        SELECT ir.*, 
               au.name as alumni_name, au.email as alumni_email,
               ap.company, ap.position, ap.domain, ap.bio
        FROM interaction_requests ir
        JOIN users au ON ir.alumni_id = au.id
        JOIN alumni_profiles ap ON au.id = ap.id
        WHERE ir.student_id = $1 AND ir.status = 'accepted'
        ORDER BY ir.created_at DESC
      `;
    } else if (user_role === 'alumni') {
      query = `
        SELECT ir.*, 
               su.name as student_name, su.email as student_email,
               s.course as student_course, s.year_of_study
        FROM interaction_requests ir
        JOIN users su ON ir.student_id = su.id
        JOIN students s ON su.id = s.id
        WHERE ir.alumni_id = $1 AND ir.status = 'accepted'
        ORDER BY ir.created_at DESC
      `;
    }

    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async checkExistingConnection(user1_id, user2_id) {
    const query = `
      SELECT * FROM interaction_requests 
      WHERE (student_id = $1 AND alumni_id = $2)
         OR (student_id = $2 AND alumni_id = $1)
    `;
    const result = await pool.query(query, [user1_id, user2_id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM interaction_requests WHERE id = $1';
    await pool.query(query, [id]);
  }

  toJSON() {
    return {
      id: this.id,
      student_id: this.student_id,
      alumni_id: this.alumni_id,
      status: this.status,
      created_at: this.created_at
    };
  }
}
