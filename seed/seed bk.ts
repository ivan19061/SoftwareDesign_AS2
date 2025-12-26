import { db } from "../db"

function seedRow(table: string, filter: object, data: object) {
  const [key, value] = Object.entries(filter)[0];
  const row = db.queryFirstRow(
    `SELECT id FROM ${table} WHERE ${key} = ?`,
    value
  );
  
  if (row) {
    console.log(' update', table, filter);
    db.update(table, data, filter);
  } else {
    console.log('insert', table, filter);
    db.insert(table, data);
  }
}



console.log('\n  Seeding labels...');
const labels = [
  { name: 'cat', description: 'Cat images' },
  { name: 'dog', description: 'Dog images' },
  { name: 'car', description: 'Car images' },
  { name: 'building', description: 'Building images' },
  { name: 'nature', description: 'Nature scenery' },
  { name: 'food', description: 'Food images' },
  { name: 'person', description: 'People' },
  { name: 'animal', description: 'Animals' },
  { name: 'otter', description: 'cute Animals' }
];

labels.forEach(label => {
  seedRow('label', { name: label.name }, {
    name: label.name,
    description: label.description,
    created_time: Math.floor(Date.now() / 1000)
  });
});

console.log('Seeding completed!');