import React, { useEffect, FunctionComponent, useContext } from 'react'
import styles from './App.module.scss'
import './antd.less'
import { Layout, Menu } from 'antd'
import { Link, Switch, Route, useLocation, useHistory } from 'react-router-dom'
import { UserOutlined } from '@ant-design/icons'
import { userContext, UserContext } from './context/user'
import * as user from './services/user'

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

    useEffect(() => {
        console.log('IN HERE')
        user.validate().then((authenticated) => {
            return setUserState({
                ...userState,
                authenticated,
            })
        })
    }, [])

    const handleSignOut = async () => {
        await user.logout()

        setUserState({ authenticated: false, name: '' })
        history.push('/')
    }

    return (
        <Layout>
            <Header className={styles['header']}>
                <div className={styles['logo']}>
                    <img src="logo.svg" />
                    <span>Tagalong</span>
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
                        <Menu.SubMenu className={styles['sign-in']} icon={<UserOutlined />}>
                            <Menu.Item onClick={handleSignOut}>Sign out</Menu.Item>
                        </Menu.SubMenu>
                    ) : (
                        <Menu.Item className={styles['sign-in']} key="/signin">
                            <Link to="/signin">
                                <UserOutlined />
                            </Link>
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
                </Switch>
            </Content>
        </Layout>
    )
}

export default App
