import React, { useEffect, FunctionComponent, useContext, useState } from 'react'
import './antd.less'
import styles from './App.module.scss'
import { Layout, Menu, message } from 'antd'
import { Link, Switch, Route, useLocation, useHistory, Redirect } from 'react-router-dom'
import { UserOutlined } from '@ant-design/icons'
import { userContext, UserContext } from './context/user'
import * as user from './services/user'

message.config({
    top: 75,
    duration: 1.5,
})

import HomeComponent from './views/home/home'
import SignInComponent from './views/signin/signin'
import RegisterComponent from './views/register/register'
import MarketComponent from './views/market/market'
import ProfileComponent from './views/profile/profile'

const { Header, Content } = Layout

const App: FunctionComponent = () => {
    const location = useLocation()
    const history = useHistory()
    const [userState, setUserState] = useContext<UserContext>(userContext)
    const [hasVerified, setHasVerified] = useState(false)

    useEffect(() => {
        user.validate().then(([response, data]) => {
            setUserState({
                ...data,
                authenticated: response.ok,
            })

            setHasVerified(true)
        })
    }, [])

    const handleSignOut = async () => {
        await user.logout()

        setUserState({ balance: 0, authenticated: false, name: '' })
        history.push('/')
    }

    return (
        <Layout>
            <Header className={styles['header']}>
                <div className={styles['logo']}>
                    <img src="logo.svg" />
                    <span className={styles['navbar-title']}>Tagalong</span>
                </div>
                <Menu
                    className={styles['menu']}
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={[location.pathname]}
                    selectedKeys={[location.pathname]}
                >
                    <Menu.Item key="/">
                        <Link to="/">Home</Link>
                    </Menu.Item>
                    {userState.authenticated && (
                        <Menu.Item key="/market">
                            <Link to="/market">Market</Link>
                        </Menu.Item>
                    )}
                    {userState.authenticated && (
                        <Menu.Item key="/profile">
                            <Link to="/profile">Profile</Link>
                        </Menu.Item>
                    )}
                    {userState.authenticated ? (
                        <Menu.Item onClick={handleSignOut}>Sign out</Menu.Item>
                    ) : (
                        <Menu.Item className={styles['sign-in']} key="/signin">
                            <Link to="/signin">Sign in</Link>
                        </Menu.Item>
                    )}
                </Menu>
            </Header>
            <Content className={styles['content']}>
                <Switch>
                    {userState.authenticated && <Route exact path="/profile" component={ProfileComponent} />}
                    {userState.authenticated && <Route exact path="/market" component={MarketComponent} />}
                    <Route exact path="/" component={HomeComponent} />
                    <Route exact path="/signin" component={SignInComponent} />
                    <Route exact path="/register" component={RegisterComponent} />
                    {hasVerified && <Route path="*" component={() => <Redirect to="/" />} />}
                </Switch>
            </Content>
        </Layout>
    )
}

export default App
