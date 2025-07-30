"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Activity, 
  Database, 
  Network, 
  Users, 
  Settings, 
  BarChart3, 
  Download, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Terminal, 
  Copy, 
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  TestTube,
  XCircle,
  Code
} from "lucide-react"

export default function DevToolsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Developer Tools</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            System monitoring, testing, and development utilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  Healthy
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  All systems operational
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs text-green-600">
                    development
                  </Badge>
                  <span className="text-xs text-green-600">environment</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  0
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Currently online</div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Development
                  </Badge>
                  <span className="text-xs text-blue-600">deployment</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-500" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  Connected
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Response time: 45ms
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    0
                  </Badge>
                  <span className="text-xs text-purple-600">total records</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Network className="w-4 h-4 text-orange-500" />
                  Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  0
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">API requests/min</div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    1.0.0
                  </Badge>
                  <span className="text-xs text-orange-600">version</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span className="text-green-600">12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span className="text-blue-600">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Error Rate</span>
                      <span className="text-yellow-600">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cache Hit Rate</span>
                      <span className="text-purple-600">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-4 text-gray-500">
                    <div className="text-sm">No recent activity</div>
                    <div className="text-xs">System events will appear here</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Response Time</span>
                      <span className="text-green-600">45ms</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Requests per Second</span>
                      <span className="text-blue-600">0</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Error Rate</span>
                      <span className="text-green-600">0.1%</span>
                    </div>
                    <Progress value={0.1} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cache Hit Rate</span>
                      <span className="text-purple-600">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Database Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Query Response Time</span>
                      <span className="text-green-600">12ms</span>
                    </div>
                    <Progress value={24} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Database Queries</span>
                      <span className="text-blue-600">24</span>
                    </div>
                    <Progress value={24} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total Records</span>
                      <span className="text-green-600">0</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Tables</span>
                      <span className="text-yellow-600">0</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Performance charts would appear here</p>
                  <p className="text-sm">Showing response times, throughput, and error rates over time</p>
                </div>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Metrics
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Alerts
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Live System Logs</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Filter logs..."
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Auto-scroll
                  </Button>
                </div>

                <ScrollArea className="h-96 w-full rounded border bg-black text-green-400 p-4">
                  <pre className="text-sm font-mono">
                    <div className="text-gray-400">
                      <div>[{new Date().toLocaleTimeString()}] INFO  System monitoring active</div>
                      <div>[{new Date().toLocaleTimeString()}] INFO  No recent events</div>
                      <div>[{new Date().toLocaleTimeString()}] INFO  Waiting for activity...</div>
                    </div>
                  </pre>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-4 text-gray-500">
                    <div className="text-sm">No active alerts</div>
                    <div className="text-xs">System is running normally</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alert Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>CPU Usage Threshold</Label>
                    <div className="flex gap-2 mt-2">
                      <Input type="number" className="w-20" />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  <div>
                    <Label>Memory Usage Threshold</Label>
                    <div className="flex gap-2 mt-2">
                      <Input type="number" className="w-20" />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  <div>
                    <Label>Response Time Threshold</Label>
                    <div className="flex gap-2 mt-2">
                      <Input type="number" className="w-20" />
                      <span className="text-sm text-gray-600">ms</span>
                    </div>
                  </div>
                  <div>
                    <Label>Error Rate Threshold</Label>
                    <div className="flex gap-2 mt-2">
                      <Input type="number" className="w-20" />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center py-4 text-gray-500">
                  <div className="text-sm">No alert history</div>
                  <div className="text-xs">Past alerts will appear here</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Test Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Run and monitor tests with real-time results
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.open('/test-dashboard', '_blank')}>
                <TestTube className="w-4 h-4 mr-2" />
                Open Test Dashboard
              </Button>
              <Button onClick={() => window.open('/test-dashboard', '_blank')}>
                <Play className="w-4 h-4 mr-2" />
                Run Tests
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-blue-500" />
                  Total Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">-</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tests available
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    -
                  </Badge>
                  <span className="text-xs text-blue-600">avg duration</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Passed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">-</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Success rate
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs text-green-600">
                    -
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">-</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Failure rate
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs text-red-600">
                    -
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">-</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Code coverage
                </div>
                <div className="mt-2">
                  <Progress value={0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Suites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Unit Tests", passed: 7, failed: 1, total: 8, duration: 4.2 },
                    { name: "Component Tests", passed: 10, failed: 1, total: 12, duration: 6.1 },
                    { name: "Hook Tests", passed: 3, failed: 0, total: 4, duration: 2.0 }
                  ].map((suite, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{suite.name}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs text-green-600">
                            {suite.passed} passed
                          </Badge>
                          <Badge variant="outline" className="text-xs text-red-600">
                            {suite.failed} failed
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('/test-dashboard', '_blank')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run All Tests
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('/test-dashboard?type=unit', '_blank')}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Run Unit Tests Only
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('/test-dashboard?type=component', '_blank')}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Run Component Tests
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('/test-dashboard?type=hook', '_blank')}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Run Hook Tests
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('/test-dashboard?tab=coverage', '_blank')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Coverage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 