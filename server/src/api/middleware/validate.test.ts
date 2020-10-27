import joi from 'joi'
import { joi as joiValidation } from './validate'
import { Request, Response, NextFunction } from 'express'

describe('validation middleware', () => {
    test('can validate joi schema', () => {
        const schema = joi.object({ test: true })

        const middleware = joiValidation(schema)

        const json = jest.fn()
        const req = { body: { test: true } } as Request
        const res = ({ status: () => ({ json }) } as any) as Response
        const next: NextFunction = jest.fn()

        middleware(req, res, next)

        expect(next).toBeCalledTimes(1)
        expect(json).toBeCalledTimes(0)
    })

    test('can cause error to be sent', () => {
        const schema = joi.object({ test: true })

        const middleware = joiValidation(schema)

        const json = jest.fn()
        const req = { body: { test: false } } as Request
        const res = ({ status: () => ({ json }) } as any) as Response
        const next: NextFunction = jest.fn()

        middleware(req, res, next)

        expect(next).toBeCalledTimes(0)
        expect(json).toBeCalledTimes(1)
    })
})
