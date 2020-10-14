import { Response, NextFunction, Request } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

if (JWT_SECRET.length < 16) {
    throw new Error("env 'JWT_SECRET' length is less than 16")
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.signedCookies.token

    if (!token) {
        return res.status(403).send('missing signed token cookie')
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            return res.status(400).send('invalid jwt')
        }

        req.jwtBody = decoded

        return next()
    })
}
