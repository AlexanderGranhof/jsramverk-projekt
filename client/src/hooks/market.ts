import socket from '../services/socket'
import { useEffect, useState } from 'react'
import { Candle } from '../models/market'

const marketNamesToMarket: Record<string, string> = {
    'JSC/PHPC': 'jscphpc',
    'JARC/CSC': 'jarccsc',
    'PYC/CPPC': 'pyccppc',
}

const marketToMarketNames: Record<string, string> = {
    jscphpc: 'JSC/PHPC',
    jarccsc: 'JARC/CSC',
    pyccppc: 'PYC/CPPC',
}

export const useOHLC = () => {
    const [ohlc, setOhlc] = useState<Candle[]>([])
    const [market, setMarket] = useState('jscphpc')

    const cleanup = () => {
        socket.off('market_ohlc')
    }

    useEffect(() => {
        socket.emit('market_history', market, (data: any) => {
            setOhlc(data)

            socket.on('market_ohlc', (data: any) => {
                if (marketNamesToMarket[data.market] !== market) {
                    return
                }

                setOhlc((currentOHLCs) => [...currentOHLCs, data])
            })
        })

        return cleanup
    }, [market])

    return {
        ohlc,
        market,
        setMarket,
    }
}
