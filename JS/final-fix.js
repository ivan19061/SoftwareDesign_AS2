const fs = require('fs');
const { execSync } = require('child_process');
const Database = require('better-sqlite3');

console.log('═══════════════════════════════════════');
console.log('  🔧 FINAL FIX - Bypass auto-migrate');
console.log('═══════════════════════════════════════\n');

// Step 1: 備份並刪除資料庫
console.log('1️⃣ Removing database...');
if (fs.existsSync('./db.sqlite3')) {
    const timestamp = Date.now();
    fs.copyFileSync('./db.sqlite3', `./db.sqlite3.backup-${timestamp}`);
    fs.unlinkSync('./db.sqlite3');
    console.log('   ✅ Deleted\n');
}

// Step 2: 清空 migrations
console.log('2️⃣ Clearing migrations...');
if (!fs.existsSync('./migrations')) {
    fs.mkdirSync('./migrations');
}
const files = fs.readdirSync('./migrations');
files.forEach(file => {
    fs.unlinkSync(`./migrations/${file}`);
    console.log(`   🗑️  ${file}`);
});
console.log('   ✅ Cleared\n');

// Step 3: 創建正確的 migration
console.log('3️⃣ Creating correct migration...');

const migrationContent = `const { Knex } = require("knex");

/**
 * @param { Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 創建 image 表
  await knex.schema.createTable('image', (table) => {
    table.increments('id').primary();
    table.text('filename').notNullable();
    table.integer('file_size').notNullable();
    table.text('mime_type').notNullable();
    table.integer('upload_time').notNullable().defaultTo(knex.raw('(unixepoch())'));
    table.text('description').nullable();
    table.integer('annotation_time').nullable();
  });

  // 創建 label 表
  await knex.schema.createTable('label', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable().unique();
    table.integer('created_time').notNullable().defaultTo(knex.raw('(unixepoch())'));
  });

  // 創建 image_label 表 - 包含所有必要欄位！
  await knex.schema.createTable('image_label', (table) => {
    table.increments('id').primary();
    table.integer('image_id').notNullable()
      .references('id').inTable('image').onDelete('CASCADE');
    table.integer('label_id').notNullable()
      .references('id').inTable('label').onDelete('CASCADE');
    table.integer('annotation_time').notNullable().defaultTo(knex.raw('(unixepoch())'));
    table.unique(['image_id', 'label_id']);
  });
};

/**
 * @param { Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('image_label');
  await knex.schema.dropTableIfExists('label');
  await knex.schema.dropTableIfExists('image');
};
`;

// 使用 .js 而不是 .ts，避免編譯問題
const timestamp = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '')
    .split('.')[0];
const filename = `${timestamp}_create_all_tables.js`;
fs.writeFileSync(`./migrations/${filename}`, migrationContent, 'utf8');
console.log(`   ✅ Created: ${filename}\n`);

// Step 4: 執行 migration（直接使用 knex）
console.log('4️⃣ Running migration...');
try {
    execSync('npx knex migrate:latest --knexfile knexfile.js', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'development' }
    });
    console.log('   ✅ Completed\n');
} catch (error) {
    console.error('   ❌ Failed!');
    process.exit(1);
}

// Step 5: 驗證
console.log('5️⃣ Verifying...\n');
const db = new Database('./db.sqlite3');

const tables = ['image', 'label', 'image_label'];
tables.forEach(tableName => {
    console.log(`   📋 ${tableName}:`);
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    if (columns.length === 0) {
        console.log(`      ❌ Table does not exist!`);
    } else {
        columns.forEach(col => {
            console.log(`      - ${col.name} (${col.type})`);
        });
    }
    console.log('');
});

// 最終檢查
const imageLabelCols = db.prepare(`PRAGMA table_info(image_label)`).all();
const required = ['id', 'image_id', 'label_id', 'annotation_time'];
const missing = required.filter(col => !imageLabelCols.some(c => c.name === col));

console.log('   🔍 Validation:');
if (missing.length > 0) {
    console.log(`      ❌ Missing: ${missing.join(', ')}`);
    db.close();
    process.exit(1);
} else {
    console.log('      ✅ All required columns present!');
}

db.close();

console.log('\n═══════════════════════════════════════');
console.log('✅ DATABASE FIXED!');
console.log('═══════════════════════════════════════\n');
console.log('Next steps:');
console.log('  1. npm run dev');
console.log('  2. Test uploading an image\n');
