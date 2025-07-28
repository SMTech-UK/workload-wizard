"use client";

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, AlertTriangle, FileText, Calendar, Check } from "lucide-react"
import Navigation from "@/components/navigation"
import SettingsModal, { TabType } from "@/components/settings-modal"

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
import { useRouter } from "next/navigation";
import { useKnockClient, useNotifications, useNotificationStore } from "@knocklabs/react";
import { useAuth } from "@clerk/nextjs";
import { format, formatDistanceToNow, differenceInHours, parseISO } from 'date-fns';
import { PlusCircle, Pencil, Trash2, User, BarChart3, BookOpen, Settings, Clock, CheckCircle, Info } from "lucide-react";
import CSVImportModal from "@/components/csv-import-modal";
import { KnockSafeWrapper } from "@/components/KnockErrorBoundary";

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

// Helper to extract a string title from the first block
function getNotificationTitle(notification: any) {
  const block = notification.blocks[0];
  if (!block) return { value: "Notification", isHtml: false };
  if (typeof block === "object") {
    if ('rendered' in block && typeof block.rendered === 'string') return { value: block.rendered, isHtml: true };
    if ('text' in block && typeof block.text === 'string') return { value: block.text, isHtml: false };
    if ('content' in block && typeof block.content === 'string') return { value: block.content, isHtml: false };
  }
  return { value: "Notification", isHtml: false };
}

function formatNotificationTimestamp(timestamp: string) {
  // timestamp is ISO string
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  const now = new Date();
  const hoursAgo = differenceInHours(now, date);
  if (hoursAgo < 24) {
    // Show relative time with tooltip
    return {
      display: formatDistanceToNow(date, { addSuffix: true }),
      tooltip: format(date, 'PPpp'),
      showTooltip: true,
    };
  } else {
    // Show full date, no tooltip
    return {
      display: format(date, 'PPpp'),
      tooltip: '',
      showTooltip: false,
    };
  }
}

