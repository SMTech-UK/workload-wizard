"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Users, BookOpen, Clock, AlertTriangle, FileText, Settings, Calendar, Check } from "lucide-react"
import Navigation from "@/components/navigation"
import SettingsModal, { TabType } from "@/hooks/settings-modal"
import LecturerManagement from "@/components/lecturer-management"
import ModuleAssignment from "@/components/module-assignment"
import ReportsSection from "@/components/reports-section"
import { DashboardMetricCard } from "@/components/ui/dashboard-metric-card";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import StaffProfileModal from "@/components/staff-profile-modal"
import { useConvex } from "convex/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { timeAgo } from "@/lib/notify";
import NotificationsInbox from "@/components/notifications-inbox";
import { useRouter } from "next/navigation";

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

export default function AcademicWorkloadPlanner() {
  const createNotification = useMutation(api.notifications.createNotification);
  const [staffProfileModalOpen, setStaffProfileModalOpen] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<any>(undefined);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<TabType>("profile");

  // All hooks must be called unconditionally!
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (["dashboard", "lecturers", "assignments", "reports"].includes(hash)) {
        return hash;
      }
    }
    return "dashboard";
  });

  // Sync tab with URL hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.hash = activeTab;
    }
  }, [activeTab]);
  const lecturers = useQuery(api.lecturers.getAll) ?? [];
  const adminAllocations = useQuery(api.admin_allocations.getAll) ?? [];
  const modules = useQuery(api.modules.getAll) ?? [];
  const recentActivity = useQuery(api.recent_activity.getAll) ?? [];
  const updateLecturerStatus = useMutation(api.lecturers.updateStatus);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(academicYears[0]);
  const convex = useConvex();

  const totalLecturers = lecturers.length;
  // Example: get last academic year lecturer count (replace with real data if available)
  // Set to null if not available
  const lastAcademicYearLecturerCount = null; // or a number if you have it
  const showLecturerDelta = typeof lastAcademicYearLecturerCount === 'number';
  const lecturerDelta = showLecturerDelta ? totalLecturers - lastAcademicYearLecturerCount : 0;
  const totalModules = modules.length;
  const unassignedModules = modules.filter(m => m.status === "unassigned").length;
  const overloadedStaff = lecturers.filter(l => l.status === "overloaded").length;
  const totalCapacity = lecturers.reduce((sum, l) => sum + (l.totalContract || 0), 0);
  const assignedHours = lecturers.reduce((sum, l) => sum + (l.totalAllocated || 0), 0);
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
      case "at-capacity":
        return <Badge variant="secondary">At Capacity</Badge>
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

  function calculateLecturerStatus(assigned: number, capacity: number): "overloaded" | "at-capacity" | "near-capacity" | "available" {
    if (assigned > capacity) return "overloaded";
    if (assigned === capacity) return "at-capacity";
    const percent = (assigned / capacity) * 100;
    if (percent > 90) return "near-capacity";
    return "available";
  }

  useEffect(() => {
    lecturers.forEach((lecturer: any) => {
      const newStatus = calculateLecturerStatus(lecturer.totalAllocated, lecturer.totalContract);
      if (lecturer.status !== newStatus) {
        updateLecturerStatus({ id: lecturer._id, status: newStatus });
      }
    });
  }, [lecturers, updateLecturerStatus]);

  const handleOpenStaffProfileModal = (lecturerId: string) => {
    if (!lecturerId) return;
    const lecturer = lecturers.find((l: any) => l && l._id === lecturerId);
    if (lecturer && lecturer._id) {
      setSelectedLecturer(lecturer);
      setStaffProfileModalOpen(true);
    }
  };

  const handleLecturerUpdate = async (updatedLecturer: any) => {
    setStaffProfileModalOpen(false);
    setTimeout(async () => {
      const freshLecturer = await convex.query(api.lecturers.getById, { id: updatedLecturer._id });
      if (freshLecturer) {
        setSelectedLecturer(freshLecturer);
        setStaffProfileModalOpen(true);
      }
    }, 150);
  };

  const handleProfileClick = () => {
    setUserProfileModalTab("profile");
    setUserProfileModalOpen(true);
  };
  const handleSettingsClick = () => {
    setUserProfileModalTab("general");
    setUserProfileModalOpen(true);
  };

  const selectedAdminAllocations = selectedLecturer
    ? (adminAllocations.find((a: any) => a.lecturerId === selectedLecturer.id)?.adminAllocations ?? [])
    : [];

  const selectedModuleAllocations = selectedLecturer && selectedLecturer.moduleAllocations
    ? (selectedLecturer.moduleAllocations as any[]).map((alloc: any) => {
        const module = modules.find((m: any) => m.id === alloc.moduleCode);
        return {
          ...alloc,
          moduleName: module ? module.title : alloc.moduleName,
          semester: module ? module.semester : alloc.semester,
          type: module ? (module.status === 'core' ? 'Core' : 'Elective') : alloc.type,
          credits: module ? module.credits : undefined,
          teachingHours: module ? module.teachingHours : undefined,
        };
      })
    : [];

  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Navigation with custom user profile dropdown */}
      <div className="w-full bg-white dark:bg-zinc-900">
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
          onInboxClick={() => router.push("/inbox")}
        />
      </div>
      <SettingsModal open={userProfileModalOpen} onOpenChange={setUserProfileModalOpen} initialTab={userProfileModalTab} />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Academic Workload Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedAcademicYear}</p>
                </div>
                <div className="flex items-center gap-2">
                  <AcademicYearSelector selected={selectedAcademicYear} onSelect={setSelectedAcademicYear} />
                </div>
              </div>

            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardMetricCard
              title="Total Lecturers"
              value={totalLecturers}
              subtitle={showLecturerDelta ? `${lecturerDelta >= 0 ? '+' : ''}${lecturerDelta} from last academic year` : undefined}
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
              <Card className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle>Staff Capacity Overview</CardTitle>
                  <CardDescription>Current workload allocation by lecturer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lecturers.map((lecturer, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lecturer.fullName}</span>
                          <Badge variant="outline" className="text-xs">
                            {lecturer.role}
                          </Badge>
                        </div>
                        {getStatusBadge(lecturer.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(lecturer.totalAllocated / lecturer.totalContract) * 100} className="flex-1" />
                        <span className="text-sm text-muted-foreground min-w-fit">
                          {lecturer.totalAllocated}h / {lecturer.totalContract}h
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest workload management activities</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <ScrollArea className="max-h-64">
                    <div className="space-y-4 pr-2">
                      <TooltipProvider>
                        {recentActivity
                          .slice()
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .slice(0, 5)
                          .map((activity) => {
                          let dotColor = "bg-blue-500";
                          if (activity.changeType === "create") dotColor = "bg-green-500";
                          else if (activity.changeType === "edit") dotColor = "bg-yellow-400";
                          else if (activity.changeType === "delete") dotColor = "bg-red-500";
                          return (
                            <div key={activity.id} className="flex items-start gap-3 pb-1 border-b border-gray-200 last:border-b-0">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${dotColor}`} />
                              <div className="flex-1 min-w-0 flex items-center justify-between">
                                <div>
                                  {(activity.type === "lecturer_created" || activity.type === "lecturer_edited") && activity.details ? (
                                    <span className="text-sm font-medium text-gray-900">
                                      Lecturer{' '}
                                      <button
                                        className="font-bold underline text-primary hover:text-primary/80"
                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                        onClick={e => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleOpenStaffProfileModal(activity.details.lecturerId);
                                        }}
                                        tabIndex={0}
                                        type="button"
                                      >
                                        {activity.details.fullName}
                                      </button>
                                      {activity.formatted.replace(
                                        new RegExp(`^Lecturer\\s+${activity.details.fullName}`),
                                        ''
                                      )}
                                    </span>
                                  ) : activity.type === "lecturer_deleted" && activity.details ? (
                                    <span className="text-sm font-medium text-gray-900">
                                      Lecturer {activity.details.fullName}
                                      {activity.formatted.replace(
                                        new RegExp(`^Lecturer\\s+${activity.details.fullName}`),
                                        ''
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-sm font-medium text-gray-900">{activity.formatted}</span>
                                  )}
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-xs text-gray-500 cursor-help ml-4 whitespace-nowrap">
                                      {formatActivityTimestamp(activity.timestamp)}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {new Date(activity.timestamp).toLocaleString(undefined, {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    })}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          );
                        })}
                      </TooltipProvider>
                    </div>
                  </ScrollArea>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => router.push("/inbox")}
                  >
                    View all activity
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common workload management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <Users className="w-6 h-6" />
                    Import Lecturers
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
            <ReportsSection onViewAllActivity={() => { router.push("/inbox"); }} />
          </TabsContent>
        </Tabs>
        {selectedLecturer && (
          <StaffProfileModal
            key={selectedLecturer._id}
            isOpen={staffProfileModalOpen}
            onClose={() => setStaffProfileModalOpen(false)}
            lecturer={selectedLecturer}
            adminAllocations={selectedAdminAllocations}
            onLecturerUpdate={handleLecturerUpdate}
          />
        )}
      </main>
    </div>
  )
}
