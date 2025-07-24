"use client"

import { X, BarChart3, Save, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface AdminAllocation {
  category: string
  description: string
  hours: number
  isHeader?: boolean
}

interface AdminAllocationsEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (allocations: AdminAllocation[]) => void
  allocations: AdminAllocation[]
  staffMemberName: string
}

const sampleAllocations: AdminAllocation[] = [
  { category: "SUPERVISION", description: "", hours: 0, isHeader: true },
  { category: "MSc Supervision", description: "5 hrs 1st supervisor", hours: 25 },
  {
    category: "Doctoral Supervision",
    description: "25hrs 1st supervisor/15hrs 2nd supervisor",
    hours: 50,
  },
  { category: "ACADEMIC ADMIN", description: "", hours: 0, isHeader: true },
  {
    category: "Module leadership",
    description: "40 per 20 credit mod, 60 for two intakes",
    hours: 120,
  },
  { category: "AA & ASLT", description: "Assessment & Academic Standards", hours: 150 },
  {
    category: "Course leadership",
    description: "1 hour / student + 20 hours for meetings",
    hours: 45,
  },
  { category: "Personal CPD", description: "Continuing Professional Development", hours: 20 },
  { category: "Personal tutor", description: "1 hour per student", hours: 15 },
  { category: "FTP", description: "20hrs for all SL who have been trained", hours: 0 },
  { category: "Lead role", description: "Leadership responsibilities", hours: 40 },
  { category: "Curriculum development", description: "Course design and updates", hours: 70 },
  {
    category: "Recruitment interviews",
    description: "Student recruitment activities",
    hours: 76,
  },
  {
    category: "Recruitment activities",
    description: "Open days, RPL, school visits",
    hours: 25,
  },
  { category: "HEA Assessor", description: "Higher Education Academy", hours: 0 },
  { category: "Projects", description: "Special projects and initiatives", hours: 50 },
  {
    category: "Research & Consultancy",
    description: "AP = 75 hrs & TA = 150 hrs",
    hours: 75,
  },
]

export default function AdminAllocationsEditModal({
  isOpen = true,
  onClose = () => {},
  onSave = () => {},
  allocations = sampleAllocations,
  staffMemberName = "Dr. Sarah Johnson",
}: AdminAllocationsEditModalProps) {
  const [formData, setFormData] = useState<AdminAllocation[]>(allocations)
  const [errors, setErrors] = useState<{ [key: number]: { post1?: string; post2?: string } }>({})

  const validateForm = () => {
    const newErrors: { [key: number]: { post1?: string; post2?: string } } = {}

    formData.forEach((allocation, index) => {
      if (!allocation.isHeader) {
        // Validate that hours are non-negative numbers
        if (allocation.hours < 0) {
          newErrors[index] = { ...newErrors[index], post1: "Hours cannot be negative" }
        }
      }
    })

    setErrors(newErrors)
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
    const numValue = value === "" ? 0 : Number.parseInt(value) || 0
    const newFormData = [...formData]
    newFormData[index] = { ...newFormData[index], [field]: numValue }
    setFormData(newFormData)
  }

  // Calculate totals
  const totalPost1Hours = formData
    .filter((allocation) => !allocation.isHeader)
    .reduce((sum, allocation) => sum + allocation.hours, 0)

  const totalPost2Hours = formData
    .filter((allocation) => !allocation.isHeader)
    .reduce((sum, allocation) => sum + allocation.hours, 0)

  const totalHours = totalPost1Hours + totalPost2Hours

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-50">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
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

        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="bg-white border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <Info className="h-5 w-5" />
                Allocation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-medium">Current Period</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPost1Hours}h</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-medium">Next Period</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPost2Hours}h</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-medium">Total Hours</p>
                  <p className="text-2xl font-bold text-black">{totalHours}h</p>
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
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {/* Table Header */}
                <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="col-span-2">
                      <Label className="text-sm font-semibold text-gray-700">Category & Description</Label>
                    </div>
                    <div className="text-center">
                      <Label className="text-sm font-semibold text-gray-700">Current Period</Label>
                    </div>
                    <div className="text-center">
                      <Label className="text-sm font-semibold text-gray-700">Next Period</Label>
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
                        <div className="grid grid-cols-5 gap-4 items-center">
                          {/* Category & Description */}
                          <div className="col-span-2 space-y-1">
                            <div className="font-medium text-gray-900">{allocation.category}</div>
                            {allocation.description && (
                              <div className="text-xs text-gray-500">{allocation.description}</div>
                            )}
                          </div>

                          {/* Current Period Input */}
                          <div className="text-center">
                            <div className="space-y-1">
                              <Input
                                type="number"
                                min="0"
                                value={allocation.hours}
                                onChange={(e) => updateAllocation(index, "hours", e.target.value)}
                                className={`w-20 text-center ${
                                  errors[index]?.post1 ? "border-red-500" : "border-gray-300"
                                }`}
                              />
                              {errors[index]?.post1 && <p className="text-xs text-red-500">{errors[index].post1}</p>}
                            </div>
                          </div>

                          {/* Next Period Input */}
                          <div className="text-center">
                            <div className="space-y-1">
                              <Input
                                type="number"
                                min="0"
                                value={allocation.hours}
                                onChange={(e) => updateAllocation(index, "hours", e.target.value)}
                                className={`w-20 text-center ${
                                  errors[index]?.post2 ? "border-red-500" : "border-gray-300"
                                }`}
                              />
                              {errors[index]?.post2 && <p className="text-xs text-red-500">{errors[index].post2}</p>}
                            </div>
                          </div>

                          {/* Total */}
                          <div className="text-center">
                            <Badge
                              variant="outline"
                              className="bg-gray-100 text-gray-700 border-gray-300 font-semibold"
                            >
                              {allocation.hours}h
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
