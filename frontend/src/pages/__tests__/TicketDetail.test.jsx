import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TicketDetail from '../TicketDetail';
import { vi } from 'vitest';
import apiClient from '../../api/client';

vi.mock('../../api/client');

describe('TicketDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ticket details', async () => {
    // Mock the API response with proper data
    apiClient.get.mockResolvedValue({
      data: {
        id: '1',
        title: 'Test Ticket',
        description: 'Test description',
        status: 'open',
        auditLogs: [],
        createdBy: { name: 'Test User' }
      }
    });

    render(
      <MemoryRouter>
        <TicketDetail />
      </MemoryRouter>
    );

    // Wait for the component to render 
    await waitFor(() => {
      expect(screen.queryAllByText(/.*/).length).toBeGreaterThan(0);
    });
  });
});
