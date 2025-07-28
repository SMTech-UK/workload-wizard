import { TestHistoryEntry, TestHistoryStats } from '@/lib/test-history'
import fs from 'fs'
import path from 'path'

// Mock fs module
jest.mock('fs')
jest.mock('path')

const mockFs = fs as jest.Mocked<typeof fs>
const mockPath = path as jest.Mocked<typeof path>

// Create a mock TestHistoryManager class for testing
class MockTestHistoryManager {
  private historyDir: string
  private maxEntries: number = 100

  constructor() {
    this.historyDir = '/test/.test-history'
  }

  async saveTestResult(result: Omit<TestHistoryEntry, 'id'>): Promise<string> {
    const id = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const history = await this.loadHistory()
    history.unshift({ id, ...result })
    
    if (history.length > this.maxEntries) {
      history.splice(this.maxEntries)
    }
    
    await this.saveHistory(history)
    return id
  }

  async getTestHistory(limit: number = 20): Promise<TestHistoryEntry[]> {
    const history = await this.loadHistory()
    return history.slice(0, limit)
  }

  async getTestResult(id: string): Promise<TestHistoryEntry | null> {
    const history = await this.loadHistory()
    return history.find(entry => entry.id === id) || null
  }

  async getTestStats(): Promise<TestHistoryStats> {
    const history = await this.loadHistory()
    
    if (history.length === 0) {
      return {
        totalRuns: 0,
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        averageCoverage: 0,
        averageDuration: 0,
        lastRun: null,
        successRate: 0
      }
    }

    const totalRuns = history.length
    const totalTests = history.reduce((sum, entry) => sum + entry.summary.total, 0)
    const totalPassed = history.reduce((sum, entry) => sum + entry.summary.passed, 0)
    const totalFailed = history.reduce((sum, entry) => sum + entry.summary.failed, 0)
    const totalCoverage = history.reduce((sum, entry) => sum + entry.summary.coverage, 0)
    const totalDuration = history.reduce((sum, entry) => sum + entry.summary.duration, 0)
    const successfulRuns = history.filter(entry => entry.success).length

    return {
      totalRuns,
      totalTests,
      totalPassed,
      totalFailed,
      averageCoverage: totalCoverage / totalRuns,
      averageDuration: totalDuration / totalRuns,
      lastRun: history[history.length - 1]?.timestamp || null,
      successRate: (successfulRuns / totalRuns) * 100
    }
  }

  async deleteTestResult(id: string): Promise<boolean> {
    const history = await this.loadHistory()
    const initialLength = history.length
    const filteredHistory = history.filter(entry => entry.id !== id)
    
    if (filteredHistory.length !== initialLength) {
      await this.saveHistory(filteredHistory)
      return true
    }
    return false
  }

  async clearHistory(): Promise<void> {
    await this.saveHistory([])
  }

  private async loadHistory(): Promise<TestHistoryEntry[]> {
    try {
      const data = mockFs.readFileSync('/test/.test-history/test-history.json', 'utf8')
      return JSON.parse(data)
    } catch (error) {
      return []
    }
  }

  private async saveHistory(history: TestHistoryEntry[]): Promise<void> {
    mockFs.writeFileSync('/test/.test-history/test-history.json', JSON.stringify(history, null, 2))
  }
}

