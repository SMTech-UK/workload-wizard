import { useState, useCallback } from 'react'

interface TestResult {
  id: string
  name: string
  status: 'passed' | 'failed' | 'running' | 'pending'
  duration?: number
  error?: string
  category: string
  timestamp: string
}

interface TestSuite {
  name: string
  total: number
  passed: number
  failed: number
  running: number
  duration: number
  results: TestResult[]
}

interface TestReport {
  summary: {
    total: number
    passed: number
    failed: number
    running: number
    coverage: number
    duration: number
  }
  suites: TestSuite[]
  timestamp: string
}

interface UseTestRunnerReturn {
  isRunning: boolean
  testReport: TestReport | null
  error: string | null
  runTests: (testType?: string, coverage?: boolean, config?: any) => Promise<void>
  runIndividualTest: (testName: string, testId: string, onComplete?: () => void) => Promise<void>
  stopTests: () => void
  clearResults: () => void
}

export function useTestRunner(): UseTestRunnerReturn {
  const [isRunning, setIsRunning] = useState(false)
  const [testReport, setTestReport] = useState<TestReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runTests = useCallback(async (testType: string = 'all', coverage: boolean = true, config?: any) => {
    setIsRunning(true)
    setError(null)
    setTestReport(null)

    try {
      const response = await fetch('/api/test-runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType,
          coverage,
          config
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setTestReport(data.results)
        // Clear any previous errors since the API call succeeded
        setError(null)
      } else {
        setError(data.error || 'Test execution failed')
        setTestReport(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsRunning(false)
    }
  }, [])

  const stopTests = useCallback(() => {
    setIsRunning(false)
  }, [])

  const clearResults = useCallback(() => {
    setTestReport(null)
    setError(null)
  }, [])

  const runIndividualTest = useCallback(async (testName: string, testId: string, onComplete?: () => void) => {
    setIsRunning(true)
    setError(null)

    try {
      const requestBody = {
        testType: 'individual',
        testName,
        testId,
        coverage: false
      }
      
      const response = await fetch('/api/test-runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      if (data.success) {
        setTestReport(data.results)
        setError(null)
      } else {
        setError(data.error || 'Individual test execution failed')
        setTestReport(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsRunning(false)
      // Call completion callback if provided
      if (onComplete) {
        setTimeout(onComplete, 500)
      }
    }
  }, [])

  return {
    isRunning,
    testReport,
    error,
    runTests,
    runIndividualTest,
    stopTests,
    clearResults
  }
} 