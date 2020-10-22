import socket from '../services/socket'
import { useEffect, useState } from 'react'
import { Candle } from '../models/market'

export const useOHLC = () => {
    const [ohlc, setOhlc] = useState<Candle[]>([])
    const cleanup = () => {
        socket.off('market_transaction')
    }

    useEffect(() => {
        socket.emit('market_history', (data: any) => {
            setOhlc(data)

            socket.on('market_ohlc', (data: any) => {
                setOhlc((currentOHLCs) => [...currentOHLCs, data])
            })
        })

        return cleanup
    }, [])

    return {
        ohlc,
    }
}
