"use client"

import {
  X,
  User,
  Mail,
  Building,
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  BarChart3,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Download,
  Printer,
  MoreVertical,
  Edit,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContentWithoutClose, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState, useEffect } from "react"
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import StaffEditModal from "./staff-edit-modal"
import AdminAllocationsEditModal from "./admin-allocations-edit-modal"
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useConvex } from "convex/react";
import Calculator from "@/lib/calculator";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@auth0/nextjs-auth0";

interface Lecturer {
  _id: Id<'lecturers'> // Convex document id
  fullName: string
  team: string
  specialism: string
  contract: string
  email: string
  capacity: number
  id: string
  maxTeachingHours: number
  moduleAllocations: ModuleAllocation[]
  role: string
  status: string
  teachingAvailability: number
  totalAllocated: number
  totalContract: number
  allocatedTeachingHours: number
  allocatedAdminHours: number
  family: string
  fte: number
}

// Types for allocations
type ModuleAllocation = {
  moduleCode: string;
  moduleName: string;
  hoursAllocated: number;
  type: string;
  semester: string;
};

type AdminAllocation = {
  category: string;
  description: string;
  hours: number;
  isHeader?: boolean;
};

type StaffProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  lecturer: Lecturer | null
  adminAllocations: AdminAllocation[]
  onLecturerUpdate?: (updatedLecturer: Lecturer) => void
}

