import { Router } from "express"
import { db } from "../db"

let labelRoute = Router()

let list_labels = db.prepare(/* sql */`
    SELECT id, name, created_time
    FROM label
    ORDER BY name COLLATE NOCASE
`)

let insert_label = db.prepare(/* sql */`
    INSERT INTO label (name, created_time) 
    VALUES (:name, :created_time)
    RETURNING id, name, created_time
`)

labelRoute.get('/labels', (req, res) => {
    try {
        let labels = list_labels.all()
        res.status(200)
        res.json({ labels })
    } catch (error) {
        res.status(500)
        res.json({ error: String(error) })
    }
})

labelRoute.post('/labels', (req, res) => {
    try {
        let { name } = req.body as { name?: string }
        if (!name || typeof name !== 'string' || name.trim() === '') {
            res.status(400)
            res.json({ error: 'Invalid label name' })
            return
        }
        let created_time = Date.now()
        let result = insert_label.get({ name: name.trim(), created_time })
        res.status(201)
        res.json(result)
    } catch (error) {
        res.status(500)
        res.json({ error: String(error) })
    }
})

export { labelRoute }