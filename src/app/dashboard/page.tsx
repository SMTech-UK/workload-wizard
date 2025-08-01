"use client";

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, AlertTriangle, FileText, Calendar, Check, GraduationCap, Settings, CheckCircle } from "lucide-react"
import Navigation from "@/components/layout/navigation"
import SettingsModal, { TabType } from "@/components/modals/settings-modal"

import ModuleAssignment from "@/components/features/module-management/module-assignment"
import ReportsSection from "@/components/features/dashboard/reports-section"
import { DashboardMetricCard } from "@/components/ui/dashboard-metric-card";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import StaffProfileModal from "@/components/modals/staff-profile-modal"
import { useConvex } from "convex/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { timeAgo } from "@/lib/notify";
import { useRouter } from "next/navigation";
import { useKnockClient, useNotifications, useNotificationStore } from "@knocklabs/react";
import { useUser } from "@clerk/nextjs";
import { format, formatDistanceToNow, differenceInHours, parseISO } from 'date-fns';
import { PlusCircle, Pencil, Trash2, User, BarChart3, BookOpen, Clock, Info } from "lucide-react";
import CSVImportModal from "@/components/modals/csv-import-modal";
import { KnockSafeWrapper } from "@/components/features/notifications/KnockErrorBoundary";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import type { Id } from "../../../convex/_generated/dataModel";

