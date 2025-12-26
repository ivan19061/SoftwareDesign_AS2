import { del, seedRow } from "better-sqlite3-proxy";
import { proxy } from "../proxy";
import { db } from "../db";

console.log('\n🗑️  Cleaning old data...\n');

db.exec(/*sql*/`
  DELETE FROM image_label;
  DELETE FROM label;
  DELETE FROM image;
  DELETE FROM sqlite_sequence WHERE name IN ('image', 'label', 'image_label');
`);

console.log(' Old data cleaned!\n');


function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
  };
  return mimeTypes[ext || ''] || 'image/jpeg';
}



function seedImage(args: { filename: string; labels: string[] }) {
  const currentTime = Math.floor(Date.now() / 1000);
  
  const image_id = seedRow(
    proxy.image,
    { filename: args.filename },
    {
      file_size: 0,
      mime_type: getMimeType(args.filename),
      upload_time: currentTime,
      description: null,
      annotation_time: currentTime,
    }
  );
  
  console.log(`  ✓ Image: ${args.filename} (ID: ${image_id})`);

  del(proxy.image_label, { image_id });

  for (let name of args.labels) {
    const label_id = seedRow(
      proxy.label,
      { name },
      {
        description: null,
        created_time: currentTime,
      }
    );

    proxy.image_label.push({
      image_id,
      label_id,
      annotation_time: currentTime,
    });
  }
  
  console.log(`    → Labels: ${args.labels.join(', ')}`);
}


console.log(' Starting database seeding...\n');

seedImage({ filename: "dog.jpg", labels: ["dog", "indoor"] });
seedImage({ filename: "cat.jpg", labels: ["cat", "indoor"] });
seedImage({ filename: "cat3.jpg", labels: ["cat", "animal", "pet"] });
seedImage({ filename: "cat1.jpg", labels: ["cat", "animal", "pet"] });
seedImage({ filename: "cat2.jpg", labels: ["cat", "animal", "pet"] });
seedImage({ filename: "dog1.jpg", labels: ["dog", "animal", "pet"] });
seedImage({ filename: "dog2.jpg", labels: ["dog", "animal", "pet"] });
seedImage({ filename: "otter.jpg", labels: ["otter", "animal", "wildlife"] });
seedImage({ filename: "otter2.jpeg", labels: ["otter", "animal", "wildlife"] });
seedImage({ filename: "otter3.jpg", labels: ["otter", "animal", "wildlife"] });

console.log('\nSeeding completed!\n');
console.log(' Summary:');
console.log(`   - Total images: ${proxy.image.length}`);
console.log(`   - Total labels: ${proxy.label.length}`);
console.log(`   - Total annotations: ${proxy.image_label.length}\n`);