const getChangeIcon = (type: string) => {
  switch (type) {
    case "staff_update":
      return <User className="h-4 w-4" />
    case "allocation_change":
      return <BarChart3 className="h-4 w-4" />
    case "module_assignment":
      return <BookOpen className="h-4 w-4" />
    case "system_update":
      return <Settings className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

function DashboardContent() {
  const [staffProfileModalOpen, setStaffProfileModalOpen] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<any>(undefined);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<TabType>("profile");
  const [csvImportModalOpen, setCsvImportModalOpen] = useState(false);
  const [csvImportType, setCsvImportType] = useState<"modules" | "module-iterations" | "lecturers">("modules");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamDetailModalOpen, setTeamDetailModalOpen] = useState(false);

  // All hooks must be called unconditionally!
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (["dashboard", "assignments", "reports"].includes(hash)) {
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
  const lecturersQuery = useQuery(api.lecturers.getAll);
  const adminAllocations = useQuery(api.admin_allocations.getAll) ?? [];
  const modules = useQuery(api.modules.getAll) ?? [];
  const updateLecturerStatus = useMutation(api.lecturers.updateStatus);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(academicYears[0]);
  const convex = useConvex();

  // Memoize lecturers to prevent unnecessary re-renders in useEffect
  const lecturers = useMemo(() => lecturersQuery ?? [], [lecturersQuery]);
  const memoizedLecturers = useMemo(() => lecturers, [lecturers]);

  const totalLecturers = lecturers.length;
  // Example: get last academic year lecturer count (replace with real data if available)
  // Set to null if not available
  const lastAcademicYearLecturerCount = null; // or a number if you have it
  const showLecturerDelta = typeof lastAcademicYearLecturerCount === 'number';
  const lecturerDelta = showLecturerDelta ? totalLecturers - lastAcademicYearLecturerCount : 0;
  const totalModules = modules.length;
  const unassignedModules = modules.filter((m: any) => m.status === "unassigned").length;
  const overloadedStaff = lecturers.filter((l: any) => l.status === "overloaded").length;
  const totalCapacity = lecturers.reduce((sum: number, l: any) => sum + (l.totalContract || 0), 0);
  const assignedHours = lecturers.reduce((sum: number, l: any) => sum + (l.totalAllocated || 0), 0);
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

  function calculateLecturerStatus(
    assigned: number,
    capacity: number
  ): "overloaded" | "at-capacity" | "near-capacity" | "available" {
    if (capacity === 0) return assigned > 0 ? "overloaded" : "available";
    if (assigned > capacity) return "overloaded";
    if (assigned === capacity) return "at-capacity";
    const percent = (assigned / capacity) * 100;
    if (percent > 90) return "near-capacity";
    return "available";
  }

  useEffect(() => {
    const updateStatuses = async () => {
      const updates = memoizedLecturers.map((lecturer: any) => {
        const newStatus = calculateLecturerStatus(lecturer.totalAllocated, lecturer.totalContract);
        if (lecturer.status !== newStatus) {
          // Wrap each call in a promise with error handling
          return updateLecturerStatus({ id: lecturer._id, status: newStatus })
            .catch((err: any) => {
              console.error(`Failed to update status for lecturer ${lecturer._id}:`, err);
              // Optionally, show a toast or notification here
            });
        }
        return null;
      }).filter(Boolean);
      if (updates.length > 0) {
        await Promise.all(updates);
      }
    };
    updateStatuses();
  }, [memoizedLecturers, updateLecturerStatus]);

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
        const moduleData = modules.find((m: any) => m.id === alloc.moduleCode);
        return {
          ...alloc,
          moduleName: moduleData ? moduleData.title : alloc.moduleName,
          semester: alloc.semester,
          type: alloc.type,
          credits: moduleData ? moduleData.credits : undefined,
          teachingHours: alloc.hoursAllocated,
        };
      })
    : [];

  // Knock feed setup for recent changes
  const { isSignedIn, userId } = useAuth();
  const recentChangesChannelId = process.env.NEXT_PUBLIC_KNOCK_RECENT_CHANGES_CHANNEL_ID;
  const knockApiKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;

  // Always call hooks unconditionally at the top level
  const knockClient = useKnockClient();
  const recentChangesFeedClient = useNotifications(
    knockClient,
    recentChangesChannelId || ""
  );
  const store = useNotificationStore(recentChangesFeedClient);

  // Fallback logic after hooks are called
  let recentChangesItems: any[] = [];
  let loadingRecentChanges = false;
  try {
    recentChangesItems = store.items;
    loadingRecentChanges = store.loading;
  } catch (error) {
    console.warn('Knock client not available:', error);
    // Fallback to empty state
  }
  
  useEffect(() => { 
    if (isSignedIn && recentChangesChannelId && knockApiKey && recentChangesFeedClient) {
      try {
        recentChangesFeedClient.fetch(); 
      } catch (error) {
        console.warn('Failed to fetch recent changes:', error);
      }
    }
  }, [recentChangesFeedClient, isSignedIn, recentChangesChannelId, knockApiKey]);

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
      {/* Removed duplicate SettingsModal here */}

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Team Capacity Overview */}
              <Card className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle>Team Capacity Overview</CardTitle>
                  <CardDescription>Workload allocation by team with capacity insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(() => {
                    // Group lecturers by team
                    const teamData = lecturers.reduce((acc: any, lecturer: any) => {
                      const team = lecturer.team || 'Unassigned';
                      if (!acc[team]) {
                        acc[team] = {
                          lecturers: [],
                          totalCapacity: 0,
                          totalAllocated: 0,
                          overloadedCount: 0,
                          availableCount: 0,
                          nearCapacityCount: 0
                        };
                      }
                      acc[team].lecturers.push(lecturer);
                      acc[team].totalCapacity += lecturer.totalContract || 0;
                      acc[team].totalAllocated += lecturer.totalAllocated || 0;
                      
                      if (lecturer.status === 'overloaded') acc[team].overloadedCount++;
                      else if (lecturer.status === 'available') acc[team].availableCount++;
                      else if (lecturer.status === 'near-capacity') acc[team].nearCapacityCount++;
                      
                      return acc;
                    }, {});

                    return Object.entries(teamData).map(([teamName, team]: [string, any]) => {
                      const utilization = team.totalCapacity > 0 ? Math.round((team.totalAllocated / team.totalCapacity) * 100) : 0;
                      const isOverloaded = utilization > 100;
                      const isNearCapacity = utilization > 90 && utilization <= 100;
                      
                      return (
                        <div key={teamName} className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{teamName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {team.lecturers.length} staff member{team.lecturers.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                isOverloaded ? 'text-red-600' : 
                                isNearCapacity ? 'text-amber-600' : 
                                'text-green-600'
                              }`}>
                                {utilization}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {team.totalAllocated}h / {team.totalCapacity}h
                              </div>
                            </div>
                          </div>
                          
                          <Progress 
                            value={Math.min(utilization, 100)} 
                            className={`h-2 ${
                              isOverloaded ? 'bg-red-100' : 
                              isNearCapacity ? 'bg-amber-100' : 
                              'bg-green-100'
                            }`}
                          />
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              {team.overloadedCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-red-600 font-medium">{team.overloadedCount} overloaded</span>
                                </div>
                              )}
                              {team.nearCapacityCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                  <span className="text-amber-600 font-medium">{team.nearCapacityCount} near capacity</span>
                                </div>
                              )}
                              {team.availableCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-green-600 font-medium">{team.availableCount} available</span>
                                </div>
                              )}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTeam(teamName);
                                setTeamDetailModalOpen(true);
                              }}
                              className="text-xs"
                            >
                              View Details
                            </Button>
                          </div>
                          
                          {/* Quick staff list - show staff with most available capacity */}
                          <div className="space-y-1">
                            {team.lecturers
                              .sort((a: any, b: any) => {
                                const aAvailable = (a.totalContract || 0) - (a.totalAllocated || 0);
                                const bAvailable = (b.totalContract || 0) - (b.totalAllocated || 0);
                                return bAvailable - aAvailable; // Sort by most available first
                              })
                              .slice(0, 3)
                              .map((lecturer: any) => (
                                <div key={lecturer._id} className="flex items-center justify-between text-xs">
                                  <span className="truncate">{lecturer.fullName}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                      {lecturer.totalAllocated}h/{lecturer.totalContract}h
                                    </span>
                                    {getStatusBadge(lecturer.status)}
                                  </div>
                                </div>
                              ))}
                            {team.lecturers.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center pt-1">
                                +{team.lecturers.length - 3} more staff members
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </CardContent>
              </Card>

              {/* Capacity Alerts & Recommendations */}
              <Card className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle>Capacity Alerts & Recommendations</CardTitle>
                  <CardDescription>Key insights and suggested actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const alerts = [];
                    
                    // Check for overloaded staff
                    const overloadedStaff = lecturers.filter((l: any) => l.status === 'overloaded');
                    if (overloadedStaff.length > 0) {
                      alerts.push({
                        type: 'critical',
                        title: 'Overloaded Staff',
                        message: `${overloadedStaff.length} staff member${overloadedStaff.length !== 1 ? 's' : ''} are over capacity`,
                        recommendation: 'Consider redistributing workload or hiring additional staff',
                        staff: overloadedStaff.slice(0, 3)
                      });
                    }
                    
                    // Check for teams with high utilization
                    const teamData = lecturers.reduce((acc: any, lecturer: any) => {
                      const team = lecturer.team || 'Unassigned';
                      if (!acc[team]) {
                        acc[team] = { totalCapacity: 0, totalAllocated: 0, lecturers: [] };
                      }
                      acc[team].lecturers.push(lecturer);
                      acc[team].totalCapacity += lecturer.totalContract || 0;
                      acc[team].totalAllocated += lecturer.totalAllocated || 0;
                      return acc;
                    }, {});
                    
                    const highUtilizationTeams = Object.entries(teamData)
                      .map(([team, data]: [string, any]) => ({
                        team,
                        utilization: data.totalCapacity > 0 ? (data.totalAllocated / data.totalCapacity) * 100 : 0,
                        data
                      }))
                      .filter((team: any) => team.utilization > 90)
                      .sort((a: any, b: any) => b.utilization - a.utilization);
                    
                    if (highUtilizationTeams.length > 0) {
                      alerts.push({
                        type: 'warning',
                        title: 'High Team Utilization',
                        message: `${highUtilizationTeams.length} team${highUtilizationTeams.length !== 1 ? 's' : ''} at >90% capacity`,
                        recommendation: 'Monitor workload distribution and consider capacity planning',
                        teams: highUtilizationTeams.slice(0, 2)
                      });
                    }
                    
                    // Check for available capacity
                    const availableStaff = lecturers.filter((l: any) => l.status === 'available');
                    const totalAvailableCapacity = availableStaff.reduce((sum: number, l: any) => 
                      sum + (l.totalContract - l.totalAllocated), 0);
                    
                    if (totalAvailableCapacity > 0) {
                      alerts.push({
                        type: 'info',
                        title: 'Available Capacity',
                        message: `${totalAvailableCapacity}h of unused capacity across ${availableStaff.length} staff`,
                        recommendation: 'Consider assigning additional modules or projects',
                        capacity: totalAvailableCapacity
                      });
                    }
                    
                    // Check for unassigned modules
                    if (unassignedModules > 0) {
                      alerts.push({
                        type: 'warning',
                        title: 'Unassigned Modules',
                        message: `${unassignedModules} module${unassignedModules !== 1 ? 's' : ''} need assignment`,
                        recommendation: 'Review module allocation and assign to available staff',
                        modules: unassignedModules
                      });
                    }
                    
                    if (alerts.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">All systems operating normally</p>
                        </div>
                      );
                    }
                    
                    return alerts.map((alert, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        alert.type === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                        alert.type === 'warning' ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/20' :
                        'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            alert.type === 'critical' ? 'bg-red-500 text-white' :
                            alert.type === 'warning' ? 'bg-amber-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {alert.type === 'critical' ? <AlertTriangle className="w-3 h-3" /> :
                             alert.type === 'warning' ? <AlertTriangle className="w-3 h-3" /> :
                             <Info className="w-3 h-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                            <p className="text-xs font-medium text-muted-foreground">{alert.recommendation}</p>
                            
                            {alert.staff && (
                              <div className="mt-2 space-y-1">
                                {alert.staff.map((staff: any) => (
                                  <div key={staff._id} className="flex items-center justify-between text-xs">
                                    <span className="truncate">{staff.fullName}</span>
                                    <span className="text-red-600 font-medium">
                                      {staff.totalAllocated}h/{staff.totalContract}h
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {alert.teams && (
                              <div className="mt-2 space-y-1">
                                {alert.teams.map((team: any) => (
                                  <div key={team.team} className="flex items-center justify-between text-xs">
                                    <span className="truncate">{team.team}</span>
                                    <span className="text-amber-600 font-medium">
                                      {Math.round(team.utilization)}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
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
                        {loadingRecentChanges ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          <span className="ml-2 text-sm text-gray-600">Loading...</span>
                        </div>
                      ) : recentChangesItems.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">No recent activity</p>
                        </div>
                      ) : (
                        recentChangesItems
                          .slice(0, 5)
                          .map((notification: any) => {
                            const titleObj = getNotificationTitle(notification);
                            return (
                              <div key={notification.id} className="flex items-start gap-3 pb-1 border-b border-gray-200 last:border-b-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1
                                  ${notification.data?.type === 'create' ? 'bg-green-100 text-green-700' :
                                    notification.data?.type === 'edit' ? 'bg-orange-100 text-orange-700' :
                                    notification.data?.type === 'delete' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-600'}`}
                                >
                                  {notification.data?.type === 'create' ? <PlusCircle className="h-4 w-4" /> :
                                   notification.data?.type === 'edit' ? <Pencil className="h-4 w-4" /> :
                                   notification.data?.type === 'delete' ? <Trash2 className="h-4 w-4" /> :
                                   getChangeIcon(notification.data?.type)}
                                </div>
                                <div className="flex-1 min-w-0 flex items-center justify-between">
                                  <div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {titleObj.isHtml ? (
                                        <span dangerouslySetInnerHTML={{ __html: titleObj.value }} />
                                      ) : (
                                        titleObj.value
                                      )}
                                    </span>
                                    {notification.data?.description && (
                                      <p className="text-xs text-gray-600 mt-1">{notification.data.description}</p>
                                    )}
                                  </div>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-xs text-gray-500 cursor-help ml-4 whitespace-nowrap">
                                        {formatNotificationTimestamp(notification.inserted_at).display}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{formatNotificationTimestamp(notification.inserted_at).tooltip}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            );
                                                     })
                       )}
                      </TooltipProvider>
                    </div>
                  </ScrollArea>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => router.push("/inbox#recent-changes")}
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
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => {
                      setCsvImportType("lecturers");
                      setCsvImportModalOpen(true);
                    }}
                  >
                    <Users className="w-6 h-6" />
                    Import Lecturers
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => {
                      setCsvImportType("modules");
                      setCsvImportModalOpen(true);
                    }}
                  >
                    <BookOpen className="w-6 h-6" />
                    Import Modules
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => {
                      setCsvImportType("module-iterations");
                      setCsvImportModalOpen(true);
                    }}
                  >
                    <FileText className="w-6 h-6" />
                    Import Module Iterations
                  </Button>
                </div>
              </CardContent>
            </Card>
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
        <SettingsModal
          open={userProfileModalOpen}
          onOpenChange={setUserProfileModalOpen}
          initialTab={userProfileModalTab}
        />
        <CSVImportModal
          isOpen={csvImportModalOpen}
          onClose={() => setCsvImportModalOpen(false)}
          importType={csvImportType}
        />
        
        {/* Team Detail Modal */}
        {selectedTeam && (
          <Dialog open={teamDetailModalOpen} onOpenChange={setTeamDetailModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {selectedTeam} - Team Details
                </DialogTitle>
                <DialogDescription>
                  Detailed view of staff capacity and workload allocation for {selectedTeam}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {(() => {
                  const teamLecturers = lecturers.filter((l: any) => l.team === selectedTeam);
                  const teamStats = teamLecturers.reduce((acc: any, lecturer: any) => {
                    acc.totalCapacity += lecturer.totalContract || 0;
                    acc.totalAllocated += lecturer.totalAllocated || 0;
                    acc.overloadedCount += lecturer.status === 'overloaded' ? 1 : 0;
                    acc.availableCount += lecturer.status === 'available' ? 1 : 0;
                    acc.nearCapacityCount += lecturer.status === 'near-capacity' ? 1 : 0;
                    return acc;
                  }, { totalCapacity: 0, totalAllocated: 0, overloadedCount: 0, availableCount: 0, nearCapacityCount: 0 });
                  
                  const utilization = teamStats.totalCapacity > 0 ? Math.round((teamStats.totalAllocated / teamStats.totalCapacity) * 100) : 0;
                  
                  return (
                    <>
                      {/* Team Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Team Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{teamLecturers.length}</div>
                              <div className="text-sm text-muted-foreground">Staff Members</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{teamStats.totalCapacity}h</div>
                              <div className="text-sm text-muted-foreground">Total Capacity</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-amber-600">{teamStats.totalAllocated}h</div>
                              <div className="text-sm text-muted-foreground">Allocated</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${
                                utilization > 100 ? 'text-red-600' : 
                                utilization > 90 ? 'text-amber-600' : 
                                'text-green-600'
                              }`}>{utilization}%</div>
                              <div className="text-sm text-muted-foreground">Utilization</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Staff List */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Staff Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {teamLecturers.map((lecturer: any) => (
                              <div key={lecturer._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{lecturer.fullName}</h4>
                                      <p className="text-sm text-muted-foreground">{lecturer.role} • {lecturer.specialism}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {getStatusBadge(lecturer.status)}
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Contract:</span>
                                    <span className="font-medium">{lecturer.contract}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Capacity:</span>
                                    <span className="font-medium">{lecturer.totalContract}h</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Allocated:</span>
                                    <span className="font-medium">{lecturer.totalAllocated}h</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Available:</span>
                                    <span className="font-medium">{lecturer.totalContract - lecturer.totalAllocated}h</span>
                                  </div>
                                  
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                      <span>Workload</span>
                                      <span>{Math.round((lecturer.totalAllocated / lecturer.totalContract) * 100)}%</span>
                                    </div>
                                    <Progress 
                                      value={(lecturer.totalAllocated / lecturer.totalContract) * 100} 
                                      className="h-2"
                                    />
                                  </div>
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenStaffProfileModal(lecturer._id)}
                                    className="w-full"
                                  >
                                    View Full Profile
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}

export default function AcademicWorkloadPlanner() {
  const { isSignedIn, userId, isLoaded } = useAuth();
  const knockApiKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;
  
  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="w-full bg-white dark:bg-zinc-900">
          <Navigation 
            activeTab="dashboard" 
            setActiveTab={() => {}} 
            onProfileClick={() => {}} 
            onSettingsClick={() => {}} 
            onInboxClick={() => {}}
          />
        </div>
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </main>
      </div>
    );
  }
  
  // Check if Knock is available
  if (!knockApiKey || !userId || !isSignedIn) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="w-full bg-white dark:bg-zinc-900">
          <Navigation 
            activeTab="dashboard" 
            setActiveTab={() => {}} 
            onProfileClick={() => {}} 
            onSettingsClick={() => {}} 
            onInboxClick={() => {}}
          />
        </div>
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">Please sign in to view recent activity</p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <KnockSafeWrapper fallback={
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="w-full bg-white dark:bg-zinc-900">
          <Navigation 
            activeTab="dashboard" 
            setActiveTab={() => {}} 
            onProfileClick={() => {}} 
            onSettingsClick={() => {}} 
            onInboxClick={() => {}}
          />
        </div>
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
          </div>
        </main>
      </div>
    }>
      <DashboardContent />
    </KnockSafeWrapper>
  );
}
