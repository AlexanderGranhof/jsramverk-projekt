import { generateTransaction } from './transaction'
import * as transactions from '../socket/transactions'

import chalk from 'chalk'
import db from '../db'

export const log = (...args: any[]) => console.log(chalk.yellow(`[MARKET]:`), ...args)

export async function start(transactionInterval = 2000) {
    const { Transaction } = await db
    const lastTransaction = await Transaction.findOne().select(['trade']).sort({ createdAt: -1 }).limit(1)

    if (lastTransaction === null) {
        console.log(chalk.yellow('Found no previous transactions'))
    }

    let price: number

    setInterval(() => {
        price = generateTransaction(price)

        log(`new market price '${price}'`)

        const document = new Transaction({ trade: price, market: 'USD/SEK' })

        transactions.send(document)
    }, transactionInterval)
}
