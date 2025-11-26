const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || process.env.PG_URL || 'postgres://devuser:devpass@db:5432/mwsi_hris_dev';
const pool = new Pool({ connectionString: DATABASE_URL });

async function tableExists(tableName) {
  const res = await pool.query(
    `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)`,
    [tableName]
  );
  return res.rows[0].exists;
}

async function runSQLFile(filePath) {
  console.log('[seed] running SQL file', filePath);
  const sql = await fs.readFile(filePath, 'utf8');
  // Execute whole file in one query - pg supports multiple statements in a single query
  await pool.query(sql);
}

async function main() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    const employeesExists = await tableExists('employees');
    if (!employeesExists) {
      console.log('[seed] employees table not found — running schema and seed');
      const files = [schemaPath, seedPath];
      for (const file of files) {
        await runSQLFile(file);
      }
      console.log('[seed] Database setup complete');
    } else {
      console.log('[seed] Tables already exist, skipping seed.');
    }
  } catch (err) {
    console.error('[seed] fatal error:', err);
    process.exitCode = 1;
    throw err;
  } finally {
    try { await pool.end(); } catch (e) {}
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('[seed] uncaught error', err);
    process.exit(1);
  });
}
