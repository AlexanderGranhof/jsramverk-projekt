import dayjs from 'dayjs'
import { Transaction } from '../../models'

type OHLC = {
    open: number
    high: number
    low: number
    close: number
    createdAt: Date
}

class OHLCHandler {
    transactions: Transaction[]
    ohlcs: OHLC[]

    constructor() {
        this.ohlcs = []
        this.transactions = []
    }

    loadPrevTransactions(prevTransactions: Transaction[]) {
        this.transactions = [...this.transactions, ...prevTransactions]
        this.processTransactions(this.transactions)
    }

    addTransaction(transaction: Transaction) {
        this.transactions.push(transaction)

        this.processTransactions(this.transactions)
    }

    lastOHLC() {
        return this.ohlcs[this.ohlcs.length - 1]
    }

    private processTransactions(transactions: Transaction[]) {
        const ohlcs = transactions.reduce(
            (acc: any[], transaction) => {
                const prev = acc.pop()

                if (prev.close) {
                    return [...acc, prev, { open: prev.close }]
                }

                if (!prev.open) {
                    prev.open = transaction.trade
                }

                if (!prev.high) {
                    prev.high = transaction.trade
                }

                if (!prev.low) {
                    prev.low = transaction.trade
                }

                if (!prev.createdAt) {
                    prev.createdAt = transaction.createdAt
                }

                const newOHLC = { ...prev }

                if (transaction.trade > newOHLC.high) {
                    newOHLC.high = transaction.trade
                }

                if (transaction.trade < newOHLC.low) {
                    newOHLC.low = transaction.trade
                }

                const diff = dayjs(transaction.createdAt).diff(dayjs(newOHLC.createdAt), 'second')

                if (diff >= 2) {
                    return [
                        ...acc,
                        {
                            ...newOHLC,
                            close: transaction.trade,
                        },
                    ]
                }

                return [...acc, newOHLC]
            },
            [{}],
        )

        // this.ohlcs.forEach((ohlc) => {
        //     const { open, high, low, close } = ohlc

        //     if (open < low || high < low || close < low) {
        //         console.log('LOW', ohlc)
        //     }

        //     if (open > high || low > high || close > high) {
        //         console.log('HIGH', ohlc)
        //     }
        // })

        if (ohlcs[ohlcs.length - 1].close) {
            this.transactions = []
            this.ohlcs = [...this.ohlcs, ...ohlcs]
        }
    }
}

export default new OHLCHandler()
