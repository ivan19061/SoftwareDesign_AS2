import { db } from './db';
import fs from 'fs';
import path from 'path';

export const insertImage = db.prepare(`
INSERT INTO images (filename, file_size, mime_type)
VALUES (:filename, :file_size, :mine_type)
RETURNING id
`)

export const findImageByFilename = db.prepare(`
    SELECT id, filename, file_size, mime_type, upload_time ,description
    FROM images
    WHERE filename = :filename
`)

export const listImages = db.prepare(`
    SELECT id, filename, file_size, mime_type, upload_time, description
    FROM images
    ORDER BY upload_time DESC
`)
//listImages.all()

export const insertAnnotation = db.prepare(`
INSERT OR IGNORE INTO image_label (image_id, label_id)
VALUES (:image_id, :label_id)
`)

export class ImageMessager {
    uploadDir = "./uploads";

    constructor() {
        this.init();
    }

    init() {
        this.uploadDir = path.join(__dirname, this.uploadDir);
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir);
        }
    }

    public uploadImage(filename: string, content: Buffer, labels: string[]) {
        const filePath = path.join(this.uploadDir, filename);
        const exists = findImageByFilename.get({ filename })
        if (exists) {
            throw new Error(`File: ${filename} already exists`)
        }
        fs.writeFileSync(filePath, content);

        const result = insertImage.run({
            filename: filename,
            file_size: content.length,
            mine_type: this.getMineType(filename)
        })

        const imageID = result.lastInsertRowId;

        if (labels.length > 0) {
            this.addLabel(imageID, labels);
        }

        return imageID;
    }


    addLabel(image_id: number, labels: string[]) {
        const transaction = db.transaction((labels) => {
            for (const label of labels) {
                // add label
                // labels table: name
                // get label_id
                // image_label table: image_id label_id

                // result = insertLabel.run({name: name})
                // label_id = result.lastInsertRowId
                // insertAnnotation.run({image_id: image_id, label_id: labelID})
            }
        })

        transaction(labels);
    }

    //return boolean
    //const transaction = db.transaction(() => {
    // ...
    //  const success = deleteImageByID.run();
    //  return success.changes > 0
    // })
    // 
    // return transaction()

    getMineType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();

        switch (ext) {
            case ".jpg":
            case ".jpeg":
                return "image/jpeg"
            case ".png":
                return "image/png"
        }
        return '';
    }
}


// insertImage.run({
//     filename: "",
//     file_size: 999,
//     mine_type: "jpg"
// })