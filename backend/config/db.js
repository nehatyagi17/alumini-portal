import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isSupabase = process.env.DB_URL && process.env.DB_URL.includes('supabase');
const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = process.env.DB_URL 
  ? { 
      connectionString: process.env.DB_URL,
      // Remote databases like Supabase usually require SSL
      ssl: isSupabase || isProduction ? { rejectUnauthorized: false } : false
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    };

const pool = new Pool(poolConfig);

export default pool;