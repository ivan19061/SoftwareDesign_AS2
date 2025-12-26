const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════');
console.log('  🔍 Checking all API files');
console.log('═══════════════════════════════════════\n');

const apiDir = './src/api';
const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts'));

const wrongColumns = ['created_at', 'updated_at'];
const correctMapping = {
  'created_at': 'created_time (for label) or upload_time (for image)',
  'updated_at': 'annotation_time'
};

files.forEach(file => {
  const filePath = path.join(apiDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log(`📄 ${file}:`);
  
  let found = false;
  lines.forEach((line, index) => {
    wrongColumns.forEach(col => {
      if (line.includes(col)) {
        console.log(`   ❌ Line ${index + 1}: ${line.trim()}`);
        console.log(`      → Should be: ${correctMapping[col]}`);
        found = true;
      }
    });
  });
  
  if (!found) {
    console.log('   ✅ No issues found');
  }
  console.log('');
});

console.log('═══════════════════════════════════════\n');

