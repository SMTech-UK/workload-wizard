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
import { Search, Users, Clock, MapPin, GripVertical, Save, X } from "lucide-react"
import { toast } from "sonner"
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import type { Id } from "../../../../convex/_generated/dataModel";

// Define interfaces for the allocation system
interface ModuleIterationForAllocation {
  _id: Id<'module_iterations'>;
  moduleCode: string;
  title: string;
  semester: number;
  cohortId: string;
  teachingStartDate: string;
  teachingHours: number;
  markingHours: number;
  assignedLecturerIds: string[];
  assignedStatus: string;
  notes?: string;
  assessments: Array<{
    title: string;
    type: string;
    weighting: number;
    submissionDate: string;
    marksDueDate: string;
    isSecondAttempt: boolean;
    externalExaminerRequired: boolean;
    alertsToTeam: boolean;
  }>;
  sites: Array<{
    name: string;
    deliveryTime: string;
    students: number;
    groups: number;
  }>;
}

// Interface for individual group assignments
interface GroupAssignment {
  id: string; // Unique ID for this group assignment
  moduleIterationId: Id<'module_iterations'>;
  moduleCode: string;
  title: string;
  semester: number;
  cohortId: string;
  siteName: string;
  deliveryTime: string;
  groupNumber: number; // Which group this is (1, 2, 3, etc.)
  students: number;
  teachingHours: number;
  markingHours: number;
  assignedLecturerId?: string;
  assignedStatus: string;
}

interface LecturerForAllocation {
  _id: Id<'lecturers'>;
  fullName: string;
  contract: string;
  capacity: number;
  totalAllocated: number;
  totalContract: number;
  maxTeachingHours: number;
  allocatedTeachingHours: number;
  allocatedAdminHours: number;
  teachingAvailability: number;
  team: string;
  specialism: string;
  status: string;
  assignedGroupIds: string[];
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
  const { currentAcademicYear } = useAcademicYear();

  // Fetch data from Convex with academic year context
  const iterations = useQuery(api.module_iterations.getAll, { academicYearId: currentAcademicYear }) ?? [];
  const lecturerInstances = useQuery(api.lecturers.getAll, { academicYearId: currentAcademicYear }) ?? [];
  const lecturerProfiles = useQuery(api.lecturers.getProfiles, {}) ?? [];
  const updateIterationAssignments = useMutation(api.module_iterations.updateIterationAssignments)
  const batchSaveAllocations = useMutation(api.module_iterations.batchSaveAllocations)
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();

  // Combine lecturer profiles with instances for allocation data
  const lecturers = lecturerProfiles.map(profile => {
    const instance = lecturerInstances.find(inst => inst.profileId === profile._id);
    return {
      ...profile,
      ...instance,
      // Ensure we have the instance data for allocation calculations
      allocatedTeachingHours: instance?.allocatedTeachingHours || 0,
      allocatedAdminHours: instance?.allocatedAdminHours || 0,
      allocatedResearchHours: instance?.allocatedResearchHours || 0,
      allocatedOtherHours: instance?.allocatedOtherHours || 0,
      totalAllocated: instance?.totalAllocated || 0,
      teachingAvailability: instance?.teachingAvailability || profile.maxTeachingHours,
    };
  });

  // Transform data for allocation system - create individual group assignments
  const groupAssignments: GroupAssignment[] = [];
  
