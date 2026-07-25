const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const backupPath = path.join(__dirname, '..', 'prisma', `dev.backup-${Date.now()}.db`);

if (fs.existsSync(dbPath)) {
  console.log(`Creating backup of SQLite database...`);
  fs.copyFileSync(dbPath, backupPath);
  console.log(`✅ Success! Database safely backed up to: ${backupPath}`);
  console.log(`If anything goes wrong, simply rename this file back to 'dev.db'`);
} else {
  console.log(`⚠️ No dev.db found at ${dbPath}. Skipping backup.`);
}
