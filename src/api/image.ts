import { Router } from "express"
import { Formidable } from 'formidable'
import { db } from "../db"

let imageRoute = Router()

// Simple in-memory insert_image stub to satisfy the missing symbol during compilation.
// Replace this with your real DB
let insert_images = db.prepare(/*sql*/ `
INSERT INTO images (filename, file_size, mime_type)
VALUES (:filename, :file_size, :mime_type)
RETURNING id
`)

let list_images = db.prepare(/*sql*/`
    SELECT 
        images.id,
        images.filename,
        images.upload_time,
        COUNT(image_label.id) AS labels_count 
    FROM images
    LEFT JOIN image_label ON images.id = image_label.image_id
    GROUP BY images.id 
    ORDER BY images.upload_time DESC
`)

let find_image = db.prepare(/*sql*/`
    SELECT id, filename, upload_time
    FROM images
    WHERE id = :image_id 
`)

let list_image_labels = db.prepare(/*sql*/`
    SELECT label_id, 
    name
    created_time,
    image_label.id AS image_label_id,
    image_label.Annotations_time
    FROM  image_label
    JOIN labels ON labels.id = image_label.label_id
    WHERE image_label.image_id = :image_id
    ORDER BY labels.name COLLATE NOCASE 
`)


imageRoute.post('/uploads', async (req, res) => {
    try {
        let form = new Formidable({ keepExtensions: true, uploadDir: 'src/uploads' })
        let [fields, files] = await form.parse(req) as any;
        let filename = files?.image?.[0]?.newFilename;
        if (!filename) {
            throw new Error('No File uploaded');
        }
         let result = insert_images.get({ filename: filename, file_size: 0, mime_type: "image/jpg", upload_time: Date.now()  })
        res.status(200)
        res.json({ image_id: result.id })
    } catch (error) {
        res.status(500)
        console.log(error)
        res.json({ error: String(error) })
    }
})

imageRoute.get('/images', (req, res) => {
    try {
        let images = list_images.all()
        res.status(200)
        res.json({ images })
    } catch (error) { 
        res.status(500)
        res.json({ error: String(error) })
    }
})


imageRoute.get('/image/:imageId', (req, res) => {
try {
    let image_id = Number(req.params.imageId)
    if (!Number.isInteger(image_id)) {
     res.status(400)
     res.json({ error: "Invalid image ID" })
     return    
    }
    let image = find_image.get({ image_id })
    if (!image) {
        res.status(404)
        res.json({ error: "Image not found" })
        return
    }
    let labels = list_image_labels.all({ image_id })
    res.status(200)
    res.json({ image, labels })
} catch (error) {
    res.status(500)
    res.json({ error: String(error) }) 
     

}    
})

export {imageRoute}