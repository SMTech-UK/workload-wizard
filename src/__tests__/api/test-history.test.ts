import { NextRequest } from 'next/server'
import { GET, DELETE } from '@/app/api/test-history/route'

// Mock the test-history module
jest.mock('@/lib/test-history', () => ({
  testHistoryManager: {
    getTestHistory: jest.fn(),
    getTestStats: jest.fn(),
    getTestResult: jest.fn(),
    deleteTestResult: jest.fn(),
    clearHistory: jest.fn()
  }
}))

const mockTestHistoryManager = require('@/lib/test-history').testHistoryManager

// Mock NextRequest constructor
const createMockRequest = (url: string): NextRequest => {
  const mockRequest = {
    url,
    nextUrl: new URL(url)
  } as NextRequest
  return mockRequest
}

describe('Test History API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/test-history', () => {
    it('should return test history successfully', async () => {
      const mockHistory = [
        {
          id: 'test-1',
          timestamp: '2024-01-01T00:00:00.000Z',
          summary: {
            total: 10,
            passed: 10,
            failed: 0,
            running: 0,
            coverage: 85.5,
            duration: 1500
          },
          testType: 'unit',
          success: true
        }
      ]

      mockTestHistoryManager.getTestHistory.mockResolvedValue(mockHistory)

      const request = createMockRequest('http://localhost:3000/api/test-history?action=history&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.history).toEqual(mockHistory)
      expect(mockTestHistoryManager.getTestHistory).toHaveBeenCalledWith(10)
    })

    it('should return test statistics successfully', async () => {
      const mockStats = {
        totalRuns: 5,
        totalTests: 50,
        totalPassed: 45,
        totalFailed: 5,
        averageCoverage: 82.5,
        averageDuration: 1200,
        lastRun: '2024-01-01T00:00:00.000Z',
        successRate: 90
      }

      mockTestHistoryManager.getTestStats.mockResolvedValue(mockStats)

      const request = createMockRequest('http://localhost:3000/api/test-history?action=stats')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.stats).toEqual(mockStats)
      expect(mockTestHistoryManager.getTestStats).toHaveBeenCalled()
    })

    it('should handle empty history file', async () => {
      mockTestHistoryManager.getTestHistory.mockResolvedValue([])

      const request = createMockRequest('http://localhost:3000/api/test-history?action=history')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.history).toEqual([])
    })

    it('should handle missing history file', async () => {
      mockTestHistoryManager.getTestHistory.mockRejectedValue(new Error('File not found'))

      const request = createMockRequest('http://localhost:3000/api/test-history?action=history')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })

    it('should limit history results', async () => {
      const mockHistory = Array.from({ length: 50 }, (_, i) => ({
        id: `test-${i}`,
        timestamp: '2024-01-01T00:00:00.000Z',
        summary: {
          total: 10,
          passed: 10,
          failed: 0,
          running: 0,
          coverage: 85.5,
          duration: 1500
        },
        testType: 'unit',
        success: true
      }))

      mockTestHistoryManager.getTestHistory.mockResolvedValue(mockHistory.slice(0, 20))

      const request = createMockRequest('http://localhost:3000/api/test-history?action=history&limit=20')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.history).toHaveLength(20)
      expect(mockTestHistoryManager.getTestHistory).toHaveBeenCalledWith(20)
    })

    it('should handle invalid action parameter', async () => {
      const request = createMockRequest('http://localhost:3000/api/test-history?action=invalid')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid action. Use: history, stats, or result')
      expect(response.status).toBe(400)
    })

    it('should handle missing action parameter', async () => {
      const request = createMockRequest('http://localhost:3000/api/test-history')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid action. Use: history, stats, or result')
      expect(response.status).toBe(400)
    })

    it('should handle file read errors', async () => {
      mockTestHistoryManager.getTestHistory.mockRejectedValue(new Error('Permission denied'))

      const request = createMockRequest('http://localhost:3000/api/test-history?action=history')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
      expect(response.status).toBe(500)
    })

    it('should handle invalid JSON in history file', async () => {
      mockTestHistoryManager.getTestHistory.mockRejectedValue(new SyntaxError('Invalid JSON'))

      const request = createMockRequest('http://localhost:3000/api/test-history?action=history')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
      expect(response.status).toBe(500)
    })

    it('should return specific test result by ID', async () => {
      const mockResult = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        summary: {
          total: 10,
          passed: 10,
          failed: 0,
          running: 0,
          coverage: 85.5,
          duration: 1500
        },
        testType: 'unit',
        success: true
      }

      mockTestHistoryManager.getTestResult.mockResolvedValue(mockResult)

      const request = createMockRequest('http://localhost:3000/api/test-history?action=result&id=test-123')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.result).toEqual(mockResult)
      expect(mockTestHistoryManager.getTestResult).toHaveBeenCalledWith('test-123')
    })

    it('should handle non-existent test result ID', async () => {
      mockTestHistoryManager.getTestResult.mockResolvedValue(null)

      const request = createMockRequest('http://localhost:3000/api/test-history?action=result&id=non-existent')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Test result not found')
      expect(response.status).toBe(404)
    })

    it('should handle missing ID for result action', async () => {
      const request = createMockRequest('http://localhost:3000/api/test-history?action=result')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Test result ID is required')
      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/test-history', () => {
    it('should clear test history successfully', async () => {
      mockTestHistoryManager.clearHistory.mockResolvedValue(undefined)

      const request = createMockRequest('http://localhost:3000/api/test-history?action=clear')
      const response = await DELETE(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.message).toBe('Test history cleared')
      expect(mockTestHistoryManager.clearHistory).toHaveBeenCalled()
    })

    it('should delete specific test result successfully', async () => {
      mockTestHistoryManager.deleteTestResult.mockResolvedValue(true)

      const request = createMockRequest('http://localhost:3000/api/test-history?action=delete&id=test-123')
      const response = await DELETE(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.message).toBe('Test result deleted')
      expect(mockTestHistoryManager.deleteTestResult).toHaveBeenCalledWith('test-123')
    })

    it('should handle non-existent test result for deletion', async () => {
      mockTestHistoryManager.deleteTestResult.mockResolvedValue(false)

      const request = createMockRequest('http://localhost:3000/api/test-history?action=delete&id=non-existent')
      const response = await DELETE(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Test result not found')
      expect(response.status).toBe(404)
    })

    it('should handle missing ID for delete action', async () => {
      const request = createMockRequest('http://localhost:3000/api/test-history?action=delete')
      const response = await DELETE(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Test result ID is required')
      expect(response.status).toBe(400)
    })

    it('should handle invalid action for DELETE', async () => {
      const request = createMockRequest('http://localhost:3000/api/test-history?action=invalid')
      const response = await DELETE(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid action. Use: clear or delete')
      expect(response.status).toBe(400)
    })

    it('should handle errors during deletion', async () => {
      mockTestHistoryManager.deleteTestResult.mockRejectedValue(new Error('Permission denied'))

      const request = createMockRequest('http://localhost:3000/api/test-history?action=delete&id=test-123')
      const response = await DELETE(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
      expect(response.status).toBe(500)
    })
  })
}) 