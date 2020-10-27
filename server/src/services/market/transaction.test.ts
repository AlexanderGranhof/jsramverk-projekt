import { createInstance } from './transaction'

describe('transaction market service', () => {
    let first = 0
    const createTransaction = createInstance(Math.random().toString(), 1000, 2505)

    test('can create a random number', () => {
        const transaction = createTransaction(100)

        expect(typeof transaction === 'number').toBe(true)

        first = transaction
    })

    test('can create random numbers', () => {
        const transaction = createTransaction(100)

        expect(transaction !== first).toBe(true)
    })
})
