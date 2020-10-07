import { Schema, Document } from 'mongoose'

export interface ITransaction extends Document {
    trade: string
    market: string
    user: string
    createdAt: Date
}

const Transaction = new Schema({
    trade: {
        type: String,
        required: true,
    },
    market: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        default: 'bot',
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

Transaction.pre('save', function () {
    this.set({ createdAt: new Date() })
})

export default Transaction
