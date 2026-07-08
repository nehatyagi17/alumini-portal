import pool from '../config/db.js';

export class CSVUpload {
  constructor(uploadData) {
    this.upload_id = uploadData.upload_id;
    this.admin_id = uploadData.admin_id;
    this.filename = uploadData.filename;
    this.records_count = uploadData.records_count;
    this.uploaded_at = uploadData.uploaded_at;
  }

  static async create(uploadData) {
    const { admin_id, filename, records_count } = uploadData;
    
    const query = `
      INSERT INTO csv_uploads (admin_id, filename, records_count)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [admin_id, filename, records_count];
    const result = await pool.query(query, values);
    return new CSVUpload(result.rows[0]);
  }

  static async findById(upload_id) {
    const query = `
      SELECT cu.*, u.name as admin_name, u.email as admin_email
      FROM csv_uploads cu
      JOIN users u ON cu.admin_id = u.id
      WHERE cu.upload_id = $1
    `;
    const result = await pool.query(query, [upload_id]);
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT cu.*, u.name as admin_name, u.email as admin_email
      FROM csv_uploads cu
      JOIN users u ON cu.admin_id = u.id
      ORDER BY cu.uploaded_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const values = [limit, offset];
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getByAdminId(admin_id, limit = 50, offset = 0) {
    const query = `
      SELECT cu.*, u.name as admin_name, u.email as admin_email
      FROM csv_uploads cu
      JOIN users u ON cu.admin_id = u.id
      WHERE cu.admin_id = $1
      ORDER BY cu.uploaded_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const values = [admin_id, limit, offset];
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getRecentUploads(days = 30) {
    const query = `
      SELECT cu.*, u.name as admin_name, u.email as admin_email
      FROM csv_uploads cu
      JOIN users u ON cu.admin_id = u.id
      WHERE cu.uploaded_at > NOW() - INTERVAL '${days} days'
      ORDER BY cu.uploaded_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getUploadStatistics() {
    const queries = {
      totalUploads: 'SELECT COUNT(*) as count FROM csv_uploads',
      totalRecords: 'SELECT SUM(records_count) as count FROM csv_uploads',
      recentUploads: 'SELECT COUNT(*) as count FROM csv_uploads WHERE uploaded_at > NOW() - INTERVAL \'30 days\'',
      recentRecords: 'SELECT SUM(records_count) as count FROM csv_uploads WHERE uploaded_at > NOW() - INTERVAL \'30 days\''
    };

    const statistics = {};
    
    for (const [key, query] of Object.entries(queries)) {
      const result = await pool.query(query);
      statistics[key] = result.rows[0].count ? parseInt(result.rows[0].count) : 0;
    }

    // Get upload activity by month for the last 12 months
    const monthlyStatsQuery = `
      SELECT 
        DATE_TRUNC('month', uploaded_at) as month,
        COUNT(*) as uploads_count,
        SUM(records_count) as records_count
      FROM csv_uploads
      WHERE uploaded_at > NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', uploaded_at)
      ORDER BY month DESC
    `;

    const monthlyStats = await pool.query(monthlyStatsQuery);
    statistics.monthlyStats = monthlyStats.rows;

    return statistics;
  }

  static async delete(upload_id) {
    const query = 'DELETE FROM csv_uploads WHERE upload_id = $1';
    await pool.query(query, [upload_id]);
  }

  toJSON() {
    return {
      upload_id: this.upload_id,
      admin_id: this.admin_id,
      filename: this.filename,
      records_count: this.records_count,
      uploaded_at: this.uploaded_at
    };
  }
}
