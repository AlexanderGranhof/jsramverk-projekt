import React, { FunctionComponent, useRef } from 'react'
import { useOHLC } from '../../hooks/market'
import { useState, useEffect } from 'react'
import Chart from '../../components/chart'
import gsap from 'gsap'
import { LoadingOutlined } from '@ant-design/icons'
import socket from '../../services/socket'
import { OpUnitType } from 'dayjs'
import { createCandles } from '../../services/candles'
import { Switch } from 'antd'

const Market: FunctionComponent = () => {
    const { ohlc } = useOHLC()
    const [domain, setDomain] = useState<[number, number]>([0, 0])
    const [loading, setLoading] = useState(false)
    const [latestTransactions, setLatestTransactions] = useState<any>([])
    const [latestOHLC, setLatestOHLC] = useState<any>([])
    const [chartScale, setChartScale] = useState<[number, OpUnitType]>([5, 'second'])
    const containerRef = useRef(null)
    const [autoScroll, setAutoScroll] = useState(true)

    const contentMargin = 50

    const width = window.innerWidth - contentMargin * 2

    useEffect(() => {
        if (!containerRef.current || loading) return

        gsap.to(containerRef.current, {
            opacity: 1,
            duration: 1,
            delay: 0.5,
        })
    }, [containerRef, loading])

    useEffect(() => {
        const values = ohlc.map((transaction) => [transaction.low, transaction.high]).flat() as number[]

        const min = Math.min(...values)
        const max = Math.max(...values)

        const domain = [isFinite(min) ? min : 0, isFinite(max) ? max : 0] as [number, number]

        setDomain(domain)
    }, [ohlc])

    useEffect(() => {
        const [value, unit] = chartScale
        const [newOHLC] = createCandles(latestTransactions, value, 'year')

        setLatestOHLC([newOHLC])
    }, [latestTransactions])

    const reset = () => {
        setLatestTransactions([])
        setLatestOHLC([])
    }

    useEffect(() => {
        socket.on('market_transaction', (data: any) => {
            setLatestTransactions((currentTransactions: any) => {
                return [...currentTransactions, data]
            })
        })
        return () => {
            socket.off('market_transaction')
        }
    }, [])

    if (loading) {
        return (
            <LoadingOutlined
                style={{ fontSize: '10em', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
            />
        )
    }

    return (
        <React.Fragment>
            <div>
                <span>Autoscroll</span>
                <Switch checked={autoScroll} onChange={setAutoScroll} />
            </div>
            <div ref={containerRef} style={{ opacity: 0 }}>
                <Chart
                    autoScroll={autoScroll}
                    width={width}
                    height={window.innerHeight / 2}
                    liveCandle={latestOHLC}
                    liveCandleLastTransaction={
                        latestTransactions.length ? latestTransactions[latestTransactions.length - 1] : null
                    }
                    candles={ohlc}
                    caliber={10}
                    domain={domain}
                    onLoad={() => setLoading(false)}
                    onScaleChange={setChartScale}
                    onSquash={reset}
                />
            </div>
        </React.Fragment>
    )
}

export default Market
