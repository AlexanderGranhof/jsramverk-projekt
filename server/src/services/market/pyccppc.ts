import { createInstance } from './transaction'
import * as transactions from '../socket/transactions'
import ohlcs from './ohlc'
import chalk from 'chalk'
import db from '../db'

const ohlcHandler = ohlcs.PyCCppc

const startX = parseInt((Math.random() * 10000).toFixed(0))
const startY = parseInt((Math.random() * 10000).toFixed(0))

const generateTransaction = createInstance(Math.random.toString(), startX, startY)

export const log = (...args: any[]) => console.log(chalk.yellow(`[MARKET:PyCCppc]:`), ...args)

export async function start(transactionInterval = 250) {
    const { Transaction } = await db
    const lastTransaction = await Transaction.findOne({ market: 'PYC/CPPC' })
        .select(['trade'])
        .sort({ createdAt: -1 })
        .limit(1)
    const allTransactions = await Transaction.find({ market: 'PYC/CPPC' })

    ohlcHandler.loadPrevTransactions(allTransactions)

    if (lastTransaction === null) {
        console.log(chalk.yellow('Found no previous transactions'))
    }

    let price: number = lastTransaction ? parseFloat(lastTransaction.trade) : 100
    let recentOHLC = 0

    setInterval(() => {
        price = generateTransaction(price)

        // log(`new market price '${price}'`)

        const document = new Transaction({ trade: price, market: 'PYC/CPPC' })

        ohlcHandler.addTransaction(document)

        const ohlc = ohlcHandler.lastOHLC() as any

        if (ohlc && ohlc.createdAt.getTime() !== recentOHLC) {
            transactions.sendOHLC(ohlc, 'PYC/CPPC')
            recentOHLC = ohlc.createdAt.getTime()
        }

        transactions.sendTransaction({ trade: price, market: 'PYC/CPPC', createdAt: document.createdAt })

        document.save()
    }, transactionInterval)
}
