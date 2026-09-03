#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
// lightweight CSV parse to avoid native dependencies
function parseCSV(content, options = { columns: true, skip_empty_lines: true }) {
  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      if (inQuotes && content[i+1] === '"') { // escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(cur);
      cur = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // handle CRLF
      if (ch === '\r' && content[i+1] === '\n') {
        i++;
      }
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
    } else {
      cur += ch;
    }
  }
  // last value
  if (cur !== '' || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }

  // remove empty lines if requested
  const filtered = options.skip_empty_lines
    ? rows.filter(r => !(r.length === 1 && r[0].trim() === ''))
    : rows;

  if (options.columns) {
    const headers = filtered[0].map(h => h.trim());
    const records = filtered.slice(1).map(r => {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = r[i] !== undefined ? r[i] : '';
      }
      return obj;
    });
    return records;
  }
  return filtered;
}
const { Pool } = require('pg');

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  console.log('No ./data directory found. Create ./data and place CSV files there.');
  process.exit(0);
}

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
if (files.length === 0) {
  console.log('No CSV files found in ./data. Nothing to import.');
  process.exit(0);
}

const DATABASE_URL = process.env.DATABASE_URL;

async function importToPostgres(rows, table) {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = cols.map((c, i) => `$${i+1}`);
      const text = `INSERT INTO ${table}(${cols.join(',')}) VALUES(${vals.join(',')})`;
      const params = cols.map(c => row[c]);
      await client.query(text, params);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

function importToSqlite(rows, table) {
  // Try to use better-sqlite3 if available, otherwise write JSON fallback
  try {
    const Database = require('better-sqlite3');
    const dbPath = path.join(dataDir, 'local.db');
    const db = new Database(dbPath);

    const first = rows[0];
    const cols = Object.keys(first);

    // create table if not exists with TEXT columns
    const createCols = cols.map(c => `"${c}" TEXT`).join(', ');
    db.exec(`CREATE TABLE IF NOT EXISTS "${table}" (${createCols});`);

    const placeholders = cols.map(() => '?').join(',');
    const stmt = db.prepare(`INSERT INTO "${table}"(${cols.map(c=>`"${c}"`).join(',')}) VALUES(${placeholders})`);
    const insert = db.transaction((rows) => {
      for (const row of rows) {
        const params = cols.map(c => row[c]);
        stmt.run(params);
      }
    });

    insert(rows);
    db.close();
  } catch (err) {
    // Fallback: write JSON file for manual import or inspection
    const outDir = path.join(dataDir, 'imported');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${table}.json`);
    fs.writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf8');
    console.log(`better-sqlite3 not available — wrote fallback JSON to ${outPath}`);
  }
}

async function processFile(file) {
  const filePath = path.join(dataDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const records = parseCSV(content, { columns: true, skip_empty_lines: true });
  const base = path.basename(file, '.csv');

  // normalize column names: remove spaces, to snake_case
  const rows = records.map(r => {
    const out = {};
    for (const k of Object.keys(r)) {
      const nk = k.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
      out[nk] = r[k];
    }
    return out;
  });

  const tableMap = {
    employees: 'employees',
    users: 'users',
    activity_logs: 'activity_logs',
    activitylogs: 'activity_logs'
  };

  const table = tableMap[base] || base;

  if (DATABASE_URL) {
    console.log(`Importing ${file} → Postgres table ${table} (${rows.length} rows)`);
    await importToPostgres(rows, table);
  } else {
    console.log(`Importing ${file} → SQLite ./data/local.db table ${table} (${rows.length} rows)`);
    importToSqlite(rows, table);
  }
}

(async () => {
  for (const f of files) {
    try {
      await processFile(f);
      console.log(`Imported ${f}`);
    } catch (err) {
      console.error(`Failed to import ${f}:`, err.message || err);
    }
  }
  console.log('Import complete.');
})();
