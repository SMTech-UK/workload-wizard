import { NextRequest } from 'next/server'

// Mock the entire test-runner route module
jest.mock('@/app/api/test-runner/route', () => {
  const mockExecAsync = jest.fn()
  
  // Mock the dependencies
  jest.mock('child_process', () => ({
    exec: jest.fn()
  }))
  
  jest.mock('util', () => ({
    promisify: jest.fn(() => mockExecAsync)
  }))
  
  jest.mock('@/lib/test-history', () => ({
    testHistoryManager: {
      saveTestResult: jest.fn().mockResolvedValue('test-id-123')
    }
  }))
  
  // Return the actual functions but with mocked dependencies
  const actualModule = jest.requireActual('@/app/api/test-runner/route')
  return {
    ...actualModule,
    __mockExecAsync: mockExecAsync
  }
})

// Import after mocking
const { POST, GET } = require('@/app/api/test-runner/route')
const mockExecAsync = require('@/app/api/test-runner/route').__mockExecAsync

// Mock fs with proper implementation
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readdirSync: jest.fn(() => ['test1.test.ts', 'test2.test.ts']),
  statSync: jest.fn(() => ({ isFile: () => true })),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn()
}))

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/'))
}))

// Mock NextRequest constructor
const createMockRequest = (url: string, options?: any): NextRequest => {
  const mockRequest = {
    url,
    nextUrl: new URL(url),
    method: options?.method || 'GET',
    headers: new Map(Object.entries(options?.headers || {})),
    body: options?.body,
    json: jest.fn().mockResolvedValue(options?.body ? JSON.parse(options.body) : {})
  } as unknown as NextRequest
  return mockRequest
}

describe('Test Runner API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/test-runner', () => {
    it('should run tests successfully with default configuration', async () => {
      const mockStdout = JSON.stringify({
        success: true,
        results: {
          summary: {
            total: 10,
            passed: 10,
            failed: 0,
            running: 0,
            coverage: 85.5,
            duration: 1500
          },
          suites: [],
          timestamp: new Date().toISOString()
        }
      })

      mockExecAsync.mockResolvedValue({ stdout: mockStdout, stderr: '' })

      const request = createMockRequest('http://localhost:3000/api/test-runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testType: 'all',
          config: {}
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.results).toBeDefined()
      expect(data.results.summary.total).toBe(10)
      expect(data.results.summary.passed).toBe(10)
    })

    it('should handle test failures gracefully', async () => {
      const mockStdout = JSON.stringify({
        success: true,
        results: {
          summary: {
            total: 10,
            passed: 8,
            failed: 2,
            running: 0,
            coverage: 80,
            duration: 1500
          },
          suites: [],
          timestamp: new Date().toISOString()
        }
      })

      mockExecAsync.mockResolvedValue({ stdout: mockStdout, stderr: '' })

      const request = createMockRequest('http://localhost:3000/api/test-runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testType: 'unit',
          config: {}
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.results.summary.failed).toBe(2)
      expect(data.results.summary.passed).toBe(8)
    })

    it('should handle exec errors gracefully', async () => {
      mockExecAsync.mockRejectedValue(new Error('Test execution failed'))

      const request = createMockRequest('http://localhost:3000/api/test-runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testType: 'unit',
          config: {}
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Test execution failed')
    })

    it('should handle invalid JSON response', async () => {
      mockExecAsync.mockResolvedValue({ stdout: 'invalid json', stderr: '' })

      const request = createMockRequest('http://localhost:3000/api/test-runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testType: 'unit',
          config: {}
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON response')
    })

    it('should handle missing request body', async () => {
      const request = createMockRequest('http://localhost:3000/api/test-runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Request body is required')
    })

    it('should handle invalid test type', async () => {
      const request = createMockRequest('http://localhost:3000/api/test-runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testType: 'invalid',
          config: {}
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid test type')
    })

    it('should run individual test successfully', async () => {
      const mockStdout = JSON.stringify({
        success: true,
        results: {
          summary: {
            total: 1,
            passed: 1,
            failed: 0,
            running: 0,
            coverage: 100,
            duration: 150
          },
          suites: [],
          timestamp: new Date().toISOString()
        }
      })

      mockExecAsync.mockResolvedValue({ stdout: mockStdout, stderr: '' })

      const request = createMockRequest('http://localhost:3000/api/test-runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testType: 'individual',
          testId: 'test-123',
          testName: 'test-file.test.ts',
          config: {}
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.results.summary.total).toBe(1)
      expect(data.results.summary.passed).toBe(1)
    })

    it('should handle missing test ID for individual test', async () => {
      const request = createMockRequest('http://localhost:3000/api/test-runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testType: 'individual',
          config: {}
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Test ID is required for individual test runs')
    })
  })

  describe('GET /api/test-runner', () => {
    it('should return test status successfully', async () => {
      mockExecAsync.mockResolvedValue({ 
        stdout: 'src/__tests__/test1.test.ts\nsrc/__tests__/test2.test.ts', 
        stderr: '' 
      })

      const response = await GET()
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.testFiles).toBeDefined()
    })

    it('should handle test status errors', async () => {
      mockExecAsync.mockRejectedValue(new Error('Command failed'))

      const response = await GET()
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Command failed')
    })
  })
}) 