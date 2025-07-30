// Mock Auth0 authentication for testing
import React from 'react'

// Mock useUser hook
export const useUser = jest.fn(() => ({
  user: {
    sub: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
    email_verified: true,
    updated_at: new Date().toISOString(),
  },
  error: null,
  isLoading: false,
}))

// Mock useAuth0 hook
export const useAuth0 = jest.fn(() => ({
  isAuthenticated: true,
  isLoading: false,
  user: {
    sub: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
    email_verified: true,
    updated_at: new Date().toISOString(),
  },
  loginWithRedirect: jest.fn(),
  logout: jest.fn(),
  getAccessTokenSilently: jest.fn(),
  getAccessTokenWithPopup: jest.fn(),
}))

// Mock UserProvider
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'auth0-provider' }, children)
}

// Mock Auth0Provider
export const Auth0Provider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'auth0-provider' }, children)
}

// Setup function to configure mocks
export const setupAuth0Mocks = () => {
  jest.mock('@auth0/nextjs-auth0', () => ({
    useUser,
    useAuth0,
    UserProvider,
    Auth0Provider,
  }))
}

// Reset all mocks
export const resetAuth0Mocks = () => {
  useUser.mockReset()
  useAuth0.mockReset()
} 