// Define interfaces based on new schema
interface LecturerProfile {
  _id: Id<'lecturer_profiles'>;
  fullName: string;
  email: string;
  team?: string;
  specialism?: string;
  contract: string;
  role?: string;
  family?: string;
  fte: number;
  capacity: number;
  maxTeachingHours: number;
  totalContract: number;
  isActive: boolean;
  organisationId?: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface Lecturer {
  _id: Id<'lecturers'>;
  profileId: Id<'lecturer_profiles'>;
  academicYearId: Id<'academic_years'>;
  status: string;
  teachingAvailability: number;
  totalAllocated: number;
  allocatedTeachingHours: number;
  allocatedAdminHours: number;
  allocatedResearchHours: number;
  allocatedOtherHours: number;
  notes?: string;
  yearSpecificData?: any;
  isActive: boolean;
  organisationId?: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

interface Module {
  _id: Id<'modules'>;
  code: string;
  title: string;
  description?: string;
  credits: number;
  level: number;
  moduleLeaderId?: Id<'lecturer_profiles'>;
  defaultTeachingHours: number;
  defaultMarkingHours: number;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface ModuleIteration {
  _id: Id<'module_iterations'>;
  moduleId: Id<'modules'>;
  academicYearId: Id<'academic_years'>;
  semester: string;
  year: number;
  assignedLecturerIds: string[];
  assignedStatus: string;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface AcademicYear {
  _id: Id<'academic_years'>;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const academicYears = [
  "Academic Year 25/26",
  "Academic Year 24/25",
  "Academic Year 23/24",
];

function AcademicYearSelector({ selected, onSelect }: { selected: string; onSelect: (year: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-primary/40 bg-white dark:bg-zinc-900 hover:bg-primary/5 dark:hover:bg-zinc-800 text-primary dark:text-white font-medium shadow-sm px-3 py-2 rounded-md"
          aria-label="Select academic year"
        >
          <Calendar className="w-5 h-5 mr-1 text-gray-900 dark:text-white" />
          <span className="hidden sm:inline text-gray-900 dark:text-white">{selected}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 mt-2 border border-primary/20 rounded-md shadow-lg bg-white dark:bg-zinc-900">
        <div className="py-2">
          <div className="px-4 pb-2 text-xs text-muted-foreground font-semibold uppercase tracking-wide dark:text-gray-300">Academic Years</div>
          <ul>
            {academicYears.map((year) => (
              <li key={year}>
                <button
                  className={cn(
                    "w-full flex items-center px-4 py-2 text-sm hover:bg-primary/10 dark:hover:bg-zinc-800 transition-colors text-gray-900 dark:text-white",
                    year === selected && "bg-primary/10 dark:bg-blue-900 font-semibold text-primary dark:text-blue-400"
                  )}
                  onClick={() => onSelect(year)}
                >
                  {year}
                  {year === selected && <Check className="w-4 h-4 ml-auto text-primary dark:text-blue-400" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper to format timestamp
function formatActivityTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 24) {
    // Show relative time (e.g., '2 hours ago')
    return timeAgo(date.getTime());
  } else {
    // Show date and time (e.g., '2024-06-01 14:30')
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

function getNotificationTitle(notification: any) {
  switch (notification.type) {
    case "module_assigned":
      return "Module Assignment";
    case "lecturer_updated":
      return "Lecturer Updated";
    case "allocation_changed":
      return "Allocation Changed";
    default:
      return "System Notification";
  }
}

function formatNotificationTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 1) {
    return "Just now";
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)} hours ago`;
  } else {
    return date.toLocaleDateString();
  }
}

const getChangeIcon = (type: string) => {
  switch (type) {
    case "create":
      return <PlusCircle className="w-4 h-4 text-green-600" />;
    case "edit":
      return <Pencil className="w-4 h-4 text-blue-600" />;
    case "delete":
      return <Trash2 className="w-4 h-4 text-red-600" />;
    default:
      return <Info className="w-4 h-4 text-gray-600" />;
  }
};

function DashboardContent() {
  const router = useRouter();
  const convex = useConvex();
  const { user } = useUser();
  const { currentAcademicYearId } = useAcademicYear();
  
  // Fetch data from Convex
  const lecturerProfiles = (useQuery(api.lecturer_profiles.getAll, {}) ?? []) as any[];
  const lecturers = (useQuery(api.lecturers.getAll, {}) ?? []) as any[];
  const modules = (useQuery(api.modules.getAll, {}) ?? []) as any[];
  const moduleIterations = (useQuery(api.module_iterations.getAll, {}) ?? []) as any[];
  const academicYears = (useQuery(api.academic_years.getAll, {}) ?? []) as any[];
  
  // Check if data is still loading
  const isLoading = !lecturerProfiles || !lecturers || !modules || !moduleIterations || !academicYears;
  
  // State
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("Academic Year 25/26");
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<TabType>("profile");
  const [staffProfileModalOpen, setStaffProfileModalOpen] = useState(false);
  const [selectedLecturerId, setSelectedLecturerId] = useState<string | null>(null);
  const [csvImportModalOpen, setCsvImportModalOpen] = useState(false);

  // Helper functions
  const getCurrentYearLecturers = () => {
    return lecturers?.filter(l => l.academicYearId === currentAcademicYearId) || [];
  };

  const getCurrentYearIterations = () => {
    return moduleIterations?.filter(mi => mi.academicYearId === currentAcademicYearId) || [];
  };

  const getLecturerProfile = (lecturerId: Id<'lecturers'>) => {
    const lecturer = lecturers.find(l => l._id === lecturerId);
    if (!lecturer) return null;
    
    return lecturerProfiles.find(p => p._id === lecturer.profileId);
  };

  const getLecturerUtilization = (lecturerId: Id<'lecturers'>) => {
    const lecturer = lecturers.find(l => l._id === lecturerId);
    if (!lecturer) return 0;
    
    const profile = lecturerProfiles.find(p => p._id === lecturer.profileId);
    const totalContract = profile?.totalContract || 0;
    const totalAllocated = lecturer.totalAllocated || 0;
    
    return totalContract > 0 ? (totalAllocated / totalContract) * 100 : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overloaded":
        return "text-red-600";
      case "at-capacity":
        return "text-yellow-600";
      case "near-capacity":
        return "text-orange-600";
      case "available":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overloaded":
        return <Badge className="bg-red-100 text-red-800">Overloaded</Badge>;
      case "at-capacity":
        return <Badge className="bg-yellow-100 text-yellow-800">At Capacity</Badge>;
      case "near-capacity":
        return <Badge className="bg-orange-100 text-orange-800">Near Capacity</Badge>;
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  function calculateLecturerStatus(
    assigned: number,
    capacity: number
  ): "overloaded" | "at-capacity" | "near-capacity" | "available" {
    if (capacity === 0) return "available";
    const percentage = (assigned / capacity) * 100;
    if (percentage > 100) return "overloaded";
    if (percentage >= 95) return "at-capacity";
    if (percentage >= 80) return "near-capacity";
    return "available";
  }

  const handleOpenStaffProfileModal = (lecturerId: string) => {
    setSelectedLecturerId(lecturerId);
    setStaffProfileModalOpen(true);
  };

  const handleLecturerUpdate = async (updatedLecturer: any) => {
    // Handle lecturer update logic
    console.log("Updated lecturer:", updatedLecturer);
  };

  const handleProfileClick = () => {
    setUserProfileModalTab("profile");
    setUserProfileModalOpen(true);
  };
  
  const handleSettingsClick = () => {
    setUserProfileModalTab("general");
    setUserProfileModalOpen(true);
  };

  // Calculate dashboard metrics
  const totalLecturers = lecturerProfiles?.length || 0;
  const activeLecturers = lecturerProfiles?.filter(p => p.isActive)?.length || 0;
  const totalModules = modules?.length || 0;
  const activeModules = modules?.filter(m => m.isActive)?.length || 0;
  const totalIterations = getCurrentYearIterations()?.length || 0;
  const assignedIterations = getCurrentYearIterations()?.filter(mi => mi.assignedStatus === "assigned")?.length || 0;
  const unassignedIterations = getCurrentYearIterations()?.filter(mi => mi.assignedStatus === "unassigned")?.length || 0;

  const currentYearLecturers = getCurrentYearLecturers();
  const lecturerStatuses = currentYearLecturers?.map(lecturer => {
    const utilization = getLecturerUtilization(lecturer._id);
    const profile = lecturerProfiles?.find(p => p._id === lecturer.profileId);
    return calculateLecturerStatus(lecturer.totalAllocated || 0, profile?.totalContract || 0);
  }) || [];

  const overloadedCount = lecturerStatuses.filter(status => status === "overloaded").length;
  const atCapacityCount = lecturerStatuses.filter(status => status === "at-capacity").length;
  const nearCapacityCount = lecturerStatuses.filter(status => status === "near-capacity").length;
  const availableCount = lecturerStatuses.filter(status => status === "available").length;

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="w-full bg-white dark:bg-zinc-900">
        <Navigation 
          activeTab="dashboard" 
          setActiveTab={() => {}} 
          onProfileClick={handleProfileClick} 
          onSettingsClick={handleSettingsClick} 
          onInboxClick={() => {}}
        />
      </div>
      
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Overview of academic workload and allocations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AcademicYearSelector 
              selected={selectedAcademicYear} 
              onSelect={setSelectedAcademicYear} 
            />
            <Button 
              onClick={() => setCsvImportModalOpen(true)}
              variant="outline"
              size="sm"
            >
              Import Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <DashboardMetricCard
            title="Total Staff"
            value={totalLecturers}
            subtitle={`${activeLecturers} active`}
            icon={<Users className="w-4 h-4" />}
          />
          <DashboardMetricCard
            title="Total Modules"
            value={totalModules}
            subtitle={`${activeModules} active`}
            icon={<BookOpen className="w-4 h-4" />}
          />
          <DashboardMetricCard
            title="Module Iterations"
            value={totalIterations}
            subtitle={`${assignedIterations} assigned`}
            icon={<GraduationCap className="w-4 h-4" />}
          />
          <DashboardMetricCard
            title="Utilisation"
            value={`${Math.round((assignedIterations / Math.max(totalIterations, 1)) * 100)}%`}
            subtitle={`${unassignedIterations} unassigned`}
            icon={<Clock className="w-4 h-4" />}
          />
        </div>

        {/* Staff Status Overview */}
        <Card className="bg-white dark:bg-zinc-900 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Staff Status Overview
            </CardTitle>
            <CardDescription>
              Current academic year lecturer workload status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{overloadedCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Overloaded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{atCapacityCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">At Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{nearCapacityCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Near Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{availableCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest changes and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p>No recent activity to display</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/lecturer-management')}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      <span className="text-sm">Manage Staff</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/module-management')}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" />
                      <span className="text-sm">Manage Modules</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/module-allocations')}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-sm">View Allocations</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/reports')}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      <span className="text-sm">Generate Reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle>Staff Overview</CardTitle>
                <CardDescription>
                  Current academic year lecturer status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentYearLecturers.map((lecturer) => {
                    const profile = getLecturerProfile(lecturer._id);
                    const utilization = getLecturerUtilization(lecturer._id);
                    const status = calculateLecturerStatus(lecturer.totalAllocated || 0, profile?.totalContract || 0);
                    
                    return (
                      <div key={lecturer._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{profile?.fullName || "Unknown"}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {profile?.family || "Unknown Family"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {lecturer.totalAllocated || 0}h / {profile?.totalContract || 0}h
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round(utilization)}% utilized
                            </div>
                          </div>
                          {getStatusBadge(status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900">
              <CardHeader>
                <CardTitle>Module Overview</CardTitle>
                <CardDescription>
                  Current academic year module status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getCurrentYearIterations().map((iteration) => {
                    const moduleData = modules.find(m => m._id === iteration.moduleId);
                    
                    return (
                      <div key={iteration._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {moduleData ? `${moduleData.code} - ${moduleData.title}` : "Unknown Module"}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Semester {iteration.semester}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {iteration.assignedLecturerIds?.length || 0} lecturers assigned
                            </div>
                          </div>
                          {getStatusBadge(iteration.assignedStatus)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <SettingsModal
        open={userProfileModalOpen}
        onOpenChange={setUserProfileModalOpen}
        initialTab={userProfileModalTab}
      />
      
      <StaffProfileModal
        isOpen={staffProfileModalOpen}
        onClose={() => setStaffProfileModalOpen(false)}
        lecturer={selectedLecturerId ? (() => {
          const lecturer = lecturers.find(l => l._id === selectedLecturerId);
          if (!lecturer) return null;
          const profile = lecturerProfiles.find(p => p._id === lecturer.profileId);
          if (!profile) return null;
          
          return {
            _id: lecturer._id,
            fullName: profile.fullName,
            team: profile.team || '',
            specialism: profile.specialism || '',
            contract: profile.contract,
            email: profile.email,
            capacity: profile.capacity,
            maxTeachingHours: profile.maxTeachingHours,
            role: profile.role || '',
            status: lecturer.status,
            teachingAvailability: lecturer.teachingAvailability,
            totalAllocated: lecturer.totalAllocated,
            totalContract: profile.totalContract,
            allocatedTeachingHours: lecturer.allocatedTeachingHours,
            allocatedAdminHours: lecturer.allocatedAdminHours,
            family: profile.family || '',
            fte: profile.fte,
            profileId: lecturer.profileId
          };
        })() : null}
        adminAllocations={[]}
        onLecturerUpdate={handleLecturerUpdate}
      />

      <CSVImportModal
        isOpen={csvImportModalOpen}
        onClose={() => setCsvImportModalOpen(false)}
        importType="modules"
      />
    </div>
  );
}

export default function AcademicWorkloadPlanner() {
  return (
    <KnockSafeWrapper>
      <DashboardContent />
    </KnockSafeWrapper>
  );
}
