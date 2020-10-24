import nodeFetch, { Response } from 'node-fetch'

const port = process.env.PORT ?? 3001
export const domain = process.env.TEST_DOMAIN ?? `http://localhost:${port}`

console.log(domain)

export const fetch = async (pathname: string, postBody?: Record<string, any>) => {
    const body = postBody ? JSON.stringify(postBody) : undefined

    const headers = {
        'Content-Type': 'application/json',
    }

    return nodeFetch(`${domain}${pathname}`, {
        method: body ? 'POST' : 'GET',
        headers: body ? headers : undefined,
        body: body ? body : undefined,
    })
}

export const extractToken = (response: Response) => {
    const setCookie = response.headers.get('set-cookie') || ''
    const match = setCookie.match(/token=(.*?);/)

    return match ? match[1] : ''
}

export const signIn = async (returnRawCookie = false) => {
    const response = await fetch('/login', {
        username: 'admin',
        password: 'admin',
    })

    if (returnRawCookie) {
        return response.headers.get('set-cookie')
    }

    return extractToken(response)
}
