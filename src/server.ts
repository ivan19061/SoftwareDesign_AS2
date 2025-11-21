import express from 'express'
import multer from 'multer'
import { db } from './db.js'
import { ImageMessager } from './prepare'
import cors from "cors";
import {annotationRoute} from './api/annotation'
import {imageRoute} from './api/image'
import {labelRoute} from './api/label'
import { mkdirSync } from 'fs';



let imageMessager = new ImageMessager();
let app = express();



let  storage = multer.memoryStorage();
let  uploads = multer({
    storage: storage,
    limits: {
        fileSize: 10 * (1024 ** 2)
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(null, false);
            throw new Error("Only image allowed")
        }
    }
})


mkdirSync('uploads',{recursive:true})
app.use('/uploads', express.static("uploads"))
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/uploads', express.static("src/uploads"))
app.use(cors())

app.use('/api',imageRoute)
app.use('/api',annotationRoute)
app.use('/api',labelRoute)

let  port = 8100;
app.listen(port, () => {

    console.log(`Server running on port ${port}`)
})
