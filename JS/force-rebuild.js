const fs = require('fs');
const { execSync } = require('child_process');
const Database = require('better-sqlite3');

console.log('═══════════════════════════════════════');
console.log('  💪 FORCE REBUILD DATABASE');
console.log('═══════════════════════════════════════\n');

// Step 1: 完全刪除資料庫
console.log('1️⃣ Deleting database...');
if (fs.existsSync('./db.sqlite3')) {
    const timestamp = Date.now();
    fs.copyFileSync('./db.sqlite3', `./db.sqlite3.backup-${timestamp}`);
    fs.unlinkSync('./db.sqlite3');
    console.log('   ✅ Deleted (backup created)\n');
} else {
    console.log('   ℹ️  No database to delete\n');
}

// Step 2: 清空 migrations 資料夾
console.log('2️⃣ Clearing migrations folder...');
if (fs.existsSync('./migrations')) {
    const files = fs.readdirSync('./migrations');
    files.forEach(file => {
        fs.unlinkSync(`./migrations/${file}`);
        console.log(`   🗑️  ${file}`);
    });
} else {
    fs.mkdirSync('./migrations');
}
console.log('   ✅ Cleared\n');

// Step 3: 創建新的 migration（使用當前時間戳）
console.log('3️⃣ Creating new migration...');
const timestamp = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '')
    .split('.')[0];

const migrationContent = `import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
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

  // 創建 image_label 表（最重要！）
  await knex.schema.createTable('image_label', (table) => {
    table.increments('id').primary();
    table.integer('image_id').notNullable()
      .references('id').inTable('image').onDelete('CASCADE');
    table.integer('label_id').notNullable()
      .references('id').inTable('label').onDelete('CASCADE');
    table.integer('annotation_time').notNullable().defaultTo(knex.raw('(unixepoch())'));
    table.unique(['image_id', 'label_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('image_label');
  await knex.schema.dropTableIfExists('label');
  await knex.schema.dropTableIfExists('image');
}
`;

const filename = `${timestamp}_create_tables.ts`;
fs.writeFileSync(`./migrations/${filename}`, migrationContent, 'utf8');
console.log(`   ✅ Created: ${filename}\n`);

// Step 4: 執行 migration
console.log('4️⃣ Running migration...');
try {
    execSync('npx knex migrate:latest', { stdio: 'pipe' });
    console.log('   ✅ Migration completed\n');
} catch (error) {
    console.error('   ❌ Migration failed!');
    console.error(error.stdout?.toString());
    console.error(error.stderr?.toString());
    process.exit(1);
}

// Step 5: 驗證
console.log('5️⃣ Verifying structure...\n');
const db = new Database('./db.sqlite3');

['image', 'label', 'image_label'].forEach(tableName => {
    console.log(`   📋 ${tableName}:`);
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    columns.forEach(col => {
        console.log(`      - ${col.name} (${col.type})`);
    });
    console.log('');
});

// 最終檢查
const imageLabelCols = db.prepare(`PRAGMA table_info(image_label)`).all();
const required = ['id', 'image_id', 'label_id', 'annotation_time'];
const missing = required.filter(col => !imageLabelCols.some(c => c.name === col));

console.log('   🔍 Final check:');
if (missing.length > 0) {
    console.log(`      ❌ STILL MISSING: ${missing.join(', ')}`);
    console.log('\n   🚨 CRITICAL: Migration did not work properly!');
    db.close();
    process.exit(1);
} else {
    console.log('      ✅ All columns present!');
}

db.close();

console.log('\n═══════════════════════════════════════');
console.log('✅ SUCCESS! Database is ready!');
console.log('═══════════════════════════════════════\n');
console.log('Start the server:');
console.log('  npm run dev\n');