  iterations.forEach(iteration => {
    // Handle iterations with no sites or empty sites array
    // Note: sites field removed from new schema - using default group assignment
    // if (!iteration.sites || iteration.sites.length === 0) {
    // Create a default group for iterations without sites
    groupAssignments.push({
      id: `${iteration._id}-default-1`,
      moduleIterationId: iteration._id,
      moduleCode: iteration.moduleCode,
      title: iteration.title,
      semester: iteration.semester,
      cohortId: iteration.cohortId,
      siteName: "No Site Assigned",
      deliveryTime: "TBD",
      groupNumber: 1,
      students: 0,
      teachingHours: iteration.teachingHours,
      markingHours: iteration.markingHours,
      assignedLecturerId: iteration.assignedLecturerIds[0] || undefined,
      assignedStatus: iteration.assignedLecturerIds[0] ? "assigned" : "unassigned"
    });
    // }

    // Process iterations with sites
    let globalGroupIndex = 0;
    iteration.sites.forEach((site: any) => {
      // Handle sites with no groups or 0 groups
      const numGroups = site.groups || 1;
      
      for (let groupNum = 1; groupNum <= numGroups; groupNum++) {
        // Calculate hours per group (divide total hours by total groups across all sites)
        const totalGroups = iteration.sites.reduce((sum: number, s: any) => sum + (s.groups || 1), 0);
        const hoursPerGroup = Math.ceil((iteration.teachingHours + iteration.markingHours) / totalGroups);
        
        groupAssignments.push({
          id: `${iteration._id}-${site.name}-${groupNum}`,
          moduleIterationId: iteration._id,
          moduleCode: iteration.moduleCode,
          title: iteration.title,
          semester: iteration.semester,
          cohortId: iteration.cohortId,
          siteName: site.name,
          deliveryTime: site.deliveryTime || "TBD",
          groupNumber: groupNum,
          students: Math.ceil((site.students || 0) / numGroups),
          teachingHours: Math.ceil(iteration.teachingHours / totalGroups),
          markingHours: Math.ceil(iteration.markingHours / totalGroups),
          assignedLecturerId: iteration.assignedLecturerIds[globalGroupIndex] || undefined,
          assignedStatus: iteration.assignedLecturerIds[globalGroupIndex] ? "assigned" : "unassigned"
        });
        globalGroupIndex++;
      }
    });
  });

  // Ensure every iteration has at least one group
  const fallbackGroupsCreated: string[] = [];
  iterations.forEach(iteration => {
    const hasGroups = groupAssignments.some(g => g.moduleIterationId === iteration._id);
    if (!hasGroups) {
      console.warn(`Creating fallback group for iteration: ${iteration.moduleCode} - ${iteration.title}`);
      fallbackGroupsCreated.push(iteration.moduleCode);
      groupAssignments.push({
        id: `${iteration._id}-fallback-1`,
        moduleIterationId: iteration._id,
        moduleCode: iteration.moduleCode,
        title: iteration.title,
        semester: iteration.semester,
        cohortId: iteration.cohortId,
        siteName: "Fallback Site",
        deliveryTime: "TBD",
        groupNumber: 1,
        students: 0,
        teachingHours: iteration.teachingHours,
        markingHours: iteration.markingHours,
        assignedLecturerId: undefined,
        assignedStatus: "unassigned"
      });
    }
  });

  // Type guard to check if lecturer has profile data
  const hasProfileData = (lecturer: any): lecturer is any & {
    fullName: string;
    contract: string;
    capacity: number;
    totalContract: number;
    maxTeachingHours: number;
    team: string;
    specialism: string;
  } => {
    return lecturer && typeof lecturer.fullName === 'string';
  };

  const lecturerAllocations: LecturerForAllocation[] = lecturers.map(lecturer => {
    const assignedGroupIds = groupAssignments
      .filter(group => group.assignedLecturerId === lecturer._id)
      .map(group => group.id);
    
    // Calculate current allocation from assigned groups (this represents pending changes)
    const currentGroupAllocation = assignedGroupIds.reduce((sum, groupId) => {
      const group = groupAssignments.find(g => g.id === groupId);
      return sum + (group ? group.teachingHours + group.markingHours : 0);
    }, 0);
    
    // Calculate total allocated as admin hours + existing teaching hours + new group allocation
    const totalAllocated = (lecturer.allocatedAdminHours || 0) + (lecturer.allocatedTeachingHours || 0) + currentGroupAllocation;
    
    // Calculate teaching availability as maxTeachingHours - (existing teaching hours + new group allocation)
    const teachingAvailability = Math.max(0, (hasProfileData(lecturer) ? lecturer.maxTeachingHours : 0) - ((lecturer.allocatedTeachingHours || 0) + currentGroupAllocation));
    
    return {
      _id: lecturer._id,
      fullName: hasProfileData(lecturer) ? lecturer.fullName : "Unknown",
      contract: hasProfileData(lecturer) ? lecturer.contract : "Unknown",
      capacity: hasProfileData(lecturer) ? lecturer.capacity : 0,
      totalAllocated,
      totalContract: hasProfileData(lecturer) ? lecturer.totalContract : 0,
      maxTeachingHours: hasProfileData(lecturer) ? lecturer.maxTeachingHours : 0,
      allocatedTeachingHours: lecturer.allocatedTeachingHours || 0,
      allocatedAdminHours: lecturer.allocatedAdminHours || 0,
      teachingAvailability,
      team: hasProfileData(lecturer) ? lecturer.team : "Unknown",
      specialism: hasProfileData(lecturer) ? lecturer.specialism : "Unknown",
      status: lecturer.status || "unknown",
      assignedGroupIds,
    };
  });

