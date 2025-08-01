"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Search, Users, Clock, MapPin, GripVertical, Save, X, BookOpen, Calendar } from "lucide-react"
import { toast } from "sonner"
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import type { Id } from "../../../../convex/_generated/dataModel";

// Define interfaces for the allocation system based on new schema
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
}

interface Lecturer {
  _id: Id<'lecturers'>;
  profileId: Id<'lecturer_profiles'>;
  academicYearId: Id<'academic_years'>;
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
  _id: Id<'lecturer_profiles'>;
  fullName: string;
  email: string;
  family: string;
  fte: number;
  capacity: number;
  maxTeachingHours: number;
  totalContract: number;
  isActive: boolean;
}

interface ModuleAllocation {
  _id: Id<'module_allocations'>;
  moduleIterationId: Id<'module_iterations'>;
  lecturerId: Id<'lecturers'>;
  allocationTypeId?: Id<'allocation_types'>;
  teachingHours: number;
  markingHours: number;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

export default function ModuleAllocations() {
  const searchParams = useSearchParams();
  const moduleFilter = searchParams.get('module');
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set())

  // Get current academic year context
  const { currentAcademicYearId } = useAcademicYear();

  // Fetch data from Convex with academic year context
  const moduleIterations = useQuery(api.module_iterations.getAll, {}) ?? [];
  const modules = useQuery(api.modules.getAll, {}) ?? [];
  const lecturers = useQuery(api.lecturers.getAll, {}) ?? [];
  const lecturerProfiles = useQuery(api.lecturer_profiles.getAll, {}) ?? [];
  const moduleAllocations = useQuery(api.module_allocations.getAll, {}) ?? [];
  const updateModuleIteration = useMutation(api.module_iterations.update);
  const createModuleAllocation = useMutation(api.module_allocations.create);
  const updateModuleAllocation = useMutation(api.module_allocations.update);
  const deleteModuleAllocation = useMutation(api.module_allocations.delete);
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();

  // Helper functions
  const getModuleName = (moduleId: Id<'modules'>) => {
    const module = modules.find(m => m._id === moduleId);
    return module ? `${module.code} - ${module.title}` : "Unknown Module";
  };

  const getModuleCode = (moduleId: Id<'modules'>) => {
    const module = modules.find(m => m._id === moduleId);
    return module?.code || "Unknown";
  };

  const getLecturerName = (lecturerId: Id<'lecturers'>) => {
    const lecturer = lecturers.find(l => l._id === lecturerId);
    if (!lecturer) return "Unknown";
    
    const profile = lecturerProfiles.find(p => p._id === lecturer.profileId);
    return profile?.fullName || "Unknown";
  };

  const getLecturerProfile = (lecturerId: Id<'lecturers'>) => {
    const lecturer = lecturers.find(l => l._id === lecturerId);
    if (!lecturer) return null;
    
    return lecturerProfiles.find(p => p._id === lecturer.profileId);
  };

  const getCurrentYearIterations = () => {
    return moduleIterations.filter(mi => mi.academicYearId === currentAcademicYearId);
  };

  const getCurrentYearLecturers = () => {
    return lecturers.filter(l => l.academicYearId === currentAcademicYearId);
  };

  const getModuleAllocations = (moduleIterationId: Id<'module_iterations'>) => {
    return moduleAllocations.filter(ma => ma.moduleIterationId === moduleIterationId);
  };

  const getLecturerAllocations = (lecturerId: Id<'lecturers'>) => {
    return moduleAllocations.filter(ma => ma.lecturerId === lecturerId);
  };

