const fs = require('fs');
const { execSync } = require('child_process');
const Database = require('better-sqlite3');

console.log('═══════════════════════════════════════');
console.log('  🚀 Database Setup');
console.log('═══════════════════════════════════════\n');

// Step 1: 刪除舊資料庫（直接刪除檔案）
console.log('1️⃣ Removing old database...');
if (fs.existsSync('./db.sqlite3')) {
  fs.unlinkSync('./db.sqlite3');
  console.log('   ✅ Deleted db.sqlite3\n');
} else {
  console.log('   ℹ️  No database to delete\n');
}

// Step 2: 清空 migrations
console.log('2️⃣ Clearing migrations...');
if (!fs.existsSync('./migrations')) {
  fs.mkdirSync('./migrations');
}
fs.readdirSync('./migrations').forEach(file => {
  fs.unlinkSync(`./migrations/${file}`);
});
console.log('   ✅ Cleared\n');

// Step 3: 創建 migration（無 default 值）
console.log('3️⃣ Creating migration...');
const migrationContent = `/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('image', (table) => {
    table.increments('id').primary();
    table.text('filename').notNullable();
    table.integer('file_size').notNullable();
    table.text('mime_type').notNullable();
    table.integer('upload_time').notNullable();
    table.text('description').nullable();
    table.integer('annotation_time').nullable();
  });

  await knex.schema.createTable('label', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable().unique();
    table.integer('created_time').notNullable();
  });

  await knex.schema.createTable('image_label', (table) => {
    table.increments('id').primary();
    table.integer('image_id').notNullable()
      .references('id').inTable('image').onDelete('CASCADE');
    table.integer('label_id').notNullable()
      .references('id').inTable('label').onDelete('CASCADE');
    table.integer('annotation_time').notNullable();
    table.unique(['image_id', 'label_id']);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('image_label');
  await knex.schema.dropTableIfExists('label');
  await knex.schema.dropTableIfExists('image');
};
`;

fs.writeFileSync('./migrations/20250101000000_init.js', migrationContent);
console.log('   ✅ Created migration\n');

// Step 4: 執行 migration
console.log('4️⃣ Running migration...');
try {
  execSync('npx knex migrate:latest --knexfile knexfile.js', { stdio: 'inherit' });
  console.log('   ✅ Completed\n');
} catch (error) {
  console.error('   ❌ Failed');
  process.exit(1);
}

// Step 5: 驗證
console.log('5️⃣ Verifying...\n');
const db = new Database('./db.sqlite3');

['image', 'label', 'image_label'].forEach(table => {
  console.log(`   📋 ${table}:`);
  db.prepare(`PRAGMA table_info(${table})`).all()
    .forEach(col => console.log(`      - ${col.name} (${col.type})`));
  console.log('');
});

const cols = db.prepare(`PRAGMA table_info(image_label)`).all();
const missing = ['id', 'image_id', 'label_id', 'annotation_time']
  .filter(c => !cols.some(col => col.name === c));

if (missing.length > 0) {
  console.log(`   ❌ Missing: ${missing.join(', ')}`);
  db.close();
  process.exit(1);
}

console.log('   ✅ All columns present');
db.close();

// Step 6: 創建 uploads 目錄
console.log('\n6️⃣ Creating uploads directory...');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
  console.log('   ✅ Created\n');
} else {
  console.log('   ℹ️  Already exists\n');
}

console.log('═══════════════════════════════════════');
console.log('✅ Setup completed!');
console.log('═══════════════════════════════════════\n');
console.log('Start server: npm run dev\n');
