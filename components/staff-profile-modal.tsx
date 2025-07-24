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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

interface lecturer {
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
}

export default function StaffProfileModal({
  isOpen = true,
  onClose = () => {},
  lecturer,
  adminAllocations,
  moduleAllocations,
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

  const [adminOpen, setAdminOpen] = useState(false)
  const [moduleOpen, setModuleOpen] = useState(false)

  const workloadPercentage = (lecturer.totalAllocated / lecturer.totalContract) * 100
  const teachingPercentage = (lecturer.allocatedTeachingHours / lecturer.maxTeachingHours) * 100
  const availabilityPercentage = (lecturer.capacity / lecturer.totalContract) * 100

  // Calculate total admin hours
  const totalAdminHours = adminAllocations
    .filter((allocation) => !allocation.isHeader)
    .reduce((sum, allocation) => sum + allocation.hours, 0)

  // Calculate total module hours
  const totalModuleHours = moduleAllocations.reduce((sum, module) => sum + module.hoursAllocated, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-gray-50">
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
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-200 rounded-lg">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Staff Details Card */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="bg-white border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <GraduationCap className="h-5 w-5" />
                Staff Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Full Name</p>
                    <p className="font-semibold text-gray-900">{lecturer.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Team</p>
                    <p className="font-semibold text-gray-900">{lecturer.team}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Specialism</p>
                    <p className="font-semibold text-gray-900">{lecturer.specialism}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Contract</p>
                    <Badge className="bg-black text-white font-medium">{lecturer.contract}</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500 font-medium">Email:</span>
                  <span className="font-medium text-gray-900">{lecturer.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workload Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Workload</p>
                    <p className="text-2xl font-bold text-gray-900">{lecturer.totalAllocated}h</p>
                  </div>
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <Progress value={workloadPercentage} className="bg-gray-200 h-2" />
                  <p className="text-xs text-gray-500">{workloadPercentage.toFixed(1)}% of capacity</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Teaching Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{lecturer.allocatedTeachingHours}h</p>
                  </div>
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <Progress value={teachingPercentage} className="bg-gray-200 h-2" />
                  <p className="text-xs text-gray-500">{teachingPercentage.toFixed(1)}% of max teaching</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Admin Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{lecturer.allocatedAdminHours}h</p>
                  </div>
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500">Administrative workload</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Availability</p>
                    <p className="text-2xl font-bold text-gray-900">{lecturer.teachingAvailability}h</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <Progress value={availabilityPercentage} className="bg-gray-200 h-2" />
                  <p className="text-xs text-gray-500">Teaching capacity remaining</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Split View: Admin & Module Allocations */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Administrative Allocations */}
            <Card className="border border-gray-200 shadow-sm bg-white">
              <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg text-gray-900">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Administrative Allocations
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-600">{totalAdminHours}h total</span>
                        {adminOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      {adminAllocations.map((allocation, index) => (
                        <div
                          key={index}
                          className={`${
                            allocation.isHeader
                              ? "bg-gray-100 text-gray-900 font-semibold py-3 px-6 border-b border-gray-200"
                              : "hover:bg-gray-50 border-b border-gray-100 py-4 px-6 transition-colors"
                          }`}
                        >
                          {allocation.isHeader ? (
                            <div className="text-sm uppercase tracking-wide">{allocation.category}</div>
                          ) : (
                            <div className="grid grid-cols-3 gap-4 items-center">
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900">{allocation.category}</div>
                                {allocation.description && (
                                  <div className="text-xs text-gray-500">{allocation.description}</div>
                                )}
                              </div>
                              <div className="text-center">
                                <Badge
                                  variant="outline"
                                  className={`${
                                    allocation.hours > 0
                                      ? "bg-black text-white border-black"
                                      : "bg-gray-100 text-gray-400 border-gray-200"
                                  }`}
                                >
                                  {allocation.hours}h
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Module Allocations */}
            <Card className="border border-gray-200 shadow-sm bg-white">
              <Collapsible open={moduleOpen} onOpenChange={setModuleOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg text-gray-900">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Module Allocations
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-600">{totalModuleHours}h total</span>
                        {moduleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
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
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
