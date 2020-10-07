import mongoose from 'mongoose'
import TransactionSchema, { ITransaction } from './schemas/transaction'

const connection = mongoose.connect(`mongodb://${process.env.MONGODB || 'localhost'}/bssf`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

export default (async () => {
    const db = await connection

    return Object.freeze({
        Transaction: db.model<ITransaction>('Transaction', TransactionSchema),
    })
})()
