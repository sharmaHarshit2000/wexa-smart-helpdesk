import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Layout from '../Layout';
import { useAuthStore } from '../../store/authStore';

// Mock the auth store
vi.mock('../../store/authStore');

describe('Layout Component', () => {
  it('renders header for admin user', () => {
    // Mock admin user with name
    useAuthStore.mockReturnValue({
      user: { role: 'admin', name: 'Admin User' },
      isAuthenticated: true,
      logout: vi.fn()
    });

    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    // Use more specific queries
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.getByText(/knowledge base/i)).toBeInTheDocument();
  });

  it('renders header for non-authenticated user', () => {
    // Mock non-authenticated user
    useAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn()
    });

    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    // Check for auth links by role and text
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });
});