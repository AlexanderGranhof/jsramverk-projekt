import { wrapAsync } from './async'
import { Request, Response } from 'express'

describe('async middleware wrapper', () => {
    test('can catch reject', () => {
        const canCatchAsyncError = new Promise((resolve) => {
            wrapAsync(async () => {
                throw new Error('oof')
            })({} as Request, {} as Response, resolve)
        })

        expect(canCatchAsyncError).resolves.toBeInstanceOf(Error)
    })
})
