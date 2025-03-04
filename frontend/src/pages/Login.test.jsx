// src/pages/Login.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Login from './login';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { vi } from 'vitest';

// Mock axios
vi.mock('axios');

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  it('renders login form', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/Enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows validation errors if fields are empty', async () => {
    renderComponent();
    // Click submit without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    // Wait for validation error messages to appear.
    await waitFor(
      () => {
        expect(screen.getByText(/Please enter your email/i)).toBeInTheDocument();
        expect(screen.getByText(/Please enter your password/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it('submits the form successfully and navigates to dashboard', async () => {
    // Mock a successful login response
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: { token: 'fake-jwt-token' },
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText(/Enter email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // Fill in form fields
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Verify axios was called with the correct payload
    await waitFor(
      () => {
        expect(axios.post).toHaveBeenCalledWith(
          '/api/login',
          { email: 'test@example.com', password: 'password123' },
          { headers: { 'Content-Type': 'application/json' } }
        );
      },
      { timeout: 10000 }
    );

    // Verify that the token is stored in localStorage
    await waitFor(
      () => {
        expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      },
      { timeout: 10000 }
    );

    // Wait for the 1-second delay (plus a little buffer)
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Verify navigation to "/dashboard" was triggered
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      },
      { timeout: 10000 }
    );
  });
});
