import React, { useRef, useEffect, FunctionComponent, useContext } from 'react'
import { Form, Input, Button, message } from 'antd'
import styles from './register.module.scss'
import gsap from 'gsap'
import * as user from '../../services/user'
import { Link, RouteComponentProps } from 'react-router-dom'
import { userContext, UserContext } from '../../context/user'

type FormFields = {
    name: string
    password: string
}

const Register: FunctionComponent<RouteComponentProps> = (props) => {
    const { history } = props
    const [userState, setUserState] = useContext<UserContext>(userContext)

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
        const response = await user.create(name, password)
        const form = formRef.current

        if (form === null) {
            return message.error('Unable to locate form element')
        }

        if (response.ok) {
            const data = await response.json()

            message.success(`Welcome ${name}!`)
            setUserState({ ...data, authenticated: true })

            return gsap.to(form, {
                y: -40,
                opacity: 0,
                ease: 'power3.out',
                duration: 0.3,
                onComplete: () => history.push('/profile'),
            })
        }

        return message.error('username already exists')
    }

    return (
        <div className={styles['form']} style={{ visibility: 'hidden' }} ref={formRef}>
            <Form onFinish={onSubmit}>
                <h1>Register</h1>
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
                            Register
                        </Button>
                        <span>or</span>
                        <Link to="/signin">sign in</Link>
                    </div>
                </Form.Item>
            </Form>
        </div>
    )
}
export default Register
