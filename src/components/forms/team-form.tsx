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
import { useTeams } from "@/hooks/useTeams";
import { useReferenceData } from "@/hooks/useReferenceData";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { useLogRecentActivity } from "@/hooks/useStoreUserEffect";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

// Team form schema
const teamFormSchema = z.object({
  name: z.string().min(1, "Team name is required").max(255, "Team name must be less than 255 characters"),
  code: z.string().min(1, "Team code is required").max(50, "Team code must be less than 50 characters"),
  description: z.string().optional(),
  teamType: z.string().min(1, "Team type is required"),
  level: z.string().min(1, "Level is required"),
  departmentId: z.string().optional(),
  facultyId: z.string().optional(),
  parentTeamId: z.string().optional(),
  teamLeaderId: z.string().optional(),
  deputyLeaderId: z.string().optional(),
  academicYearId: z.string().optional(),
  memberCount: z.number().min(0, "Member count must be 0 or greater").optional(),
  maxMembers: z.number().min(1, "Max members must be at least 1").optional(),
  defaultWorkloadHours: z.number().min(0, "Default workload hours must be 0 or greater").optional(),
  workloadDistribution: z.object({
    teaching: z.number().min(0).max(100).optional(),
    research: z.number().min(0).max(100).optional(),
    admin: z.number().min(0).max(100).optional(),
    other: z.number().min(0).max(100).optional(),
  }).optional(),
  isActive: z.boolean(),
  isSystem: z.boolean(),
  isPublic: z.boolean(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamFormSchema>;

interface TeamFormProps {
  teamId?: Id<"teams">;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

const TEAM_TYPES = [
  { value: "academic", label: "Academic" },
  { value: "administrative", label: "Administrative" },
  { value: "research", label: "Research" },
  { value: "support", label: "Support" },
  { value: "project", label: "Project" },
  { value: "committee", label: "Committee" },
];

const TEAM_LEVELS = [
  { value: "university", label: "University" },
  { value: "faculty", label: "Faculty" },
  { value: "department", label: "Department" },
  { value: "programme", label: "Programme" },
  { value: "module", label: "Module" },
];

export function TeamForm({ teamId, onSuccess, onCancel, mode = "create" }: TeamFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  const { createTeam, updateTeam, selectedTeam, setSelectedTeamId, teams } = useTeams();
  const { faculties, departments, userProfiles } = useReferenceData();
  const { academicYears, activeAcademicYear } = useAcademicYear();
  const logActivity = useLogRecentActivity();

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      teamType: "",
      level: "",
      departmentId: "",
      facultyId: "",
      parentTeamId: "",
      teamLeaderId: "",
      deputyLeaderId: "",
      academicYearId: activeAcademicYear?._id || "",
      memberCount: 0,
      maxMembers: undefined,
      defaultWorkloadHours: 0,
      workloadDistribution: {
        teaching: 60,
        research: 20,
        admin: 15,
        other: 5,
      },
      isActive: true,
      isSystem: false,
      isPublic: true,
      tags: [],
      notes: "",
    },
  });

  // Load team data for editing
  useEffect(() => {
    if (teamId && mode === "edit") {
      setSelectedTeamId(teamId);
    }
  }, [teamId, mode, setSelectedTeamId]);

  // Populate form with existing data
  useEffect(() => {
    if (selectedTeam && mode === "edit") {
      form.reset({
        name: selectedTeam.name,
        code: selectedTeam.code,
        description: selectedTeam.description || "",
        teamType: selectedTeam.teamType,
        level: selectedTeam.level,
        departmentId: selectedTeam.departmentId || "",
        facultyId: selectedTeam.facultyId || "",
        parentTeamId: selectedTeam.parentTeamId || "",
        teamLeaderId: selectedTeam.teamLeaderId || "",
        deputyLeaderId: selectedTeam.deputyLeaderId || "",
        academicYearId: selectedTeam.academicYearId || "",
        memberCount: selectedTeam.memberCount || 0,
        maxMembers: selectedTeam.maxMembers,
        defaultWorkloadHours: selectedTeam.defaultWorkloadHours || 0,
        workloadDistribution: selectedTeam.workloadDistribution || {
          teaching: 60,
          research: 20,
          admin: 15,
          other: 5,
        },
        isActive: selectedTeam.isActive,
        isSystem: selectedTeam.isSystem || false,
        isPublic: selectedTeam.isPublic || true,
        tags: selectedTeam.tags || [],
        notes: selectedTeam.notes || "",
      });
      setTags(selectedTeam.tags || []);
    }
  }, [selectedTeam, mode, form]);

  // Update academic year when active year changes
  useEffect(() => {
    if (activeAcademicYear && mode === "create") {
      form.setValue("academicYearId", activeAcademicYear._id);
    }
  }, [activeAcademicYear, mode, form]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue("tags", updatedTags);
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
    form.setValue("tags", updatedTags);
  };

  const onSubmit = async (data: TeamFormData) => {
    try {
      setIsSubmitting(true);

      const teamData = {
        ...data,
        tags: tags,
        departmentId: data.departmentId || undefined,
        facultyId: data.facultyId || undefined,
        parentTeamId: data.parentTeamId || undefined,
        teamLeaderId: data.teamLeaderId || undefined,
        deputyLeaderId: data.deputyLeaderId || undefined,
        academicYearId: data.academicYearId || undefined,
        maxMembers: data.maxMembers || undefined,
      };

      if (mode === "create") {
        await createTeam(teamData);
        logActivity("team_created", { teamName: data.name, teamCode: data.code });
        toast.success("Team created successfully");
      } else {
        if (!teamId) {
          toast.error("Team ID is required for editing");
          return;
        }
        await updateTeam({ id: teamId, ...teamData });
        logActivity("team_updated", { teamName: data.name, teamCode: data.code });
        toast.success("Team updated successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving team:", error);
      toast.error("Failed to save team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setTags([]);
    setNewTag("");
    onCancel?.();
  };

  // Get available parent teams (exclude current team in edit mode)
  const availableParentTeams = teams?.filter(team => 
    mode === "edit" ? team._id !== teamId : true
  ) || [];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Team" : "Edit Team"}</CardTitle>
        <CardDescription>
          {mode === "create" 
            ? "Add a new team to the system" 
            : "Update team information and settings"
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
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g., Computer Science Department"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Team Code *</Label>
                <Input
                  id="code"
                  {...form.register("code")}
                  placeholder="e.g., CS-DEPT"
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
                placeholder="Team description..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Team Structure */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Team Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamType">Team Type *</Label>
                <Select
                  value={form.watch("teamType")}
                  onValueChange={(value) => form.setValue("teamType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.teamType && (
                  <p className="text-sm text-destructive">{form.formState.errors.teamType.message}</p>
                )}
              </div>

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
                    {TEAM_LEVELS.map((level) => (
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentTeamId">Parent Team</Label>
              <Select
                value={form.watch("parentTeamId")}
                onValueChange={(value) => form.setValue("parentTeamId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent team (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {availableParentTeams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Leadership */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Leadership</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamLeaderId">Team Leader</Label>
                <Select
                  value={form.watch("teamLeaderId")}
                  onValueChange={(value) => form.setValue("teamLeaderId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team leader" />
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

              <div className="space-y-2">
                <Label htmlFor="deputyLeaderId">Deputy Leader</Label>
                <Select
                  value={form.watch("deputyLeaderId")}
                  onValueChange={(value) => form.setValue("deputyLeaderId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deputy leader" />
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

          {/* Academic Year */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Academic Year</h3>
            <div className="space-y-2">
              <Label htmlFor="academicYearId">Academic Year</Label>
              <Select
                value={form.watch("academicYearId")}
                onValueChange={(value) => form.setValue("academicYearId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears?.map((year) => (
                    <SelectItem key={year._id} value={year._id}>
                      {year.name} {year.isActive && "(Active)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Capacity and Workload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Capacity and Workload</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberCount">Current Members</Label>
                <Input
                  id="memberCount"
                  type="number"
                  {...form.register("memberCount", { valueAsNumber: true })}
                  min="0"
                />
                {form.formState.errors.memberCount && (
                  <p className="text-sm text-destructive">{form.formState.errors.memberCount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers">Max Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  {...form.register("maxMembers", { valueAsNumber: true })}
                  min="1"
                />
                {form.formState.errors.maxMembers && (
                  <p className="text-sm text-destructive">{form.formState.errors.maxMembers.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultWorkloadHours">Default Workload Hours</Label>
                <Input
                  id="defaultWorkloadHours"
                  type="number"
                  {...form.register("defaultWorkloadHours", { valueAsNumber: true })}
                  min="0"
                />
                {form.formState.errors.defaultWorkloadHours && (
                  <p className="text-sm text-destructive">{form.formState.errors.defaultWorkloadHours.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Workload Distribution (%)</Label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teaching">Teaching</Label>
                  <Input
                    id="teaching"
                    type="number"
                    {...form.register("workloadDistribution.teaching", { valueAsNumber: true })}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="research">Research</Label>
                  <Input
                    id="research"
                    type="number"
                    {...form.register("workloadDistribution.research", { valueAsNumber: true })}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin">Admin</Label>
                  <Input
                    id="admin"
                    type="number"
                    {...form.register("workloadDistribution.admin", { valueAsNumber: true })}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other">Other</Label>
                  <Input
                    id="other"
                    type="number"
                    {...form.register("workloadDistribution.other", { valueAsNumber: true })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags</h3>
            <div className="space-y-2">
              <Label>Team Tags</Label>
              <div className="space-y-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 p-2 bg-muted rounded-md">{tag}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTag(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              </div>
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
                placeholder="Additional notes about the team..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
                <Label htmlFor="isActive">Team is active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isSystem"
                  checked={form.watch("isSystem")}
                  onCheckedChange={(checked) => form.setValue("isSystem", checked)}
                />
                <Label htmlFor="isSystem">System team</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={form.watch("isPublic")}
                  onCheckedChange={(checked) => form.setValue("isPublic", checked)}
                />
                <Label htmlFor="isPublic">Public team</Label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Team" : "Update Team"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 