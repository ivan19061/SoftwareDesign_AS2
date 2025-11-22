import express from 'express'
import multer from 'multer'
import { db } from './db.js'
import { ImageMessager } from './prepare'
import cors from "cors";
import {annotationRoute} from './api/annotation'
import { imageRoute } from './api/image'
import {labelRoute} from './api/label'
import { mkdirSync } from 'fs';


let app = express();



mkdirSync('uploads', {recursive: true})
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.use('/api', imageRoute)  
app.use('/api', annotationRoute)
app.use('/api', labelRoute)

app.use('/uploads', express.static("src/uploads"))

let port = 8100;
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})