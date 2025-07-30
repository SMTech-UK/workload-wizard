// Mock Clerk authentication for testing
import React from 'react'

// Mock useUser hook
export const useUser = jest.fn(() => ({
  user: {
    id: 'test-user-id',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  isLoaded: true,
  isSignedIn: true,
}))

// Mock useAuth hook
export const useAuth = jest.fn(() => ({
  isLoaded: true,
  isSignedIn: true,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
}))

// Mock ClerkProvider
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'clerk-provider' }, children)
}

// Mock SignIn component
export const SignIn = () => {
  return React.createElement('div', { 'data-testid': 'sign-in' }, 'Sign In')
}

// Mock SignUp component
export const SignUp = () => {
  return React.createElement('div', { 'data-testid': 'sign-up' }, 'Sign Up')
}

// Mock UserButton component
export const UserButton = () => {
  return React.createElement('div', { 'data-testid': 'user-button' }, 'User Button')
}

// Mock UserProfile component
export const UserProfile = () => {
  return React.createElement('div', { 'data-testid': 'user-profile' }, 'User Profile')
}

// Setup function to configure mocks
export const setupClerkMocks = () => {
  jest.mock('@clerk/nextjs', () => ({
    useUser,
    useAuth,
    ClerkProvider,
    SignIn,
    SignUp,
    UserButton,
    UserProfile,
  }))
}

// Reset all mocks
export const resetClerkMocks = () => {
  useUser.mockReset()
  useAuth.mockReset()
} 