import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { UserProvider } from '../../context/user'

import SignIn from './signin'
import { fireEvent } from '@testing-library/react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

let root: HTMLDivElement | null = null

beforeEach(() => {
    root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)
})

afterEach(() => {
    if (root instanceof HTMLDivElement) {
        unmountComponentAtNode(root)
        root.remove()
        root = null
    }

    ;(global.fetch as any).mockRestore()
})

it('renders SignIn view', async () => {
    jest.spyOn(global, 'fetch').mockImplementation((): any => {
        return Promise.resolve({
            json: () => Promise.resolve({ name: 'test', balance: 100 }),
            ok: false,
        })
    })

    // Without this causes error with jest??
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // Deprecated
            removeListener: jest.fn(), // Deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    })

    act(() => {
        render(
            <UserProvider>
                <Router>
                    <Switch>
                        <Route component={SignIn} />
                    </Switch>
                </Router>
            </UserProvider>,
            root,
        )
    })

    expect(root?.querySelector('h1')?.textContent).toBe('Sign in')

    act(() => {
        const name = root?.querySelector('input[type=text]') as HTMLInputElement
        const password = root?.querySelector('input[type=password]') as HTMLInputElement
        const submit = root?.querySelector('button[type=submit]') as HTMLButtonElement

        expect(name).not.toBe(null)
        expect(password).not.toBe(null)
        expect(submit).not.toBe(null)

        fireEvent.change(name, { target: { value: 'test' } })
        fireEvent.change(password, { target: { value: 'test' } })

        fireEvent.click(submit)
    })

    // If there are not alerts, it means we successfully posted to server
    expect(root?.querySelector('div[role=alert]')).not.toBeInTheDocument()
})
