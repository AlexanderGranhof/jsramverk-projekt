import { Socket, Server } from 'socket.io'

let io: Server

export const initialize = (newIO: Server) => {
    io = newIO
}

export const send = (transaction: any) => {
    io.emit('market_transaction', transaction)
}
