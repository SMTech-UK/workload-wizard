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
import { api } from "../../convex/_generated/api";
import { useLogRecentActivity } from "@/hooks/useStoreUserEffect";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

// Assessment form schema
const assessmentFormSchema = z.object({
  title: z.string().min(1, "Assessment title is required").max(255, "Assessment title must be less than 255 characters"),
  type: z.string().min(1, "Assessment type is required"),
  weighting: z.number().min(0, "Weighting must be 0 or greater").max(100, "Weighting must be 100 or less"),
  submissionDate: z.string().min(1, "Submission date is required"),
  marksDueDate: z.string().min(1, "Marks due date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  isSecondAttempt: z.boolean(),
  externalExaminerRequired: z.boolean(),
  alertsToTeam: z.boolean(),
  isGroupAssessment: z.boolean(),
  maxGroupSize: z.number().min(1, "Max group size must be at least 1").optional(),
  minGroupSize: z.number().min(1, "Min group size must be at least 1").optional(),
  isPublished: z.boolean(),
  isActive: z.boolean(),
}).refine((data) => {
  const submissionDate = new Date(data.submissionDate);
  const marksDueDate = new Date(data.marksDueDate);
  const dueDate = new Date(data.dueDate);
  return marksDueDate >= submissionDate && dueDate >= submissionDate;
}, {
  message: "Due dates must be on or after submission date",
  path: ["dueDate"],
}).refine((data) => {
  if (data.isGroupAssessment) {
    return data.maxGroupSize && data.minGroupSize && data.maxGroupSize >= data.minGroupSize;
  }
  return true;
}, {
  message: "Max group size must be greater than or equal to min group size",
  path: ["maxGroupSize"],
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

interface AssessmentFormProps {
  moduleIterationId: Id<"module_iterations">;
  assessmentId?: Id<"module_iteration_assessments">;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

const ASSESSMENT_TYPES = [
  { value: "exam", label: "Exam" },
  { value: "coursework", label: "Coursework" },
  { value: "presentation", label: "Presentation" },
  { value: "practical", label: "Practical" },
  { value: "dissertation", label: "Dissertation" },
  { value: "thesis", label: "Thesis" },
  { value: "project", label: "Project" },
  { value: "portfolio", label: "Portfolio" },
  { value: "viva", label: "Viva" },
  { value: "other", label: "Other" },
];

export function AssessmentForm({ 
  moduleIterationId, 
  assessmentId, 
  onSuccess, 
  onCancel, 
  mode = "create" 
}: AssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Queries
  const assessmentTypes = useQuery(api.assessment_types.getAll);
  const selectedAssessment = useQuery(
    api.module_iteration_assessments.getById,
    assessmentId ? { id: assessmentId } : "skip"
  );
  const moduleIteration = useQuery(
    api.module_iterations.getById,
    { id: moduleIterationId }
  );
  
  // Mutations
  const createAssessment = useMutation(api.module_iteration_assessments.create);
  const updateAssessment = useMutation(api.module_iteration_assessments.update);
  
  const logActivity = useLogRecentActivity();

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      title: "",
      type: "",
      weighting: 100,
      submissionDate: "",
      marksDueDate: "",
      dueDate: "",
      isSecondAttempt: false,
      externalExaminerRequired: false,
      alertsToTeam: true,
      isGroupAssessment: false,
      maxGroupSize: undefined,
      minGroupSize: undefined,
      isPublished: false,
      isActive: true,
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (selectedAssessment && mode === "edit") {
      form.reset({
        title: selectedAssessment.title,
        type: selectedAssessment.type,
        weighting: selectedAssessment.weighting,
        submissionDate: selectedAssessment.submissionDate,
        marksDueDate: selectedAssessment.marksDueDate,
        dueDate: selectedAssessment.dueDate,
        isSecondAttempt: selectedAssessment.isSecondAttempt,
        externalExaminerRequired: selectedAssessment.externalExaminerRequired,
        alertsToTeam: selectedAssessment.alertsToTeam,
        isGroupAssessment: selectedAssessment.isGroupAssessment,
        maxGroupSize: selectedAssessment.maxGroupSize,
        minGroupSize: selectedAssessment.minGroupSize,
        isPublished: selectedAssessment.isPublished,
        isActive: selectedAssessment.isActive,
      });
    }
  }, [selectedAssessment, mode, form]);

  const onSubmit = async (data: AssessmentFormData) => {
    try {
      setIsSubmitting(true);

      const assessmentData = {
        moduleIterationId,
        assessmentTypeId: undefined, // Will be set based on type selection
        title: data.title,
        type: data.type,
        weighting: data.weighting,
        submissionDate: data.submissionDate,
        marksDueDate: data.marksDueDate,
        dueDate: data.dueDate,
        isSecondAttempt: data.isSecondAttempt,
        externalExaminerRequired: data.externalExaminerRequired,
        alertsToTeam: data.alertsToTeam,
        isGroupAssessment: data.isGroupAssessment,
        maxGroupSize: data.maxGroupSize,
        minGroupSize: data.minGroupSize,
        isPublished: data.isPublished,
        isActive: data.isActive,
      };

      if (mode === "create") {
        await createAssessment(assessmentData);
        logActivity("assessment_created", { 
          assessmentTitle: data.title, 
          moduleIterationId 
        });
        toast.success("Assessment created successfully");
      } else {
        if (!assessmentId) {
          toast.error("Assessment ID is required for editing");
          return;
        }
        await updateAssessment({ id: assessmentId, ...assessmentData });
        logActivity("assessment_updated", { 
          assessmentTitle: data.title, 
          moduleIterationId 
        });
        toast.success("Assessment updated successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Assessment" : "Edit Assessment"}</CardTitle>
        <CardDescription>
          {mode === "create" 
            ? "Add a new assessment to the module iteration" 
            : "Update assessment information and settings"
          }
          {moduleIteration && (
            <div className="mt-2 text-sm text-muted-foreground">
              Module: {moduleIteration.iterationCode}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="e.g., Final Project Report"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Assessment Type *</Label>
                  <Select
                    value={form.watch("type")}
                    onValueChange={(value) => form.setValue("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSESSMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weighting">Weighting (%) *</Label>
                  <Input
                    id="weighting"
                    type="number"
                    {...form.register("weighting", { valueAsNumber: true })}
                    min="0"
                    max="100"
                  />
                  {form.formState.errors.weighting && (
                    <p className="text-sm text-destructive">{form.formState.errors.weighting.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Important Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submissionDate">Submission Date *</Label>
                <Input
                  id="submissionDate"
                  type="date"
                  {...form.register("submissionDate")}
                />
                {form.formState.errors.submissionDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.submissionDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="marksDueDate">Marks Due Date *</Label>
                <Input
                  id="marksDueDate"
                  type="date"
                  {...form.register("marksDueDate")}
                />
                {form.formState.errors.marksDueDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.marksDueDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...form.register("dueDate")}
                />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.dueDate.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Assessment Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assessment Options</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isSecondAttempt"
                  checked={form.watch("isSecondAttempt")}
                  onCheckedChange={(checked) => form.setValue("isSecondAttempt", checked)}
                />
                <Label htmlFor="isSecondAttempt">Second attempt assessment</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="externalExaminerRequired"
                  checked={form.watch("externalExaminerRequired")}
                  onCheckedChange={(checked) => form.setValue("externalExaminerRequired", checked)}
                />
                <Label htmlFor="externalExaminerRequired">External examiner required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="alertsToTeam"
                  checked={form.watch("alertsToTeam")}
                  onCheckedChange={(checked) => form.setValue("alertsToTeam", checked)}
                />
                <Label htmlFor="alertsToTeam">Send alerts to team</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isGroupAssessment"
                  checked={form.watch("isGroupAssessment")}
                  onCheckedChange={(checked) => form.setValue("isGroupAssessment", checked)}
                />
                <Label htmlFor="isGroupAssessment">Group assessment</Label>
              </div>
            </div>

            {/* Group Assessment Settings */}
            {form.watch("isGroupAssessment") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="minGroupSize">Minimum Group Size</Label>
                  <Input
                    id="minGroupSize"
                    type="number"
                    {...form.register("minGroupSize", { valueAsNumber: true })}
                    min="1"
                  />
                  {form.formState.errors.minGroupSize && (
                    <p className="text-sm text-destructive">{form.formState.errors.minGroupSize.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxGroupSize">Maximum Group Size</Label>
                  <Input
                    id="maxGroupSize"
                    type="number"
                    {...form.register("maxGroupSize", { valueAsNumber: true })}
                    min="1"
                  />
                  {form.formState.errors.maxGroupSize && (
                    <p className="text-sm text-destructive">{form.formState.errors.maxGroupSize.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={form.watch("isPublished")}
                  onCheckedChange={(checked) => form.setValue("isPublished", checked)}
                />
                <Label htmlFor="isPublished">Assessment is published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
                <Label htmlFor="isActive">Assessment is active</Label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Assessment" : "Update Assessment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 