import { Router } from "express"
import { Formidable } from 'formidable'
import { db } from "../db"
import { unlink, rename } from "fs/promises"
import { join, extname } from "path"

let imageRoute = Router()

let insert_images = db.prepare(/*sql*/`
    INSERT INTO image (filename, file_size, mime_type)
    VALUES (:filename, :file_size, :mime_type)
    RETURNING id
`)

let insert_image_label = db.prepare(/*sql*/`
    INSERT INTO image_label (image_id, label_id)
    VALUES (:image_id, :label_id)
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

let update_image = db.prepare(/*sql*/`
    UPDATE image 
    SET description = :description, filename = :filename
    WHERE id = :id
`)

let delete_image = db.prepare(/*sql*/`
    DELETE FROM image 
    WHERE id = :id
`)

let delete_image_labels = db.prepare(/*sql*/`
    DELETE FROM image_label 
    WHERE image_id = :image_id
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

        let labelId = fields?.label_id?.[0];
        if (!labelId || !Number.isInteger(Number(labelId))) {
            throw new Error('Invalid or missing label_id');
        }

        let result = insert_images.get({ 
            filename: filename, 
            file_size: files?.image?.[0]?.size, 
            mime_type: files?.image?.[0]?.mimetype 
        }) as any;

        insert_image_label.run({
            image_id: result.id,
            label_id: Number(labelId)
        });

        res.status(201)
        res.json({ 
            message: 'Image uploaded successfully', 
            image_id: result.id,
            url: `/uploads/${filename}`
        })
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

imageRoute.patch('/images/:id', async (req, res) => {
    try {
        let id = Number(req.params.id)
        if (!Number.isInteger(id)) {
            res.status(400)
            res.json({ error: 'Invalid image id' })
            return
        }

        let { description, filename: newFilename } = req.body

        let image = find_image.get({ id }) as any
        if (!image) {
            res.status(404)
            res.json({ error: 'Image not found' })
            return
        }

        let finalFilename = image.filename

        if (newFilename && newFilename !== image.filename) {
            let ext = extname(image.filename)
            let newFilenameWithExt = newFilename.endsWith(ext) ? newFilename : newFilename + ext
            
            let oldPath = join('src/uploads', image.filename)
            let newPath = join('src/uploads', newFilenameWithExt)

            try {
                await rename(oldPath, newPath)
                finalFilename = newFilenameWithExt
            } catch (error) {
                res.status(500)
                res.json({ error: 'Failed to rename file' })
                return
            }
        }

        update_image.run({ 
            id, 
            description: description || image.description || '',
            filename: finalFilename
        })
        
        res.status(200)
        res.json({ message: 'Image updated successfully', filename: finalFilename })
    } catch (error: any) {
        res.status(500)
        res.json({ error: error.message })
    }
})

imageRoute.delete('/images/:id', async (req, res) => {
    try {
        let id = Number(req.params.id)
        if (!Number.isInteger(id)) {
            res.status(400)
            res.json({ error: 'Invalid image id' })
            return
        }

        let image = find_image.get({ id }) as any
        if (!image) {
            res.status(404)
            res.json({ error: 'Image not found' })
            return
        }

        delete_image_labels.run({ image_id: id })
        delete_image.run({ id })

        try {
            await unlink(join('src/uploads', image.filename))
        } catch (error) {
            console.error('Failed to delete file:', error)
        }

        res.status(200)
        res.json({ message: 'Image deleted successfully' })
    } catch (error: any) {
        res.status(500)
        res.json({ error: error.message })
    }
})

export { imageRoute }
