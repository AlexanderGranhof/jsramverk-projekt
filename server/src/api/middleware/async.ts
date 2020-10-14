import { Response, NextFunction, Request } from 'express'

type MiddlewareFunc = (req: Request, res: Response, next?: NextFunction) => void

export const wrapAsync = (fn: MiddlewareFunc) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next)
}
