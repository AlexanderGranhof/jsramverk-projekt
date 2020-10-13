import { OpUnitType } from 'dayjs'

export interface Transaction {
    trade: string
    market: string
    user: string
    createdAt: Date
}

export type OHLCRange = {
    value: number
    unit: OpUnitType
}

export type Candle = {
    open: number
    high: number
    low: number
    close: number
    createdAt: Date
}
