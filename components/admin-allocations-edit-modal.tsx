"use client"

import { X, BarChart3, Save, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { toast } from "sonner"

interface AdminAllocation {
  category: string
  description: string
  hours: string | number
  isHeader?: boolean
}

interface AdminAllocationsEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (allocations: AdminAllocation[]) => void
  allocations: AdminAllocation[]
  staffMemberName: string
  capacity: number // NEW PROP
}

const defaultAllocations: AdminAllocation[] = [
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
    hours: 150,
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
    hours: 70,
  },
  {
    category: "Recruitment Interviews",
    description:
      "Conducting interviews with prospective students",
    hours: 76,
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
      "Project work – add a note for each specific project",
    hours: 0,
  },
  {
    category:
      "Research, Scholarship and Professional Practice",
    description:
      "AP = 75 hours & TA = 150 hours for research and scholarly activity",
    hours: 75,
  },
];

export default function AdminAllocationsEditModal({
  isOpen = true,
  onClose = () => {},
  onSave = () => {},
  allocations = defaultAllocations,
  staffMemberName = "Dr. Sarah Johnson",
  capacity = 0, // NEW PROP
}: AdminAllocationsEditModalProps) {
  const [formData, setFormData] = useState<AdminAllocation[]>(allocations)
  const [errors, setErrors] = useState<{ [key: number]: { post1?: string; post2?: string } }>({})

  const validateForm = () => {
    let hasEmpty = false;
    const newErrors: { [key: number]: { post1?: string; post2?: string } } = {}

    formData.forEach((allocation, index) => {
      if (!allocation.isHeader) {
        if (allocation.hours === "" || allocation.hours === undefined || allocation.hours === null) {
          newErrors[index] = { ...newErrors[index], post1: "" }
          hasEmpty = true;
        } else if (Number(allocation.hours) < 0) {
          newErrors[index] = { ...newErrors[index], post1: "Hours cannot be negative" }
        }
      }
    })

    setErrors(newErrors)
    if (hasEmpty) {
      toast("All hours fields are required.");
      return false;
    }
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  const handleCancel = () => {
    setFormData(allocations) // Reset to original data
    setErrors({})
    onClose()
  }

  const updateAllocation = (index: number, field: "hours", value: string) => {
    // Allow empty string for input, treat as 0 in calculations
    const newFormData = [...formData]
    newFormData[index] = { ...newFormData[index], [field]: value === "" ? "" : Number(value) }
    setFormData(newFormData)
  }

  // Calculate totals
  const totalPost1Hours = formData
    .filter((allocation) => !allocation.isHeader)
    .reduce((sum, allocation) => sum + (typeof allocation.hours === "number" ? allocation.hours : 0), 0)

  const totalPost2Hours = formData
    .filter((allocation) => !allocation.isHeader)
    .reduce((sum, allocation) => sum + (typeof allocation.hours === "number" ? allocation.hours : 0), 0)

  const totalHours = totalPost1Hours

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-hidden bg-gray-50">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Edit Administrative Allocations</DialogTitle>
              <p className="text-sm text-gray-600">Update workload allocations for {staffMemberName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCancel} className="hover:bg-gray-200 rounded-lg">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="bg-white border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <Info className="h-5 w-5" />
                Allocation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-medium">Overall Available Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{capacity}h</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-medium">Current Period Allocated</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPost1Hours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allocations Edit Form */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="bg-white border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <BarChart3 className="h-5 w-5" />
                Administrative Allocations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
              <div className="max-h-96 overflow-y-auto">
                {/* Table Header */}
                <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-1">
                      <Label className="text-sm font-semibold text-gray-700">Category & Description</Label>
                    </div>
                    <div className="text-center">
                      <Label className="text-sm font-semibold text-gray-700">Hours</Label>
                    </div>
                    <div className="text-center">
                      <Label className="text-sm font-semibold text-gray-700">Total</Label>
                    </div>
                  </div>
                </div>

                {/* Allocation Rows */}
                {formData.map((allocation, index) => (
                  <div key={index}>
                    {allocation.isHeader ? (
                      <div className="bg-gray-100 text-gray-900 font-semibold py-4 px-6 border-b border-gray-200">
                        <div className="text-sm uppercase tracking-wide">{allocation.category}</div>
                      </div>
                    ) : (
                      <div className="hover:bg-gray-50 border-b border-gray-100 py-4 px-6 transition-colors">
                        <div className="grid grid-cols-3 gap-4 items-center">
                          {/* Category & Description */}
                          <div className="col-span-1 space-y-1">
                            <div className="font-medium text-gray-900">{allocation.category}</div>
                            {allocation.description && (
                              <div className="text-xs text-gray-500">{allocation.description}</div>
                            )}
                          </div>

                          {/* Hours Input */}
                          <div className="flex justify-center items-center">
                            <Input
                              type="number"
                              min="0"
                              value={allocation.hours === "" ? "" : allocation.hours}
                              onChange={(e) => updateAllocation(index, "hours", e.target.value)}
                              className={`w-24 text-center ${allocation.hours === "" ? "input-error" : "border-gray-300"}`}
                            />
                          </div>

                          {/* Total */}
                          <div className="flex justify-center items-center">
                            <Badge
                              variant="outline"
                              className="bg-gray-100 text-gray-700 border-gray-300 font-semibold"
                            >
                              {Number(allocation.hours) > 0 ? allocation.hours : 0}h
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Administrative Hours: </span>
              <span className="font-bold text-black">{totalHours}h</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleCancel} className="px-6 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800 px-6">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
