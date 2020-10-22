import { Schema } from 'mongoose'

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
    closeTrade: Number,
    closed: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: () => new Date(),
    },
})

Transaction.pre('save', function () {
    this.set({ createdAt: new Date() })
})

export default Transaction
