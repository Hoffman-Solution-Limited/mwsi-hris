async function tableExists(tableName) {
  const res = await pool.query(
    `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)`,
    [tableName]
  );
  return res.rows[0].exists;
}

async function main() {
  try {
    if (!(await tableExists('employees'))) { // pick a table guaranteed to exist after schema
      console.log("[seed] Running schema + seed...");
      const files = [
        path.join(__dirname, 'schema.sql'),
        path.join(__dirname, 'seed.sql')
      ];

      for (const file of files) {
        await runSQLFile(file);
      }
      console.log("[seed] Database setup complete");
    } else {
      console.log("[seed] Tables already exist, skipping seed.");
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
