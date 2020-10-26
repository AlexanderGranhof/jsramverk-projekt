import React, { FunctionComponent, useRef, useContext } from 'react'
import { useOHLC } from '../../hooks/market'
import { useState, useEffect } from 'react'
import Chart from '../../components/chart'
import gsap from 'gsap'
// import { LoadingOutlined } from '@ant-design/icons'
import socket from '../../services/socket'
import { OpUnitType } from 'dayjs'
import { createCandles } from '../../services/candles'
import { Switch, Button, message } from 'antd'
import styles from './market.module.scss'
import { userContext, UserContext } from '../../context/user'

const Market: FunctionComponent = () => {
    const { ohlc } = useOHLC()
    const [domain, setDomain] = useState<[number, number]>([0, 0])
    const [latestTransactions, setLatestTransactions] = useState<any>([])
    const [latestOHLC, setLatestOHLC] = useState<any>([])
    const [chartScale, setChartScale] = useState<[number, OpUnitType]>([5, 'second'])
    const containerRef = useRef(null)
    const [autoScroll, setAutoScroll] = useState(true)
    const [userState, setUserState] = useContext<UserContext>(userContext)
    const [profit, setProfit] = useState<number>()
    const [userTransaction, setUserTransaction] = useState<number>()
    const [latestPrice, setLatestPrice] = useState<number>(0)

    const [loading, setLoading] = useState({
        sell: false,
        buy: false,
    })

    const contentMargin = window.innerWidth <= 600 ? 40 : 75

    const width = window.innerWidth - contentMargin * 2
    // const width = '100%'

    useEffect(() => {
        if (!containerRef.current) return

        gsap.to(containerRef.current, {
            opacity: 1,
            duration: 1,
            delay: 0.5,
        })
    }, [containerRef])

    const formatDollar = (number: number) => {
        return `${number < 0 ? '-' : ''}$${Math.abs(number)}`
    }

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
        socket.emit('current_user_transaction', userState.name, (data: any) => {
            data && setUserTransaction(parseFloat(data.trade))
        })
    }, [])

    useEffect(() => {
        if (!userTransaction) return

        function handleProfit(data: any) {
            userTransaction && setProfit(data.trade - userTransaction)
        }

        socket.on('market_transaction', handleProfit)

        return () => {
            socket.off('market_transaction', handleProfit)
        }
    }, [userTransaction])

    useEffect(() => {
        const latest = latestTransactions.length
            ? latestTransactions[latestTransactions.length - 1].trade.toFixed(2)
            : ''

        if (latest !== '') {
            setLatestPrice(latest)
        }
    }, [latestTransactions])

    const handleBuy = () => {
        if (latestPrice > userState.balance) {
            return message.error('Insufficient funds')
        }

        setLoading({ ...loading, buy: true })
        socket.emit('create_user_transaction', userState.name, () => {
            socket.emit('current_user_transaction', userState.name, (data: any) => {
                data && setUserTransaction(parseFloat(data.trade))
            })

            setLoading({ ...loading, buy: false })
        })
    }

    const handleSell = () => {
        setLoading({ ...loading, sell: true })

        socket.emit('close_user_transaction', userState.name, (profit: number) => {
            setLoading({ ...loading, sell: false })

            setUserState({ ...userState, balance: userState.balance + profit })

            setUserTransaction(undefined)
            setProfit(undefined)

            message.success(`Successfully closed trade with profit of ${formatDollar(profit)}`)
        })
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

    // if (loading) {
    //     return (
    //         <LoadingOutlined
    //             style={{ fontSize: '10em', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
    //         />
    //     )
    // }

    return (
        <React.Fragment>
            <div className={styles['header']}>
                <h1>JSC/PHPC</h1>
                <h2>Trading JavaScript coin for PHP coin</h2>
            </div>
            <div className={styles['user-controls']}>
                <div className={styles['controls']}>
                    <div className={styles['auto-scroll']}>
                        <span>Autoscroll</span>
                        <Switch checked={autoScroll} onChange={setAutoScroll} />
                    </div>
                    <Button
                        className={styles['make-transaction']}
                        size="large"
                        type="primary"
                        loading={userTransaction ? loading.sell : loading.buy}
                        onClick={userTransaction ? handleSell : handleBuy}
                    >
                        {userTransaction
                            ? `SELL AT ${formatDollar(latestPrice)}`
                            : `BUY AT: ${formatDollar(latestPrice)}`}
                    </Button>
                </div>
                <div style={{ visibility: userTransaction ? 'visible' : 'hidden' }} className={styles['metrics']}>
                    <h1>Bought at: {userTransaction && formatDollar(parseFloat(userTransaction?.toFixed(2)))}</h1>
                    <h1
                        className={[
                            styles['balance'],
                            profit ? (profit > 0 ? styles['profit'] : styles['loss']) : '',
                        ].join(' ')}
                    >
                        Profit: {profit && formatDollar(parseFloat(profit.toFixed(2)))}
                    </h1>
                </div>
            </div>
            <span style={{ width: '100%', textAlign: 'center', opacity: 0.5, display: 'block' }}>
                Market OHLCs at 5 second interval
            </span>
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
                    onScaleChange={setChartScale}
                    onSquash={reset}
                />
            </div>
        </React.Fragment>
    )
}

export default Market
