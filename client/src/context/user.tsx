import React, { createContext, FunctionComponent, useState } from 'react'

type UserState = {
    name: string
    authenticated: boolean
    balance: number
}

export type UserContext = [UserState, React.Dispatch<React.SetStateAction<UserState>>]

const baseContext: UserState = { name: '', authenticated: false, balance: 0 }

export const userContext = createContext<any>([])

export const UserProvider: FunctionComponent = ({ children }) => {
    const [userState, setState] = useState<UserState>(baseContext)

    const setUserState = (data: any) => {
        localStorage.setItem('context.userContext', JSON.stringify(data))

        return setState(data)
    }

    return <userContext.Provider value={[userState, setUserState]}>{children}</userContext.Provider>
}
