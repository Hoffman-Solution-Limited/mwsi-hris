import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgres://devuser:devpass@db:5432/mwsi_hris_dev';
console.log("connectionString>>>>>",connectionString);

export const pool = new Pool({ connectionString });

export async function testConnection() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT 1');
    return res.rows;
  } finally {
    client.release();
  }
}
