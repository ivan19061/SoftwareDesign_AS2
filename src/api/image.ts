import { Router } from "express"
import { Formidable } from 'formidable'
import { db } from "../db"

let imageRoute = Router()

let insert_images = db.prepare(/*sql*/`
    INSERT INTO image (filename, file_size, mime_type)
    VALUES (:filename, :file_size, :mime_type)
    RETURNING id
`)

let list_images = db.prepare(/*sql*/`
    SELECT 
        image.id,
        image.filename,
        image.upload_time,
        COUNT(image_label.id) AS labels_count 
    FROM image
    LEFT JOIN image_label ON image.id = image_label.image_id
    GROUP BY image.id 
    ORDER BY image.upload_time DESC
`)

let find_image = db.prepare(/*sql*/`
    SELECT id, filename, upload_time, description
    FROM image
    WHERE id = :id 
`)

let list_image_labels = db.prepare(/*sql*/`
    SELECT 
        label.id AS label_id, 
        label.name,
        label.created_time,
        image_label.id AS image_label_id,
        image_label.annotation_time
    FROM image_label
    JOIN label ON label.id = image_label.label_id
    WHERE image_label.image_id = :image_id
    ORDER BY label.name COLLATE NOCASE 
`)

imageRoute.post('/uploads', async (req, res) => {
    try {
        let form = new Formidable({ keepExtensions: true, uploadDir: 'src/uploads' })
        let [fields, files] = await form.parse(req) as any;
        let filename = files?.image?.[0]?.newFilename;
        if (!filename) {
            throw new Error('No File uploaded');
        }
        let result = insert_images.get({ 
            filename: filename, 
            file_size: files?.image?.[0]?.size, 
            mime_type: files?.image?.[0]?.mimetype 
        }) as any;
        res.status(201)
        res.json({ message: 'Image uploaded successfully', image_id: result.id })
    } catch (error: any) {
        res.status(400)
        res.json({ error: error.message })
    }
})

imageRoute.get('/images', (req, res) => {
    try {
        let images = list_images.all()
        res.status(200)
        res.json({ images })
    } catch (error: any) {
        res.status(500)
        res.json({ error: error.message })
    }
})

imageRoute.get('/images/:id', (req, res) => {
    try {
        let id = Number(req.params.id)
        if (!Number.isInteger(id)) {
            res.status(400)
            res.json({ error: 'Invalid image id' })
            return
        }
        let image = find_image.get({ id })
        if (!image) {
            res.status(404)
            res.json({ error: 'Image not found' })
            return
        }
        let labels = list_image_labels.all({ image_id: id })
        res.status(200)
        res.json({ image, labels })
    } catch (error: any) {
        res.status(500)
        res.json({ error: error.message })
    }
})

export { imageRoute }
