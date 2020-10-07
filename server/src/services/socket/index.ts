import SocketIO from 'socket.io'
import chalk from 'chalk'

export const log = (...args: any[]) => console.log(chalk.yellow(`[SOCKET]:`), ...args)

export default (server: Express.Application) => {
    const io = SocketIO(server)

    io.on('connection', (socket) => {
        log('Client has connected')
    })
}
