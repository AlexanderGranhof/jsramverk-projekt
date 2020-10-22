import { Socket, Server } from 'socket.io'
import ohlcHandler from '../market/ohlc'
import db from '../db'
import { OpUnitType } from 'dayjs'

let io: Server

export const initialize = (newIO: Server) => {
    io = newIO

    io.on('connection', (socket) => {
        socket.on('market_history', async (cb) => {
            cb(ohlcHandler.ohlcs)
        })

        socket.on('market_squash', ([value, unit]: [number, OpUnitType], cb) => {
            const squashedData = ohlcHandler.squashTransactions(value, unit)

            return cb(squashedData)
        })

        socket.on('current_user_transaction', async (user, cb) => {
            const { Transaction } = await db

            const result = await Transaction.findOne({ user, closed: false })

            return typeof cb === 'function' && cb(result)
        })

        socket.on('create_user_transaction', async (user, cb) => {
            const { Transaction } = await db

            const lastTransaction = await Transaction.findOne({}).sort({ createdAt: -1 })

            if (!lastTransaction) {
                return
            }

            await Transaction.create({
                user,
                market: 'SEK/USD',
                trade: lastTransaction.trade,
                createdAt: new Date(),
            })

            cb()
        })

        socket.on('close_user_transaction', async (user, cb) => {
            const { Transaction, User } = await db

            const lastTransaction = await Transaction.findOne({}).sort({ createdAt: -1 })
            const userTransaction = await Transaction.findOne({ user, closed: false })

            if (!lastTransaction || !userTransaction) {
                return
            }

            const lastTrade = parseFloat(lastTransaction.trade)
            const userTrade = parseFloat(userTransaction.trade)
            const profit = parseFloat((lastTrade - userTrade).toFixed(2))

            await Transaction.findOneAndUpdate({ user, closed: false }, { closed: true, closedAt: lastTrade })
            await User.findOneAndUpdate({ name: user }, { $inc: { balance: profit } })

            cb(profit)
        })
    })
}

export const sendTransaction = (transaction: any) => {
    io.emit('market_transaction', transaction)
}
export const sendOHLC = (ohlc: any) => {
    io.emit('market_ohlc', ohlc)
}
