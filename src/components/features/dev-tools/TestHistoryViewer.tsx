import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Eye,
  Filter,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useTestHistory } from '@/hooks/useTestHistory'
import { TestResultsViewer } from './TestResultsViewer'
import type { TestHistoryEntry } from '@/lib/test-history'

interface TestHistoryViewerProps {
  onViewResult?: (result: TestHistoryEntry) => void
}

export function TestHistoryViewer({ onViewResult }: TestHistoryViewerProps) {
  const { history, stats, loading, error, deleteTestResult, clearHistory, refresh } = useTestHistory()
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResult, setSelectedResult] = useState<TestHistoryEntry | null>(null)

  const filteredHistory = history.filter(entry => {
    const matchesType = filterType === 'all' || entry.testType === filterType
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'success' && entry.success) ||
      (filterStatus === 'failed' && !entry.success)
    const matchesSearch = searchTerm === '' || 
      entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.testType.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesType && matchesStatus && matchesSearch
  })

  const handleViewResult = (result: TestHistoryEntry) => {
    setSelectedResult(result)
    onViewResult?.(result)
  }

  const handleDeleteResult = async (id: string) => {
    await deleteTestResult(id)
  }

  const handleClearHistory = async () => {
    await clearHistory()
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
    return `${seconds.toFixed(2)}s`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (success: boolean) => {
    return success ? 
      <Badge variant="default" className="bg-green-100 text-green-800">Passed</Badge> :
      <Badge variant="destructive">Failed</Badge>
  }

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading test history...
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Error loading test history: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Test History Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalRuns}</div>
                <div className="text-sm text-muted-foreground">Total Runs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.averageCoverage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Avg Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</div>
                <div className="text-sm text-muted-foreground">Avg Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Test History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear Test History</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all test history. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(new Event('click'))}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleClearHistory}>Clear All</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type-filter">Test Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tests</SelectItem>
                  <SelectItem value="unit">Unit Tests</SelectItem>
                  <SelectItem value="component">Component Tests</SelectItem>
                  <SelectItem value="hook">Hook Tests</SelectItem>
                  <SelectItem value="integration">Integration Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* History List */}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No test history found
                </div>
              ) : (
                filteredHistory.map((entry) => (
                  <Card key={entry.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(entry.success)}
                          <div>
                            <div className="font-medium text-sm">
                              {entry.testType === 'all' ? 'All Tests' : entry.testType.split(',').map(type => type.trim().charAt(0).toUpperCase() + type.trim().slice(1)).join(', ')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTimestamp(entry.timestamp)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {entry.summary.passed}/{entry.summary.total} passed
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDuration(entry.summary.duration)}
                            </div>
                          </div>
                          {getStatusBadge(entry.success)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
                              <DialogHeader>
                                <DialogTitle>Test Result Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 h-[calc(80vh-120px)] overflow-y-auto pr-2">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Test Type:</span> {entry.testType === 'all' ? 'All Tests' : entry.testType.split(',').map(type => type.trim().charAt(0).toUpperCase() + type.trim().slice(1)).join(', ')}
                                  </div>
                                  <div>
                                    <span className="font-medium">Coverage:</span> {entry.summary.coverage}%
                                  </div>
                                  <div>
                                    <span className="font-medium">Duration:</span> {formatDuration(entry.summary.duration)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Timestamp:</span> {formatTimestamp(entry.timestamp)}
                                  </div>
                                </div>
                                
                                {/* Configuration Information */}
                                {entry.config && (
                                  <>
                                    <Separator />
                                    <div>
                                      <h4 className="font-medium mb-2">Configuration Used</h4>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium">Environment:</span> {entry.config.environment || 'jsdom'}
                                        </div>
                                        <div>
                                          <span className="font-medium">Coverage Threshold:</span> {entry.config.coverageThreshold || 70}%
                                        </div>
                                        <div>
                                          <span className="font-medium">Timeout:</span> {(entry.config.timeout || 5000) / 1000}s
                                        </div>
                                        <div>
                                          <span className="font-medium">Max Workers:</span> {entry.config.maxWorkers || 4}
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                                
                                <Separator />
                                <TestResultsViewer 
                                  suites={entry.suites}
                                  onRerunTest={() => {}}
                                  onRerunSuite={() => {}}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Test Result</DialogTitle>
                                <DialogDescription>
                                  This will permanently delete this test result. This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(new Event('click'))}>
                                  Cancel
                                </Button>
                                <Button variant="destructive" onClick={() => handleDeleteResult(entry.id)}>
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 