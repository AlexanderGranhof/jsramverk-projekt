import React, { FunctionComponent, useRef } from 'react'
import { useOHLC } from '../../hooks/market'
import { useState, useEffect } from 'react'
import Chart from '../../components/chart'
import gsap from 'gsap'
import { LoadingOutlined } from '@ant-design/icons'

const Market: FunctionComponent = () => {
    const { ohlc } = useOHLC()
    const [domain, setDomain] = useState<[number, number]>([0, 0])
    const [loading, setLoading] = useState(true)
    const containerRef = useRef(null)

    const contentMargin = 50

    const width = window.innerWidth - contentMargin * 2

    useEffect(() => {
        if (!containerRef.current) return

        gsap.to(containerRef.current, {
            opacity: 1,
            duration: 1,
            delay: 3,
            onStart: () => setLoading(false),
        })
    }, [containerRef])

    useEffect(() => {
        const values = ohlc.map((transaction) => [transaction.low, transaction.high]).flat() as number[]

        const min = Math.min(...values)
        const max = Math.max(...values)

        const domain = [isFinite(min) ? min : 0, isFinite(max) ? max : 0] as [number, number]

        setDomain(domain)
    }, [ohlc])

    return (
        <React.Fragment>
            {loading && (
                <LoadingOutlined
                    style={{ fontSize: '10em', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
                />
            )}
            <div ref={containerRef} style={{ opacity: 0 }}>
                <Chart
                    autoScroll={true}
                    width={width}
                    height={window.innerHeight / 2}
                    candles={ohlc}
                    caliber={10}
                    domain={domain}
                />
            </div>
        </React.Fragment>
    )
}

export default Market