export default function StaffProfileModal({
  isOpen = true,
  onClose = () => {},
  lecturer,
  adminAllocations,
  onLecturerUpdate,
}: StaffProfileModalProps) {
  // Always call hooks at the top level, before any early returns
  const [adminOpen, setAdminOpen] = useState(false)
  const [moduleOpen, setModuleOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [adminEditModalOpen, setAdminEditModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const updateLecturer = useMutation(api.lecturers.updateLecturer);
  const deleteLecturer = useMutation(api.lecturers.deleteLecturer);
  const convex = useConvex();
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();

  // Fetch the latest lecturer data from Convex
  const liveLecturer = useQuery(api.lecturers.getById, lecturer ? { id: lecturer._id } : "skip");
  const displayLecturer = liveLecturer || lecturer;

  // Fetch module allocations for this lecturer from Convex
  const moduleAllocations = useQuery(api.modules.getByLecturerId, lecturer ? { lecturerId: lecturer._id } : "skip") ?? [];

  // Fetch all admin allocations at the top level (fixes hooks rules violation)
  const allAdminAllocations = useQuery(api.admin_allocations.getAll) ?? [];

  // Early return after all hooks are called
  if (!displayLecturer) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContentWithoutClose>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5 text-primary" />
                <span>Loading staff profile, please wait...</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div>Loading staff profile...</div>
        </DialogContentWithoutClose>
      </Dialog>
    );
  }

  // Default admin allocation categories
  const DEFAULT_ADMIN_ALLOCATIONS = [
    {
      category: "Module Leadership",
      description:
        "40 hours per 20-credit module; 60 hours for two intakes; bespoke arrangements require a note",
      hours: 0,
    },
    {
      category: "AA & ASLT",
      description:
        "Academic Assessor and Apprenticeship Support Link Tutor",
      hours: 0,
    },
    {
      category: "Course Leadership",
      description:
        "1 hour per student plus 20 hours for meetings",
      hours: 0,
    },
    {
      category: "Personal CPD",
      description:
        "Continuing Professional Development courses",
      hours: 0,
    },
    {
      category: "Personal Tutor",
      description: "1 hour of tutorial support per student",
      hours: 0,
    },
    {
      category: "FTP",
      description:
        "20 hours for all Senior Lecturers who have been trained",
      hours: 0,
    },
    {
      category: "Lead Role",
      description:
        "Team leadership responsibilities and oversight duties",
      hours: 0,
    },
    {
      category: "Curriculum Development",
      description:
        "Creation and review of programme curriculum and learning materials",
      hours: 0,
    },
    {
      category: "Recruitment Interviews",
      description:
        "Conducting interviews with prospective students",
      hours: 0,
    },
    {
      category: "Recruitment Activities",
      description:
        "Open days, Recognition of Prior Learning (RPL) sessions, School Visits",
      hours: 0,
    },
    {
      category: "HEA Assessor",
      description:
        "Assessing applications for Higher Education Academy fellowship",
      hours: 0,
    },
    {
      category: "Projects",
      description:
        "Project work - add a note for each specific project",
      hours: 0,
    },
    {
      category: "Research, Scholarship and Professional Practice",
      description:
        "AP = 75 hours & TA = 150 hours for research and scholarly activity",
      hours: 0,
    },
  ];

  function formatFTEWithFamily(totalContract: number, family: string) {
    if (!totalContract || !family) return '';
    const fte = totalContract / 1489;
    const rounded = Math.round(fte * 100) / 100;
    // Remove trailing .00 if integer, else show up to 2 decimals
    const fteStr = Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(/\.00$/, '');
    return `${fteStr}${family}`;
  }

  // Helper to get the current admin allocations for the lecturer
  const getCurrentAdminAllocations = () => {
    const found = allAdminAllocations.find(
      (a: any) => a.lecturerId === displayLecturer._id
    );
    return found && found.adminAllocations && found.adminAllocations.length > 0
      ? found.adminAllocations
      : DEFAULT_ADMIN_ALLOCATIONS;
  };

  // Helper to get family initials
  function getFamilyInitials(family: string) {
    const map: Record<string, string> = {
      'Academic Practitioner': 'AP',
      'Teaching Academic': 'TA',
      'Research Academic': 'RA',
    };
    return map[family] || family;
  }

  async function handleSaveLecturer(updatedStaffMember: Partial<Lecturer>) {
    if (!lecturer || !lecturer._id) return;
    
    try {
      await updateLecturer({
        id: lecturer._id,
        fullName: updatedStaffMember.fullName ?? lecturer.fullName,
        team: updatedStaffMember.team ?? lecturer.team,
        specialism: updatedStaffMember.specialism ?? lecturer.specialism,
        contract: updatedStaffMember.contract ?? lecturer.contract,
        email: updatedStaffMember.email ?? lecturer.email,
        capacity: lecturer.capacity,
        maxTeachingHours: updatedStaffMember.maxTeachingHours ?? lecturer.maxTeachingHours,
        role: updatedStaffMember.role ?? lecturer.role,
        status: lecturer.status,
        teachingAvailability: lecturer.teachingAvailability,
        totalAllocated: lecturer.totalAllocated,
        totalContract: updatedStaffMember.totalContract ?? lecturer.totalContract,
        allocatedTeachingHours: lecturer.allocatedTeachingHours,
        allocatedAdminHours: lecturer.allocatedAdminHours,
        family: updatedStaffMember.family ?? lecturer.family,
        fte: updatedStaffMember.fte ?? lecturer.fte,
      });

      if (onLecturerUpdate) {
        // Fetch the updated lecturer from Convex
        const freshLecturer = await convex.query(api.lecturers.getById, { id: lecturer._id });
        if (freshLecturer) {
          onLecturerUpdate(freshLecturer);
        }
      }
      
      setEditModalOpen(false);
      
      // Log recent activity for editing personal details
      await logRecentActivity({
        action: "user details edited",
        changeType: "edit",
        entity: "lecturer",
        entityId: lecturer._id,
        fullName: updatedStaffMember.fullName ?? lecturer.fullName,
        modifiedBy: user ? [{ name: user.name ?? "", email: user.email ?? "" }] : [],
        permission: "default",
        type: "lecturer_edited",
        details: {
          fullName: updatedStaffMember.fullName ?? lecturer.fullName,
          lecturerId: lecturer._id,
          section: "User Details"
        }
      });

      toast.success("Staff profile updated successfully.");
    } catch (error) {
      console.error("Error updating lecturer:", error);
      toast.error("Failed to update staff profile. Please try again.");
    }
  }
  const workloadPercentage = displayLecturer.totalContract > 0 
    ? (displayLecturer.totalAllocated / displayLecturer.totalContract) * 100 
    : 0;
  const adminBreakdownPercent = Calculator.totalAllocated(displayLecturer.allocatedTeachingHours, displayLecturer.allocatedAdminHours) > 0
    ? (displayLecturer.allocatedAdminHours / Calculator.totalAllocated(displayLecturer.allocatedTeachingHours, displayLecturer.allocatedAdminHours)) * 100
    : 0;
  const teachingBreakdownPercent = Calculator.totalAllocated(displayLecturer.allocatedTeachingHours, displayLecturer.allocatedAdminHours) > 0
    ? (displayLecturer.allocatedTeachingHours / Calculator.totalAllocated(displayLecturer.allocatedTeachingHours, displayLecturer.allocatedAdminHours)) * 100
    : 0;
  const teachingPercentage = displayLecturer.maxTeachingHours > 0 
    ? (displayLecturer.allocatedTeachingHours / displayLecturer.maxTeachingHours) * 100 
    : 0;
  const adminPercentage = displayLecturer.totalContract > 0 
    ? (displayLecturer.allocatedAdminHours / displayLecturer.totalContract) * 100 
    : 0;
  const availabilityPercentage = displayLecturer.totalContract > 0 
    ? (displayLecturer.totalAllocated / displayLecturer.totalContract) * 100 
    : 0;

  // Calculate total admin hours
  const totalAdminHours = adminAllocations
    .filter((allocation) => !allocation.isHeader)
    .reduce((sum, allocation) => sum + allocation.hours, 0)

  // Calculate total module hours
  const totalModuleHours = moduleAllocations.reduce((sum, module) => sum + module.hoursAllocated, 0)

  async function handleDeleteLecturer() {
    if (!lecturer || !lecturer._id) return;
    
    try {
      await deleteLecturer({ id: lecturer._id });
      await logRecentActivity({
        action: "lecturer deleted",
        changeType: "delete",
        entity: "lecturer",
        entityId: lecturer._id,
        fullName: lecturer.fullName,
        modifiedBy: user ? [{ name: user.name ?? "", email: user.email ?? "" }] : [],
        permission: "default",
        type: "lecturer_deleted"
      });
      toast("Staff profile deleted.");
      setDeleteConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error("Error deleting lecturer:", error);
      toast.error("Failed to delete staff profile. Please try again.");
      setDeleteConfirmOpen(false);
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContentWithoutClose className="max-w-[1400px] max-h-[95vh] overflow-y-auto bg-gray-50">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Academic Staff Profile</DialogTitle>
                <p className="text-sm text-gray-600">Comprehensive workload overview and allocations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Action menu popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="hover:bg-gray-100 rounded-lg" aria-label="More actions">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-2">
                  {/* Commented out buttons now as menu items */}
                  <div className="flex flex-col gap-1">
                    {/* Delete */}
                    <Button variant="ghost" className="justify-start w-full" onClick={() => setDeleteConfirmOpen(true)}>
                      <Trash2 className="h-4 w-4 mr-2 text-red-600" /> Delete profile
                    </Button>
                    {/* Download */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="justify-start w-full" disabled>
                            <Download className="h-4 w-4 mr-2 text-gray-400" /> Download profile
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download feature coming soon</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {/* Print */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="justify-start w-full" disabled>
                            <Printer className="h-4 w-4 mr-2 text-gray-400" /> Print profile
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Print feature coming soon</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {/* Message */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="justify-start w-full" disabled>
                            <Mail className="h-4 w-4 mr-2 text-gray-400" /> Message staff
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Messaging feature coming soon</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-200 rounded-lg" aria-label="Close profile modal">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex gap-8">
            {/* Sidebar: Staff Details */}
            <div className="w-full max-w-xs flex-shrink-0">
              <Card className="border border-gray-200 shadow-sm bg-white h-full">
                <CardHeader className="bg-white border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                    <GraduationCap className="h-5 w-5" />
                    Staff Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditModalOpen(true)}
                    className="hover:bg-gray-50 mt-2"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Full Name</p>
                    <p className="font-semibold text-gray-900">{displayLecturer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Team</p>
                    <p className="font-semibold text-gray-900">{displayLecturer.team}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Specialism</p>
                    <p className="font-semibold text-gray-900">{displayLecturer.specialism}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Contract</p>
                    <Badge className="bg-black text-white font-medium">
                      {displayLecturer.contract} | {displayLecturer.totalContract}h
                    </Badge>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>
                        <span className="font-semibold">FTE:</span> {displayLecturer.fte}

                      </div>
                      <div>
                        <span className="font-semibold">Family:</span> {getFamilyInitials(displayLecturer.family)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Role</p>
                    <p className="font-semibold text-gray-900">{displayLecturer.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Email</p>
                    <p className="font-medium text-gray-900">{displayLecturer.email}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content: Workload Cards and Allocations */}
            <div className="flex-1 flex flex-col gap-8">
              {/* Workload Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="relative mb-4 flex-1">
                      <div className="flex flex-col">
                        <p className="text-gray-600 text-sm font-medium">Total Workload</p>
                        <p className="text-2xl font-bold text-gray-900">{displayLecturer.totalAllocated}h</p>
                      </div>
                      <Clock className="h-5 w-5 text-gray-400 absolute top-0 right-0" />
                    </div>
                    <div className="flex flex-col items-stretch space-y-1 mt-auto">
                      <Progress value={workloadPercentage} className="bg-gray-200 h-2" />
                      <p className="text-xs text-gray-500">{workloadPercentage.toFixed(1)}% of contract</p>
                    </div>
                  </CardContent>
                </Card>


                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="relative mb-4 flex-1">
                      <div className="flex flex-col">
                        <p className="text-gray-600 text-sm font-medium">Teaching Hours</p>
                        <p className="text-2xl font-bold text-gray-900">{displayLecturer.allocatedTeachingHours}h</p>
                        <span className="mt-2 text-xs text-primary font-semibold bg-primary/10 rounded px-2 py-0.5">{teachingBreakdownPercent.toFixed(1)}% of workload</span>
                      </div>
                      <BookOpen className="h-5 w-5 text-gray-400 absolute top-0 right-0" />
                    </div>
                    <div className="flex flex-col items-stretch space-y-1 mt-auto">
                      <Progress value={teachingPercentage} className="bg-gray-200 h-2" />
                      <p className="text-xs text-gray-500">{teachingPercentage.toFixed(1)}% of max teaching</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="relative mb-4 flex-1">
                      <div className="flex flex-col">
                        <p className="text-gray-600 text-sm font-medium">Admin Hours</p>
                        <p className="text-2xl font-bold text-gray-900">{displayLecturer.allocatedAdminHours}h</p>
                        <span className="mt-2 text-xs text-primary font-semibold bg-primary/10 rounded px-2 py-0.5">{adminBreakdownPercent.toFixed(1)}% of workload</span>
                      </div>
                      <Users className="h-5 w-5 text-gray-400 absolute top-0 right-0" />
                    </div>
                    <div className="flex flex-col items-stretch space-y-1 mt-auto">
                      <Progress value={adminPercentage} className="bg-gray-200 h-2" />
                      <p className="text-xs text-gray-500">{adminPercentage.toFixed(1)}% of contract</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="relative mb-4 flex-1">
                      <div className="flex flex-col">
                        <p className="text-gray-600 text-sm font-medium">Availability</p>
                        <p className="text-2xl font-bold text-gray-900">{displayLecturer.capacity}h</p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-gray-400 absolute top-0 right-0" />
                    </div>
                    <div className="flex flex-col items-stretch space-y-1 mt-auto">
                      <Progress value={availabilityPercentage} className="bg-gray-200 h-2" />
                      <p className="text-xs text-gray-500">{availabilityPercentage.toFixed(1)}% of contract</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Allocations Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Administrative Allocations Table */}
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader className="bg-white border-b border-gray-200 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                      <BarChart3 className="h-5 w-5" />
                      Administrative Allocations
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-semibold">Total:</span>
                      <Badge className="bg-gray-900 text-white font-semibold">{totalAdminHours}h</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAdminEditModalOpen(true)}
                        className="hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      {getCurrentAdminAllocations().map((allocation: AdminAllocation, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b border-gray-100 py-3 px-6 hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{allocation.category}</div>
                            {allocation.description && (
                              <div className="text-xs text-gray-500">{allocation.description}</div>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-700 border-gray-300 font-semibold"
                          >
                            {Number(allocation.hours) > 0 ? allocation.hours : 0}h
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {/* Module Allocations Table */}
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader className="bg-white border-b border-gray-200 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                      <BookOpen className="h-5 w-5" />
                      Module Allocations
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-semibold">Total:</span>
                      <Badge className="bg-gray-900 text-white font-semibold">{displayLecturer.allocatedTeachingHours}h</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModuleOpen(true)}
                        className="hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      {moduleAllocations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          No modules allocated.
                        </div>
                      ) : (
                        moduleAllocations.map((module, index) => (
                          <div key={index} className="hover:bg-gray-50 border-b border-gray-100 p-6 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                  {module?.moduleId ? String(module.moduleId).slice(-2) : '--'}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{module?.title ?? 'No Title'}</div>
                                  <div className="text-xs text-gray-500">Module: {module?.moduleId ?? 'No ID'}</div>
                                  <div className="text-xs text-gray-500">Cohort: {module?.cohort ?? 'N/A'}</div>
                                  <div className="text-xs text-gray-500">Site: {module?.site ?? 'N/A'}</div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 min-w-[120px]">
                                <div className="text-xs text-gray-500">Semester: {module?.semester ?? 'N/A'}</div>
                                <div className="text-xs text-gray-500">Teaching: <span className="font-semibold text-gray-900">{module?.teachingHours ?? 0}h</span></div>
                                <div className="text-xs text-gray-500">Marking: <span className="font-semibold text-gray-900">{module?.markingHours ?? 0}h</span></div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContentWithoutClose>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContentWithoutClose className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this staff profile? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => {
              handleDeleteLecturer();
            }}>
              Delete
            </Button>
          </div>
        </DialogContentWithoutClose>
      </Dialog>
      {/* Edit Modal */}
      <StaffEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveLecturer}
        staffMember={{
          fullName: displayLecturer.fullName,
          team: displayLecturer.team,
          specialism: displayLecturer.specialism,
          contract: displayLecturer.contract,
          email: displayLecturer.email,
          role: displayLecturer.role,
          fte: displayLecturer.fte,
          totalContract: displayLecturer.totalContract,
          family: displayLecturer.family,
        }}
      />
      <AdminAllocationsEditModal
        isOpen={adminEditModalOpen}
        onClose={() => setAdminEditModalOpen(false)}
        allocations={getCurrentAdminAllocations()}
        staffMemberName={displayLecturer.fullName}
        capacity={displayLecturer.capacity}
        lecturerId={displayLecturer._id}
      />
    </>
  )
}
