import { generateTransaction } from './transaction'
import * as transactions from '../socket/transactions'
import ohlcHandler from './ohlc'
import chalk from 'chalk'
import db from '../db'

export const log = (...args: any[]) => console.log(chalk.yellow(`[MARKET]:`), ...args)

export async function start(transactionInterval = 100) {
    const { Transaction } = await db
    const lastTransaction = await Transaction.findOne().select(['trade']).sort({ createdAt: -1 }).limit(1)
    const allTransactions = await Transaction.find()

    ohlcHandler.loadPrevTransactions(allTransactions)

    if (lastTransaction === null) {
        console.log(chalk.yellow('Found no previous transactions'))
    }

    let price: number = lastTransaction ? parseFloat(lastTransaction.trade) : 100
    let recentOHLC = 0

    setInterval(() => {
        price = generateTransaction(price)

        // log(`new market price '${price}'`)

        const document = new Transaction({ trade: price, market: 'USD/SEK' })

        ohlcHandler.addTransaction(document)

        const ohlc = ohlcHandler.lastOHLC() as any

        if (ohlc && ohlc.createdAt.getTime() !== recentOHLC) {
            transactions.sendOHLC(ohlc)
            recentOHLC = ohlc.createdAt.getTime()
        }

        transactions.sendTransaction({ trade: price, market: 'USD/SEK', createdAt: document.createdAt })

        // document.save()
    }, transactionInterval)
}
