import React, { FunctionComponent, useRef, useEffect, MouseEvent } from 'react'
import { Candle as CandleModel } from '../../models/market'
import * as d3 from 'd3'

type CandleProps = {
    candle: CandleModel
    caliber: number
    scaleY: d3.ScaleLinear<number, number>
    scaleBody: d3.ScaleLinear<number, number>
    index: number
    margin: number
}

const Candle: FunctionComponent<CandleProps> = (props) => {
    const { caliber, candle, scaleBody, scaleY, index, margin } = props
    const toolTipRef = useRef(null)
    const candleRef = useRef(null)

    const open = candle.open
    const high = candle.high || open
    const low = candle.low || open
    const close = candle.close || open

    useEffect(() => {
        if (!candleRef.current || !toolTipRef.current) return

        d3.select(candleRef.current)
            .on('mouseover', (event: any) => {
                const tooltip = d3
                    .select('body')
                    .append('div')
                    .attr('id', 'tooltip')
                    .attr(
                        'style',
                        `position: absolute; width: auto; padding: 0 20px; height: auto; background-color: white; left: ${
                            event.pageX + 20
                        }px; top: ${event.pageY + 20}px`,
                    )

                tooltip.append('p').text(`open: ${candle.open}`)
                tooltip.append('p').text(`high: ${candle.high}`)
                tooltip.append('p').text(`low: ${candle.low}`)
                tooltip.append('p').text(`close: ${candle.close}`)
            })
            .on('mouseout', (event: any) => {
                d3.select('#tooltip').remove()
            })
    }, [candleRef, toolTipRef])

    if (!open) {
        return null
    }

    const x = (caliber + margin) * index + caliber / 2

    const color = open > close ? '#f5222d' : '#52c41a'

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
                y={scaleY(Math.max(open, close))}
                width={caliber}
                height={scaleBody(Math.max(open, close) - Math.min(open, close))}
                fill={color}
            />
        </g>
    )
}

export default Candle
