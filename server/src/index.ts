import * as market from './services/market'
import express from 'express'
import chalk from 'chalk'
import sockets from './services/socket'

const port = process.env.PORT || 3000

const app = express()

market.start()

const server = app.listen(port, () => {
    console.log(chalk.yellow('[INDEX]:'), `Server is listening on ${port}`)
})

sockets(server)
