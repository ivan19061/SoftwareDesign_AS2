import express from 'express'
import cors from "cors"
import { annotationRoute } from './api/annotation'
import { imageRoute } from './api/image'
import { labelRoute } from './api/label'
import { updateRoute } from './api/update'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use('/uploads', express.static('src/uploads'))

app.use('/api', annotationRoute)
app.use('/api', imageRoute)
app.use('/api', labelRoute)
app.use('/api', updateRoute)
let PORT = process.env.PORT || 8100
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})