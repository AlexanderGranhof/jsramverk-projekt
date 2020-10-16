import dayjs, { OpUnitType } from 'dayjs'
import { Candle as CandleModel } from '../models/market'

export const squashCandles = (candles: any, value: number, unit: OpUnitType): Promise<CandleModel[]> => {
    return new Promise((resolve) => {
        const ohlcs = candles.reduce(
            (acc: any[], candle: any) => {
                const prev = acc.pop()

                if (prev.merged) {
                    return [...acc, prev, { open: prev.close }]
                }

                if (!prev.open) {
                    prev.open = candle.open
                }

                if (!prev.high) {
                    prev.high = candle.high
                }

                if (!prev.low) {
                    prev.low = candle.low
                }

                if (!prev.createdAt) {
                    prev.createdAt = candle.createdAt
                }

                const newOHLC = { ...prev }

                if (candle.high > newOHLC.high) {
                    newOHLC.high = candle.high
                }

                if (candle.low < newOHLC.low) {
                    newOHLC.low = candle.low
                }

                const diff = dayjs(candle.createdAt).diff(dayjs(newOHLC.createdAt), unit)

                if (diff >= value) {
                    return [
                        ...acc,
                        {
                            ...newOHLC,
                            close: candle.close,
                            merged: true,
                        },
                    ]
                }

                return [...acc, newOHLC]
            },
            [{}],
        )

        if (!ohlcs[ohlcs.length - 1].close) {
            return ohlcs.slice(0, -1)
        }

        resolve(ohlcs)
    })
}
