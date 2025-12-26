import { Router } from "express"
import { db } from "../../db"

let labelRoute = Router()

let select_labels = db.prepare(/*sql*/`
    SELECT id, name, created_time
    FROM label
`)

let insert_label = db.prepare(/*sql*/`
    INSERT INTO label (name, created_time)
    VALUES (:name, :created_time)
    RETURNING id, name, created_time
`)

let delete_label = db.prepare(/*sql*/`
    DELETE FROM label
    WHERE id = :id
`)

labelRoute.get('/labels', (req, res) => {
    try {
        let labels = select_labels.all()
        res.json({ labels })
    } catch (error: any) {
        res.status(500)
        res.json({ error: error.message })
    }
})

labelRoute.post('/labels', (req, res) => {
    try {
        let { name } = req.body as { name?: unknown }
        
        if (typeof name !== 'string' || !name.trim()) {
            res.status(400)
            res.json({ error: 'Label name is required' })
            return
        }

        let created_time = Math.floor(Date.now() / 1000)
        let label = insert_label.get({ name: name.trim(), created_time })
        
        res.status(201)
        res.json({ message: 'Label created', label })
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint')) {
            res.status(409)
            res.json({ error: 'Label already exists' })
            return
        }
        res.status(500)
        res.json({ error: error.message })
    }
})

labelRoute.delete('/labels/:id', (req, res) => {
    try {
        let id = Number(req.params.id)
        
        if (!Number.isInteger(id)) {
            res.status(400)
            res.json({ error: 'Invalid label id' })
            return
        }

        let result = delete_label.run({ id })
        
        if (result.changes === 0) {
            res.status(404)
            res.json({ error: 'Label not found' })
            return
        }
        
        res.json({ message: 'Label deleted successfully' })
    } catch (error: any) {
        res.status(500)
        res.json({ error: error.message })
    }
})

export { labelRoute }
