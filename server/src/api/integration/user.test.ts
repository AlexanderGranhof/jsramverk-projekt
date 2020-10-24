import { fetch, extractToken } from './__util__'

const data = {
    token: '',
}

const name = Math.random().toString()
const password = Math.random().toString()

describe('user router', () => {
    test('can register and sign in', async () => {
        const response = await fetch('/user/register', {
            name,
            password,
        })

        expect(response.status).toBe(201)

        data.token = extractToken(response)

        expect(data.token).not.toBe('')

        const signInResponse = await fetch('/user/signin', {
            name,
            password,
        })

        expect(signInResponse.status).toBe(200)

        data.token = extractToken(signInResponse)

        expect(data.token).not.toBe('')
    })

    test('can sign in', async () => {
        const response = await fetch('/user/signin', {
            name,
            password,
        })

        expect(response.status).toBe(200)

        data.token = extractToken(response)

        expect(data.token).not.toBe('')
    })
})
