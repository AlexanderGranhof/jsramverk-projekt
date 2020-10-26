import { Socket, Server } from 'socket.io'
import allOhlcs from '../market/ohlc'
import db from '../db'
import { OpUnitType } from 'dayjs'

let io: Server

const ohlcHandlers = {
    jscphpc: allOhlcs.JscPhpc,
    jarccsc: allOhlcs.JarCCsC,
    pyccppc: allOhlcs.PyCCppc,
}

const marketToMarketNames: Record<string, string> = {
    jscphpc: 'JSC/PHPC',
    jarccsc: 'JARC/CSC',
    pyccppc: 'PYC/CPPC',
}

type OlhcHanderTypes = keyof typeof ohlcHandlers

export const initialize = (newIO: Server) => {
    io = newIO

    io.on('connection', (socket) => {
        socket.on('market_history', async (market: OlhcHanderTypes, cb) => {
            const marketHandler = ohlcHandlers[market]

            if (!marketHandler) {
                return console.error(`Invalid market ${market}`)
            }

            cb(marketHandler.ohlcs)
        })

        socket.on('market_squash', (market: OlhcHanderTypes, [value, unit]: [number, OpUnitType], cb) => {
            const marketHandler = ohlcHandlers[market]

            if (!marketHandler) {
                return console.error(`Invalid market ${market}`)
            }

            const squashedData = marketHandler.squashTransactions(value, unit)

            return cb(squashedData)
        })

        socket.on('current_user_transaction', async (market, user, cb) => {
            const { Transaction } = await db

            if (!market) {
                return console.error(`Invalid market ${market}`)
            }

            const result = await Transaction.findOne({ user, market: marketToMarketNames[market], closed: false })

            return typeof cb === 'function' && cb(result)
        })

        socket.on('create_user_transaction', async (market, user, cb) => {
            const { Transaction } = await db

            const lastTransaction = await Transaction.findOne({ market: marketToMarketNames[market] }).sort({
                createdAt: -1,
            })

            if (!lastTransaction) {
                return
            }

            if (!market) {
                return console.error(`Invalid market ${market}`)
            }

            await Transaction.create({
                user,
                market: marketToMarketNames[market],
                trade: lastTransaction.trade,
                createdAt: new Date(),
            })

            cb()
        })

        socket.on('close_user_transaction', async (market, user, cb) => {
            const { Transaction, User } = await db

            const lastTransaction = await Transaction.findOne({
                market: marketToMarketNames[market],
                user: { $ne: user },
            }).sort({ createdAt: -1 })

            const userTransaction = await Transaction.findOne({
                market: marketToMarketNames[market],
                user,
                closed: false,
            })

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
export const sendOHLC = (ohlc: any, market: string) => {
    io.emit('market_ohlc', { ...ohlc, market })
}