  const getLecturerUtilization = (lecturerId: Id<'lecturers'>) => {
    const lecturer = lecturers.find(l => l._id === lecturerId);
    if (!lecturer) return 0;
    
    const totalContract = lecturer.totalContract || 0;
    const totalAllocated = lecturer.totalAllocated || 0;
    
    return totalContract > 0 ? (totalAllocated / totalContract) * 100 : 0;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return <Badge className="bg-green-100 text-green-800">Assigned</Badge>;
      case "unassigned":
        return <Badge className="bg-red-100 text-red-800">Unassigned</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCapacityColor = (assigned: number, capacity: number) => {
    if (capacity === 0) return "text-gray-500";
    const percentage = (assigned / capacity) * 100;
    if (percentage > 100) return "text-red-600";
    if (percentage > 90) return "text-yellow-600";
    if (percentage > 70) return "text-blue-600";
    return "text-green-600";
  };

  const getSemesterLabel = (semester: string) => {
    switch (semester) {
      case "1":
        return "Semester 1";
      case "2":
        return "Semester 2";
      case "3":
        return "Summer";
      default:
        return `Semester ${semester}`;
    }
  };

  // Filter data based on search and semester
  const filteredIterations = getCurrentYearIterations().filter(iteration => {
    const moduleName = getModuleName(iteration.moduleId).toLowerCase();
    const matchesSearch = searchTerm === "" || moduleName.includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === "all" || iteration.semester === selectedSemester;
    const matchesModuleFilter = !moduleFilter || getModuleCode(iteration.moduleId) === moduleFilter;
    
    return matchesSearch && matchesSemester && matchesSemester;
  });

  const availableLecturers = getCurrentYearLecturers().filter(lecturer => {
    const profile = getLecturerProfile(lecturer._id);
    return profile && profile.isActive && lecturer.isActive;
  });

  // Track changes for unsaved changes warning
  const trackChange = (iterationId: string) => {
    setPendingChanges(prev => new Set(prev).add(iterationId));
    setHasUnsavedChanges(true);
  };

  const clearChanges = () => {
    setPendingChanges(new Set());
    setHasUnsavedChanges(false);
  };

  // Handle drag and drop for allocations
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Same list, just reordering
      return;
    }

    const iterationId = destination.droppableId;
    const lecturerId = draggableId;

