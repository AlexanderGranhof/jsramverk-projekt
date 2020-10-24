process.env.JWT_SECRET = 'test123123123123123123123123123123123'

import { authenticate } from './auth'
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET

describe('auth middleware', () => {
    let status: number
    let calledNext = false

    const res = {
        status: (num: number) => {
            status = num

            return {
                send: (data: any) => {
                    return
                },
            }
        },
    }

    let token = jwt.sign({ test: '123' }, JWT_SECRET, { expiresIn: 100000 })

    let req = {
        signedCookies: {
            token,
        },
    }

    const next = () => {
        calledNext = true
        return
    }

    test('can handle a JWT token', () => {
        authenticate(req as Request, res as Response, next as NextFunction)

        expect(calledNext).toEqual(true)
        expect((req as any).jwtBody.test).toEqual('123')
    })

    test('can handle invalid token', () => {
        token = jwt.sign({ test: '123' }, JWT_SECRET + 2, { expiresIn: 100000 })
        req = {
            signedCookies: {
                token,
            },
        }

        authenticate(req as Request, res as Response, next as NextFunction)
        expect(status).toEqual(400)

        authenticate({ signedCookies: {} } as Request, res as Response, next as NextFunction)
        expect(status).toEqual(403)
    })
})
