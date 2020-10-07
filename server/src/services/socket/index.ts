import SocketIO from 'socket.io'
import chalk from 'chalk'
import * as transactions from './transactions'

export const log = (...args: any[]) => console.log(chalk.blueBright(`[SOCKET]:`), ...args)

export default (server: Express.Application) => {
    const io = SocketIO(server)
    log('Socket server is running')

    transactions.initialize(io)

    io.on('connection', (socket) => {
        log('Client has connected')
    })
}
