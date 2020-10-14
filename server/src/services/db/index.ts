import mongoose, { Document } from 'mongoose'
import TransactionSchema from './schemas/transaction'
import UserSChema from './schemas/user'
import { Transaction, User } from '../../models'

const connection = mongoose.connect(`mongodb://${process.env.MONGODB || 'localhost'}/bssf`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

export default (async () => {
    const db = await connection

    return Object.freeze({
        Transaction: db.model<Transaction & Document>('Transaction', TransactionSchema),
        User: db.model<User & Document>('User', UserSChema),
    })
})()