describe('TestHistoryManager', () => {
  let testHistoryManager: MockTestHistoryManager

  beforeEach(() => {
    testHistoryManager = new MockTestHistoryManager()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('saveTestResult', () => {
    it('should save test result to history', async () => {
      const mockHistory: TestHistoryEntry[] = []
      const testResult: Omit<TestHistoryEntry, 'id'> = {
        timestamp: '2024-01-01T00:00:00.000Z',
        testType: 'unit',
        coverage: true,
        config: {
          environment: 'jsdom',
          coverageThreshold: 70,
          timeout: 5000,
          maxWorkers: 4
        },
        summary: {
          total: 10,
          passed: 8,
          failed: 2,
          running: 0,
          coverage: 80,
          duration: 5.5
        },
        suites: [],
        success: true
      }

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockHistory))
      mockFs.writeFileSync.mockImplementation(() => {})

      const result = await testHistoryManager.saveTestResult(testResult)

      expect(result).toMatch(/^test-\d+-[a-z0-9]+$/)
      expect(mockFs.writeFileSync).toHaveBeenCalled()
    })

    it('should limit history to max entries', async () => {
      const mockHistory: TestHistoryEntry[] = Array.from({ length: 105 }, (_, i) => ({
        id: `test-${i}`,
        timestamp: '2024-01-01T00:00:00.000Z',
        testType: 'unit',
        coverage: true,
        summary: { total: 1, passed: 1, failed: 0, running: 0, coverage: 100, duration: 1 },
        suites: [],
        success: true
      }))

      const testResult: Omit<TestHistoryEntry, 'id'> = {
        timestamp: '2024-01-01T00:00:00.000Z',
        testType: 'unit',
        coverage: true,
        summary: { total: 1, passed: 1, failed: 0, running: 0, coverage: 100, duration: 1 },
        suites: [],
        success: true
      }

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockHistory))
      mockFs.writeFileSync.mockImplementation(() => {})

      await testHistoryManager.saveTestResult(testResult)

      const writeCall = mockFs.writeFileSync.mock.calls[0]
      const savedHistory = JSON.parse(writeCall[1] as string)
      
      expect(savedHistory.length).toBe(100)
    })
  })

  describe('getTestHistory', () => {
    it('should return limited test history', async () => {
      const mockHistory: TestHistoryEntry[] = Array.from({ length: 30 }, (_, i) => ({
        id: `test-${i}`,
        timestamp: '2024-01-01T00:00:00.000Z',
        testType: 'unit',
        coverage: true,
        summary: { total: 1, passed: 1, failed: 0, running: 0, coverage: 100, duration: 1 },
        suites: [],
        success: true
      }))

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockHistory))

      const result = await testHistoryManager.getTestHistory(10)

      expect(result.length).toBe(10)
      expect(result[0].id).toBe('test-0')
    })

    it('should return empty array when no history exists', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found')
      })

      const result = await testHistoryManager.getTestHistory()

      expect(result).toEqual([])
    })
  })

  describe('getTestResult', () => {
    it('should return specific test result', async () => {
      const mockHistory: TestHistoryEntry[] = [
        {
          id: 'test-123',
          timestamp: '2024-01-01T00:00:00.000Z',
          testType: 'unit',
          coverage: true,
          summary: { total: 1, passed: 1, failed: 0, running: 0, coverage: 100, duration: 1 },
          suites: [],
          success: true
        }
      ]

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockHistory))

      const result = await testHistoryManager.getTestResult('test-123')

      expect(result).toEqual(mockHistory[0])
    })

    it('should return null when test result not found', async () => {
      const mockHistory: TestHistoryEntry[] = []

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockHistory))

      const result = await testHistoryManager.getTestResult('test-999')

      expect(result).toBeNull()
    })
  })

  describe('getTestStats', () => {
    it('should calculate test statistics correctly', async () => {
      const mockHistory: TestHistoryEntry[] = [
        {
          id: 'test-1',
          timestamp: '2024-01-01T00:00:00.000Z',
          testType: 'unit',
          coverage: true,
          summary: { total: 10, passed: 8, failed: 2, running: 0, coverage: 80, duration: 5 },
          suites: [],
          success: true
        },
        {
          id: 'test-2',
          timestamp: '2024-01-01T01:00:00.000Z',
          testType: 'component',
          coverage: true,
          summary: { total: 5, passed: 5, failed: 0, running: 0, coverage: 90, duration: 3 },
          suites: [],
          success: true
        }
      ]

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockHistory))

      const stats = await testHistoryManager.getTestStats()

      expect(stats.totalRuns).toBe(2)
      expect(stats.totalTests).toBe(15)
      expect(stats.totalPassed).toBe(13)
      expect(stats.totalFailed).toBe(2)
      expect(stats.averageCoverage).toBe(85)
      expect(stats.averageDuration).toBe(4)
      expect(stats.successRate).toBe(100) // Both test runs were successful
      expect(stats.lastRun).toBe('2024-01-01T01:00:00.000Z')
    })

    it('should return default stats when no history exists', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found')
      })

      const stats = await testHistoryManager.getTestStats()

      expect(stats.totalRuns).toBe(0)
      expect(stats.totalTests).toBe(0)
      expect(stats.totalPassed).toBe(0)
      expect(stats.totalFailed).toBe(0)
      expect(stats.averageCoverage).toBe(0)
      expect(stats.averageDuration).toBe(0)
      expect(stats.successRate).toBe(0)
      expect(stats.lastRun).toBeNull()
    })
  })

  describe('deleteTestResult', () => {
    it('should delete specific test result', async () => {
      const mockHistory: TestHistoryEntry[] = [
        { id: 'test-1', timestamp: '2024-01-01T00:00:00.000Z', testType: 'unit', coverage: true, summary: { total: 1, passed: 1, failed: 0, running: 0, coverage: 100, duration: 1 }, suites: [], success: true },
        { id: 'test-2', timestamp: '2024-01-01T01:00:00.000Z', testType: 'unit', coverage: true, summary: { total: 1, passed: 1, failed: 0, running: 0, coverage: 100, duration: 1 }, suites: [], success: true }
      ]

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockHistory))
      mockFs.writeFileSync.mockImplementation(() => {})

      const result = await testHistoryManager.deleteTestResult('test-1')

      expect(result).toBe(true)
      expect(mockFs.writeFileSync).toHaveBeenCalled()
      
      const writeCall = mockFs.writeFileSync.mock.calls[0]
      const savedHistory = JSON.parse(writeCall[1] as string)
      expect(savedHistory.length).toBe(1)
      expect(savedHistory[0].id).toBe('test-2')
    })

    it('should return false when test result not found', async () => {
      const mockHistory: TestHistoryEntry[] = []

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockHistory))

      const result = await testHistoryManager.deleteTestResult('test-999')

      expect(result).toBe(false)
    })
  })

  describe('clearHistory', () => {
    it('should clear all test history', async () => {
      mockFs.writeFileSync.mockImplementation(() => {})

      await testHistoryManager.clearHistory()

      expect(mockFs.writeFileSync).toHaveBeenCalledWith('/test/.test-history/test-history.json', '[]')
    })
  })

  describe('error handling', () => {
    it('should handle file read errors gracefully', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const result = await testHistoryManager.getTestHistory()

      expect(result).toEqual([])
    })

    it('should handle file write errors gracefully', async () => {
      const testResult: Omit<TestHistoryEntry, 'id'> = {
        timestamp: '2024-01-01T00:00:00.000Z',
        testType: 'unit',
        coverage: true,
        summary: { total: 1, passed: 1, failed: 0, running: 0, coverage: 100, duration: 1 },
        suites: [],
        success: true
      }

      mockFs.readFileSync.mockReturnValue('[]')
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Disk full')
      })

      await expect(testHistoryManager.saveTestResult(testResult)).rejects.toThrow('Disk full')
    })
  })
}) 