  // Filter group assignments based on search, semester, and module filter
  const filteredGroupAssignments = groupAssignments.filter((group) => {
    const matchesSearch =
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.moduleCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = selectedSemester === "all" || group.semester.toString() === selectedSemester
    const matchesModuleFilter = moduleFilter ? group.moduleCode === moduleFilter : true
    return matchesSearch && matchesSemester && matchesModuleFilter
  })

  const unassignedGroups = filteredGroupAssignments.filter((g) => !g.assignedLecturerId)

  // Function to track changes when drag operations occur
  const trackChange = (iterationId: string) => {
    setPendingChanges(prev => new Set(prev).add(iterationId));
    setHasUnsavedChanges(true);
  };

  // Function to clear changes after successful save
  const clearChanges = () => {
    setPendingChanges(new Set());
    setHasUnsavedChanges(false);
  };

  // Debug logging to help identify missing modules
  console.log('Module Allocations Debug:', {
    totalIterations: iterations.length,
    totalGroupsCreated: groupAssignments.length,
    unassignedGroups: unassignedGroups.length,
    filteredGroups: filteredGroupAssignments.length,
    hasUnsavedChanges,
    pendingChanges: Array.from(pendingChanges),
    iterationsWithoutGroups: iterations.filter(i => 
      !groupAssignments.some(g => g.moduleIterationId === i._id)
    ).map(i => ({ code: i.moduleCode, title: i.title, sites: i.sites?.length || 0 }))
  });

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    // If dropped in the same place, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Find the group being dragged
    const group = groupAssignments.find((g) => g.id === draggableId)
    if (!group) return

    // If dropped to 'unassigned' column
    if (destination.droppableId === "unassigned") {
      try {
        // Find the iteration and update its assigned lecturers
        const iteration = iterations.find(i => i._id === group.moduleIterationId)
        if (!iteration) return

        // Remove this lecturer from the assigned lecturers
        const updatedAssignedLecturerIds = [...iteration.assignedLecturerIds];
        const groupIndex = groupAssignments
          .filter(g => g.moduleIterationId === iteration._id)
          .findIndex(g => g.id === group.id)
        if (groupIndex >= 0 && groupIndex < updatedAssignedLecturerIds.length) {
          updatedAssignedLecturerIds.splice(groupIndex, 1);
        }

        // Filter out empty strings to avoid Convex validation errors
        const validLecturerIds = updatedAssignedLecturerIds.filter(id => id !== "");
        
        await updateIterationAssignments({
          id: iteration._id,
          assignedLecturerIds: validLecturerIds,
          assignedStatus: validLecturerIds.length === 0 ? "unassigned" : "assigned",
        });
        
        await logRecentActivity({
          action: "group unassigned",
          changeType: "update",
          entity: "module_iteration",
          entityId: iteration._id,
          fullName: `${group.moduleCode} Group ${group.groupNumber} (${group.siteName})`,
          modifiedBy: user ? [{ name: user.fullName ?? "", email: user.primaryEmailAddress?.emailAddress ?? "" }] : [],
          permission: "default"
        });
        
        // Track the change
        trackChange(iteration._id);
      } catch (error) {
        console.error('Failed to unassign group:', error);
      }
      return
    }

    // Dropped to a lecturer column
    const lecturerIdx = lecturers.findIndex((lect) => lect._id === destination.droppableId)
    if (lecturerIdx === -1) return
    const lecturer = lecturers[lecturerIdx]

    // Validation: check if adding this group would exceed teaching availability
    const groupHours = group.teachingHours + group.markingHours;
    const newTeachingHours = (lecturer.allocatedTeachingHours || 0) + groupHours;
    const maxTeachingHours = lecturer.maxTeachingHours || 0;
    if (newTeachingHours > maxTeachingHours) {
      alert(`${lecturer.fullName} does not have enough teaching availability for this group.`)
      return
    }

