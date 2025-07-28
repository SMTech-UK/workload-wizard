import '@testing-library/jest-dom'

// Mock Next.js Response for API tests
global.Response = {
  json: jest.fn((data, options) => ({
    json: () => Promise.resolve(data),
    status: options?.status || 200,
    ok: (options?.status || 200) < 400,
    ...options
  }))
}

// Mock NextResponse for API route tests
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(url = 'http://localhost:3000/api/test') {
      this.url = url
      this.nextUrl = new URL(url)
    }
  },
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ok: (options?.status || 200) < 400,
      ...options
    }))
  }
}))

// Mock file system for test history
const fs = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}

const path = {
  join: jest.fn((...args) => args.join('/'))
}

jest.mock('fs', () => fs)
jest.mock('path', () => path)

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
}

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
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

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock fetch for API tests
global.fetch = jest.fn()

// Mock URLSearchParams
global.URLSearchParams = class MockURLSearchParams {
  constructor(init) {
    this.params = new Map()
    if (init) {
      const searchParams = new URL(init).searchParams
      for (const [key, value] of searchParams) {
        this.params.set(key, value)
      }
    }
  }
  
  get(key) {
    return this.params.get(key)
  }
  
  has(key) {
    return this.params.has(key)
  }
  
  set(key, value) {
    this.params.set(key, value)
  }
  
  delete(key) {
    this.params.delete(key)
  }
  
  forEach(callback) {
    this.params.forEach(callback)
  }
  
  entries() {
    return this.params.entries()
  }
  
  keys() {
    return this.params.keys()
  }
  
  values() {
    return this.params.values()
  }
  
  toString() {
    return Array.from(this.params.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
  }
}

// Export mocks for use in tests
export { fs, path, localStorageMock, sessionStorageMock } 