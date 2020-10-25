import React, { FunctionComponent, useContext, useState, useEffect, useRef } from 'react'
import styles from './profile.module.scss'
import { userContext, UserContext } from '../../context/user'
import { Button, message } from 'antd'
import gsap from 'gsap'
import * as user from '../../services/user'

const Profile: FunctionComponent = () => {
    const [userState, setUserState] = useContext<UserContext>(userContext)
    const containerRef = useRef(null)

    const handleAddBalance = async () => {
        try {
            const response = await user.addBalance(100)
            const data = await response.json()

            setUserState({
                ...userState,
                balance: data.balance,
            })
            message.success('Added $100 to your account')
        } catch (err) {
            message.error('Unable to add balance to user account')
        }
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    })

    useEffect(() => {
        if (!containerRef.current) return

        gsap.from(containerRef.current, { y: 50, opacity: 0, visibility: 'visible' })
        gsap.to(containerRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
            visibility: 'visible',
        })
    }, [containerRef])

    return (
        <div className={styles['profile']} style={{ visibility: 'hidden' }}>
            <div ref={containerRef} className={styles['profile-inner']}>
                <h1 className={styles['name']}>{userState.name}</h1>
                <div className={styles['balance-container']}>
                    <p>Balance</p>
                    <h1 id="balance" className={styles['current-balance']}>
                        {formatter.format(userState.balance)}
                    </h1>
                    <Button onClick={handleAddBalance} type="primary">
                        Add balance
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Profile
