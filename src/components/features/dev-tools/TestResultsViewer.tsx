"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  FileText,
  Code,
  AlertTriangle,
  Copy,
  ExternalLink,
  Eye
} from "lucide-react"

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

interface TestResultsViewerProps {
  suites: TestSuite[]
  onRerunTest?: (testName: string, testId: string) => void
  onRerunSuite?: (suiteName: string) => void
}

export function TestResultsViewer({ suites, onRerunTest, onRerunSuite }: TestResultsViewerProps) {
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set())
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set())
  const [selectedTestCode, setSelectedTestCode] = useState<{ name: string; code: string } | null>(null)

  const toggleSuite = (suiteName: string) => {
    const newExpanded = new Set(expandedSuites)
    if (newExpanded.has(suiteName)) {
      newExpanded.delete(suiteName)
    } else {
      newExpanded.add(suiteName)
    }
    setExpandedSuites(newExpanded)
  }

  const toggleTest = (testId: string) => {
    const newExpanded = new Set(expandedTests)
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId)
    } else {
      newExpanded.add(testId)
    }
    setExpandedTests(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200'
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200'
      case 'running':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Utility function to clean up test names by removing src/__tests__ prefix
  const cleanTestName = (name: string) => {
    return name.replace(/^src\/__tests__\//, '')
  }

  const handleViewCode = async (testName: string, testId?: string) => {
    try {
      // Convert test name to file path
      const filePath = testName.startsWith('src/__tests__/') 
        ? testName 
        : `src/__tests__/${testName}`
      
      // Fetch the test file content with optional test ID for specific section
      const url = testId 
        ? `/api/test-code?file=${encodeURIComponent(filePath)}&testId=${encodeURIComponent(testId)}`
        : `/api/test-code?file=${encodeURIComponent(filePath)}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setSelectedTestCode({
          name: cleanTestName(testName),
          code: data.code
        })
      } else {
        // Fallback: show a placeholder with the file path
        setSelectedTestCode({
          name: cleanTestName(testName),
          code: `// Test file: ${filePath}\n// Content not available\n// This would show the actual test code when the API endpoint is implemented`
        })
      }
    } catch (error) {
      console.error('Failed to fetch test code:', error)
      setSelectedTestCode({
        name: cleanTestName(testName),
        code: `// Error loading test code for: ${testName}\n// ${error}`
      })
    }
  }

  return (
    <div className="space-y-4">
      {suites.map((suite, suiteIndex) => (
        <Collapsible key={suiteIndex} open={expandedSuites.has(suite.name)} onOpenChange={() => toggleSuite(suite.name)}>
          <Card className="overflow-hidden max-w-full">
                        <CardHeader className="pb-3">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-start gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <CollapsibleTrigger
                      className="flex items-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
                    >
                      {expandedSuites.has(suite.name) ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex items-start gap-2 min-w-0">
                        {getStatusIcon(suite.failed > 0 ? 'failed' : 'passed')}
                        <CardTitle className="text-base break-words min-w-0 leading-relaxed">{cleanTestName(suite.name)}</CardTitle>
                      </div>
                    </CollapsibleTrigger>
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0">
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs text-green-600 whitespace-nowrap">
                        {suite.passed}P
                      </Badge>
                      <Badge variant="outline" className="text-xs text-red-600 whitespace-nowrap">
                        {suite.failed}F
                      </Badge>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {suite.duration.toFixed(1)}s
                      </Badge>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCode(suite.name)}
                          className="whitespace-nowrap"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>Test Suite Code: {selectedTestCode?.name || cleanTestName(suite.name)}</DialogTitle>
                          <DialogDescription>
                            View the source code for this test suite
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-96 w-full">
                          <pre className="text-sm font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
                            <code>{selectedTestCode?.code || 'Loading...'}</code>
                          </pre>
                        </ScrollArea>
                        <div className="flex justify-end gap-2 mt-4 px-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(selectedTestCode?.code || '')}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Code
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/test-code?file=${encodeURIComponent(suite.name)}&download=true`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {onRerunSuite && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRerunSuite(suite.name)}
                        className="whitespace-nowrap"
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Rerun
                      </Button>
                    )}
                  </div>
                </div>
                <div className="ml-6">
                  <Progress 
                    value={suite.total > 0 ? (suite.passed / suite.total) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </div>
            </CardHeader>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {suite.results.map((test, testIndex) => (
                    <Collapsible key={test.id} open={expandedTests.has(test.id)} onOpenChange={() => toggleTest(test.id)}>
                      <div
                        className={`p-3 rounded-lg border ${getStatusColor(test.status)} overflow-hidden`}
                      >
                        <div className="flex flex-wrap items-start gap-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <CollapsibleTrigger
                              className="flex items-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
                            >
                              {expandedTests.has(test.id) ? (
                                <ChevronDown className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              ) : (
                                <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              )}
                              {getStatusIcon(test.status)}
                              <span className="font-medium text-sm break-words min-w-0 leading-relaxed text-left">{cleanTestName(test.name)}</span>
                            </CollapsibleTrigger>
                          </div>
                          <div className="flex items-start gap-2 flex-shrink-0">
                            {test.duration && (
                              <Badge variant="outline" className="text-xs whitespace-nowrap">
                                {test.duration.toFixed(1)}s
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {test.category.charAt(0).toUpperCase() + test.category.slice(1)}
                            </Badge>
                            {onRerunTest && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRerunTest(test.name, test.id)}
                                className="whitespace-nowrap"
                              >
                                <Code className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <CollapsibleContent>
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                <span>Test ID: {test.id}</span>
                                <span>Category: {test.category}</span>
                              </div>
                              {test.error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    <span className="font-medium text-red-700 dark:text-red-300">Error</span>
                                  </div>
                                  <pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono">
                                    {test.error}
                                  </pre>
                                                                     <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => copyToClipboard(test.error || '')}
                                     className="mt-2"
                                   >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy Error
                                  </Button>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <span>Duration: {test.duration?.toFixed(3) || 0}s</span>
                                <span>•</span>
                                <span>Timestamp: {new Date(test.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  )
} 