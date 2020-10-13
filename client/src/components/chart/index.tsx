import React, { FunctionComponent, useRef, useEffect, useState } from 'react'
import { Candle as CandleModel } from '../../models/market'
import Candle from './candle'
import * as d3 from 'd3'
import { OpUnitType } from 'dayjs'
import { squashCandles } from '../../services/candles'

type ChartProps = {
    candles: CandleModel[]
    caliber: number
    width: number
    height: number
    domain: [number, number]
    autoScroll?: boolean
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
    const { candles, caliber, domain } = props
    const margin = {
        top: 100,
        left: 100,
        right: 100,
        bottom: 100,
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
    const [zoomState, setZoomState] = useState<d3.ZoomTransform>()
    const [scaleBody, setScaleBody] = useState<d3.ScaleLinear<number, number>>(() => initScaleBody)
    const [scaleY, setScaleY] = useState<d3.ScaleLinear<number, number>>(() => initScaleY)
    const [squashedCandles, setSquashedCandles] = useState<CandleModel[]>([])
    const [panTransform, setPanTransform] = useState(0)
    const [candleScale, setCandleScale] = useState<[number, OpUnitType]>([5, 'second'])

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
        const lastSquash = squashedCandles[squashedCandles.length - 1]
        let newCandles: CandleModel[] = []

        if (lastSquash) {
            let sliceIndex = 0

            for (let i = candles.length - 1; i >= 0; i--) {
                if (candles[i].createdAt === lastSquash.createdAt) {
                    sliceIndex = i
                    break
                }
            }

            newCandles = candles.slice(sliceIndex)
        }

        if (newCandles.length) {
            return setSquashedCandles([...squashedCandles.slice(0, -1), ...squashCandles(newCandles, ...candleScale)])
        }

        setSquashedCandles(squashCandles(candles, ...candleScale))
    }, [candles])

    useEffect(() => {
        if (!yAxisRef.current) return
        d3.select(yAxisRef.current).attr('color', '#262626').attr('class', 'yAxis').call(yAxis)
    }, [candles, yAxisRef])

    useEffect(() => {
        if (!yAxisRef.current || !selection) return
    }, [candles, yAxisRef])

    const chartWidth = (caliber + candleMargin) * squashedCandles.length

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

            setZoomState(state)
        })

    selection?.call(zoomBehaviour)

    const transform = autoScroll ? `translate(${panTransform}, 0)` : zoomState ? `translate(${zoomState.x}, 0)` : ''

    useEffect(() => {
        setPanTransform(width - (caliber + candleMargin) * squashedCandles.length)
    }, [candles])

    return (
        <svg
            style={{ border: '1px solid red' }}
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
                </g>
            </g>
        </svg>
    )
}

export default Chart
