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
import Calculator from "@/lib/calculator"
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@auth0/nextjs-auth0";

interface AdminAllocation {
  category: string
  description: string
  hours: number // strictly a number now
  isHeader?: boolean
}

interface AdminAllocationsEditModalProps {
  isOpen: boolean
  onClose: () => void
  allocations: AdminAllocation[]
  staffMemberName: string
  capacity: number // NEW PROP
  lecturerId: Id<"lecturers">
}

export default function AdminAllocationsEditModal({
  isOpen = true,
  onClose = () => {},
  allocations = [],
  staffMemberName = "Dr. Sarah Johnson",
  capacity = 0, // NEW PROP
  lecturerId,
}: AdminAllocationsEditModalProps) {
  // If no allocations, initialize with empty categories (all 0 hours)
  const [formData, setFormData] = useState<AdminAllocation[]>(
    allocations.length > 0 ? allocations.map(a => ({ 
      ...a, 
      hours: typeof a.hours === "number" && !isNaN(a.hours) ? a.hours : 0,
      description: a.description || "" // Ensure description is always a string
    })) : []
  )
  const [errors, setErrors] = useState<{ [key: number]: { post1?: string; post2?: string } }>({})
  const setAdminAllocations = useMutation(api.admin_allocations.setForLecturer);
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();

  const validateForm = () => {
    const newErrors: { [key: number]: { post1?: string; post2?: string } } = {}
    let hasErrors = false;

    formData.forEach((allocation, index) => {
      if (!allocation.isHeader) {
        if (allocation.hours === undefined) {
          newErrors[index] = { ...newErrors[index], post1: "Hours are required" };
          hasErrors = true;
        } else if (isNaN(allocation.hours)) {
          newErrors[index] = { ...newErrors[index], post1: "Hours must be a number" };
          hasErrors = true;
        } else if (allocation.hours < 0) {
          newErrors[index] = { ...newErrors[index], post1: "Hours cannot be negative" };
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);
    if (hasErrors) {
      toast("Please correct the errors in the form.");
      return false;
    }
    // Check for any non-empty error messages
    const hasAnyError = Object.values(newErrors).some(
      (err) => Object.values(err).some((msg) => msg && msg.length > 0)
    );
    return !hasAnyError;
  }

  // Store the initial admin hours sum for delta calculation
  const initialAdminHours = allocations
    .filter((allocation) => !allocation.isHeader)
    .reduce((sum, allocation) => {
      const hours = typeof allocation.hours === "number" && !isNaN(allocation.hours) ? allocation.hours : 0;
      return sum + hours;
    }, 0)

  // Calculate current total admin hours from formData
  const totalAdminHours = formData
    .filter((allocation) => !allocation.isHeader)
    .reduce((sum, allocation) => {
      const hours = typeof allocation.hours === "number" && !isNaN(allocation.hours) ? allocation.hours : 0;
      return sum + hours;
    }, 0)

  // The delta is the change from the initial admin hours
  const adminDelta = totalAdminHours - initialAdminHours;

  // Remaining available hours is the passed-in capacity minus the delta
  const remainingAvailableHours = capacity - adminDelta;
  const isOverAllocated = remainingAvailableHours < 0;

  // --- NEW: Per-allocation delta calculation ---
  const getAllocationDelta = (index: number) => {
    const originalRaw = allocations[index]?.hours;
    const currentRaw = formData[index]?.hours;
    const original = typeof originalRaw === "number" && !isNaN(originalRaw) ? originalRaw : 0;
    const current = typeof currentRaw === "number" && !isNaN(currentRaw) ? currentRaw : 0;
    return current - original;
  };

  const handleSave = async () => {
    if (isOverAllocated) {
      toast("Cannot save: Over-allocated hours.");
      return;
    }
    if (validateForm()) {
      try {
        // No need to convert null hours to 0 anymore
        await setAdminAllocations({ lecturerId, adminAllocations: formData });
        toast("Admin allocations saved.");
        // Log recent activity for editing admin allocations
        await logRecentActivity({
          action: "admin allocation edited",
          changeType: "edit",
          entity: "lecturer",
          entityId: lecturerId,
          fullName: staffMemberName,
          modifiedBy: user ? [{ name: user.name ?? "", email: user.email ?? "" }] : [],
          permission: "default",
          type: "lecturer_edited",
          details: {
            fullName: staffMemberName,
            lecturerId,
            section: "Admin Allocation"
          }
        });
        onClose();
      } catch (err) {
        toast("Failed to save admin allocations.");
      }
    }
  }

  const handleCancel = () => {
    setFormData(allocations.map(a => ({ ...a, hours: typeof a.hours === "number" && !isNaN(a.hours) ? a.hours : 0 }))) // Reset to original data
    setErrors({})
    onClose()
  }

  const updateAllocation = (index: number, field: "hours", value: string) => {
    // Convert empty string to 0, otherwise parse as number
    const newFormData = [...formData]
    newFormData[index] = { ...newFormData[index], [field]: value === "" ? 0 : Number(value) }
    setFormData(newFormData)
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
    >
      <DialogContent 
        className="max-w-5xl max-h-[90vh] overflow-y-hidden bg-gray-50"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
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
                  <p className="text-sm text-gray-500 font-medium">Remaining Available Hours</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className={`text-2xl font-bold ${isOverAllocated ? 'text-red-600' : 'text-gray-900'}`}>{remainingAvailableHours}h</p>
                    {/* Show delta for available hours (inverse of adminDelta) */}
                    {adminDelta !== 0 && (
                      <span className={`text-sm font-semibold ${adminDelta < 0 ? 'text-green-600' : 'text-red-600'}`}> 
                        {adminDelta > 0 ? `-${adminDelta}` : `+${-adminDelta}`}h
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-medium">Current Period Allocated</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{totalAdminHours}h</p>
                    {/* Show delta for period allocated */}
                    {adminDelta !== 0 && (
                      <span className={`text-sm font-semibold ${adminDelta > 0 ? 'text-green-600' : 'text-red-600'}`}> 
                        {adminDelta > 0 ? `+${adminDelta}` : `${adminDelta}`}h
                      </span>
                    )}
                  </div>
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
                              value={allocation.hours === 0 ? "" : allocation.hours.toString()}
                              onChange={(e) => updateAllocation(index, "hours", e.target.value)}
                              className={`w-24 text-center ${isNaN(Number(allocation.hours)) ? "input-error" : "border-gray-300"}`}
                            />
                          </div>

                          {/* Total */}
                          <div className="relative flex items-center justify-center min-h-[32px]">
                            <div className="flex items-center justify-center w-full">
                              <Badge
                                variant="outline"
                                className="bg-gray-100 text-gray-700 border-gray-300 font-semibold z-10"
                              >
                                {(() => {
                                  const hours = typeof allocation.hours === 'number' && !isNaN(allocation.hours) && allocation.hours > 0 ? allocation.hours : 0;
                                  return `${hours}h`;
                                })()}
                              </Badge>
                            </div>
                            {/* Show per-row delta if changed, absolutely positioned to the right of the badge */}
                            {(() => {
                              const delta = getAllocationDelta(index);
                              if (delta === 0) return null;
                              return (
                                <span className={`absolute left-1/2 translate-x-8 text-xs font-semibold ${delta > 0 ? 'text-green-600' : 'text-red-600'}`}
                                  >
                                  {delta > 0 ? `+${delta}` : `${delta}`}h
                                </span>
                              );
                            })()}
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
              <span className="font-bold text-black">{totalAdminHours}h</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleCancel} className="px-6 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800 px-6" disabled={isOverAllocated}>
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
