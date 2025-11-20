import express from 'express';
import multer from 'multer';
import { db } from './db';
import { ImageMessager } from './prepare';

const imageMessager = new ImageMessager();

const app = express();
const port = 8100;


const storage = multer.memoryStorage();
const upload = multer({
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

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/uploads', express.static("src/uploads"))

app.listen(8100, () => {
    console.log(`Server running on port ${port}`)
})