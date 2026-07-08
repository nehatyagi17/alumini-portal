import pool from '../config/db.js';

export class Admin {
  constructor(adminData) {
    this.id = adminData.id;
  }

  static async create(adminData) {
    const { id } = adminData;
    
    const query = `
      INSERT INTO admins (id)
      VALUES ($1)
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return new Admin(result.rows[0]);
  }

  static async findById(id) {
    const query = `
      SELECT a.*, u.name, u.email 
      FROM admins a
      JOIN users u ON a.id = u.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT a.*, u.name, u.email, u.created_at
      FROM admins a
      JOIN users u ON a.id = u.id
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getStatistics() {
    const queries = {
      totalUsers: 'SELECT COUNT(*) as count FROM users',
      totalAlumni: 'SELECT COUNT(*) as count FROM alumni_profiles',
      totalStudents: 'SELECT COUNT(*) as count FROM students',
      totalAdmins: 'SELECT COUNT(*) as count FROM admins',
      claimedProfiles: "SELECT COUNT(*) as count FROM alumni_profiles WHERE profile_type = 'claimed'",
      verifiedProfiles: 'SELECT COUNT(*) as count FROM alumni_profiles WHERE is_verified = true',
      pendingVerifications: "SELECT COUNT(*) as count FROM alumni_profiles WHERE profile_type = 'claimed' AND is_verified = false",
      totalInteractions: 'SELECT COUNT(*) as count FROM interaction_requests',
      acceptedInteractions: "SELECT COUNT(*) as count FROM interaction_requests WHERE status = 'accepted'",
      totalMessages: 'SELECT COUNT(*) as count FROM messages',
      recentUploads: 'SELECT COUNT(*) as count FROM csv_uploads WHERE uploaded_at > NOW() - INTERVAL \'30 days\''
    };

    const statistics = {};
    
    for (const [key, query] of Object.entries(queries)) {
      const result = await pool.query(query);
      statistics[key] = parseInt(result.rows[0].count);
    }

    // Get recent activity
    const recentActivityQuery = `
      SELECT 
        'user_registration' as type,
        u.name,
        u.email,
        u.role,
        u.created_at as timestamp
      FROM users u
      WHERE u.created_at > NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'profile_claim' as type,
        u.name,
        u.email,
        'alumni' as role,
        ap.last_updated as timestamp
      FROM alumni_profiles ap
      JOIN users u ON ap.id = u.id
      WHERE ap.profile_type = 'claimed' AND ap.last_updated > NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'csv_upload' as type,
        u.name,
        cu.filename,
        'admin' as role,
        cu.uploaded_at as timestamp
      FROM csv_uploads cu
      JOIN users u ON cu.admin_id = u.id
      WHERE cu.uploaded_at > NOW() - INTERVAL '7 days'
      
      ORDER BY timestamp DESC
      LIMIT 20
    `;

    const recentActivity = await pool.query(recentActivityQuery);
    statistics.recentActivity = recentActivity.rows;

    return statistics;
  }

  toJSON() {
    return {
      id: this.id
    };
  }
}
