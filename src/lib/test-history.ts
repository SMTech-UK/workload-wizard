import fs from 'fs'
import path from 'path'

export interface TestHistoryEntry {
  id: string
  timestamp: string
  testType: string
  coverage: boolean
  config?: {
    environment: string
    coverageThreshold: number
    timeout: number
    maxWorkers: number
  }
  coverageDetails?: {
    statements: number
    branches: number
    functions: number
    lines: number
  }
  summary: {
    total: number
    passed: number
    failed: number
    running: number
    coverage: number
    duration: number
  }
  suites: Array<{
    name: string
    total: number
    passed: number
    failed: number
    running: number
    duration: number
    results: Array<{
      id: string
      name: string
      status: 'passed' | 'failed' | 'pending'
      duration: number
      error: string
      category: string
      timestamp: string
    }>
  }>
  success: boolean
  error?: string
}

export interface TestHistoryStats {
  totalRuns: number
  totalTests: number
  totalPassed: number
  totalFailed: number
  averageCoverage: number
  averageDuration: number
  lastRun: string | null
  successRate: number
}

class TestHistoryManager {
  private historyDir: string
  private maxEntries: number = 100 // Keep last 100 test runs

  constructor() {
    this.historyDir = path.join(process.cwd(), '.test-history')
    this.ensureHistoryDir()
  }

  private ensureHistoryDir(): void {
    if (!fs.existsSync(this.historyDir)) {
      fs.mkdirSync(this.historyDir, { recursive: true })
    }
  }

  private getHistoryFilePath(): string {
    return path.join(this.historyDir, 'test-history.json')
  }

  async saveTestResult(result: Omit<TestHistoryEntry, 'id'>): Promise<string> {
    const id = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const entry: TestHistoryEntry = {
      id,
      ...result
    }

    const history = await this.loadHistory()
    history.unshift(entry) // Add to beginning

    // Keep only the last maxEntries
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
      lastRun: history[0]?.timestamp || null,
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
    const filePath = this.getHistoryFilePath()
    
    try {
      if (!fs.existsSync(filePath)) {
        return []
      }
      
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error loading test history:', error)
      return []
    }
  }

  private async saveHistory(history: TestHistoryEntry[]): Promise<void> {
    const filePath = this.getHistoryFilePath()
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(history, null, 2))
    } catch (error) {
      console.error('Error saving test history:', error)
    }
  }
}

export const testHistoryManager = new TestHistoryManager() 