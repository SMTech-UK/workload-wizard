"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "convex/react";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";

// Allocation form schema
const allocationFormSchema = z.object({
  lecturerId: z.string().min(1, "Lecturer is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  allocationTypeId: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  hours: z.number().min(0, "Hours must be 0 or greater"),
  hoursPerWeek: z.number().min(0, "Hours per week must be 0 or greater").optional(),
  weeksPerYear: z.number().min(0, "Weeks per year must be 0 or greater").optional(),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  isRecurring: z.boolean(),
  recurrencePattern: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  isActive: z.boolean(),
  isApproved: z.boolean(),
  approvedBy: z.string().optional(),
  approvedAt: z.number().optional(),
  priority: z.string().min(1, "Priority is required"),
  isEssential: z.boolean(),
  notes: z.string().optional(),
});

type AllocationFormData = z.infer<typeof allocationFormSchema>;

interface AllocationFormProps {
  allocationId?: Id<"admin_allocations">;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

const ALLOCATION_CATEGORIES = [
  { value: "teaching", label: "Teaching" },
  { value: "research", label: "Research" },
  { value: "administration", label: "Administration" },
  { value: "supervision", label: "Supervision" },
  { value: "committee", label: "Committee" },
  { value: "project", label: "Project" },
  { value: "other", label: "Other" },
];

const ALLOCATION_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const ALLOCATION_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const RECURRENCE_PATTERNS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semester", label: "Per Semester" },
  { value: "yearly", label: "Yearly" },
];

export function AllocationForm({ 
  allocationId, 
  onSuccess, 
  onCancel, 
  mode = "create" 
}: AllocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Queries
  const lecturers = useQuery('lecturers:getAll' as any, {}) ?? [];
  const allocationTypes = useQuery('allocation_types:getAll' as any, {}) ?? [];
  const selectedAllocation = useQuery(
    'admin_allocations:getById' as any,
    allocationId ? { id: allocationId } : "skip"
  );
  
  // Hooks
  const { academicYears, activeAcademicYear } = useAcademicYear();
  const logActivity = useLogRecentActivity();
  
  // Mutations
  const createAllocation = useMutation('admin_allocations:create' as any);
  const updateAllocation = useMutation('admin_allocations:update' as any);

  const form = useForm<AllocationFormData>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      lecturerId: "",
      academicYearId: activeAcademicYear?._id || "",
      allocationTypeId: "",
      category: "",
      title: "",
      description: "",
      hours: 0,
      hoursPerWeek: undefined,
      weeksPerYear: undefined,
      startDate: undefined,
      endDate: undefined,
      isRecurring: false,
      recurrencePattern: "",
      status: "draft",
      isActive: true,
      isApproved: false,
      approvedBy: "",
      approvedAt: undefined,
      priority: "medium",
      isEssential: false,
      notes: "",
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (selectedAllocation && mode === "edit") {
      form.reset({
        lecturerId: selectedAllocation.lecturerId,
        academicYearId: selectedAllocation.academicYearId,
        allocationTypeId: selectedAllocation.allocationTypeId || "",
        category: selectedAllocation.category,
        title: selectedAllocation.title,
        description: selectedAllocation.description || "",
        hours: selectedAllocation.hours,
        hoursPerWeek: selectedAllocation.hoursPerWeek,
        weeksPerYear: selectedAllocation.weeksPerYear,
        startDate: selectedAllocation.startDate,
        endDate: selectedAllocation.endDate,
        isRecurring: selectedAllocation.isRecurring || false,
        recurrencePattern: selectedAllocation.recurrencePattern || "",
        status: selectedAllocation.status,
        isActive: selectedAllocation.isActive,
        isApproved: selectedAllocation.isApproved || false,
        approvedBy: selectedAllocation.approvedBy || "",
        approvedAt: selectedAllocation.approvedAt,
        priority: selectedAllocation.priority,
        isEssential: selectedAllocation.isEssential || false,
        notes: selectedAllocation.notes || "",
      });
    }
  }, [selectedAllocation, mode, form]);

  // Update academic year when active year changes
  useEffect(() => {
    if (activeAcademicYear && mode === "create") {
      form.setValue("academicYearId", activeAcademicYear._id);
    }
  }, [activeAcademicYear, mode, form]);

  const onSubmit = async (data: AllocationFormData) => {
    try {
      setIsSubmitting(true);

      const allocationData = {
        lecturerId: data.lecturerId as Id<"lecturers">,
        academicYearId: data.academicYearId as Id<"academic_years">,
        allocationTypeId: data.allocationTypeId as Id<"allocation_types"> | undefined,
        category: data.category,
        title: data.title,
        description: data.description,
        hours: data.hours,
        hoursPerWeek: data.hoursPerWeek,
        weeksPerYear: data.weeksPerYear,
        startDate: data.startDate,
        endDate: data.endDate,
        isRecurring: data.isRecurring,
        recurrencePattern: data.recurrencePattern,
        status: data.status,
        isActive: data.isActive,
        isApproved: data.isApproved,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt,
        priority: data.priority,
        isEssential: data.isEssential,
        notes: data.notes,
      };

      if (mode === "create") {
        await createAllocation(allocationData);
        logActivity({
          type: "create",
          entity: "admin_allocation",
          description: `Created allocation: ${data.title}`,
          userId: "", // user?.id || "", // user is not defined in this scope
          organisationId: "",
        });
        toast.success("Allocation created successfully");
      } else {
        if (!allocationId) {
          toast.error("Allocation ID is required for editing");
          return;
        }
        await updateAllocation({ id: allocationId, ...allocationData });
        logActivity({
          type: "edit",
          entity: "admin_allocation", 
          description: `Updated allocation: ${data.title}`,
          userId: "", // user?.id || "", // user is not defined in this scope
          organisationId: "",
        });
        toast.success("Allocation updated successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving allocation:", error);
      toast.error("Failed to save allocation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  // Get selected lecturer for display
  const selectedLecturer = lecturers?.find((lecturer: any) => lecturer._id === form.watch("lecturerId"));

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Allocation" : "Edit Allocation"}</CardTitle>
        <CardDescription>
          {mode === "create" 
            ? "Add a new workload allocation for a lecturer" 
            : "Update allocation information and settings"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Lecturer and Academic Year */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lecturer and Academic Year</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lecturerId">Lecturer *</Label>
                <Select
                  value={form.watch("lecturerId")}
                  onValueChange={(value) => form.setValue("lecturerId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers?.map((lecturer: any) => (
                      <SelectItem key={lecturer._id} value={lecturer._id}>
                        {lecturer.profileId} - {lecturer.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.lecturerId && (
                  <p className="text-sm text-destructive">{form.formState.errors.lecturerId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYearId">Academic Year *</Label>
                <Select
                  value={form.watch("academicYearId")}
                  onValueChange={(value) => form.setValue("academicYearId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears?.map((year: any) => (
                      <SelectItem key={year._id} value={year._id}>
                        {year.name} {year.isActive && "(Active)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.academicYearId && (
                  <p className="text-sm text-destructive">{form.formState.errors.academicYearId.message}</p>
                )}
              </div>
            </div>

            {selectedLecturer && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Selected Lecturer:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedLecturer.profileId} - {selectedLecturer.status} 
                  (Teaching Availability: {selectedLecturer.teachingAvailability}h)
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Allocation Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Allocation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allocationTypeId">Allocation Type</Label>
                <Select
                  value={form.watch("allocationTypeId")}
                  onValueChange={(value) => form.setValue("allocationTypeId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select allocation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {allocationTypes?.map((type: any) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(value) => form.setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOCATION_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="e.g., Course Leader for CS101"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Detailed description of the allocation..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Hours and Duration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hours and Duration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Total Hours *</Label>
                <Input
                  id="hours"
                  type="number"
                  {...form.register("hours", { valueAsNumber: true })}
                  min="0"
                  step="0.5"
                />
                {form.formState.errors.hours && (
                  <p className="text-sm text-destructive">{form.formState.errors.hours.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hoursPerWeek">Hours Per Week</Label>
                <Input
                  id="hoursPerWeek"
                  type="number"
                  {...form.register("hoursPerWeek", { valueAsNumber: true })}
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeksPerYear">Weeks Per Year</Label>
                <Input
                  id="weeksPerYear"
                  type="number"
                  {...form.register("weeksPerYear", { valueAsNumber: true })}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register("startDate", { 
                    setValueAs: (value) => value ? new Date(value).getTime() : undefined 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...form.register("endDate", { 
                    setValueAs: (value) => value ? new Date(value).getTime() : undefined 
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Recurrence */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recurrence</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRecurring"
                  checked={form.watch("isRecurring")}
                  onCheckedChange={(checked) => form.setValue("isRecurring", checked)}
                />
                <Label htmlFor="isRecurring">Recurring allocation</Label>
              </div>

              {form.watch("isRecurring") && (
                <div className="space-y-2">
                  <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
                  <Select
                    value={form.watch("recurrencePattern")}
                    onValueChange={(value) => form.setValue("recurrencePattern", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recurrence pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_PATTERNS.map((pattern) => (
                        <SelectItem key={pattern.value} value={pattern.value}>
                          {pattern.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Status and Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status and Priority</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOCATION_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(value) => form.setValue("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOCATION_PRIORITIES.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.priority && (
                  <p className="text-sm text-destructive">{form.formState.errors.priority.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isEssential"
                  checked={form.watch("isEssential")}
                  onCheckedChange={(checked) => form.setValue("isEssential", checked)}
                />
                <Label htmlFor="isEssential">Essential allocation</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Approval */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Approval</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isApproved"
                  checked={form.watch("isApproved")}
                  onCheckedChange={(checked) => form.setValue("isApproved", checked)}
                />
                <Label htmlFor="isApproved">Allocation is approved</Label>
              </div>

              {form.watch("isApproved") && (
                <div className="space-y-2">
                  <Label htmlFor="approvedBy">Approved By</Label>
                  <Input
                    id="approvedBy"
                    {...form.register("approvedBy")}
                    placeholder="Name of approver"
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notes</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Additional notes about the allocation..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={form.watch("isActive")}
                onCheckedChange={(checked) => form.setValue("isActive", checked)}
              />
              <Label htmlFor="isActive">Allocation is active</Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Allocation" : "Update Allocation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 