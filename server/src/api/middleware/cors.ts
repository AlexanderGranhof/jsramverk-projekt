import cors from 'cors'

const originWhitelist = ['http://localhost:3000', 'http://192.168.0.34:3000', 'http://84.216.208.141:3000']

type CustomOrigin = (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void

const origin: CustomOrigin = (origin, callback) => {
    console.log(origin)
    if (origin && originWhitelist.includes(origin)) {
        return callback(null, true)
    }

    return callback(new Error('not allowed by CORS'))
}

export default cors({ origin, credentials: true })
