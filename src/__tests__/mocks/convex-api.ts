import React from 'react'

// Mock Convex API for testing
export const mockConvexApi = {
  api: {
    lecturers: {
      getAll: 'lecturers.getAll',
      getById: 'lecturers.getById',
      create: 'lecturers.create',
      update: 'lecturers.update',
      delete: 'lecturers.delete',
      list: 'lecturers.list'
    },
    modules: {
      getAll: 'modules.getAll',
      getById: 'modules.getById',
      create: 'modules.create',
      update: 'modules.update',
      delete: 'modules.delete',
      list: 'modules.list',
      bulkImport: 'modules.bulkImport'
    },
    module_iterations: {
      getAll: 'module_iterations.getAll',
      getById: 'module_iterations.getById',
      create: 'module_iterations.create',
      update: 'module_iterations.update',
      delete: 'module_iterations.delete',
      list: 'module_iterations.list'
    },
    module_allocations: {
      getAll: 'module_allocations.getAll',
      getById: 'module_allocations.getById',
      create: 'module_allocations.create',
      update: 'module_allocations.update',
      delete: 'module_allocations.delete',
      list: 'module_allocations.list'
    },
    users: {
      getAll: 'users.getAll',
      getById: 'users.getById',
      create: 'users.create',
      update: 'users.update',
      delete: 'users.delete',
      list: 'users.list'
    },
    cohorts: {
      getAll: 'cohorts.getAll',
      getById: 'cohorts.getById',
      create: 'cohorts.create',
      update: 'cohorts.update',
      delete: 'cohorts.delete',
      list: 'cohorts.list'
    },
    recent_activity: {
      getAll: 'recent_activity.getAll',
      getById: 'recent_activity.getById',
      create: 'recent_activity.create',
      update: 'recent_activity.update',
      delete: 'recent_activity.delete',
      list: 'recent_activity.list'
    },
    dept_summary: {
      getAll: 'dept_summary.getAll',
      getById: 'dept_summary.getById',
      create: 'dept_summary.create',
      update: 'dept_summary.update',
      delete: 'dept_summary.delete',
      list: 'dept_summary.list'
    },
    admin_allocations: {
      getAll: 'admin_allocations.getAll',
      getById: 'admin_allocations.getById',
      create: 'admin_allocations.create',
      update: 'admin_allocations.update',
      delete: 'admin_allocations.delete',
      list: 'admin_allocations.list'
    }
  }
}

// Mock Convex client
export const mockConvexClient = {
  query: jest.fn(),
  mutation: jest.fn(),
  action: jest.fn(),
  onQuery: jest.fn(),
  onMutation: jest.fn(),
  onAction: jest.fn(),
  close: jest.fn()
}

// Mock useQuery hook
export const mockUseQuery = jest.fn()

// Mock useMutation hook
export const mockUseMutation = jest.fn()

// Mock useAction hook
export const mockUseAction = jest.fn()

// Mock ConvexProvider
export const MockConvexProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'convex-provider' }, children)
}

// Setup function to configure mocks
export const setupConvexMocks = () => {
  // Mock the Convex API module
  jest.mock('convex/_generated/api', () => mockConvexApi)
  
  // Mock the Convex client
  jest.mock('convex/react', () => ({
    useQuery: mockUseQuery,
    useMutation: mockUseMutation,
    useAction: mockUseAction,
    ConvexProvider: MockConvexProvider
  }))
  
  // Mock the Convex client creation
  jest.mock('convex/react', () => ({
    ...jest.requireActual('convex/react'),
    useQuery: mockUseQuery,
    useMutation: mockUseMutation,
    useAction: mockUseAction,
    ConvexProvider: MockConvexProvider
  }), { virtual: true })
}

// Reset all mocks
export const resetConvexMocks = () => {
  mockUseQuery.mockReset()
  mockUseMutation.mockReset()
  mockUseAction.mockReset()
  mockConvexClient.query.mockReset()
  mockConvexClient.mutation.mockReset()
  mockConvexClient.action.mockReset()
} 