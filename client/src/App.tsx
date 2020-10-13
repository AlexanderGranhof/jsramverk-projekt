import React, { useEffect, useState } from 'react'
import './App.css'
import { useOHLC } from './hooks/market'
import Chart from './components/chart'

function App() {
    const { ohlc } = useOHLC()
    const [domain, setDomain] = useState<[number, number]>([0, 0])

    useEffect(() => {
        const values = ohlc.map((transaction) => [transaction.low, transaction.high]).flat() as number[]

        const min = Math.min(...values)
        const max = Math.max(...values)

        const domain = [isFinite(min) ? min : 0, isFinite(max) ? max : 0] as [number, number]

        setDomain(domain)
    }, [ohlc])

    return <Chart width={window.innerWidth} height={window.innerHeight} candles={ohlc} caliber={10} domain={domain} />
}

export default App
