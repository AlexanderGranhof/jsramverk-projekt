import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { UserProvider } from '../../context/user'

import Profile from './profile'
import { waitForElement, getByText, prettyDOM } from '@testing-library/react'

let root: HTMLDivElement | null = null

beforeEach(() => {
    root = document.createElement('div')
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

it('renders Profile view', async () => {
    jest.spyOn(global, 'fetch').mockImplementation((): any => {
        return Promise.resolve({
            json: () => Promise.resolve({ balance: 100 }),
        })
    })

    act(() => {
        render(
            <UserProvider>
                <Profile />
            </UserProvider>,
            root,
        )
    })

    expect(root?.querySelector('div > div > p')?.textContent).toBe('Balance')
    expect(root?.querySelector('h1#balance')?.textContent).toBe('$0.00')

    act(() => {
        const button = root?.querySelector('button.ant-btn.ant-btn-primary')

        button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    await waitForElement(() => {
        return root && getByText(root, '$100.00')
    })

    expect(root?.querySelector('h1#balance')?.textContent).toBe('$100.00')
})
