import { ObjectSchema } from 'joi'
import { Request, Response, NextFunction } from 'express'

export const joi = (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
    const { value, error } = schema.validate(req.body)

    if (error) {
        return res.status(400).json(error)
    }

    req.body = value

    return next()
}
