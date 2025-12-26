const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════');
console.log('  🔧 Auto-fixing column names');
console.log('═══════════════════════════════════════\n');

const fixes = [
  {
    file: './src/api/label.ts',
    replacements: [
      { from: 'SELECT id, name, created_at', to: 'SELECT id, name, created_time' },
      { from: 'INSERT INTO label (name, created_at)', to: 'INSERT INTO label (name, created_time)' },
      { from: 'VALUES (:name, :created_at)', to: 'VALUES (:name, :created_time)' },
      { from: 'RETURNING id, name, created_at', to: 'RETURNING id, name, created_time' },
      { from: 'let created_at = Date.now()', to: 'let created_time = Math.floor(Date.now() / 1000)' },
      { from: '{ name: name.trim(), created_at }', to: '{ name: name.trim(), created_time }' }
    ]
  },
  {
    file: './src/api/image.ts',
    replacements: [
      { from: 'label.created_at', to: 'label.created_time' },
      { from: 'created_at:', to: 'created_time:' }
    ]
  },
  {
    file: './src/api/update.ts',
    replacements: [
      { from: 'SELECT id, name, created_at', to: 'SELECT id, name, created_time' }
    ]
  }
];

fixes.forEach(({ file, replacements }) => {
  console.log(`📝 Fixing ${file}...`);
  
  if (!fs.existsSync(file)) {
    console.log(`   ⚠️  File not found, skipping\n`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  let changeCount = 0;

  replacements.forEach(({ from, to }) => {
    const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, to);
      changeCount += matches.length;
      console.log(`   ✅ Replaced "${from}" → "${to}" (${matches.length}x)`);
    }
  });

  if (changeCount > 0) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`   💾 Saved ${changeCount} changes\n`);
  } else {
    console.log(`   ℹ️  No changes needed\n`);
  }
});

console.log('═══════════════════════════════════════');
console.log('✅ All files fixed!');
console.log('═══════════════════════════════════════\n');
console.log('Next step: npm run dev\n');
