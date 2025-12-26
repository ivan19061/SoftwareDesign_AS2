const Database = require('better-sqlite3');
const db = new Database('./db.sqlite3');

console.log('═══════════════════════════════════════');
console.log('  🔍 Checking Database Schema');
console.log('═══════════════════════════════════════\n');

// 檢查 image_label 表結構
console.log('📋 image_label table structure:');
try {
    const columns = db.prepare(`PRAGMA table_info(image_label)`).all();
    if (columns.length === 0) {
        console.log('   ❌ Table does not exist!\n');
    } else {
        columns.forEach(col => {
            console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : 'NULL'}${col.pk ? ' PRIMARY KEY' : ''}`);
        });
    }
} catch (error) {
    console.log('   ❌ Error:', error.message);
}

console.log('\n═══════════════════════════════════════\n');
db.close();