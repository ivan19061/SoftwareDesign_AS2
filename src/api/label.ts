import { Router } from "express"
import { db } from "../db"
let labelRoute = Router()



let list_labels = db.prepare(/* sql */`
    SELECT id, name, created_time
    FROM labels
    ORDER BY name COLLATE NOCASE
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

export {labelRoute}