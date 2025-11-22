import { Router } from "express"
import { db } from "../db"

let annotationRoute = Router()

let find_image = db.prepare(/* sql */`
    SELECT id,
    filename,
    upload_time
    FROM image
    WHERE id = :id
`)

let find_label_by_id = db.prepare(/* sql */`
    SELECT id,
    name,
    created_time
    FROM label
    WHERE id = :id
`)

let find_image_label = db.prepare(/* sql */`
    SELECT id
    FROM image_label
    WHERE image_id = :image_id AND label_id = :label_id
`)

let insert_image_label = db.prepare(/* sql */`
    INSERT INTO image_label (image_id, label_id, annotation_time)
    VALUES (:image_id, :label_id, :annotation_time)
    RETURNING id
`)

let delete_image_label = db.prepare(/* sql */`
    DELETE FROM image_label
    WHERE image_id = :image_id AND label_id = :label_id
`)

annotationRoute.post('/images/:imageId/labels', (req, res) => {
    try {
        let image_id = Number(req.params.imageId)
        let { label_id } = req.body as { label_id?: unknown }
        
        if (!Number.isInteger(image_id)) {
            res.status(400)
            res.json({ error: 'Invalid image id' })
            return
        }
        
        if (!Number.isInteger(Number(label_id))) {
            res.status(400)
            res.json({ error: 'Invalid label id' })
            return
        }
        
        label_id = Number(label_id)
        
        let image = find_image.get({ id: image_id })
        if (!image) {
            res.status(404)
            res.json({ error: 'Image not found' })
            return
        }
        
        let label = find_label_by_id.get({ id: label_id })
        if (!label) {
            res.status(404)
            res.json({ error: 'Label not found' })
            return
        }

        let existing = find_image_label.get({ image_id, label_id })
        if (existing) {
            res.status(409)
            res.json({ error: 'Label already assigned to image' })
            return
        }

        let annotation_time = Date.now()
        let result = insert_image_label.get({ image_id, label_id, annotation_time })
        res.status(201)
        res.json({ message: 'Label assigned', id: result.id })
    } catch (error) {
        res.status(500)
        res.json({ error: String(error) })
    }
})

annotationRoute.delete('/images/:imageId/labels/:labelId', (req, res) => {
    try {
        let image_id = Number(req.params.imageId)
        let label_id = Number(req.params.labelId)
        
        if (!Number.isInteger(image_id) || !Number.isInteger(label_id)) {
            res.status(400)
            res.json({ error: 'Invalid image or label id' })
            return
        }

        let image = find_image.get({ id: image_id })
        if (!image) {
            res.status(404)
            res.json({ error: 'Image not found' })
            return
        }

        let label = find_label_by_id.get({ id: label_id })
        if (!label) {
            res.status(404)
            res.json({ error: 'Label not found' })
            return
        }

        let removed = delete_image_label.run({ image_id, label_id })
        if (removed.changes === 0) {
            res.status(404)
            res.json({ error: 'Label not assigned to image' })
            return
        }

        res.status(200)
        res.json({ message: 'Label removed' })
    } catch (error) {
        res.status(500)
        res.json({ error: String(error) })
    }
})

export { annotationRoute }
