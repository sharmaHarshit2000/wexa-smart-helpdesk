import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import CreateTicket from '../CreateTicket';
import apiClient from '../../api/client'; 

// Mock the API client 
vi.mock('../../api/client', () => ({
  default: {
    post: vi.fn()
  }
}));

describe('CreateTicket Component', () => {
  it('renders ticket form', () => {
    render(
      <BrowserRouter>
        <CreateTicket />
      </BrowserRouter>
    );

    // Use getByLabelText 
    expect(screen.getByLabelText(/title:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create ticket/i })).toBeInTheDocument();
  });

  it('submits ticket and calls apiClient.post', async () => {
    // Mock the resolved value
    const mockPost = vi.fn().mockResolvedValue({});
    vi.mocked(apiClient.post).mockImplementation(mockPost);

    render(
      <BrowserRouter>
        <CreateTicket />
      </BrowserRouter>
    );

    // Fill the form using label text
    fireEvent.change(screen.getByLabelText(/title:/i), {
      target: { value: 'Test Ticket' }
    });
    fireEvent.change(screen.getByLabelText(/description:/i), {
      target: { value: 'Test Description' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create ticket/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/tickets', {
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'other'
      });
    });
  });
});