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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import StaffEditModal from "./staff-edit-modal"
import AdminAllocationsEditModal from "./admin-allocations-edit-modal"
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useConvex } from "convex/react";
import Calculator from "@/lib/calculator";

interface lecturer {
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
}

interface AdminAllocation {
  category: string
  description: string
  hours: number
  isHeader?: boolean
}

interface ModuleAllocation {
  moduleCode: string
  moduleName: string
  hoursAllocated: number
  type: string
  semester: string
}

interface StaffProfileModalProps {
  isOpen: boolean
  onClose: () => void
  lecturer: lecturer
  adminAllocations: AdminAllocation[]
  moduleAllocations: ModuleAllocation[]
  onLecturerUpdate?: (updatedLecturer: lecturer) => void
}

export default function StaffProfileModal({
  isOpen = true,
  onClose = () => {},
  lecturer,
  adminAllocations,
  moduleAllocations,
  onLecturerUpdate,
}: StaffProfileModalProps) {
  // Null check for lecturer
  if (!lecturer) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div>Lecturer data is missing.</div>
        </DialogContent>
      </Dialog>
    )
  }

  // Fetch the latest lecturer data from Convex
  const liveLecturer = useQuery(api.lecturers.getById, { id: lecturer._id });
  const displayLecturer = liveLecturer || lecturer;

  if (!displayLecturer) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div>Loading staff profile...</div>
        </DialogContent>
      </Dialog>
    );
  }

  const [adminOpen, setAdminOpen] = useState(false)
  const [moduleOpen, setModuleOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [adminEditModalOpen, setAdminEditModalOpen] = useState(false)
  const updateLecturer = useMutation(api.lecturers.updateLecturer);
  const convex = useConvex();
  const lecturers = useQuery(api.lecturers.getAll) ?? [];

  // Helper to get the current admin allocations for the lecturer
  const getCurrentAdminAllocations = () => {
    const found = (useQuery(api.admin_allocations.getAll) ?? []).find(
      (a: any) => a.lecturerId === displayLecturer._id
    );
    return found && found.adminAllocations && found.adminAllocations.length > 0
      ? found.adminAllocations
      : DEFAULT_ADMIN_ALLOCATIONS;
  };

  function handleSaveLecturer(updatedStaffMember: Partial<lecturer>) {
    if (!lecturer || !lecturer._id) return;
    updateLecturer({
      id: lecturer._id,
      fullName: updatedStaffMember.fullName ?? lecturer.fullName,
      team: updatedStaffMember.team ?? lecturer.team,
      specialism: updatedStaffMember.specialism ?? lecturer.specialism,
      contract: updatedStaffMember.contract ?? lecturer.contract,
      email: updatedStaffMember.email ?? lecturer.email,
      capacity: lecturer.capacity,
      maxTeachingHours: lecturer.maxTeachingHours,
      role: updatedStaffMember.role ?? lecturer.role,
      status: lecturer.status,
      teachingAvailability: lecturer.teachingAvailability,
      totalAllocated: lecturer.totalAllocated,
      totalContract: lecturer.totalContract,
      allocatedTeachingHours: lecturer.allocatedTeachingHours,
      allocatedAdminHours: lecturer.allocatedAdminHours,
    }).then(async () => {
      if (onLecturerUpdate) {
        // Fetch the updated lecturer from Convex
        const freshLecturer = await convex.query(api.lecturers.getById, { id: lecturer._id });
        if (freshLecturer) {
          onLecturerUpdate(freshLecturer);
        }
      }
      setEditModalOpen(false);
    });
  }
  const workloadPercentage = (displayLecturer.totalAllocated / displayLecturer.totalContract) * 100;
  const adminBreakdownPercent = Calculator.totalAllocated(displayLecturer.allocatedTeachingHours, displayLecturer.allocatedAdminHours) > 0
    ? (displayLecturer.allocatedAdminHours / Calculator.totalAllocated(displayLecturer.allocatedTeachingHours, displayLecturer.allocatedAdminHours)) * 100
    : 0;
  const teachingBreakdownPercent = Calculator.totalAllocated(displayLecturer.allocatedTeachingHours, displayLecturer.allocatedAdminHours) > 0
    ? (displayLecturer.allocatedTeachingHours / Calculator.totalAllocated(displayLecturer.allocatedTeachingHours, displayLecturer.allocatedAdminHours)) * 100
    : 0;
  const teachingPercentage = (displayLecturer.allocatedTeachingHours / displayLecturer.maxTeachingHours) * 100;
  const adminPercentage = (displayLecturer.allocatedAdminHours / displayLecturer.totalContract) * 100;
  const availabilityPercentage = (displayLecturer.totalAllocated / displayLecturer.totalContract) * 100;

  // Calculate total admin hours
  const totalAdminHours = adminAllocations
    .filter((allocation) => !allocation.isHeader)
    .reduce((sum, allocation) => sum + allocation.hours, 0)

  // Calculate total module hours
  const totalModuleHours = moduleAllocations.reduce((sum, module) => sum + module.hoursAllocated, 0)

  // Default admin allocation categories
  const DEFAULT_ADMIN_ALLOCATIONS = [
    { category: "Module Leadership", description: "", hours: 0 },
    { category: "AA & ASLT", description: "", hours: 0 },
    { category: "Course Leadership", description: "", hours: 0 },
    { category: "Personal CPD", description: "", hours: 0 },
    { category: "Personal Tutor", description: "", hours: 0 },
    { category: "FTP", description: "", hours: 0 },
    { category: "Lead Role", description: "", hours: 0 },
    { category: "Curriculum Development", description: "", hours: 0 },
    { category: "Recruitment Interviews", description: "", hours: 0 },
    { category: "Recruitment Activities", description: "", hours: 0 },
    { category: "HEA Assessor", description: "", hours: 0 },
    { category: "Projects", description: "", hours: 0 },
    { category: "Research, Scholarship and Professional Practice", description: "", hours: 0 },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[1400px] max-h-[95vh] overflow-y-auto bg-gray-50">
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => { /* TODO: Implement delete handler */ }} className="hover:bg-red-100 rounded-lg" aria-label="Delete profile">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => { /* TODO: Implement download handler */ }} className="hover:bg-gray-100 rounded-lg" aria-label="Download profile">
                      <Download className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => { /* TODO: Implement print handler */ }} className="hover:bg-gray-100 rounded-lg" aria-label="Print profile">
                      <Printer className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Print</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => { /* TODO: Implement message handler */ }} className="hover:bg-gray-100 rounded-lg" aria-label="Message staff">
                      <Mail className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Message</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => { /* TODO: Implement more handler */ }} className="hover:bg-gray-100 rounded-lg" aria-label="More actions">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>More</TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                    <Badge className="bg-black text-white font-medium">{displayLecturer.contract}</Badge>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdminEditModalOpen(true)}
                      className="hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
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
                  <CardHeader className="bg-white border-b border-gray-200">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                      <BookOpen className="h-5 w-5" />
                      Module Allocations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      {moduleAllocations.map((module, index) => (
                        <div key={index} className="hover:bg-gray-50 border-b border-gray-100 p-6 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {module.moduleCode.slice(-2)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{module.moduleCode}</div>
                                <div className="text-sm text-gray-500">{module.semester}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">{module.hoursAllocated}h</div>
                              <Badge
                                className={`${
                                  module.type === "Core" ? "bg-black text-white" : "bg-gray-600 text-white"
                                }`}
                              >
                                {module.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-700">{module.moduleName}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
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
        }}
      />
      <AdminAllocationsEditModal
        isOpen={adminEditModalOpen}
        onClose={() => setAdminEditModalOpen(false)}
        allocations={(() => {
          // Find the admin allocations for this lecturer
          const found = (useQuery(api.admin_allocations.getAll) ?? []).find(
            (a: any) => a.lecturerId === displayLecturer._id
          );
          return found && found.adminAllocations && found.adminAllocations.length > 0
            ? found.adminAllocations
            : DEFAULT_ADMIN_ALLOCATIONS;
        })()}
        staffMemberName={displayLecturer.fullName}
        capacity={displayLecturer.capacity}
        lecturerId={displayLecturer._id}
      />
    </>
  )
}
