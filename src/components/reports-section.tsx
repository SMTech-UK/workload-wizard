"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { FileText, Download, Calendar, Users, BookOpen, TrendingUp, AlertTriangle } from "lucide-react"

// Mock report data
const departmentSummary = [
  {
    department: "Computer Science",
    lecturers: 12,
    modules: 28,
    totalCapacity: 14400,
    assignedHours: 13200,
    utilizationRate: 92,
    overloadedStaff: 1,
  },
  {
    department: "Mathematics",
    lecturers: 8,
    modules: 22,
    totalCapacity: 9600,
    assignedHours: 8800,
    utilizationRate: 92,
    overloadedStaff: 2,
  },
  {
    department: "Physics",
    lecturers: 6,
    modules: 18,
    totalCapacity: 7200,
    assignedHours: 6400,
    utilizationRate: 89,
    overloadedStaff: 0,
  },
  {
    department: "Chemistry",
    lecturers: 5,
    modules: 15,
    totalCapacity: 6000,
    assignedHours: 5200,
    utilizationRate: 87,
    overloadedStaff: 0,
  },
]

const workloadTrends = [
  { period: "Sep 2024", capacity: 22500, assigned: 18420, utilization: 82 },
  { period: "Oct 2024", capacity: 22500, assigned: 19200, utilization: 85 },
  { period: "Nov 2024", capacity: 22500, assigned: 20100, utilization: 89 },
  { period: "Dec 2024", capacity: 22500, assigned: 19800, utilization: 88 },
  { period: "Jan 2025", capacity: 22500, assigned: 20500, utilization: 91 },
]

const reportTemplates = [
  {
    id: 1,
    name: "Department Workload Summary",
    description: "Overview of workload distribution by department",
    type: "summary",
    lastGenerated: "2 hours ago",
  },
  {
    id: 2,
    name: "Individual Lecturer Report",
    description: "Detailed breakdown for specific lecturers",
    type: "individual",
    lastGenerated: "1 day ago",
  },
  {
    id: 3,
    name: "Module Assignment Report",
    description: "Complete module allocation overview",
    type: "modules",
    lastGenerated: "3 hours ago",
  },
  {
    id: 4,
    name: "Capacity Analysis Report",
    description: "Staff capacity utilization and trends",
    type: "capacity",
    lastGenerated: "5 hours ago",
  },
]

export default function ReportsSection({ onViewAllActivity }: { onViewAllActivity?: () => void }) {
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("current")

  const getUtilizationColor = (rate: number) => {
    if (rate > 95) return "text-red-600"
    if (rate > 85) return "text-amber-600"
    return "text-green-600"
  }

  const getUtilizationBadge = (rate: number) => {
    if (rate > 95) return <Badge variant="destructive">High</Badge>
    if (rate > 85) return <Badge variant="secondary">Moderate</Badge>
    return (
      <Badge variant="default" className="bg-green-600">
        Optimal
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive workload analysis and reporting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onViewAllActivity}>
            View All Activity
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">31 total lecturers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83</div>
            <p className="text-xs text-muted-foreground">12 unassigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90%</div>
            <p className="text-xs text-muted-foreground">+5% from last semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overloaded Staff</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Customize your report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Semester</SelectItem>
                <SelectItem value="semester1">Semester 1</SelectItem>
                <SelectItem value="semester2">Semester 2</SelectItem>
                <SelectItem value="full-year">Full Academic Year</SelectItem>
              </SelectContent>
            </Select>
            <Button>Generate Report</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Department Summary</CardTitle>
            <CardDescription>Workload distribution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentSummary.map((dept) => (
                  <TableRow key={dept.department}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{dept.department}</div>
                        <div className="text-sm text-muted-foreground">{dept.modules} modules</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {dept.lecturers}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className={`text-sm font-medium ${getUtilizationColor(dept.utilizationRate)}`}>
                          {dept.utilizationRate}%
                        </div>
                        <Progress value={dept.utilizationRate} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getUtilizationBadge(dept.utilizationRate)}
                        {dept.overloadedStaff > 0 && (
                          <div className="text-xs text-red-600">{dept.overloadedStaff} overloaded</div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Workload Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Workload Trends</CardTitle>
            <CardDescription>Capacity utilization over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workloadTrends.map((trend, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{trend.period}</span>
                    <span className={getUtilizationColor(trend.utilization)}>{trend.utilization}%</span>
                  </div>
                  <Progress value={trend.utilization} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{trend.assigned.toLocaleString()}h assigned</span>
                    <span>{trend.capacity.toLocaleString()}h capacity</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Pre-configured reports for common analysis needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium">{template.name}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Last generated: {template.lastGenerated}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
