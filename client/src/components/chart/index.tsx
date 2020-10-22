import React, { FunctionComponent, useRef, useEffect, useState } from 'react'
import { Candle as CandleModel } from '../../models/market'
import Candle from './candle'
import * as d3 from 'd3'
import { OpUnitType } from 'dayjs'
import socket from '../../services/socket'

type ChartProps = {
    candles: CandleModel[]
    caliber: number
    width: number
    height: number
    domain: [number, number]
    autoScroll?: boolean
    onLoad?: () => void
    onScaleChange?: (scale: [number, OpUnitType]) => void
    liveCandle?: any
    onSquash?: () => void
    liveCandleLastTransaction?: any | null
}

type CandleProps = {
    candles: CandleModel[]
    caliber: number
    scaleY: d3.ScaleLinear<number, number>
    scaleBody: d3.ScaleLinear<number, number>
    margin: number
}

const candleScaleIncrements: [number, OpUnitType][] = [
    [5, 'second'],
    [1, 'minute'],
    [10, 'minute'],
    [1, 'hour'],
    [12, 'hour'],
    [1, 'day'],
    [1, 'week'],
    [1, 'month'],
]

const CandleGroup = React.memo<CandleProps>((props) => {
    const { caliber, margin, candles, scaleBody, scaleY } = props

    return (
        <React.Fragment>
            {candles.map((candle, index) => {
                return <Candle key={index} {...{ candle, caliber, scaleY, scaleBody, index, margin }} />
            })}
        </React.Fragment>
    )
})

CandleGroup.displayName = 'CandleGroup'

const Chart: FunctionComponent<ChartProps> = (props) => {
    const { candles, caliber, domain, liveCandle } = props
    const margin = {
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
    }

    const autoScroll = props.autoScroll ?? true

    const minAxisMargin = 30
    const candleMargin = 4

    const width = props.width - margin.left - margin.right
    const height = props.height - margin.top - margin.bottom

    const [min, max] = domain

    const initScaleBody = d3
        .scaleLinear()
        .domain([0, max - min])
        .range([0, height])

    const initScaleY = d3.scaleLinear().domain(domain).range([height, 0])

    const selectionRef = useRef<SVGSVGElement>(null)
    const yAxisRef = useRef<SVGGElement>(null)
    const [selection, setSelection] = useState<d3.Selection<SVGSVGElement, unknown, null, undefined>>()
    const [zoomState, setZoomState] = useState<number>(0)
    const [scaleBody, setScaleBody] = useState<d3.ScaleLinear<number, number>>(() => initScaleBody)
    const [scaleY, setScaleY] = useState<d3.ScaleLinear<number, number>>(() => initScaleY)
    const [squashedCandles, setSquashedCandles] = useState<CandleModel[]>([])
    const [panTransform, setPanTransform] = useState(0)
    const [candleScale, setCandleScale] = useState<[number, OpUnitType]>([5, 'second'])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        props.onLoad && props.onLoad()
    }, [loading])

    useEffect(() => {
        props.onScaleChange && props.onScaleChange(candleScale)
    }, [candleScale])

    const yAxis = d3.axisLeft(scaleY).ticks(5).tickSize(-width)

    const incrementCandleScale = () => {
        const currentIndex = candleScaleIncrements.findIndex(([value, unit]) => {
            const [currentValue, currentUnit] = candleScale

            return currentValue === value && currentUnit === unit
        })

        if (currentIndex + 1 >= candleScaleIncrements.length - 1) {
            return
        }

        setCandleScale(candleScaleIncrements[currentIndex + 1])
    }

    const decrementCandleScale = () => {
        const currentIndex = candleScaleIncrements.findIndex(([value, unit]) => {
            const [currentValue, currentUnit] = candleScale

            return currentValue === value && currentUnit === unit
        })

        if (currentIndex - 1 < 0) {
            return
        }

        setCandleScale(candleScaleIncrements[currentIndex - 1])
    }

    useEffect(() => {
        socket.emit('market_squash', candleScale, (data: any) => {
            setSquashedCandles((prevSquashed) => {
                if (data.length > prevSquashed.length) {
                    props.onSquash && props.onSquash()
                }

                return data
            })
            loading && setLoading(false)
        })
    }, [candles])

    useEffect(() => {
        if (!yAxisRef.current) return
        d3.select(yAxisRef.current).attr('color', '#262626').attr('class', 'yAxis').call(yAxis)
    }, [candles, yAxisRef])

    useEffect(() => {
        if (!yAxisRef.current || !selection) return
    }, [candles, yAxisRef])

    const chartWidth = (caliber + candleMargin) * (squashedCandles.length + 1)

    useEffect(() => {
        setScaleBody(() => {
            return d3
                .scaleLinear()
                .domain([0, max - min])
                .range([0, height])
        })
    }, [max, min, height])

    useEffect(() => {
        setScaleY(() => {
            return d3.scaleLinear().domain(domain).range([height, 0])
        })
    }, [domain, height])

    useEffect(() => {
        if (!selectionRef.current) return

        const newSelection = d3.select<SVGSVGElement, unknown>(selectionRef.current)

        setSelection(newSelection)
    }, [selectionRef])

    const zoomBehaviour = d3
        .zoom<SVGSVGElement, unknown>()
        .translateExtent([
            [0, 0],
            [chartWidth, 0],
        ])
        .on('zoom', (d: any) => {
            const node = selection?.node()

            if (d.sourceEvent instanceof WheelEvent) {
                const direction = d.sourceEvent.deltaY > 0

                direction ? decrementCandleScale() : incrementCandleScale()
                return
            }

            if (!node) return

            const state = d3.zoomTransform(node)

            setZoomState(state.x)
        })

    selection?.call(zoomBehaviour)

    useEffect(() => {
        if (autoScroll === false) {
            setZoomState(panTransform)
        }
    }, [autoScroll])

    let transform = ``

    if (autoScroll) {
        if (chartWidth > width) {
            transform = `translate(${panTransform}, 0)`
        } else {
            transform = `translate(${panTransform + minAxisMargin}, 0)`
        }
    } else if (zoomState) {
        transform = `translate(${zoomState}, 0)`
    }

    useEffect(() => {
        if (chartWidth > width) {
            setPanTransform(width - chartWidth)
        }
    }, [squashedCandles, candles])

    return (
        <svg
            style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
            ref={selectionRef}
            transform={`translate(${margin.left}, ${margin.top})`}
            width={width}
            height={height}
        >
            <defs>
                <clipPath id="clip">
                    <rect transform={`translate(${minAxisMargin}, 0)`} width={width - minAxisMargin} height={height} />
                </clipPath>
            </defs>
            <g ref={yAxisRef} transform={`translate(${minAxisMargin}, 0)`}></g>
            <g clipPath="url(#clip)">
                <g transform={transform}>
                    <CandleGroup
                        caliber={caliber}
                        candles={squashedCandles.length ? squashedCandles : candles}
                        margin={candleMargin}
                        scaleBody={scaleBody}
                        scaleY={scaleY}
                    />
                    {liveCandle[0] && (
                        <Candle
                            key="live"
                            {...{
                                candle: liveCandle[0],
                                caliber,
                                scaleY,
                                scaleBody,
                                index: squashedCandles.length,
                                margin: candleMargin,
                                lastTransaction: props.liveCandleLastTransaction,
                            }}
                        />
                    )}
                </g>
            </g>
        </svg>
    )
}

export default Chart