    try {
      // Update the module iteration's assigned lecturers
      const iteration = moduleIterations.find(mi => mi._id === iterationId);
      if (!iteration) return;

      const currentAssignedIds = iteration.assignedLecturerIds || [];
      const newAssignedIds = [...currentAssignedIds, lecturerId];

      await updateModuleIteration({
        id: iterationId as Id<'module_iterations'>,
        assignedLecturerIds: newAssignedIds,
        assignedStatus: "assigned",
      });

      // Create module allocation record
      const module = modules.find(m => m._id === iteration.moduleId);
      if (module) {
        await createModuleAllocation({
          moduleIterationId: iterationId as Id<'module_iterations'>,
          lecturerId: lecturerId as Id<'lecturers'>,
          teachingHours: module.defaultTeachingHours,
          markingHours: module.defaultMarkingHours,
        });
      }

      trackChange(iterationId);
      toast.success("Allocation updated successfully");

      logRecentActivity({
        type: "edit",
        entity: "module_allocation",
        description: `Assigned lecturer to ${getModuleName(iteration.moduleId)}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

    } catch (error) {
      console.error("Error updating allocation:", error);
      toast.error("Failed to update allocation");
    }
  };

  const handleUnassignLecturer = async (iterationId: string, lecturerId: string) => {
    try {
      const iteration = moduleIterations.find(mi => mi._id === iterationId);
      if (!iteration) return;

      const currentAssignedIds = iteration.assignedLecturerIds || [];
      const newAssignedIds = currentAssignedIds.filter(id => id !== lecturerId);

      await updateModuleIteration({
        id: iterationId as Id<'module_iterations'>,
        assignedLecturerIds: newAssignedIds,
        assignedStatus: newAssignedIds.length > 0 ? "assigned" : "unassigned",
      });

      // Remove module allocation record
      const allocation = moduleAllocations.find(ma => 
        ma.moduleIterationId === iterationId && ma.lecturerId === lecturerId
      );
      if (allocation) {
        await deleteModuleAllocation({ id: allocation._id });
      }

      trackChange(iterationId);
      toast.success("Lecturer unassigned successfully");

      logRecentActivity({
        type: "edit",
        entity: "module_allocation",
        description: `Unassigned lecturer from ${getModuleName(iteration.moduleId)}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

    } catch (error) {
      console.error("Error unassigning lecturer:", error);
      toast.error("Failed to unassign lecturer");
    }
  };

  const handleSaveAllocations = async () => {
    setIsSaving(true);
    try {
      // Save all pending changes
      for (const iterationId of pendingChanges) {
        // Additional save logic if needed
      }
      
      clearChanges();
      toast.success("All allocations saved successfully");
    } catch (error) {
      console.error("Error saving allocations:", error);
      toast.error("Failed to save allocations");
    } finally {
      setIsSaving(false);
    }
  };

  // Get unique semesters for filter
  const semesters = [...new Set(getCurrentYearIterations().map(mi => mi.semester))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Module Allocations
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage module assignments and lecturer allocations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Button 
              onClick={handleSaveAllocations} 
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Iterations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getCurrentYearIterations().length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getCurrentYearIterations().filter(mi => mi.assignedStatus === "assigned").length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unassigned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getCurrentYearIterations().filter(mi => mi.assignedStatus === "unassigned").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Lecturers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableLecturers.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white dark:bg-zinc-900">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map(semester => (
                  <SelectItem key={semester} value={semester}>
                    {getSemesterLabel(semester)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Module Iterations Table */}
      <Card className="bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle>Module Iterations</CardTitle>
          <CardDescription>
            Current academic year module iterations and their allocations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Assigned Lecturers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIterations.map((iteration) => {
                const assignedLecturers = iteration.assignedLecturerIds || [];
                const allocations = getModuleAllocations(iteration._id);
                
                return (
                  <TableRow key={iteration._id}>
                    <TableCell className="font-medium">
                      {getModuleName(iteration.moduleId)}
                    </TableCell>
                    <TableCell>{getSemesterLabel(iteration.semester)}</TableCell>
                    <TableCell>
                      {assignedLecturers.length > 0 ? (
                        <div className="space-y-1">
                          {assignedLecturers.map(lecturerId => {
                            const profile = getLecturerProfile(lecturerId);
                            const allocation = allocations.find(a => a.lecturerId === lecturerId);
                            return (
                              <div key={lecturerId} className="flex items-center justify-between text-sm">
                                <span>{profile?.fullName || "Unknown"}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    {allocation?.teachingHours || 0}h teaching
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUnassignLecturer(iteration._id, lecturerId)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No lecturers assigned</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(iteration.assignedStatus)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled>
                        <span className="text-xs">Coming Soon</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Available Lecturers */}
      <Card className="bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle>Available Lecturers</CardTitle>
          <CardDescription>
            Lecturers available for module assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableLecturers.map((lecturer) => {
                const profile = getLecturerProfile(lecturer._id);
                const utilization = getLecturerUtilization(lecturer._id);
                const lecturerAllocations = getLecturerAllocations(lecturer._id);
                
                return (
                  <TableRow key={lecturer._id}>
                    <TableCell className="font-medium">
                      {profile?.fullName || "Unknown"}
                    </TableCell>
                    <TableCell>{profile?.family || "Unknown"}</TableCell>
                    <TableCell>{lecturer.team || "Unassigned"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Contract: {lecturer.totalContract || 0}h</div>
                        <div>Allocated: {lecturer.totalAllocated || 0}h</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getCapacityColor(lecturer.totalAllocated || 0, lecturer.totalContract || 0)}`}>
                          {Math.round(utilization)}%
                        </span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              utilization > 100 ? 'bg-red-500' :
                              utilization > 90 ? 'bg-yellow-500' :
                              utilization > 70 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {utilization > 100 ? (
                        <Badge variant="destructive">Overloaded</Badge>
                      ) : utilization > 90 ? (
                        <Badge variant="secondary">Near Capacity</Badge>
                      ) : (
                        <Badge variant="default">Available</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 