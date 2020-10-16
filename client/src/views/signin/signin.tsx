import React, { useRef, useEffect, FunctionComponent, useContext } from 'react'
import { Form, Input, Button, message } from 'antd'
import styles from './signin.module.scss'
import gsap from 'gsap'
import * as user from '../../services/user'
import { Link, RouteComponentProps } from 'react-router-dom'
import { userContext, UserContext } from '../../context/user'

type FormFields = {
    name: string
    password: string
}

const Signin: FunctionComponent<RouteComponentProps> = (props) => {
    const { history } = props
    const [, setUserState] = useContext<UserContext>(userContext)

    const formRef = useRef(null)

    useEffect(() => {
        if (!formRef.current) return
        const form = formRef.current

        gsap.from(form, { opacity: 0, y: 50 })
        gsap.to(form, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            visibility: 'visible',
        })
    }, [formRef])

    const onSubmit = async (values: FormFields) => {
        const { name, password } = values
        const response = await user.login(name, password)
        const form = formRef.current

        if (form === null) {
            return message.error('Unable to locate form element')
        }

        if (response.ok) {
            const data = await response.json()

            message.success(`Welcome back ${name}!`)
            setUserState({ ...data, authenticated: true })

            return gsap.to(form, {
                y: -40,
                opacity: 0,
                ease: 'power3.out',
                duration: 0.3,
                onComplete: () => history.push('/profile'),
            })
        }

        return message.error('incorrect name or password')
    }

    return (
        <div className={styles['form']} style={{ visibility: 'hidden' }} ref={formRef}>
            <Form onFinish={onSubmit}>
                <h1>Sign in</h1>
                <Form.Item
                    labelCol={{ span: 24 }}
                    label="Name"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: 'Please enter your name!',
                        },
                    ]}
                >
                    <Input type="text" />
                </Form.Item>
                <Form.Item
                    labelCol={{ span: 24 }}
                    label="Password"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please enter your password!',
                        },
                    ]}
                >
                    <Input type="password" />
                </Form.Item>
                <Form.Item style={{ marginTop: '40px' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Button type="primary" htmlType="submit">
                            Sign in
                        </Button>
                        <span>or</span>
                        <Link to="/register">register as a new user</Link>
                    </div>
                </Form.Item>
            </Form>
        </div>
    )
}
export default Signin
