import React, { FunctionComponent, useRef, useContext } from 'react'
import { useOHLC } from '../../hooks/market'
import { useState, useEffect } from 'react'
import Chart from '../../components/chart'
import gsap from 'gsap'
import { LoadingOutlined } from '@ant-design/icons'
import socket from '../../services/socket'
import { OpUnitType } from 'dayjs'
import { createCandles } from '../../services/candles'
import { Switch, Button, message, Select } from 'antd'
import styles from './market.module.scss'
import { userContext, UserContext } from '../../context/user'
import { Option } from 'antd/lib/mentions'

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

const marketSubtitles: Record<string, string> = {
    jscphpc: 'Trading JavaScript coin for PHP coin',
    jarccsc: 'Trading Java coin for C# coin',
    pyccppc: 'Trading Python coin for C++ coin',
}

const Market: FunctionComponent = () => {
    const { ohlc, market, setMarket } = useOHLC()
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
        const values = [...ohlc, ...latestOHLC]
            .map((transaction) => [transaction.low, transaction.high])
            .flat() as number[]

        const min = Math.min(...values)
        const max = Math.max(...values)

        const domain = [isFinite(min) ? min : 0, isFinite(max) ? max : 0] as [number, number]

        setDomain(domain)
    }, [ohlc, market])

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
        socket.emit('current_user_transaction', market, userState.name, (data: any) => {
            data && setUserTransaction(parseFloat(data.trade))
        })
    }, [market])

    useEffect(() => {
        if (userTransaction === undefined) return

        function handleProfit(data: any) {
            if (marketNamesToMarket[data.market] !== market) {
                return
            }

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
        socket.emit('create_user_transaction', market, userState.name, () => {
            socket.emit('current_user_transaction', market, userState.name, (data: any) => {
                data && setUserTransaction(parseFloat(data.trade))
            })

            setLoading({ ...loading, buy: false })
        })
    }

    const handleSell = () => {
        setLoading({ ...loading, sell: true })

        socket.emit('close_user_transaction', market, userState.name, (actualProfit: number) => {
            setLoading({ ...loading, sell: false })

            message.success(`Successfully closed trade with profit of ${formatDollar(actualProfit)}`)
            setUserState({ ...userState, balance: userState.balance + actualProfit })

            setUserTransaction(undefined)
            setProfit(undefined)
        })
    }

    useEffect(() => {
        setLatestTransactions([])
        console.log(ohlc[ohlc.length - 1])
    }, [ohlc])

    useEffect(() => {
        setLatestTransactions([])

        const handleTransaction = (data: any) => {
            if (marketNamesToMarket[data.market] !== market) {
                return
            }

            setLatestTransactions((currentTransactions: any) => {
                return [...currentTransactions, data]
            })
        }

        socket.on('market_transaction', handleTransaction)

        return () => {
            socket.off('market_transaction', handleTransaction)
        }
    }, [market])

    // if (loading) {
    //     return (
    //         <LoadingOutlined
    //             style={{ fontSize: '10em', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
    //         />
    //     )
    // }

    const [domainA, domainB] = domain

    return (
        <React.Fragment>
            <div className={styles['header']}>
                <h1>{marketToMarketNames[market]}</h1>
                <h2>{marketSubtitles[market]}</h2>
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
                    <div className={styles['select-market']}>
                        <p>Select a market to trade</p>
                        <Select
                            defaultValue={Object.values(marketToMarketNames)[0]}
                            onChange={(name) => setMarket(marketNamesToMarket[name])}
                        >
                            {Object.values(marketToMarketNames).map((name) => {
                                return (
                                    <Option key={name} value={name}>
                                        {name}
                                    </Option>
                                )
                            })}
                        </Select>
                    </div>
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
            <div ref={containerRef} className={styles['chart']}>
                {!(domainA !== 0 && domainB !== 0) ? (
                    <LoadingOutlined
                        style={{
                            fontSize: '10em',
                            position: 'absolute',
                            marginTop: '50px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }}
                    />
                ) : (
                    <Chart
                        market={market}
                        autoScroll={autoScroll}
                        width={width}
                        height={window.innerHeight / 2 - 100}
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
                )}
            </div>
        </React.Fragment>
    )
}

export default Market
