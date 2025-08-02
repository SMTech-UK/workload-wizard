"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCohorts } from "@/hooks/useCohorts";
import { useCourses } from "@/hooks/useCourses";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

// Cohort form schema
const cohortFormSchema = z.object({
  name: z.string().min(1, "Cohort name is required").max(255, "Cohort name must be less than 255 characters"),
  code: z.string().min(1, "Cohort code is required").max(50, "Cohort code must be less than 50 characters"),
  courseId: z.string().min(1, "Course is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  entryYear: z.number().min(2000, "Entry year must be 2000 or later").max(2100, "Entry year must be 2100 or earlier"),
  isFullTime: z.boolean(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean(),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type CohortFormData = z.infer<typeof cohortFormSchema>;

interface CohortFormProps {
  cohortId?: Id<"cohorts">;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export function CohortForm({ cohortId, onSuccess, onCancel, mode = "create" }: CohortFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  
  const { createCohort, updateCohort, selectedCohort, setSelectedCohortId } = useCohorts();
  const { courses } = useCourses();
  const { academicYears, activeAcademicYear } = useAcademicYear();
  const logActivity = useLogRecentActivity();

  const form = useForm<CohortFormData>({
    resolver: zodResolver(cohortFormSchema),
    defaultValues: {
      name: "",
      code: "",
      courseId: "",
      academicYearId: activeAcademicYear?._id || "",
      entryYear: new Date().getFullYear(),
      isFullTime: true,
      startDate: "",
      endDate: "",
      isActive: true,
    },
  });

  // Load cohort data for editing
  useEffect(() => {
    if (cohortId && mode === "edit") {
      setSelectedCohortId(cohortId);
    }
  }, [cohortId, mode, setSelectedCohortId]);

  // Populate form with existing data
  useEffect(() => {
    if (selectedCohort && mode === "edit") {
      form.reset({
        name: selectedCohort.name,
        code: selectedCohort.code,
        courseId: selectedCohort.courseId,
        academicYearId: selectedCohort.academicYearId,
        entryYear: selectedCohort.entryYear,
        isFullTime: selectedCohort.isFullTime,
        startDate: selectedCohort.startDate,
        endDate: selectedCohort.endDate,
        isActive: selectedCohort.isActive,
      });
    }
  }, [selectedCohort, mode, form]);

  // Update academic year when active year changes
  useEffect(() => {
    if (activeAcademicYear && mode === "create") {
      form.setValue("academicYearId", activeAcademicYear._id);
    }
  }, [activeAcademicYear, mode, form]);

  const onSubmit = async (data: CohortFormData) => {
    try {
      setIsSubmitting(true);

      const cohortData = {
        ...data,
        courseId: data.courseId as Id<"courses">,
        academicYearId: data.academicYearId as Id<"academic_years">,
      };

      if (mode === "create") {
        await createCohort(cohortData);
        logActivity({
          type: "create",
          entity: "cohort",
          description: `Created cohort: ${data.name} (${data.code})`,
          userId: user?.id || "",
          organisationId: "",
        });
        toast.success("Cohort created successfully");
      } else {
        if (!cohortId) {
          toast.error("Cohort ID is required for editing");
          return;
        }
        await updateCohort({ id: cohortId, ...cohortData });
        logActivity({
          type: "edit",
          entity: "cohort",
          description: `Updated cohort: ${data.name} (${data.code})`,
          userId: user?.id || "",
          organisationId: "",
        });
        toast.success("Cohort updated successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving cohort:", error);
      toast.error("Failed to save cohort. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  // Get selected course for display
  const selectedCourse = courses?.find((course: any) => course._id === form.watch("courseId"));

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Cohort" : "Edit Cohort"}</CardTitle>
        <CardDescription>
          {mode === "create" 
            ? "Add a new student cohort to the system" 
            : "Update cohort information and settings"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Cohort Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g., Computer Science 2024"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Cohort Code *</Label>
                <Input
                  id="code"
                  {...form.register("code")}
                  placeholder="e.g., CS2024"
                />
                {form.formState.errors.code && (
                  <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Course and Academic Year */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Course and Academic Year</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseId">Course *</Label>
                <Select
                  value={form.watch("courseId")}
                  onValueChange={(value) => form.setValue("courseId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course: any) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.courseId && (
                  <p className="text-sm text-destructive">{form.formState.errors.courseId.message}</p>
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

            {selectedCourse && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Selected Course:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCourse.code} - {selectedCourse.name} ({selectedCourse.credits} credits, {selectedCourse.duration} years)
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Cohort Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cohort Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryYear">Entry Year *</Label>
                <Input
                  id="entryYear"
                  type="number"
                  {...form.register("entryYear", { valueAsNumber: true })}
                  min="2000"
                  max="2100"
                />
                {form.formState.errors.entryYear && (
                  <p className="text-sm text-destructive">{form.formState.errors.entryYear.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="isFullTime">Study Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFullTime"
                    checked={form.watch("isFullTime")}
                    onCheckedChange={(checked) => form.setValue("isFullTime", checked)}
                  />
                  <Label htmlFor="isFullTime">
                    {form.watch("isFullTime") ? "Full Time" : "Part Time"}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Academic Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register("startDate")}
                />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...form.register("endDate")}
                />
                {form.formState.errors.endDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.endDate.message}</p>
                )}
              </div>
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
              <Label htmlFor="isActive">Cohort is active</Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Cohort" : "Update Cohort"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 