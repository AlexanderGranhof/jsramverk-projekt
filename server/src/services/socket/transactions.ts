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
    })
}

export const sendTransaction = (transaction: any) => {
    io.emit('market_transaction', transaction)
}
export const sendOHLC = (ohlc: any) => {
    io.emit('market_ohlc', ohlc)
}
