"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Users, BookOpen, Clock, AlertTriangle, FileText, Settings } from "lucide-react"
import Navigation from "@/components/navigation"
import LecturerManagement from "@/components/lecturer-management"
import ModuleAssignment from "@/components/module-assignment"
import ReportsSection from "@/components/reports-section"

// Mock data
const dashboardData = {
  totalLecturers: 45,
  totalModules: 128,
  assignedHours: 18420,
  totalCapacity: 22500,
  overloadedStaff: 3,
  unassignedModules: 12,
  pendingApprovals: 7,
}

const recentActivity = [
  { id: 1, action: "Module CS101 assigned to Dr. Smith", time: "2 hours ago", type: "assignment" },
  { id: 2, action: "Workload template updated for Semester 2", time: "4 hours ago", type: "update" },
  { id: 3, action: "Dr. Johnson requested capacity review", time: "1 day ago", type: "request" },
  { id: 4, action: "New lecturer profile created: Dr. Williams", time: "2 days ago", type: "creation" },
]

const capacityOverview = [
  { name: "Dr. Smith", assigned: 1150, capacity: 1200, type: "AP", status: "near-capacity" },
  { name: "Dr. Johnson", assigned: 1250, capacity: 1200, type: "AP", status: "overloaded" },
  { name: "Dr. Williams", assigned: 800, capacity: 900, type: "TA", status: "available" },
  { name: "Dr. Brown", assigned: 400, capacity: 450, type: "RA", status: "available" },
  { name: "Dr. Davis", assigned: 1180, capacity: 1200, type: "AP", status: "near-capacity" },
]

export default function AcademicWorkloadPlanner() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overloaded":
        return "bg-red-500"
      case "near-capacity":
        return "bg-amber-500"
      case "available":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overloaded":
        return <Badge variant="destructive">Overloaded</Badge>
      case "near-capacity":
        return <Badge variant="secondary">Near Capacity</Badge>
      case "available":
        return (
          <Badge variant="default" className="bg-green-600">
            Available
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Academic Workload Dashboard</h1>
                <p className="text-gray-600 mt-1">September 2024 - September 2025 Academic Year</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalLecturers}</div>
                  <p className="text-xs text-muted-foreground">+2 from last semester</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalModules}</div>
                  <p className="text-xs text-muted-foreground">{dashboardData.unassignedModules} unassigned</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((dashboardData.assignedHours / dashboardData.totalCapacity) * 100)}%
                  </div>
                  <Progress
                    value={(dashboardData.assignedHours / dashboardData.totalCapacity) * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{dashboardData.overloadedStaff}</div>
                  <p className="text-xs text-muted-foreground">Staff over capacity</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Capacity Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Staff Capacity Overview</CardTitle>
                  <CardDescription>Current workload allocation by lecturer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {capacityOverview.map((lecturer, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lecturer.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {lecturer.type}
                          </Badge>
                        </div>
                        {getStatusBadge(lecturer.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(lecturer.assigned / lecturer.capacity) * 100} className="flex-1" />
                        <span className="text-sm text-muted-foreground min-w-fit">
                          {lecturer.assigned}h / {lecturer.capacity}h
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest workload management activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common workload management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <Users className="w-6 h-6" />
                    Add New Lecturer
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <BookOpen className="w-6 h-6" />
                    Import Modules
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <FileText className="w-6 h-6" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lecturers">
            <LecturerManagement />
          </TabsContent>

          <TabsContent value="assignments">
            <ModuleAssignment />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
