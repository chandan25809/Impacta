// src/pages/Register.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Register from './register';
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

describe('Register Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
  };

  it('renders the register form', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/Enter your full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter a strong password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Re-enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('shows validation errors when fields are empty', async () => {
    renderComponent();
    // Click the submit button without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    await waitFor(() => {
      expect(screen.getByText(/Please enter your full name/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter your email/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter your password/i)).toBeInTheDocument();
      expect(screen.getByText(/Please re-enter your password/i)).toBeInTheDocument();
    });
  });

  it('shows a validation error when passwords do not match', async () => {
    renderComponent();
    const fullNameInput = screen.getByPlaceholderText(/Enter your full name/i);
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter a strong password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/Re-enter your password/i);
    const registerButton = screen.getByRole('button', { name: /Register/i });

    // Fill in fields with mismatched passwords
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password2!' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match!/i)).toBeInTheDocument();
    });
  });

  it('submits the form successfully and navigates to login', async () => {
    // Mock a successful registration response
    axios.post.mockResolvedValueOnce({
      status: 201,
      data: {},
    });

    renderComponent();

    const fullNameInput = screen.getByPlaceholderText(/Enter your full name/i);
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter a strong password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/Re-enter your password/i);
    const registerButton = screen.getByRole('button', { name: /Register/i });

    // Fill in the form with matching passwords
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password1!' } });

    fireEvent.click(registerButton);

    // Verify that axios.post was called with the correct payload
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/register',
        {
          full_name: 'John Doe',
          email: 'john@example.com',
          password: 'Password1!',
          confirm_password: 'Password1!',
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
    });

    // Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Registration successful! Redirecting to login/i)).toBeInTheDocument();
    });

    // Wait for the 2000ms delay plus a small buffer
    await new Promise((resolve) => setTimeout(resolve, 2100));

    // Verify that navigation to "/login" was triggered
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
