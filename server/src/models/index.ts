import joi from 'joi'

export type Transaction = {
    trade: string
    market: string
    user: string
    createdAt: Date
}

export type User = {
    name: string
    password: string
    balance: number
}

export const UserSchema = joi.object({
    name: joi.string().required(),
    password: joi.string().required(),
})
