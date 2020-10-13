import { Socket, Server } from 'socket.io'
import ohlcHandler from '../market/ohlc'
import db from '../db'

let io: Server

export const initialize = (newIO: Server) => {
    io = newIO

    io.on('connection', (socket) => {
        socket.on('market_history', async (cb) => {
            cb(ohlcHandler.ohlcs)
        })
    })
}

export const send = (transaction: any) => {
    io.emit('market_transaction', transaction)
}
