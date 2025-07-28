"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3, 
  History, 
  Settings, 
  TestTube, 
  Eye,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  FileText,
  Code,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  EyeOff,
  AlertCircle,
  WandSparkles
} from "lucide-react"
import { useTestHistory } from "@/hooks/useTestHistory"
import { TestResultsViewer } from "@/components/features/dev-tools/TestResultsViewer"
import { TestHistoryViewer } from "@/components/features/dev-tools/TestHistoryViewer"
import { useTestRunner } from "@/hooks/useTestRunner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  coverageDetails?: {
    statements: number
    branches: number
    functions: number
    lines: number
  }
  suites: TestSuite[]
  timestamp: string
}

export default function TestDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [testType, setTestType] = useState("all")
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set())
  
  const { runTests, runIndividualTest, testReport, isRunning, error } = useTestRunner()
  const { stats, history, refresh: refreshHistory } = useTestHistory()

  // Test configuration state
  const [testConfig, setTestConfig] = useState({
    environment: 'jsdom',
    coverageThreshold: 70,
    timeout: 5000,
    maxWorkers: 4
  })

  // Export state
  const [isExporting, setIsExporting] = useState(false)
  const [configSaved, setConfigSaved] = useState(false)

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('testConfig')
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setTestConfig(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to parse saved test config:', error)
      }
    }
  }, [])

  // Get the most recent test result for display
  const mostRecentResult = history.length > 0 ? history[0] : null
  const displayReport = testReport || (mostRecentResult ? {
    summary: {
      total: mostRecentResult.summary.total,
      passed: mostRecentResult.summary.passed,
      failed: mostRecentResult.summary.failed,
      running: mostRecentResult.summary.running,
      coverage: mostRecentResult.summary.coverage ?? 0, // Use nullish coalescing
      duration: mostRecentResult.summary.duration
    },
    coverageDetails: mostRecentResult.coverageDetails || null,
    suites: mostRecentResult.suites,
    timestamp: mostRecentResult.timestamp
  } : null)

  // Debug logging
  useEffect(() => {
    if (mostRecentResult) {
      console.log('Most recent result loaded:', {
        summary: mostRecentResult.summary,
        coverage: mostRecentResult.summary.coverage,
        displayReport: displayReport?.summary.coverage,
        hasCoverage: typeof mostRecentResult.summary.coverage === 'number'
      })
    }
  }, [mostRecentResult, displayReport])

  // Handle URL parameters for auto-running tests
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const runParam = urlParams.get('run')
      
      if (runParam && !isRunning && !displayReport) {
        // Auto-run tests based on URL parameter
        console.log(`Auto-running ${runParam} tests from URL parameter`)
        handleRunTests(runParam)
        
        // Clean up the URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('run')
        window.history.replaceState({}, '', newUrl.toString())
      }
    }
  }, [isRunning, displayReport])

  // Load most recent test result from history if no current test report
  useEffect(() => {
    if (!testReport && history.length > 0) {
      const mostRecent = history[0]
      // Convert history entry to test report format for display
      // For now, we'll just use the history data directly
    }
  }, [testReport, history])

  const handleRunTests = async (testType: string = "all") => {
    await runTests(testType, true, testConfig)
    // Refresh history after test run
    setTimeout(() => refreshHistory(), 1000)
  }

  const toggleSuiteDetails = (suiteName: string) => {
    const newExpanded = new Set(expandedSuites)
    if (newExpanded.has(suiteName)) {
      newExpanded.delete(suiteName)
    } else {
      newExpanded.add(suiteName)
    }
    setExpandedSuites(newExpanded)
  }

  const handleSaveConfig = () => {
    localStorage.setItem('testConfig', JSON.stringify(testConfig))
    setConfigSaved(true)
    setTimeout(() => setConfigSaved(false), 3000) // Hide saved message after 3 seconds
    // You could also send this to an API endpoint to save server-side
    console.log('Test configuration saved:', testConfig)
  }

  const handleResetConfig = () => {
    const defaultConfig = {
      environment: 'jsdom',
      coverageThreshold: 70,
      timeout: 5000,
      maxWorkers: 4
    }
    setTestConfig(defaultConfig)
    localStorage.removeItem('testConfig')
    setConfigSaved(true)
    setTimeout(() => setConfigSaved(false), 3000)
    console.log('Test configuration reset to defaults')
  }

  const handleExportTestResults = () => {
    if (!displayReport) return
    
    setIsExporting(true)
    try {
      const exportData = {
        ...displayReport,
        exportTimestamp: new Date().toISOString(),
        config: testConfig
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `test-results-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCoverageReport = () => {
    if (!displayReport || !displayReport.summary.coverage) {
      console.log('No coverage data available for export')
      return
    }
    
    setIsExporting(true)
    try {
      const coverageData = {
        summary: displayReport.summary,
        suites: displayReport.suites,
        exportTimestamp: new Date().toISOString(),
        config: testConfig
      }
      
      const dataStr = JSON.stringify(coverageData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `coverage-report-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Coverage export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportTestCode = () => {
    setIsExporting(true)
    try {
      // This would typically fetch test files from the server
      const testCodeData = {
        testFiles: [],
        exportTimestamp: new Date().toISOString(),
        note: 'Test code export would fetch actual test files from the server'
      }
      
      const dataStr = JSON.stringify(testCodeData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `test-code-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Test code export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPerformanceMetrics = () => {
    if (!displayReport) return
    
    setIsExporting(true)
    try {
      const performanceData = {
        testMetrics: {
          totalTests: displayReport.summary.total,
          passedTests: displayReport.summary.passed,
          failedTests: displayReport.summary.failed,
          duration: displayReport.summary.duration,
          averageTestTime: displayReport.summary.duration / displayReport.summary.total,
          successRate: (displayReport.summary.passed / displayReport.summary.total) * 100
        },
        suiteMetrics: displayReport.suites.map(suite => ({
          name: suite.name,
          total: suite.total,
          passed: suite.passed,
          failed: suite.failed,
          duration: suite.duration,
          successRate: suite.total > 0 ? (suite.passed / suite.total) * 100 : 0
        })),
        exportTimestamp: new Date().toISOString(),
        config: testConfig
      }
      
      const dataStr = JSON.stringify(performanceData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Performance metrics export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'running':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  // Utility function to clean up test names by removing src/__tests__ prefix
  const cleanTestName = (name: string) => {
    return name.replace(/^src\/__tests__\//, '')
  }

  const filteredResults = testReport?.suites.flatMap(suite => 
    suite.results.filter(result => {
      const matchesSearch = result.name.toLowerCase().includes(testType.toLowerCase())
      const matchesType = testType === "all" || result.category === testType
      // The showPassed and showFailed state variables were removed, so this logic needs to be re-evaluated
      // or the original logic needs to be restored. For now, we'll assume all results are shown.
      return matchesSearch && matchesType
    })
  ) || []

  useEffect(() => {
    // The autoRefresh logic was removed from the new_code, so this useEffect is removed.
  }, [testType, runTests])

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-500">
            <WandSparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Test Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Run and monitor tests with real-time results
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">Config:</span>
              <span className="inline-flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {testConfig.environment}
              </span>
              <span>•</span>
              <span>{testConfig.timeout / 1000}s</span>
              <span>•</span>
              <span>{testConfig.maxWorkers}w</span>
            </div>
          </div>
          <div className="flex">
            <Button
              onClick={() => handleRunTests("all")}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 rounded-none rounded-l-md border-r-0"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isRunning ? "Running..." : "Run Tests"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="default"
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-none rounded-r-md border-l-0 px-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Test Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleRunTests("unit")}>
                  <TestTube className="w-4 h-4 mr-2" />
                  Unit Tests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRunTests("component")}>
                  <Code className="w-4 h-4 mr-2" />
                  Component Tests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRunTests("hook")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Hook Tests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRunTests("all")}>
                  <Play className="w-4 h-4 mr-2" />
                  All Tests
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Test Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 max-w-full overflow-hidden">
        <TabsList className="flex w-full bg-white border border-gray-200">
          <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-black data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="results" className="flex-1 data-[state=active]:bg-black data-[state=active]:text-white">Results</TabsTrigger>
          <TabsTrigger value="coverage" className="flex-1 data-[state=active]:bg-black data-[state=active]:text-white">Coverage</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-black data-[state=active]:text-white">History</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-black data-[state=active]:text-white">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-blue-500" />
                  Total Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {displayReport?.summary.total || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {isRunning ? "Running..." : "Tests executed"}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {displayReport ? `${Math.round(displayReport.summary.duration)}s` : "0s"}
                  </Badge>
                  <span className="text-xs text-blue-600">duration</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Passed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {displayReport?.summary.passed || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {displayReport ? `${Math.round((displayReport.summary.passed / displayReport.summary.total) * 100)}%` : "0%"} success rate
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs text-green-600">
                    Success
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {displayReport?.summary.failed || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {displayReport ? `${Math.round((displayReport.summary.failed / displayReport.summary.total) * 100)}%` : "0%"} failure rate
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs text-red-600">
                    Issues
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {typeof displayReport?.summary.coverage === 'number'
                    ? `${Math.round(displayReport.summary.coverage)}%` 
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {typeof displayReport?.summary.coverage === 'number'
                    ? "Code coverage" 
                    : "Coverage not collected"}
                </div>
                <div className="mt-2">
                  {typeof displayReport?.summary.coverage === 'number' ? (
                    <Progress
                      value={displayReport.summary.coverage} 
                      className="h-2" 
                    />
                  ) : (
                    <div className="text-xs text-gray-500 italic">
                      Run tests with coverage enabled to see data
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Stats */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Historical Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalRuns}</div>
                    <div className="text-sm text-gray-600">Total Runs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{Math.round(stats.successRate)}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(stats.averageCoverage)}%</div>
                    <div className="text-sm text-gray-600">Avg Coverage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(stats.averageDuration)}s</div>
                    <div className="text-sm text-gray-600">Avg Duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-100">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Suites</CardTitle>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="h-60 overflow-scroll">
                  <div className="space-y-3">
                    {displayReport?.suites.map((suite, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex flex-wrap items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm leading-tight break-words">
                            {cleanTestName(suite.name)}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Badge variant="outline" className="text-xs text-green-600 whitespace-nowrap">
                            {suite.passed}P
                          </Badge>
                          <Badge variant="outline" className="text-xs text-red-600 whitespace-nowrap">
                            {suite.failed}F
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={suite.total > 0 ? (suite.passed / suite.total) * 100 : 0} 
                        className="h-2" 
                      />
                      <div className="text-xs text-gray-500">
                        {suite.duration.toFixed(1)}s duration
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 h-60 overflow-scroll">
                  {displayReport ? (
                    displayReport.suites.flatMap(suite => suite.results).slice(0, 5).map((result, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                        {getStatusIcon(result.status)}
                        <div className="flex-1 min-w-0 ">
                          <div className="text-sm font-medium truncate">{cleanTestName(result.name)}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        {result.duration && (
                          <Badge variant="outline" className="text-xs">
                            {result.duration.toFixed(1)}s
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <div className="text-sm">No test results</div>
                      <div className="text-xs">Run tests to see activity</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4 max-w-full overflow-hidden">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Test Results</CardTitle>
                <div className="flex gap-2">
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="unit">Unit Tests</SelectItem>
                      <SelectItem value="component">Component Tests</SelectItem>
                      <SelectItem value="hook">Hook Tests</SelectItem>
                      <SelectItem value="integration">Integration Tests</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="space-y-4 max-w-full">
                {/* The showPassed and showFailed buttons were removed from the new_code, so this section is removed. */}

                <ScrollArea className="h-[32rem] w-full overflow-hidden">
                  {displayReport ? (
                    <TestResultsViewer 
                      suites={displayReport.suites}
                      onRerunTest={(testName, testId) => {
                        runIndividualTest(testName, testId, () => {
                          // Refresh history after individual test completes
                          refreshHistory()
                        })
                      }}
                      onRerunSuite={(suiteName) => {
                        handleRunTests("all")
                      }}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TestTube className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No test results available</p>
                      <p className="text-sm">Run tests to see results</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          {/* Overall Coverage Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Coverage</CardTitle>
              <CardDescription>
                Code coverage metrics and breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {displayReport && (displayReport as any)?.coverageDetails ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600">
                      {displayReport.summary.coverage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Coverage</div>
                  </div>
                  
                  {/* Detailed Coverage Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(displayReport as any).coverageDetails.statements.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Statements</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {(displayReport as any).coverageDetails.branches.toFixed(1)}%
                      </div>
                    <div className="text-sm text-gray-600">Branches</div>
                  </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {(displayReport as any).coverageDetails.functions.toFixed(1)}%
                      </div>
                    <div className="text-sm text-gray-600">Functions</div>
                    </div>
                    <div className="text-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {(displayReport as any).coverageDetails.lines.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Lines</div>
                    </div>
                  </div>
                  
                  <Progress 
                    value={displayReport.summary.coverage} 
                    className="h-3" 
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-2xl font-bold text-gray-400">N/A</div>
                  <div className="text-sm text-gray-500">No coverage data available</div>
                  <div className="text-xs text-gray-400 mt-2">
                    Run tests with coverage enabled to see detailed metrics
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coverage by Test Suite */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coverage by Test Suite</CardTitle>
              <CardDescription>
                Test suite performance and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {displayReport?.suites && displayReport.suites.length > 0 ? (
                <div className="space-y-4">
                  {displayReport.suites.map((suite, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex flex-wrap items-start gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm leading-tight break-words">
                            {cleanTestName(suite.name)}
                          </h4>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Badge variant="outline" className="text-xs text-green-600 whitespace-nowrap">
                            {suite.passed}P
                          </Badge>
                          <Badge variant="outline" className="text-xs text-red-600 whitespace-nowrap">
                            {suite.failed}F
                          </Badge>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {suite.total}T
                          </Badge>
                        </div>
                      </div>
                      
                      <Progress 
                        value={suite.total > 0 ? (suite.passed / suite.total) * 100 : 0} 
                        className="h-2" 
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {suite.duration.toFixed(1)}s duration
                      </div>
                    </div>
                  ))}
                  </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400">No test suites available</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <TestHistoryViewer />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Test Configuration & Export</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Configure test settings and export test results, coverage reports, and performance metrics.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Test Environment</Label>
                    <p className="text-xs text-gray-500 mb-2">Select the test environment for running tests</p>
                    <Select value={testConfig.environment} onValueChange={(value) => setTestConfig(prev => ({ ...prev, environment: value }))}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jsdom">jsdom (Default)</SelectItem>
                        <SelectItem value="node">Node.js</SelectItem>
                        <SelectItem value="happy-dom">Happy DOM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Coverage Threshold</Label>
                    <p className="text-xs text-gray-500 mb-2">Minimum code coverage percentage required</p>
                    <div className="flex gap-2 mt-2">
                      <Input type="number" value={testConfig.coverageThreshold} onChange={(e) => setTestConfig(prev => ({ ...prev, coverageThreshold: parseInt(e.target.value, 10) || 0 }))} className="w-20" />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  <div>
                    <Label>Timeout (seconds)</Label>
                    <p className="text-xs text-gray-500 mb-2">Maximum time allowed for test execution</p>
                    <div className="flex gap-2 mt-2">
                      <Input type="number" value={testConfig.timeout / 1000} onChange={(e) => setTestConfig(prev => ({ ...prev, timeout: parseInt(e.target.value, 10) * 1000 || 5000 }))} className="w-20" />
                      <span className="text-sm text-gray-600">seconds</span>
                    </div>
                  </div>
                  <div>
                    <Label>Max Workers</Label>
                    <p className="text-xs text-gray-500 mb-2">Number of parallel test workers</p>
                    <div className="flex gap-2 mt-2">
                      <Input type="number" value={testConfig.maxWorkers} onChange={(e) => setTestConfig(prev => ({ ...prev, maxWorkers: parseInt(e.target.value, 10) || 4 }))} className="w-20" />
                      <span className="text-sm text-gray-600">threads</span>
                    </div>
                  </div>
                  <Button onClick={handleSaveConfig} className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button onClick={handleResetConfig} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button 
                    onClick={() => handleRunTests("all")} 
                    disabled={isRunning}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isRunning ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Run Tests with Current Config
                  </Button>
                  {configSaved && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Configuration saved!
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Functions</CardTitle>
                <CardDescription>
                  Export test results, coverage reports, and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleExportTestResults}
                  disabled={!displayReport || isExporting}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Test Results'}
                  </Button>
                
                <Button 
                  onClick={handleExportCoverageReport}
                  disabled={!displayReport?.summary.coverage || isExporting}
                  className="w-full"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Coverage Report'}
                  </Button>
                
                <Button 
                  onClick={handleExportTestCode}
                  disabled={!displayReport || isExporting}
                  className="w-full"
                >
                    <Code className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Test Code'}
                  </Button>
                
                <Button 
                  onClick={handleExportPerformanceMetrics}
                  disabled={!displayReport || isExporting}
                  className="w-full"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Performance Metrics'}
                  </Button>
              </CardContent>
            </Card>
          </div>
          
        </TabsContent>
      </Tabs>
    </div>
  )
} 