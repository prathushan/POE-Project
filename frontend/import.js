import fs from 'fs';
import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // XAMPP usually empty
  database: 'poe'
});

const data = JSON.parse(
  fs.readFileSync('./company_tickers_exchange.json', 'utf-8')
);

// IMPORTANT: check structure
const rows = data.data || data;

for (const row of rows) {
  const cik = String(row[0]).padStart(10, '0');
  const org_name = row[1];

  await db.execute(
    `INSERT IGNORE INTO cik_registry (cik, org_name)
     VALUES (?, ?)`,
    [cik, org_name]
  );
}

console.log('✅ Imported successfully');
process.exit();