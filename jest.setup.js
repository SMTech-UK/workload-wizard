import '@testing-library/jest-dom'

// Polyfill fetch for Node.js environment
if (!global.fetch) {
  global.fetch = jest.fn()
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Convex
jest.mock('convex/react', () => ({
  useQuery: jest.fn(() => null),
  useMutation: jest.fn(() => jest.fn()),
  useAction: jest.fn(() => jest.fn()),
  usePaginatedQuery: jest.fn(() => ({ results: [], status: 'CanLoadMore' })),
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
  }),
  SignIn: () => <div data-testid="sign-in">Sign In</div>,
  SignUp: () => <div data-testid="sign-up">Sign Up</div>,
  UserButton: () => <div data-testid="user-button">User Button</div>,
}))

// Mock Knock
jest.mock('@knocklabs/react', () => ({
  useKnock: () => ({
    user: { id: 'test-user-id' },
    feed: {
      items: [],
      pageInfo: { after: null, before: null },
      on: jest.fn(),
      off: jest.fn(),
    },
  }),
  KnockProvider: ({ children }) => children,
}))

// Mock window.matchMedia - only define if not already defined
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Proper timer mocks for Jest environment
// Store original timer functions
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;
const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;

// Mock timer functions properly
global.setTimeout = jest.fn((callback, delay) => {
  return originalSetTimeout(callback, delay);
});

global.clearTimeout = jest.fn((id) => {
  return originalClearTimeout(id);
});

global.setInterval = jest.fn((callback, delay) => {
  return originalSetInterval(callback, delay);
});

global.clearInterval = jest.fn((id) => {
  return originalClearInterval(id);
});

// Ensure clearTimeout is available globally
if (!global.clearTimeout) {
  global.clearTimeout = jest.fn();
}

// Mock clearTimeout to prevent errors in cleanup
global.clearTimeout = jest.fn();

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress console errors in tests unless explicitly needed
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: An update to') ||
       args[0].includes('Warning: React does not recognize'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 