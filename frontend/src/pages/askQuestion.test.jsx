/** @vitest-environment jsdom */

// ─── STUB OUT JSDOM’S CSS ENGINE ───────────────────────────────────────────────
// This prevents errors from AntD’s internal style-rule matching.
Object.defineProperty(document, 'styleSheets', { get: () => [] });
Element.prototype.matches = () => false;
Element.prototype.querySelectorAll = () => [];

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AskQuestion from './askQuestion';
import axios from 'axios';
import { message } from 'antd';
import { vi } from 'vitest';

// mock react‑router navigation
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// spy on AntD message
const successSpy = vi.spyOn(message, 'success');
const errorSpy   = vi.spyOn(message, 'error');

// mock axios
vi.mock('axios');

describe('AskQuestion Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders all form fields', async () => {
    // stub campaigns fetch
    axios.get.mockResolvedValueOnce({
      data: { campaigns: [{ ID: 'c1', Title: 'Campaign One' }] },
    });

    render(<AskQuestion />);
    // wait for useEffect -> axios.get
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // check that each label/control is present
    expect(screen.getByLabelText(/Your Question/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Related Campaign/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  it('submits the form and navigates away on success', async () => {
    axios.get.mockResolvedValueOnce({ data: { campaigns: [] } });
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<AskQuestion />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // fill only the required textarea
    fireEvent.change(screen.getByLabelText(/Your Question/), { target: { value: 'How?' } });

    // fire a form submission
    fireEvent.submit(screen.getByRole('button', { name: /Submit/i }).closest('form'));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(successSpy).toHaveBeenCalledWith('Your question has been submitted!');
    expect(navigateMock).toHaveBeenCalledWith('/support');
  });

  it('shows an error toast if submission fails', async () => {
    axios.get.mockResolvedValueOnce({ data: { campaigns: [] } });
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    render(<AskQuestion />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/Your Question/), { target: { value: 'Oops?' } });
    fireEvent.submit(screen.getByRole('button', { name: /Submit/i }).closest('form'));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Failed to submit question.'));
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
