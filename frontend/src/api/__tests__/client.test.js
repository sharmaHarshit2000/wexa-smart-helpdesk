import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../client';

// Mock the auth store
vi.mock('../../store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn()
  }
}));

import { useAuthStore } from '../../store/authStore';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://localhost:3001/api');
  });

  it('includes authorization header when token exists', () => {
    // Mock store to return token
    useAuthStore.getState.mockReturnValue({
      token: 'test-token-123'
    });
    
    // Get the request interceptor
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    
    // Call it with a mock config
    const config = requestInterceptor({ headers: {} });
    
    expect(config.headers.Authorization).toBe('Bearer test-token-123');
  });

  it('does not include authorization header when no token', () => {
    // Mock store to return no token
    useAuthStore.getState.mockReturnValue({
      token: null
    });
    
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const config = requestInterceptor({ headers: {} });
    
    expect(config.headers.Authorization).toBeUndefined();
  });
});