    try {
      // Find the iteration and update its assigned lecturers
      const iteration = iterations.find(i => i._id === group.moduleIterationId)
      if (!iteration) return

      // Add lecturer to the assigned lecturers array
      const updatedAssignedLecturerIds = [...iteration.assignedLecturerIds, lecturer._id]

      // Filter out empty strings to avoid Convex validation errors
      const validLecturerIds = updatedAssignedLecturerIds.filter(id => id !== "");
      
      await updateIterationAssignments({
        id: iteration._id,
        assignedLecturerIds: validLecturerIds,
        assignedStatus: newTeachingHours > maxTeachingHours ? "overloaded" : "assigned",
      });
      
              await logRecentActivity({
          action: "group assigned to lecturer",
          changeType: "update",
          entity: "module_iteration",
          entityId: iteration._id,
          fullName: `${group.moduleCode} Group ${group.groupNumber} (${group.siteName}) → ${lecturer.fullName}`,
          modifiedBy: user ? [{ name: user.fullName ?? "", email: user.primaryEmailAddress?.emailAddress ?? "" }] : [],
          permission: "default"
        });
        
        // Track the change
        trackChange(iteration._id);
      } catch (error) {
        console.error('Failed to assign group:', error);
      }
  }

  const handleUnassignGroup = async (groupId: string, lecturerId: string) => {
    const group = groupAssignments.find(g => g.id === groupId);
    if (!group) return;

    const lecturer = lecturers.find(l => l._id === lecturerId);
    if (!lecturer) return;

    const iteration = iterations.find(i => i._id === group.moduleIterationId);
    if (!iteration) return;

    // Remove lecturer from the assigned lecturers array
    const updatedAssignedLecturerIds = iteration.assignedLecturerIds.filter((id: string) => id !== lecturerId);
    
    try {
      // Filter out empty strings to avoid Convex validation errors
      const validLecturerIds = updatedAssignedLecturerIds.filter((id: string) => id !== "");
      
      await updateIterationAssignments({
        id: iteration._id,
        assignedLecturerIds: validLecturerIds,
        assignedStatus: validLecturerIds.length === 0 ? "unassigned" : "assigned",
      });
      
              await logRecentActivity({
          action: "group unassigned from lecturer",
          changeType: "update",
          entity: "module_iteration",
          entityId: iteration._id,
          fullName: `${group.moduleCode} Group ${group.groupNumber} (${group.siteName}) unassigned from ${lecturer.fullName}`,
          modifiedBy: user ? [{ name: user.fullName ?? "", email: user.primaryEmailAddress?.emailAddress ?? "" }] : [],
          permission: "default"
        });
        
        // Track the change
        trackChange(iteration._id);
      } catch (error) {
        console.error('Failed to unassign group:', error);
      }
  }

  const handleSaveAllocations = async () => {
    // Check if there are any changes to save
    if (!hasUnsavedChanges) {
      toast.info("No changes to save", {
        description: "All allocations are already up to date."
      });
      return;
    }

    setIsSaving(true);
    try {
      // Prepare data for batch save
      const allocations: Array<{
        moduleIterationId: Id<'module_iterations'>;
        assignedLecturerIds: Id<'lecturers'>[];
        assignedStatus: string;
      }> = [];

      const lecturerUpdates: Array<{
        lecturerId: Id<'lecturers'>;
        allocatedTeachingHours: number;
        totalAllocated: number;
        teachingAvailability: number;
        capacity: number;
      }> = [];

      const moduleAllocations: Array<{
        lecturerId: Id<'lecturers'>;
        moduleCode: string;
        moduleName: string;
        hoursAllocated: number;
        type: string;
        semester: string;
        groupNumber: number;
        siteName: string;
      }> = [];

      // Process each iteration to update assigned lecturers
      iterations.forEach(iteration => {
        const assignedLecturerIds: string[] = [];
        
        // Get all groups for this iteration and their assignments
        const iterationGroups = groupAssignments.filter(g => g.moduleIterationId === iteration._id);
        iterationGroups.forEach(group => {
          if (group.assignedLecturerId) {
            assignedLecturerIds.push(group.assignedLecturerId);
          }
        });

        allocations.push({
          moduleIterationId: iteration._id,
          assignedLecturerIds: assignedLecturerIds.filter((id: string) => id !== "").map(id => id as Id<'lecturers'>),
          assignedStatus: assignedLecturerIds.filter((id: string) => id !== "").length > 0 ? "assigned" : "unassigned"
        });
      });

      // Process each lecturer to update their allocation data
      lecturers.forEach(lecturer => {
        const assignedGroups = groupAssignments.filter(g => g.assignedLecturerId === lecturer._id);
        const newTeachingHours = assignedGroups.reduce((sum, group) => sum + group.teachingHours, 0);
        const newMarkingHours = assignedGroups.reduce((sum, group) => sum + group.markingHours, 0);
        
        // Calculate total teaching hours for this assignment (teaching + marking)
        const totalNewHours = newTeachingHours + newMarkingHours;
        
        // For now, we'll replace the allocatedTeachingHours with the new total
        // This assumes that the current assignments represent the complete state
        const updatedAllocatedTeachingHours = totalNewHours;
        
        // Calculate totalAllocated as allocatedAdminHours + allocatedTeachingHours
        const totalAllocated = (lecturer.allocatedAdminHours || 0) + updatedAllocatedTeachingHours;
        
        // Calculate teachingAvailability as maxTeachingHours - allocatedTeachingHours
        const updatedTeachingAvailability = Math.max(0, (lecturer.maxTeachingHours || 0) - updatedAllocatedTeachingHours);

        lecturerUpdates.push({
          lecturerId: lecturer._id,
          allocatedTeachingHours: updatedAllocatedTeachingHours,
          totalAllocated: totalAllocated,
          teachingAvailability: updatedTeachingAvailability,
          capacity: lecturer.capacity // Keep existing capacity as it's based on contract
        });

        // Create module allocation records for each assigned group
        assignedGroups.forEach(group => {
          const iteration = iterations.find(i => i._id === group.moduleIterationId);
          if (iteration) {
            moduleAllocations.push({
              lecturerId: lecturer._id,
              moduleCode: group.moduleCode,
              moduleName: group.title,
              hoursAllocated: group.teachingHours + group.markingHours,
              type: "teaching",
              semester: `Semester ${group.semester}`,
              groupNumber: group.groupNumber,
              siteName: group.siteName
            });
          }
        });
      });

      // Execute batch save
      await batchSaveAllocations({
        allocations,
        lecturerUpdates,
        moduleAllocations
      });

      await logRecentActivity({
        action: "module allocations batch saved",
        changeType: "update",
        entity: "module_allocations",
        entityId: "batch",
        fullName: "Module allocations and lecturer data updated",
        modifiedBy: user ? [{ name: user.fullName ?? "", email: user.primaryEmailAddress?.emailAddress ?? "" }] : [],
        permission: "default"
      });

      // Show success message
      toast.success("Module allocations saved successfully!", {
        description: `Updated ${allocations.length} module iterations and ${lecturerUpdates.length} lecturer records.`
      });
      
      // Clear changes after successful save
      clearChanges();
    } catch (error) {
      console.error('Failed to save allocations:', error);
      toast.error("Failed to save allocations", {
        description: "Please try again or contact support if the problem persists."
      });
    } finally {
      setIsSaving(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return (
          <Badge variant="default" className="bg-green-600">
            Assigned
          </Badge>
        )
      case "unassigned":
        return <Badge variant="secondary">Unassigned</Badge>
      case "overloaded":
        return <Badge variant="destructive">Overloaded</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getCapacityColor = (assigned: number, capacity: number) => {
    const percentage = (assigned / capacity) * 100
    if (percentage > 100) return "text-red-600"
    if (percentage > 90) return "text-amber-600"
    return "text-green-600"
  }

  const getSemesterLabel = (semester: number) => {
    switch (semester) {
      case 1: return "Semester 1";
      case 2: return "Semester 2";
      case 3: return "Summer";
      default: return `Semester ${semester}`;
    }
  }

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Module Allocations
            {moduleFilter && (
              <span className="text-lg font-normal text-gray-600 dark:text-gray-300 ml-2">
                - {moduleFilter}
              </span>
            )}
            {hasUnsavedChanges && (
              <span className="text-sm font-normal text-amber-600 ml-2">
                • Unsaved Changes
              </span>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {moduleFilter 
              ? `Assign iterations for module ${moduleFilter} to lecturers`
              : "Assign module iterations to lecturers and manage workload distribution"
            }
          </p>
        </div>
        <Button 
          onClick={handleSaveAllocations} 
          disabled={isSaving || !hasUnsavedChanges}
          className={`${
            hasUnsavedChanges 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "bg-gray-400 text-gray-600 cursor-not-allowed"
          }`}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : hasUnsavedChanges ? "Save Allocations" : "No Changes"}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules by code or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
                <SelectItem value="3">Summer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unassigned Modules */}
          <Card className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Unassigned Groups ({unassignedGroups.length})
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Drag groups to assign them to lecturers, or click the X button to unassign
              </CardDescription>
              <div className="text-xs text-gray-500 mt-2">
                Processing {iterations.length} module iterations with {groupAssignments.length} total groups
                {fallbackGroupsCreated.length > 0 && (
                  <div className="text-amber-600 mt-1">
                    ⚠️ Created fallback groups for: {fallbackGroupsCreated.join(', ')}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="unassigned">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {unassignedGroups.map((group, index) => (
                      <Draggable key={group.id} draggableId={group.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 border rounded-lg bg-white dark:bg-zinc-800 hover:shadow-md transition-shadow cursor-move"
                          >
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                                    {group.moduleCode} - Group {group.groupNumber}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {getSemesterLabel(group.semester)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{group.title}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {group.teachingHours + group.markingHours}h
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {group.students} students
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {group.siteName} - {group.deliveryTime}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* Lecturer Assignment Columns */}
          <div className="lg:col-span-2 space-y-4">
            {lecturerAllocations.map((lecturer) => (
              <Card key={lecturer._id} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{lecturer.fullName}</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {lecturer.contract} • {lecturer.allocatedTeachingHours || 0}h / {lecturer.maxTeachingHours || 0}h teaching • {lecturer.teachingAvailability || 0}h available
                      </CardDescription>
                    </div>
                    <div className={`text-sm font-medium ${getCapacityColor(lecturer.allocatedTeachingHours || 0, lecturer.maxTeachingHours || 0)}`}>
                      {Math.round(((lecturer.allocatedTeachingHours || 0) / (lecturer.maxTeachingHours || 1)) * 100)}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId={lecturer._id}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-24">
                        {lecturer.assignedGroupIds.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            Drop groups here to assign
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500 mb-2 text-center">
                              Click X to unassign or drag to move
                            </div>
                            {lecturer.assignedGroupIds.map((groupId, index) => {
                              const group = groupAssignments.find((g) => g.id === groupId)
                              if (!group) return null

                              return (
                                <div key={groupId} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                                        {group.moduleCode} - Group {group.groupNumber}
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-300">{group.title}</div>
                                      <div className="text-xs text-gray-500">{group.siteName} - {group.deliveryTime}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="text-right text-xs text-gray-500">
                                        <div>{group.teachingHours + group.markingHours}h</div>
                                        <div>{group.students} students</div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUnassignGroup(groupId, lecturer._id);
                                        }}
                                        title="Unassign group"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* All Modules Table */}
      <Card className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">All Module Iterations</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Complete overview of all module iterations and their group assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-900 dark:text-white">Module</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Semester</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Sites & Groups</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Teaching Hours</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Assigned To</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {iterations.map((iteration) => (
                <TableRow key={iteration._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{iteration.moduleCode}</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-300">{iteration.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getSemesterLabel(iteration.semester)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {iteration.sites.map((site: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span className="text-gray-900 dark:text-white">{site.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {site.groups} groups, {site.students} students
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {iteration.teachingHours + iteration.markingHours}h
                    </div>
                  </TableCell>
                  <TableCell>
                    {iteration.assignedLecturerIds.length > 0 ? (
                      <div className="space-y-1">
                        {iteration.assignedLecturerIds.map((lecturerId: string) => {
                          const lecturer = lecturers.find(l => l._id === lecturerId);
                          return (
                            <div key={lecturerId} className="text-sm text-gray-900 dark:text-white">
                              {lecturer?.fullName || "Unknown"}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground dark:text-gray-300">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(iteration.assignedStatus)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 