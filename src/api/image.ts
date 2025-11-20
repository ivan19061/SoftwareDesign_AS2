import { Router } from "express"
import { Formidable } from 'formidable'
import { db } from "../db"

let imageRoute = Router()

// Simple in-memory insert_image stub to satisfy the missing symbol during compilation.
// Replace this with your real DB
let insert_image = db.prepare(/*sql*/ `
INSERT INTO images (filename, upload_date) VALUES (:filename, :upload_date)
RETURNING id
`)



imageRoute.post('/upload-image', async (req, res) => {
    try {
        let form = new Formidable({ keepExtensions: true, uploadDir: './src/uploads' })
        let [fields, files] = await form.parse(req) as any;
        let filename = files?.image?.[0]?.newFilename;
        if (!filename) {
            throw new Error('No File uploaded');
        }
        let result = insert_image.get({ filename, upload_date: Date.now() })
        res.status(200)
        res.json({ image_id: result.id })
    } catch (error) {
        res.status(500)
        res.json ({ error: String(error) })
    }
})
 


export { imageRoute }; 