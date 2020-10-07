import socket from '../services/socket'
import { useEffect, useState } from 'react'

export const useOHLC = () => {
    const [transactions, setTransactions] = useState<any[]>([])
    const [ohlc, setOhlc] = useState<any[]>([])

    const cleanup = () => {
        socket.off("market_transaction")
    }

    useEffect(() => {
        socket.on("market_transaction", (data: any[]) => {
            console.log(data)
            setTransactions((currentTranscations) => [...currentTranscations, data])
        })

        return cleanup
    }, [])
}