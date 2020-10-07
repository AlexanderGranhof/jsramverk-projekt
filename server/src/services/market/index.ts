import { generateTransaction } from './transaction'

import chalk from 'chalk'
import db from '../db'

export async function start(transactionInterval = 250) {
    const { Transaction } = await db
    const lastTransaction = await Transaction.findOne().select(['trade']).sort({ createdAt: -1 }).limit(1)

    if (lastTransaction === null) {
        console.log(chalk.yellow('Found no previous transactions'))
    }

    let price: number

    setInterval(() => {
        price = generateTransaction(price)

        // new Transaction({ trade: price, market: 'USD/SEK' }).save()
    }, transactionInterval)
}
