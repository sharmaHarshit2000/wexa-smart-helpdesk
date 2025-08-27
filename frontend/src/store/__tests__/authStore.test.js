import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear mocks and reset store
    vi.clearAllMocks();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false
    });
  });

  it('initializes with default state', () => {
    const state = useAuthStore.getState();
    
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('login action updates state', () => {
    const testUser = { id: '1', name: 'Test User', role: 'user' };
    const testToken = 'test-token-123';
    
    useAuthStore.getState().login(testToken, testUser);
    const state = useAuthStore.getState();
    
    expect(state.token).toBe(testToken);
    expect(state.user).toEqual(testUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('logout action clears state', () => {
    // First login
    useAuthStore.getState().login('token', { id: '1', name: 'Test' });
    
    // Then logout
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});