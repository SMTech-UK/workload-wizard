"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Calendar, 
  Download, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  PieChart,
  Activity
} from "lucide-react"
import { useUser } from "@clerk/nextjs";
import Navigation from "@/components/layout/navigation"
import SettingsModal, { TabType } from "@/components/modals/settings-modal"
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { DashboardMetricCard } from "@/components/ui/dashboard-metric-card";

// Define interfaces based on the database schema
interface Lecturer {
  _id: string;
  profileId: string;
  academicYearId: string;
  teachingAvailability: number;
  totalAllocated: number;
  allocatedTeachingHours: number;
  allocatedAdminHours: number;
  allocatedResearchHours: number;
  allocatedOtherHours: number;
  team?: string;
  isActive: boolean;
}

interface LecturerProfile {
  _id: string;
  fullName: string;
  email: string;
  family: string;
  fte: number;
  capacity: number;
  maxTeachingHours: number;
  totalContract: number;
  isActive: boolean;
}

interface ModuleIteration {
  _id: string;
  moduleId: string;
  academicYearId: string;
  semester: string;
  year: number;
  assignedLecturerIds: string[];
  assignedStatus: string;
  isActive: boolean;
}

interface Module {
  _id: string;
  code: string;
  title: string;
  credits: number;
  level: number;
  defaultTeachingHours: number;
  defaultMarkingHours: number;
  isActive: boolean;
}

interface TeamSummary {
  _id: string;
  teamName: string;
  academicYearId: string;
  totalMembers: number;
  totalCapacity: number;
  totalAllocated: number;
  averageUtilization: number;
  overloadedCount: number;
  availableCount: number;
  isActive: boolean;
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState("current");
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<TabType>("profile");

  // Fetch data from Convex
  const lecturers = useQuery(api.lecturers.getAll, {}) ?? [];
  const lecturerProfiles = useQuery(api.lecturer_profiles.getAll, {}) ?? [];
  const moduleIterations = useQuery(api.module_iterations.getAll, {}) ?? [];
  const modules = useQuery(api.modules.getAll, {}) ?? [];
  const teamSummaries = useQuery(api.team_summaries.getAll, {}) ?? [];
  const { user } = useUser();
  const { currentAcademicYearId } = useAcademicYear();

  // Helper functions
  const getLecturerName = (profileId: string) => {
    const profile = lecturerProfiles.find(p => p._id === profileId);
    return profile?.fullName || "Unknown";
  };

  const getModuleName = (moduleId: string) => {
    const module = modules.find(m => m._id === moduleId);
    return module ? `${module.code} - ${module.title}` : "Unknown Module";
  };

  const calculateUtilization = (allocated: number, capacity: number) => {
    if (capacity === 0) return 0;
    return Math.round((allocated / capacity) * 100);
  };

  const getStatusBadge = (utilization: number) => {
    if (utilization > 100) {
      return <Badge variant="destructive">Overloaded</Badge>;
    } else if (utilization >= 90) {
      return <Badge variant="secondary">Near Capacity</Badge>;
    } else if (utilization >= 70) {
      return <Badge variant="default">Good</Badge>;
    } else {
      return <Badge variant="outline">Available</Badge>;
    }
  };

  // Calculate metrics
  const totalLecturers = lecturers.length;
  const activeLecturers = lecturers.filter(l => l.isActive).length;
  const totalModules = modules.length;
  const activeModules = modules.filter(m => m.isActive).length;
  const totalIterations = moduleIterations.length;
  const assignedIterations = moduleIterations.filter(mi => 
    mi.assignedLecturerIds && mi.assignedLecturerIds.length > 0
  ).length;
  const unassignedIterations = totalIterations - assignedIterations;

  const totalCapacity = lecturers.reduce((sum, l) => sum + (l.totalContract || 0), 0);
  const totalAllocated = lecturers.reduce((sum, l) => sum + (l.totalAllocated || 0), 0);
  const overallUtilization = totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0;

  const overloadedStaff = lecturers.filter(l => {
    const utilization = calculateUtilization(l.totalAllocated || 0, l.totalContract || 0);
    return utilization > 100;
  }).length;

  const availableStaff = lecturers.filter(l => {
    const utilization = calculateUtilization(l.totalAllocated || 0, l.totalContract || 0);
    return utilization < 70;
  }).length;

  const handleProfileClick = () => {
    setUserProfileModalTab("profile");
    setUserProfileModalOpen(true);
  };
  
