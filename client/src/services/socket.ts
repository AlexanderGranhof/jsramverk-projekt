import SocketIO from 'socket.io-client'
import { host } from './fetch'

export default SocketIO(host)
