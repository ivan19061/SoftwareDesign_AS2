import { Router } from "express"
import { db } from "../db"

let updateRoute = Router()

let update_image_description = db.prepare(/*sql*/`
    UPDATE image 
    SET description = :description
    WHERE id = :id
`)

let update_label_name = db.prepare(/*sql*/`
    UPDATE label 
    SET name = :name
    WHERE id = :id
`)

let find_image_by_id = db.prepare(/*sql*/`
    SELECT id, filename, description, annotation_time
    FROM image
    WHERE id = :id
`)

let find_label_by_id = db.prepare(/*sql*/`
    SELECT id, name, created_time
    FROM label
    WHERE id = :id
`)

let find_image_labels = db.prepare(/*sql*/`
    SELECT label.id, label.name
    FROM image_label
    JOIN label ON label.id = image_label.label_id
    WHERE image_label.image_id = :image_id
`)

updateRoute.put('/images/:id', (req, res) => {
    try {
        let id = Number(req.params.id)
        let { description } = req.body as { description?: string }

        if (!Number.isInteger(id)) {
            res.status(400).json({ error: 'Invalid image id' })
            return
        }

        let image = find_image_by_id.get({ id })
        if (!image) {
            res.status(404).json({ error: 'Image not found' })
            return
        }

        update_image_description.run({ id, description: description || null })
        let updatedImage = find_image_by_id.get({ id })
        
        console.log(`Image ${id} updated`)
        
        res.status(200).json({ 
            message: 'Image updated successfully',
            image: updatedImage
        })
    } catch (error: any) {
        console.error('Update image error:', error)
        res.status(500).json({ error: 'Failed to update image' })
    }
})

updateRoute.put('/labels/:id', (req, res) => {
    try {
        let id = Number(req.params.id)
        let { name } = req.body as { name?: string }

        if (!Number.isInteger(id)) {
            res.status(400).json({ error: 'Invalid label id' })
            return
        }

        if (!name || name.trim() === '') {
            res.status(400).json({ error: 'Label name is required' })
            return
        }

        let label = find_label_by_id.get({ id })
        if (!label) {
            res.status(404).json({ error: 'Label not found' })
            return
        }

        update_label_name.run({ id, name: name.trim() })
        let updatedLabel = find_label_by_id.get({ id })
        
        console.log(`Label ${id} updated`)
        
        res.status(200).json({ 
            message: 'Label updated successfully',
            label: updatedLabel
        })
    } catch (error: any) {
        console.error('Update label error:', error)
        res.status(500).json({ error: 'Failed to update label' })
    }
})

updateRoute.put('/images/:id/sync-labels', (req, res) => {
    try {
        let image_id = Number(req.params.id)
        let { label_ids } = req.body as { label_ids?: number[] }

        if (!Number.isInteger(image_id)) {
            res.status(400).json({ error: 'Invalid image id' })
            return
        }

        if (!Array.isArray(label_ids)) {
            res.status(400).json({ error: 'label_ids must be an array' })
            return
        }

        let image = find_image_by_id.get({ id: image_id })
        if (!image) {
            res.status(404).json({ error: 'Image not found' })
            return
        }

        let delete_all_labels = db.prepare(/*sql*/`
            DELETE FROM image_label WHERE image_id = :image_id
        `)
        delete_all_labels.run({ image_id })

        let insert_label = db.prepare(/*sql*/`
            INSERT INTO image_label (image_id, label_id, annotation_time)
            VALUES (:image_id, :label_id, :annotation_time)
        `)

        let annotation_time = Date.now()
        for (let label_id of label_ids) {
            insert_label.run({ image_id, label_id, annotation_time })
        }

        let labels = find_image_labels.all({ image_id })

        console.log(`Image ${image_id} labels synced: ${label_ids.length} labels`)

        res.status(200).json({ 
            message: 'Labels synced successfully',
            labels
        })
    } catch (error: any) {
        console.error('Sync labels error:', error)
        res.status(500).json({ error: 'Failed to sync labels' })
    }
})

export { updateRoute }
