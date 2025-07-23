"use client"

import { useState } from "react"
import { useUser } from "@auth0/nextjs-auth0"
import LandingPage from "@/components/landing-page"
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
import { DashboardCard, DashboardCardData } from "@/components/DashboardCard";
import { DashboardMetricCard } from "@/components/ui/dashboard-metric-card";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect } from "react";



export default function AcademicWorkloadPlanner() {
  const { user, isLoading } = useUser();

  // All hooks must be called unconditionally!
  const [activeTab, setActiveTab] = useState("dashboard");
  const lecturers = useQuery(api.lecturers.getAll) ?? [];
  const modules = useQuery(api.modules.getAll) ?? [];
  const recentActivity = useQuery(api.recent_activity.getAll) ?? [];
  const updateLecturerStatus = useMutation(api.lecturers.updateStatus);

  const totalLecturers = lecturers.length;
  const totalModules = modules.length;
  const unassignedModules = modules.filter(m => m.status === "unassigned").length;
  const overloadedStaff = lecturers.filter(l => l.status === "overloaded").length;
  const totalCapacity = lecturers.reduce((sum, l) => sum + (l.capacity || 0), 0);
  const assignedHours = lecturers.reduce((sum, l) => sum + (l.assigned || 0), 0);
  const capacityUtilization = totalCapacity ? Math.round((assignedHours / totalCapacity) * 100) : 0;

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

  function calculateLecturerStatus(assigned: number, capacity: number): "overloaded" | "near-capacity" | "available" {
    const percent = (assigned / capacity) * 100;
    if (percent > 100) return "overloaded";
    if (percent > 90) return "near-capacity";
    return "available";
  }

  useEffect(() => {
    lecturers.forEach((lecturer: any) => {
      const newStatus = calculateLecturerStatus(lecturer.assigned, lecturer.capacity);
      if (lecturer.status !== newStatus) {
        updateLecturerStatus({ id: lecturer._id, status: newStatus });
      }
    });
  }, [lecturers, updateLecturerStatus]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <LandingPage />;
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
            <DashboardMetricCard
              title="Total Lecturers"
              value={totalLecturers}
              subtitle={`+${totalLecturers - 43} from last semester`} // Example
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <DashboardMetricCard
              title="Total Modules"
              value={totalModules}
              subtitle={`${unassignedModules} unassigned`}
              icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            />
            <DashboardMetricCard
              title="Capacity Utilisation"
              value={`${capacityUtilization}%`}
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            >
              <Progress value={capacityUtilization} className="mt-2" />
            </DashboardMetricCard>
            <DashboardMetricCard
              title="Alerts"
              value={overloadedStaff}
              subtitle="Staff over capacity"
              icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              valueClassName="text-red-600"
            />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Capacity Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Staff Capacity Overview</CardTitle>
                  <CardDescription>Current workload allocation by lecturer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lecturers.map((lecturer, index) => (
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