  const handleSettingsClick = () => {
    setUserProfileModalTab("general");
    setUserProfileModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="w-full bg-white dark:bg-zinc-900">
        <Navigation 
          activeTab="reports" 
          setActiveTab={() => {}} 
          onProfileClick={handleProfileClick} 
          onSettingsClick={handleSettingsClick} 
          onInboxClick={() => {}}
        />
      </div>
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Comprehensive workload analytics and reporting
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Year</SelectItem>
                <SelectItem value="previous">Previous Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" disabled>
              <Download className="w-4 h-4 mr-2" />
              <span className="text-xs">Coming Soon</span>
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <DashboardMetricCard
            title="Total Staff"
            value={totalLecturers}
            subtitle={`${activeLecturers} active`}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <DashboardMetricCard
            title="Total Modules"
            value={totalModules}
            subtitle={`${activeModules} active`}
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          />
          <DashboardMetricCard
            title="Capacity Utilization"
            value={`${overallUtilization}%`}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          >
            <Progress value={overallUtilization} className="mt-2" />
          </DashboardMetricCard>
          <DashboardMetricCard
            title="Module Iterations"
            value={totalIterations}
            subtitle={`${assignedIterations} assigned`}
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {/* Reports Tabs */}
        <Tabs value={selectedReport} onValueChange={setSelectedReport} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staff">Staff Analysis</TabsTrigger>
            <TabsTrigger value="teams">Team Reports</TabsTrigger>
            <TabsTrigger value="modules">Module Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Capacity Overview */}
              <Card className="bg-white dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Capacity Overview
                  </CardTitle>
                  <CardDescription>Workload distribution and utilization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{overloadedStaff}</div>
                      <div className="text-sm text-muted-foreground">Overloaded</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {totalLecturers - overloadedStaff - availableStaff}
                      </div>
                      <div className="text-sm text-muted-foreground">Balanced</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{availableStaff}</div>
                      <div className="text-sm text-muted-foreground">Available</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Capacity</span>
                      <span className="font-medium">{totalCapacity}h</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Allocated</span>
                      <span className="font-medium">{totalAllocated}h</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Available</span>
                      <span className="font-medium">{totalCapacity - totalAllocated}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Module Assignment Status */}
              <Card className="bg-white dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Module Assignment Status
                  </CardTitle>
                  <CardDescription>Current module iteration assignments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{assignedIterations}</div>
                      <div className="text-sm text-muted-foreground">Assigned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{unassignedIterations}</div>
                      <div className="text-sm text-muted-foreground">Unassigned</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Assignment Rate</span>
                      <span className="font-medium">
                        {totalIterations > 0 ? Math.round((assignedIterations / totalIterations) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={totalIterations > 0 ? (assignedIterations / totalIterations) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest workload management activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Activity tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle>Staff Workload Analysis</CardTitle>
                <CardDescription>Detailed staff capacity and allocation breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Allocated</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lecturers.map((lecturer) => {
                      const profile = lecturerProfiles.find(p => p._id === lecturer.profileId);
                      const utilization = calculateUtilization(lecturer.totalAllocated || 0, lecturer.totalContract || 0);
                      
                      return (
                        <TableRow key={lecturer._id}>
                          <TableCell className="font-medium">
                            {profile?.fullName || "Unknown"}
                          </TableCell>
                          <TableCell>{lecturer.team || "Unassigned"}</TableCell>
                          <TableCell>{lecturer.totalContract || 0}h</TableCell>
                          <TableCell>{lecturer.totalAllocated || 0}h</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{utilization}%</span>
                              <Progress value={Math.min(utilization, 100)} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(utilization)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle>Team Performance Reports</CardTitle>
                <CardDescription>Team-level workload and capacity analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {teamSummaries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Total Capacity</TableHead>
                        <TableHead>Total Allocated</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamSummaries.map((team) => (
                        <TableRow key={team._id}>
                          <TableCell className="font-medium">{team.teamName}</TableCell>
                          <TableCell>{team.totalMembers}</TableCell>
                          <TableCell>{team.totalCapacity}h</TableCell>
                          <TableCell>{team.totalAllocated}h</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{Math.round(team.averageUtilization)}%</span>
                              <Progress value={team.averageUtilization} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            {team.averageUtilization > 100 ? (
                              <Badge variant="destructive">Overloaded</Badge>
                            ) : team.averageUtilization > 90 ? (
                              <Badge variant="secondary">High</Badge>
                            ) : (
                              <Badge variant="default">Good</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No team data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle>Module Assignment Analysis</CardTitle>
                <CardDescription>Module iteration assignment status and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Iterations</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Unassigned</TableHead>
                      <TableHead>Assignment Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const moduleStats = modules.map(module => {
                        const iterations = moduleIterations.filter(mi => mi.moduleId === module._id);
                        const assigned = iterations.filter(mi => 
                          mi.assignedLecturerIds && mi.assignedLecturerIds.length > 0
                        ).length;
                        const unassigned = iterations.length - assigned;
                        const rate = iterations.length > 0 ? Math.round((assigned / iterations.length) * 100) : 0;
                        
                        return { module, iterations: iterations.length, assigned, unassigned, rate };
                      });

                      return moduleStats.map(({ module, iterations, assigned, unassigned, rate }) => (
                        <TableRow key={module._id}>
                          <TableCell className="font-medium">
                            {module.code} - {module.title}
                          </TableCell>
                          <TableCell>{iterations}</TableCell>
                          <TableCell>{assigned}</TableCell>
                          <TableCell>{unassigned}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{rate}%</span>
                              <Progress value={rate} className="w-16 h-2" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <SettingsModal
        open={userProfileModalOpen}
        onOpenChange={setUserProfileModalOpen}
        initialTab={userProfileModalTab}
      />
    </div>
  )
} 