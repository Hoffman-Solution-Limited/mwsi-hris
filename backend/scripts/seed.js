// backend/scripts/seed.js
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set!");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function runSQLFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
  console.log(`[seed] Applied ${filePath}`);
}

async function main() {
  try {
    // List your schema + seed files in order
    const files = [
      path.join('scripts', 'schema.sql'),
      path.join('scripts', 'seed.sql')
    ];

    for (const file of files) {
      await runSQLFile(file);
    }

    console.log("[seed] Database setup complete");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
