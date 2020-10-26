import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { UserProvider } from '../../context/user'

import Market from './market'

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
})

it('renders market view', () => {
    act(() => {
        render(
            <UserProvider>
                <Market />
            </UserProvider>,
            root,
        )
    })

    // Make sure the chart rendered
    expect(root?.querySelector('svg')).toBeInTheDocument()

    // Make sure the title and subtitle rendered
    expect(root?.querySelector('div > h1')?.textContent).toBe('JSC/PHPC')
    expect(root?.querySelector('div > h2')?.textContent).toBe('Trading JavaScript coin for PHP coin')
})
