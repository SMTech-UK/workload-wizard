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
import { useCourses } from "@/hooks/useCourses";
import { useReferenceData } from "@/hooks/useReferenceData";
import { useLogRecentActivity } from "@/hooks/useStoreUserEffect";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

// Course form schema
const courseFormSchema = z.object({
  name: z.string().min(1, "Course name is required").max(255, "Course name must be less than 255 characters"),
  code: z.string().min(1, "Course code is required").max(50, "Course code must be less than 50 characters"),
  description: z.string().optional(),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
  credits: z.number().min(1, "Credits must be at least 1").max(999, "Credits must be less than 999"),
  duration: z.number().min(1, "Duration must be at least 1").max(10, "Duration must be less than 10 years"),
  level: z.string().min(1, "Level is required"),
  courseLeaderId: z.string().optional(),
  contactEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  entryRequirements: z.string().optional(),
  learningOutcomes: z.array(z.string()).optional(),
  isAccredited: z.boolean(),
  accreditationBody: z.string().optional(),
  isActive: z.boolean(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  courseId?: Id<"courses">;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

const COURSE_LEVELS = [
  { value: "Foundation", label: "Foundation" },
  { value: "Level 4", label: "Level 4" },
  { value: "Level 5", label: "Level 5" },
  { value: "Level 6", label: "Level 6" },
  { value: "Level 7", label: "Level 7" },
  { value: "Level 8", label: "Level 8" },
];

export function CourseForm({ courseId, onSuccess, onCancel, mode = "create" }: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState("");
  
  const { createCourse, updateCourse, selectedCourse, setSelectedCourseId } = useCourses();
  const { faculties, departments, userProfiles } = useReferenceData();
  const logActivity = useLogRecentActivity();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      facultyId: "",
      departmentId: "",
      credits: 120,
      duration: 3,
      level: "",
      courseLeaderId: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      entryRequirements: "",
      learningOutcomes: [],
      isAccredited: false,
      accreditationBody: "",
      isActive: true,
    },
  });

  // Load course data for editing
  useEffect(() => {
    if (courseId && mode === "edit") {
      setSelectedCourseId(courseId);
    }
  }, [courseId, mode, setSelectedCourseId]);

  // Populate form with existing data
  useEffect(() => {
    if (selectedCourse && mode === "edit") {
      form.reset({
        name: selectedCourse.name,
        code: selectedCourse.code,
        description: selectedCourse.description || "",
        facultyId: selectedCourse.facultyId || "",
        departmentId: selectedCourse.departmentId || "",
        credits: selectedCourse.credits,
        duration: selectedCourse.duration,
        level: selectedCourse.level,
        courseLeaderId: selectedCourse.courseLeaderId || "",
        contactEmail: selectedCourse.contactEmail || "",
        contactPhone: selectedCourse.contactPhone || "",
        website: selectedCourse.website || "",
        entryRequirements: selectedCourse.entryRequirements || "",
        learningOutcomes: selectedCourse.learningOutcomes || [],
        isAccredited: selectedCourse.isAccredited,
        accreditationBody: selectedCourse.accreditationBody || "",
        isActive: selectedCourse.isActive,
      });
      setLearningOutcomes(selectedCourse.learningOutcomes || []);
    }
  }, [selectedCourse, mode, form]);

  const handleAddLearningOutcome = () => {
    if (newOutcome.trim() && !learningOutcomes.includes(newOutcome.trim())) {
      const updatedOutcomes = [...learningOutcomes, newOutcome.trim()];
      setLearningOutcomes(updatedOutcomes);
      form.setValue("learningOutcomes", updatedOutcomes);
      setNewOutcome("");
    }
  };

  const handleRemoveLearningOutcome = (index: number) => {
    const updatedOutcomes = learningOutcomes.filter((_, i) => i !== index);
    setLearningOutcomes(updatedOutcomes);
    form.setValue("learningOutcomes", updatedOutcomes);
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsSubmitting(true);

      const courseData = {
        ...data,
        learningOutcomes: learningOutcomes,
        facultyId: data.facultyId || undefined,
        departmentId: data.departmentId || undefined,
        courseLeaderId: data.courseLeaderId || undefined,
      };

      if (mode === "create") {
        await createCourse(courseData);
        logActivity("course_created", { courseName: data.name, courseCode: data.code });
        toast.success("Course created successfully");
      } else {
        if (!courseId) {
          toast.error("Course ID is required for editing");
          return;
        }
        await updateCourse({ id: courseId, ...courseData });
        logActivity("course_updated", { courseName: data.name, courseCode: data.code });
        toast.success("Course updated successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Failed to save course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setLearningOutcomes([]);
    setNewOutcome("");
    onCancel?.();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Course" : "Edit Course"}</CardTitle>
        <CardDescription>
          {mode === "create" 
            ? "Add a new course to the system" 
            : "Update course information and settings"
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
                <Label htmlFor="name">Course Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g., Computer Science"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Course Code *</Label>
                <Input
                  id="code"
                  {...form.register("code")}
                  placeholder="e.g., CS101"
                />
                {form.formState.errors.code && (
                  <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Course description..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Academic Structure */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Academic Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facultyId">Faculty</Label>
                <Select
                  value={form.watch("facultyId")}
                  onValueChange={(value) => form.setValue("facultyId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties?.map((faculty) => (
                      <SelectItem key={faculty._id} value={faculty._id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <Select
                  value={form.watch("departmentId")}
                  onValueChange={(value) => form.setValue("departmentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((department) => (
                      <SelectItem key={department._id} value={department._id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  type="number"
                  {...form.register("credits", { valueAsNumber: true })}
                  min="1"
                  max="999"
                />
                {form.formState.errors.credits && (
                  <p className="text-sm text-destructive">{form.formState.errors.credits.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Years) *</Label>
                <Input
                  id="duration"
                  type="number"
                  {...form.register("duration", { valueAsNumber: true })}
                  min="1"
                  max="10"
                />
                {form.formState.errors.duration && (
                  <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select
                  value={form.watch("level")}
                  onValueChange={(value) => form.setValue("level", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.level && (
                  <p className="text-sm text-destructive">{form.formState.errors.level.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseLeaderId">Course Leader</Label>
                <Select
                  value={form.watch("courseLeaderId")}
                  onValueChange={(value) => form.setValue("courseLeaderId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course leader" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProfiles?.map((profile) => (
                      <SelectItem key={profile._id} value={profile._id}>
                        {profile.firstName} {profile.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...form.register("contactEmail")}
                  placeholder="course@university.edu"
                />
                {form.formState.errors.contactEmail && (
                  <p className="text-sm text-destructive">{form.formState.errors.contactEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  {...form.register("contactPhone")}
                  placeholder="+44 123 456 7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...form.register("website")}
                placeholder="https://course-website.com"
              />
              {form.formState.errors.website && (
                <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Learning Outcomes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Learning Outcomes</h3>
            <div className="space-y-2">
              <Label htmlFor="entryRequirements">Entry Requirements</Label>
              <Textarea
                id="entryRequirements"
                {...form.register("entryRequirements")}
                placeholder="Entry requirements for the course..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Learning Outcomes</Label>
              <div className="space-y-2">
                {learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 p-2 bg-muted rounded-md">{outcome}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveLearningOutcome(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    placeholder="Add a learning outcome..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLearningOutcome())}
                  />
                  <Button type="button" onClick={handleAddLearningOutcome}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Accreditation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Accreditation</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="isAccredited"
                checked={form.watch("isAccredited")}
                onCheckedChange={(checked) => form.setValue("isAccredited", checked)}
              />
              <Label htmlFor="isAccredited">Course is accredited</Label>
            </div>

            {form.watch("isAccredited") && (
              <div className="space-y-2">
                <Label htmlFor="accreditationBody">Accreditation Body</Label>
                <Input
                  id="accreditationBody"
                  {...form.register("accreditationBody")}
                  placeholder="e.g., BCS, QAA"
                />
              </div>
            )}
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
              <Label htmlFor="isActive">Course is active</Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Course" : "Update Course"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 