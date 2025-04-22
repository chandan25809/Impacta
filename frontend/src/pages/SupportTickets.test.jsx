/** @vitest-environment jsdom */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// 1) Create the mock fn up front
const navigateMock = vi.fn()

// 2) Hoisted mock for react‑router‑dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SupportTickets from './SupportTickets'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'
import { message } from 'antd'

vi.mock('axios')

describe('SupportTickets Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  it('renders FAQs and Ask Now button for unauthenticated users', () => {
    render(
      <MemoryRouter>
        <SupportTickets />
      </MemoryRouter>
    )
    // FAQ question
    expect(
      screen.getByText(/How can I donate to a campaign\?/i)
    ).toBeInTheDocument()
    // Ask Now
    expect(screen.getByRole('button', { name: /Ask Now/i })).toBeVisible()
    // Should not show My Questions or User Questions
    expect(screen.queryByText(/My Questions/i)).toBeNull()
    expect(screen.queryByText(/User Questions/i)).toBeNull()
  })

  it('renders My Questions for non-admin users', async () => {
    // non‑admin JWT
    const payload = { role: 'user' }
    window.localStorage.setItem(
      'token',
      `xxx.${btoa(JSON.stringify(payload))}.yyy`
    )

    axios.get.mockResolvedValueOnce({
      data: { tickets: [{ ID: '1', Query: 'Test Query', Answer: null }] },
    })

    render(
      <MemoryRouter>
        <SupportTickets />
      </MemoryRouter>
    )

    await waitFor(() => expect(axios.get).toHaveBeenCalledOnce())
    expect(screen.getByText(/My Questions/i)).toBeVisible()
    expect(screen.getByText('Test Query')).toBeVisible()
  })

  it('allows admin users to submit an answer', async () => {
    // admin JWT
    const payload = { role: 'admin' }
    window.localStorage.setItem(
      'token',
      `xxx.${btoa(JSON.stringify(payload))}.yyy`
    )

    axios.get.mockResolvedValueOnce({
      data: { tickets: [{ ID: '1', Query: 'Q1', Answer: null }] },
    })
    axios.put.mockResolvedValue({})

    const successSpy = vi.spyOn(message, 'success')

    render(
      <MemoryRouter>
        <SupportTickets />
      </MemoryRouter>
    )

    // wait for tickets to load
    await waitFor(() => expect(axios.get).toHaveBeenCalledOnce())

    // expand panel
    fireEvent.click(screen.getByText('Q1'))

    // fill and submit form
    fireEvent.change(
      screen.getByPlaceholderText(/Enter your answer here\.\.\./i),
      { target: { value: 'My answer' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }))

    // expect PUT and success message
    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(
        '/api/support-tickets/1',
        { answer: 'My answer' },
        expect.any(Object)
      )
    )
    expect(successSpy).toHaveBeenCalledWith('Answer updated successfully!')
  })

  it('navigates to ask page on Ask Now click', () => {
    render(
      <MemoryRouter>
        <SupportTickets />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /Ask Now/i }))
    expect(navigateMock).toHaveBeenCalledWith('/support/ask')
  })
})
