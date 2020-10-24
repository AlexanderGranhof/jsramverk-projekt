import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'

import Home from './home'

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

it('renders home view', () => {
    act(() => {
        render(<Home />, root)
    })

    expect(root?.querySelector('div > header > h1')?.textContent).toBe('TAGALONG')
    expect(root?.querySelector('div > header > p')?.textContent).toBe('Commision free and easy to use trading platform')
})
