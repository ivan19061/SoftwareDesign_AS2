import { Response } from 'express'
import { HttpError } from '../errors/http-error'

export function handleRequest(res: Response, fn: () => object) {
  try {
    let result = fn()
    res.json(result)
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message })
    } else {
      res.status(500).json({ error: String(error) })
    }
  }
}