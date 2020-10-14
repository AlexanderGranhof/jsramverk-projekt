declare namespace Express {
    export interface Request {
        jwtBody: Record<string, any>
    }
}
