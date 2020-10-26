import React, { FunctionComponent, useRef, useEffect, MouseEvent } from 'react'
import { Candle as CandleModel } from '../../models/market'
import * as d3 from 'd3'
import { domain } from 'process'

type CandleProps = {
    candle: CandleModel
    caliber: number
    scaleY: d3.ScaleLinear<number, number>
    scaleBody: d3.ScaleLinear<number, number>
    index: number
    margin: number
    lastTransaction?: any
}

const Candle: FunctionComponent<CandleProps> = (props) => {
    const { caliber, candle, scaleBody, scaleY, index, margin, lastTransaction } = props
    const toolTipRef = useRef(null)
    const candleRef = useRef(null)

    const open = candle.open
    const high = candle.high || open
    const low = candle.low || open
    const close = candle.close || open

    if (!open) {
        return null
    }

    const x = (caliber + margin) * index + caliber / 2

    let color = open > close ? '#f5222d' : '#52c41a'

    let rectY = scaleY(Math.max(open, close))
    let rectHeight = scaleBody(Math.max(open, close) - Math.min(open, close))

    // If we are given a last transaction, we are a live candle
    if (lastTransaction) {
        rectY = scaleY(Math.max(open, lastTransaction.trade))
        rectHeight = scaleBody(Math.max(open, lastTransaction.trade) - Math.min(open, lastTransaction.trade))
        color = open > lastTransaction.trade ? '#f5222d' : '#52c41a'
    }

    // console.log(index, (caliber + margin) * index, rectY, open, close)

    return (
        <g>
            <div ref={toolTipRef}>im a tooltip</div>
            <line
                onClick={() => console.log(candle)}
                x1={x}
                x2={x}
                y1={scaleY(high)}
                y2={scaleY(low)}
                stroke={color}
                strokeWidth={1}
            />
            <rect
                ref={candleRef}
                onClick={() => console.log(candle)}
                x={(caliber + margin) * index}
                y={rectY}
                width={caliber}
                height={rectHeight}
                fill={color}
            />
        </g>
    )
}

export default Candle
