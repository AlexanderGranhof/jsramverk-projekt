import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

// import * as market from './services/market'
import express from 'express'
import chalk from 'chalk'
import sockets from './services/socket'
import cookieParser from 'cookie-parser'

import userRoute from './api/routes/user'

const port = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.use('/user', userRoute)

const server = app.listen(port, () => {
    console.log(chalk.green('[INDEX]:'), `Server is listening on ${port}`)
    // market.start()
})

sockets(server)
