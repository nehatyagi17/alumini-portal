import pool from '../config/db.js';

export class AlumniProfile {
  constructor(profileData) {
    this.id = profileData.id;
    this.course = profileData.course;
    this.department = profileData.department;
    this.batch = profileData.batch;
    this.company = profileData.company;
    this.position = profileData.position;
    this.domain = profileData.domain;
    this.experience = profileData.experience;
    this.location = profileData.location;
    this.bio = profileData.bio;
    this.profile_type = profileData.profile_type;
    this.is_verified = profileData.is_verified;
    this.last_updated = profileData.last_updated;
  }

  static async create(profileData) {
    const {
      id,
      course,
      department,
      batch,
      company,
      position,
      domain,
      experience,
      location,
      bio,
      profile_type = 'static',
      is_verified = false
    } = profileData;

    const query = `
      INSERT INTO alumni_profiles (
        id, course, department, batch, company, position, 
        domain, experience, location, bio, profile_type, 
        is_verified, last_updated
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *
    `;
    
    const values = [
      id, course, department, batch, company, position,
      domain, experience, location, bio, profile_type, is_verified
    ];
    
    const result = await pool.query(query, values);
    return new AlumniProfile(result.rows[0]);
  }

  static async findById(id) {
    const query = `
      SELECT ap.*, u.name, u.email 
      FROM alumni_profiles ap
      JOIN users u ON ap.id = u.id
      WHERE ap.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT ap.*, u.name, u.email 
      FROM alumni_profiles ap
      JOIN users u ON ap.id = u.id
      WHERE u.email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async updateProfile(id, updateData) {
    const {
      course,
      department,
      batch,
      company,
      position,
      domain,
      experience,
      location,
      bio
    } = updateData;

    const query = `
      UPDATE alumni_profiles 
      SET course = $1, department = $2, batch = $3, company = $4,
          position = $5, domain = $6, experience = $7, location = $8,
          bio = $9, last_updated = NOW()
      WHERE id = $10
      RETURNING *
    `;
    
    const values = [
      course, department, batch, company, position,
      domain, experience, location, bio, id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0] ? new AlumniProfile(result.rows[0]) : null;
  }

  static async claimProfile(id) {
    const query = `
      UPDATE alumni_profiles 
      SET profile_type = 'claimed', is_verified = false
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] ? new AlumniProfile(result.rows[0]) : null;
  }

  static async verifyProfile(id) {
    const query = `
      UPDATE alumni_profiles 
      SET is_verified = true, last_updated = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] ? new AlumniProfile(result.rows[0]) : null;
  }

  static async rejectProfile(id) {
    const query = `
      UPDATE alumni_profiles 
      SET profile_type = 'static', is_verified = false
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] ? new AlumniProfile(result.rows[0]) : null;
  }

  static async getDirectory(filters = {}) {
    let query = `
      SELECT ad.*, u.name, u.email
      FROM alumni_directory ad
      JOIN users u ON ad.id = u.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 0;

    if (filters.batch) {
      query += ` AND ad.batch = $${++paramCount}`;
      values.push(filters.batch);
    }

    if (filters.company) {
      query += ` AND ad.company ILIKE $${++paramCount}`;
      values.push(`%${filters.company}%`);
    }

    if (filters.domain) {
      query += ` AND ad.domain ILIKE $${++paramCount}`;
      values.push(`%${filters.domain}%`);
    }

    if (filters.course) {
      query += ` AND ad.course ILIKE $${++paramCount}`;
      values.push(`%${filters.course}%`);
    }

    if (filters.experience_min) {
      query += ` AND ad.experience >= $${++paramCount}`;
      values.push(filters.experience_min);
    }

    if (filters.experience_max) {
      query += ` AND ad.experience <= $${++paramCount}`;
      values.push(filters.experience_max);
    }

    if (filters.search) {
      query += ` AND (u.name ILIKE $${++paramCount} OR ad.company ILIKE $${paramCount} OR ad.domain ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    query += ` ORDER BY ad.last_updated DESC`;
    
    if (filters.limit) {
      query += ` LIMIT $${++paramCount}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${++paramCount}`;
      values.push(filters.offset);
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getPendingVerifications() {
    const query = `
      SELECT ap.*, u.name, u.email 
      FROM alumni_profiles ap
      JOIN users u ON ap.id = u.id
      WHERE ap.profile_type = 'claimed' AND ap.is_verified = false
      ORDER BY ap.last_updated ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getStaleProfiles(daysOld = 365) {
    const query = `
      SELECT ap.*, u.name, u.email 
      FROM alumni_profiles ap
      JOIN users u ON ap.id = u.id
      WHERE ap.last_updated < NOW() - INTERVAL '${daysOld} days'
      ORDER BY ap.last_updated ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  toJSON() {
    return {
      id: this.id,
      course: this.course,
      department: this.department,
      batch: this.batch,
      company: this.company,
      position: this.position,
      domain: this.domain,
      experience: this.experience,
      location: this.location,
      bio: this.bio,
      profile_type: this.profile_type,
      is_verified: this.is_verified,
      last_updated: this.last_updated
    };
  }
}
