import { proxySchema } from 'better-sqlite3-proxy'
import { db } from './db'

export type Image = {
  id?: null | number
  filename: string
  file_size: number
  mime_type: string
  upload_time: number
  description: null | string
  annotation_time: null | number
}

export type Label = {
  id?: null | number
  name: string
  description: null | string
  created_time: number
}

export type ImageLabel = {
  id?: null | number
  image_id: number
  image?: Image
  label_id: number
  label?: Label
  annotation_time: null | number
}

export type DBProxy = {
  image: Image[]
  label: Label[]
  image_label: ImageLabel[]
}

export let proxy = proxySchema<DBProxy>({
  db,
  tableFields: {
    image: [],
    label: [],
    image_label: [
      /* foreign references */
      ['image', { field: 'image_id', table: 'image' }],
      ['label', { field: 'label_id', table: 'label' }],
    ],
  },
})
