import React, { FunctionComponent, useEffect, useRef } from 'react'
import styles from './home.module.scss'
import gsap from 'gsap'

const Home: FunctionComponent = () => {
    const containerRef = useRef(null)

    useEffect(() => {
        if (!containerRef.current) return

        gsap.from(containerRef.current, { opacity: 0, y: 75 })
        gsap.to(containerRef.current, {
            opacity: 1,
            y: 50,
            duration: 2,
            delay: 0.2,
            ease: 'power3.out',
        })
    }, [containerRef])

    return (
        <div style={{ opacity: 0 }} className={styles['container']} ref={containerRef}>
            <header className={styles['header']}>
                <img src="/logo.svg" alt="" />
                <h1>TAGALONG</h1>
                <p>Commision free and easy to use trading platform</p>
            </header>
        </div>
    )
}

export default Home
