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
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Building,
  GraduationCap,
  Calendar,
  Eye,
  Edit,
  Plus
} from "lucide-react"
import { useUser } from "@clerk/nextjs";
import Navigation from "@/components/layout/navigation"
import SettingsModal, { TabType } from "@/components/modals/settings-modal"
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { DashboardMetricCard } from "@/components/ui/dashboard-metric-card";
import { useRouter } from "next/navigation";

// Define interfaces based on the database schema
interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: number;
}

interface Organisation {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: number;
}

interface AcademicYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Lecturer {
  _id: string;
  profileId: string;
  academicYearId: string;
  isActive: boolean;
}

interface Module {
  _id: string;
  code: string;
  title: string;
  isActive: boolean;
}

interface Team {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export default function AdminDashboardPage() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<TabType>("profile");
  const router = useRouter();

  // Fetch data from Convex
  const users = useQuery(api.users.getAll, {}) ?? [];
  const organisation = useQuery(api.organisations.get, {}) ?? null;
  const academicYears = useQuery(api.academic_years.getAll, {}) ?? [];
  const lecturers = useQuery(api.lecturers.getAll, {}) ?? [];
  const modules = useQuery(api.modules.getAll, {}) ?? [];
  const teams = useQuery(api.teams.getAll, {}) ?? [];
  const { user } = useUser();
  const { currentAcademicYearId } = useAcademicYear();

  // Calculate metrics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const totalOrganisations = organisation ? 1 : 0;
  const activeOrganisations = organisation?.isActive ? 1 : 0;
  const totalAcademicYears = academicYears.length;
  const activeAcademicYears = academicYears.filter(ay => ay.isActive).length;
  const totalLecturers = lecturers.length;
  const activeLecturers = lecturers.filter(l => l.isActive).length;
  const totalModules = modules.length;
  const activeModules = modules.filter(m => m.isActive).length;
  const totalTeams = teams.length;
  const activeTeams = teams.filter(t => t.isActive).length;

  // Calculate system health metrics
  const systemHealth = {
    users: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
    organisations: totalOrganisations > 0 ? (activeOrganisations / totalOrganisations) * 100 : 0,
    academicYears: totalAcademicYears > 0 ? (activeAcademicYears / totalAcademicYears) * 100 : 0,
    lecturers: totalLecturers > 0 ? (activeLecturers / totalLecturers) * 100 : 0,
    modules: totalModules > 0 ? (activeModules / totalModules) * 100 : 0,
    teams: totalTeams > 0 ? (activeTeams / totalTeams) * 100 : 0,
  };

  const overallHealth = Object.values(systemHealth).reduce((sum, health) => sum + health, 0) / Object.keys(systemHealth).length;

  const getHealthBadge = (health: number) => {
    if (health >= 90) {
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    } else if (health >= 75) {
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    } else if (health >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
    }
  };

  const getHealthIcon = (health: number) => {
    if (health >= 90) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (health >= 75) {
      return <Activity className="w-5 h-5 text-blue-600" />;
    } else if (health >= 50) {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const handleProfileClick = () => {
    setUserProfileModalTab("profile");
    setUserProfileModalOpen(true);
  };
  
  const handleSettingsClick = () => {
    setUserProfileModalTab("general");
    setUserProfileModalOpen(true);
  };

  const handleNavigateToReferenceData = () => {
    router.push("/admin/reference-data");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="w-full bg-white dark:bg-zinc-900">
        <Navigation 
          activeTab="admin" 
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
              <Shield className="w-8 h-8" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              System administration and monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleNavigateToReferenceData} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Reference Data
            </Button>
            <Button variant="outline" disabled>
              <span className="text-xs">Coming Soon</span>
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <DashboardMetricCard
            title="System Health"
            value={`${Math.round(overallHealth)}%`}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          >
            <Progress value={overallHealth} className="mt-2" />
          </DashboardMetricCard>
          <DashboardMetricCard
            title="Active Users"
            value={activeUsers}
            subtitle={`${totalUsers} total`}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <DashboardMetricCard
            title="Organisations"
            value={activeOrganisations}
            subtitle={`${totalOrganisations} total`}
            icon={<Building className="h-4 w-4 text-muted-foreground" />}
          />
          <DashboardMetricCard
            title="Academic Years"
            value={activeAcademicYears}
            subtitle={`${totalAcademicYears} total`}
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {/* Admin Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="organisations">Organisations</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health Breakdown */}
              <Card className="bg-white dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    System Health Breakdown
                  </CardTitle>
                  <CardDescription>Health status of different system components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(systemHealth).map(([component, health]) => (
                    <div key={component} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getHealthIcon(health)}
                        <span className="capitalize">{component}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={health} className="w-20 h-2" />
                        <span className="text-sm font-medium">{Math.round(health)}%</span>
                        {getHealthBadge(health)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleNavigateToReferenceData}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Manage Reference Data
                  </Button>
                  <Button 
                    className="w-full justify-start opacity-50 cursor-not-allowed"
                    variant="outline"
                    disabled
                  >
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                    <span className="ml-auto text-xs">Coming Soon</span>
                  </Button>
                  <Button 
                    className="w-full justify-start opacity-50 cursor-not-allowed"
                    variant="outline"
                    disabled
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    System Settings
                    <span className="ml-auto text-xs">Coming Soon</span>
                  </Button>
                  <Button 
                    className="w-full justify-start opacity-50 cursor-not-allowed"
                    variant="outline"
                    disabled
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    System Logs
                    <span className="ml-auto text-xs">Coming Soon</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent System Activity
                </CardTitle>
                <CardDescription>Latest administrative activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Activity tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>System users and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          {`${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'N/A'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" disabled>
                              <span className="text-xs">Coming Soon</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organisations" className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle>Organisation Management</CardTitle>
                <CardDescription>Organisations in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organisation && (
                      <TableRow key={organisation._id}>
                        <TableCell className="font-medium">{organisation.name}</TableCell>
                        <TableCell>{organisation.code || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={organisation.isActive ? "default" : "secondary"}>
                            {organisation.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(organisation.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" disabled>
                              <span className="text-xs">Coming Soon</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Academic Years */}
              <Card className="bg-white dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Academic Years
                  </CardTitle>
                  <CardDescription>Academic year configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Period</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academicYears.map((ay) => (
                        <TableRow key={ay._id}>
                          <TableCell className="font-medium">{ay.name}</TableCell>
                          <TableCell>
                            <Badge variant={ay.isActive ? "default" : "secondary"}>
                              {ay.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(ay.startDate).getFullYear()} - {new Date(ay.endDate).getFullYear()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* System Statistics */}
              <Card className="bg-white dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    System Statistics
                  </CardTitle>
                  <CardDescription>Key system metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalLecturers}</div>
                      <div className="text-sm text-muted-foreground">Lecturers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{totalModules}</div>
                      <div className="text-sm text-muted-foreground">Modules</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{totalTeams}</div>
                      <div className="text-sm text-muted-foreground">Teams</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{totalAcademicYears}</div>
                      <div className="text-sm text-muted-foreground">Academic Years</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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