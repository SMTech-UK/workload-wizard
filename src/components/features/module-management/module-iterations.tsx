"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Edit, X, Calendar, Users, Clock, Share2 } from "lucide-react"
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import type { Id } from "../../convex/_generated/dataModel";

// Define the Assessment interface
interface Assessment {
  title: string;
  type: string;
  weighting: number;
  submissionDate: string;
  marksDueDate: string;
  isSecondAttempt: boolean;
  externalExaminerRequired: boolean;
  alertsToTeam: boolean;
}

// Define the Site interface
interface Site {
  name: string;
  deliveryTime: string;
  students: number;
  groups: number;
}

// Define the Module Iteration interface
export interface ModuleIteration {
  _id: Id<'module_iterations'>;
  moduleCode: string;
  title: string;
  semester: number;
  cohortId: string;
  teachingStartDate: string;
  teachingHours: number;
  markingHours: number;
  assignedLecturerIds: string[];
  assignedStatus: string;
  notes?: string;
  assessments: Assessment[];
  sites: Site[];
}

export default function ModuleIterations() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleFilter = searchParams.get('module');
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIteration, setSelectedIteration] = useState<ModuleIteration | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const iterations = useQuery(api.module_iterations.getAll) ?? [];
  const modules = useQuery(api.modules.getAll) ?? [];
  const lecturers = useQuery(api.lecturers.getAll) ?? [];
  const createIteration = useMutation(api.module_iterations.createIteration)
  const updateIteration = useMutation(api.module_iterations.updateIteration)
  const deleteIteration = useMutation(api.module_iterations.deleteIteration)
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();

  // Add semesters array for dropdown
  const semesters = [
    { value: 1, label: "Semester 1" },
    { value: 2, label: "Semester 2" },
    { value: 3, label: "Summer" },
  ];

  // Add assignment statuses
  const assignmentStatuses = [
    { value: "unassigned", label: "Unassigned" },
    { value: "assigned", label: "Assigned" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  // State for form fields
  const [form, setForm] = useState({
    moduleCode: "",
    title: "",
    semester: 1,
    cohortId: "",
    teachingStartDate: "",
    teachingHours: 0,
    markingHours: 0,
    assignedLecturerId: "",
    assignedLecturerIds: [] as string[],
    assignedStatus: "unassigned",
    notes: "",
    assessments: [] as Assessment[],
    sites: [] as Site[],
  })
  const [submitting, setSubmitting] = useState(false)

  // Assessment form state
  const [assessmentForm, setAssessmentForm] = useState<Assessment>({
    title: "",
    type: "",
    weighting: 0,
    submissionDate: "",
    marksDueDate: "",
    isSecondAttempt: false,
    externalExaminerRequired: false,
    alertsToTeam: false,
  });

  // Site form state
  const [siteForm, setSiteForm] = useState<Site>({
    name: "",
    deliveryTime: "",
    students: 0,
    groups: 1,
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: id === "semester" || id === "teachingHours" || id === "markingHours" 
        ? Number(value) 
        : value
    }));
  }

  const handleSelectChange = (field: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: typeof value === "number" ? value : (value === "none" ? "" : value)
    }));
  }

  const handleModuleCodeChange = (moduleCode: string) => {
    const selectedModule = modules.find(m => m.code === moduleCode);
    setForm(prev => ({
      ...prev,
      moduleCode,
      title: selectedModule?.title || "",
      teachingHours: selectedModule?.defaultTeachingHours || 0,
      markingHours: selectedModule?.defaultMarkingHours || 0,
    }));
  }

  const handleCreateIteration = async () => {
    if (!form.moduleCode.trim() || !form.title.trim() || !form.cohortId.trim()) {
      return;
    }

    setSubmitting(true)
    try {
      const newIterationId = await createIteration({
        ...form,
        assignedLecturerIds: form.assignedLecturerIds.map(id => id as Id<'lecturers'>)
      });
      await logRecentActivity({
        action: "module iteration created",
        changeType: "create",
        entity: "module_iteration",
        entityId: newIterationId,
        fullName: form.title,
        modifiedBy: user ? [{ name: user.fullName ?? "", email: user.primaryEmailAddress?.emailAddress ?? "" }] : [],
        permission: "default"
      });
      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create iteration:', error);
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateIteration = async () => {
    if (!selectedIteration) return;

    if (!form.moduleCode.trim() || !form.title.trim() || !form.cohortId.trim()) {
      return;
    }

    setSubmitting(true)
    try {
      await updateIteration({
        id: selectedIteration._id,
        ...form,
        assignedLecturerIds: form.assignedLecturerIds.map(id => id as Id<'lecturers'>)
      });
      await logRecentActivity({
        action: "module iteration updated",
        changeType: "update",
        entity: "module_iteration",
        entityId: selectedIteration._id,
        fullName: form.title,
        modifiedBy: user ? [{ name: user.fullName ?? "", email: user.primaryEmailAddress?.emailAddress ?? "" }] : [],
        permission: "default"
      });
      setModalOpen(false)
      setSelectedIteration(null)
      setIsEditing(false)
      resetForm()
    } catch (error) {
      console.error('Failed to update iteration:', error);
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm({
      moduleCode: "",
      title: "",
      semester: 1,
      cohortId: "",
      teachingStartDate: "",
      teachingHours: 0,
      markingHours: 0,
      assignedLecturerId: "",
      assignedLecturerIds: [],
      assignedStatus: "unassigned",
      notes: "",
      assessments: [],
      sites: [],
    })
    setAssessmentForm({
      title: "",
      type: "",
      weighting: 0,
      submissionDate: "",
      marksDueDate: "",
      isSecondAttempt: false,
      externalExaminerRequired: false,
      alertsToTeam: false,
    });
    setSiteForm({
      name: "",
      deliveryTime: "",
      students: 0,
      groups: 1,
    });
  }

  const handleOpenCreateModal = () => {
    setIsEditing(false)
    setSelectedIteration(null)
    resetForm()
    if (moduleFilter) {
      const selectedModule = modules.find(m => m.code === moduleFilter);
      setForm(prev => ({
        ...prev,
        moduleCode: moduleFilter,
        title: selectedModule?.title || "",
        teachingHours: selectedModule?.defaultTeachingHours || 0,
        markingHours: selectedModule?.defaultMarkingHours || 0,
      }));
    }
    setModalOpen(true)
  }

  const handleOpenEditModal = (iteration: ModuleIteration) => {
    setIsEditing(true)
    setSelectedIteration(iteration)
    setForm({
      moduleCode: iteration.moduleCode,
      title: iteration.title,
      semester: iteration.semester,
      cohortId: iteration.cohortId,
      teachingStartDate: iteration.teachingStartDate,
      teachingHours: iteration.teachingHours,
      markingHours: iteration.markingHours,
      assignedLecturerId: iteration.assignedLecturerIds?.[0] || "",
      assignedLecturerIds: iteration.assignedLecturerIds || [],
      assignedStatus: iteration.assignedStatus,
      notes: iteration.notes || "",
      assessments: iteration.assessments,
      sites: iteration.sites,
    })
    setModalOpen(true)
  }

  // Assessment management
  const addAssessment = () => {
    if (assessmentForm.title && assessmentForm.type) {
      setForm(prev => ({
        ...prev,
        assessments: [...prev.assessments, { ...assessmentForm }]
      }));
      setAssessmentForm({
        title: "",
        type: "",
        weighting: 0,
        submissionDate: "",
        marksDueDate: "",
        isSecondAttempt: false,
        externalExaminerRequired: false,
        alertsToTeam: false,
      });
    }
  };

  const removeAssessment = (index: number) => {
    setForm(prev => ({
      ...prev,
      assessments: prev.assessments.filter((_, i) => i !== index)
    }));
  };

  // Site management
  const addSite = () => {
    if (siteForm.name && siteForm.deliveryTime) {
      setForm(prev => ({
        ...prev,
        sites: [...prev.sites, { ...siteForm }]
      }));
      setSiteForm({
        name: "",
        deliveryTime: "",
        students: 0,
        groups: 1,
      });
    }
  };

  const removeSite = (index: number) => {
    setForm(prev => ({
      ...prev,
      sites: prev.sites.filter((_, i) => i !== index)
    }));
  };

  const filteredIterations = iterations.filter((iteration) => {
    const matchesSearch = 
      iteration.moduleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iteration.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iteration.cohortId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModuleFilter = moduleFilter ? iteration.moduleCode === moduleFilter : true;
    
    return matchesSearch && matchesModuleFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return <Badge variant="default" className="bg-green-600">Assigned</Badge>
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      case "unassigned":
      default:
        return <Badge variant="outline">Unassigned</Badge>
    }
  }

  const getSemesterBadge = (semester: number) => {
    const colors = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-yellow-100 text-yellow-800",
    }
    return <Badge className={colors[semester as keyof typeof colors]}>Semester {semester}</Badge>
  }

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [iterationToDelete, setIterationToDelete] = useState<ModuleIteration | null>(null);

  const confirmDeleteIteration = (iteration: ModuleIteration) => {
    setIterationToDelete(iteration);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!iterationToDelete || !iterationToDelete._id) return;
    await deleteIteration({ id: iterationToDelete._id });
    await logRecentActivity({
      action: "module iteration deleted",
      changeType: "delete",
      entity: "module_iteration",
      entityId: iterationToDelete._id,
      fullName: iterationToDelete.title,
      modifiedBy: user ? [{ name: user.fullName ?? "", email: user.primaryEmailAddress?.emailAddress ?? "" }] : [],
      permission: "default"
    });
    setDeleteDialogOpen(false);
    setIterationToDelete(null);
  };

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Module Iterations
            {moduleFilter && (
              <span className="text-lg font-normal text-gray-600 dark:text-gray-300 ml-2">
                - {moduleFilter}
              </span>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {moduleFilter 
              ? `Manage iterations for module ${moduleFilter}`
              : "Manage module iterations with teaching schedules and assessments"
            }
          </p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Iteration
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search iterations by module code, title, or cohort..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Iterations Table */}
      <Card className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Module Iterations ({filteredIterations.length})</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Overview of all module iterations and their configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-900 dark:text-white">Module</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Cohort</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Semester</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Teaching Hours</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Assessments</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Lecturers</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Sites</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIterations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground dark:text-gray-300">
                    No iterations to show.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIterations.map((iteration) => (
                  <TableRow key={iteration._id} className="cursor-pointer hover:bg-accent/40 dark:hover:bg-zinc-800">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{iteration.moduleCode}</div>
                        <div className="text-sm text-muted-foreground dark:text-gray-300">{iteration.title}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{iteration.cohortId}</TableCell>
                    <TableCell>{getSemesterBadge(iteration.semester)}</TableCell>
                    <TableCell>{getStatusBadge(iteration.assignedStatus)}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{iteration.teachingHours}h</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">{iteration.assessments.length}</Badge>
                        <span className="text-sm text-muted-foreground"></span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">{iteration.assignedLecturerIds?.length || 0}</Badge>
                        <span className="text-sm text-muted-foreground"></span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">{iteration.sites.length}</Badge>
                        <span className="text-sm text-muted-foreground"></span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); router.push(`/module-allocations?module=${iteration.moduleCode}`); }}>
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleOpenEditModal(iteration); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900" onClick={e => { e.stopPropagation(); confirmDeleteIteration(iteration); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Iteration Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {isEditing ? "Edit Module Iteration" : "Add New Module Iteration"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {isEditing ? "Update iteration details, assessments, and sites." : "Create a new module iteration with teaching schedule and assessments."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="moduleCode" className="text-gray-900 dark:text-white">Module Code</Label>
                <Select value={form.moduleCode} onValueChange={handleModuleCodeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map(module => (
                      <SelectItem key={module.code} value={module.code}>
                        {module.code} - {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester" className="text-gray-900 dark:text-white">Semester</Label>
                <Select value={form.semester.toString()} onValueChange={(value) => handleSelectChange("semester", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map(semester => (
                      <SelectItem key={semester.value} value={semester.value.toString()}>
                        {semester.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cohortId" className="text-gray-900 dark:text-white">Cohort ID</Label>
                <Input id="cohortId" value={form.cohortId} onChange={handleFormChange} placeholder="Sep24" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedStatus" className="text-gray-900 dark:text-white">Assignment Status</Label>
                <Select value={form.assignedStatus} onValueChange={(value) => handleSelectChange("assignedStatus", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignmentStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teachingStartDate" className="text-gray-900 dark:text-white">Teaching Start Date</Label>
                <Input id="teachingStartDate" type="date" value={form.teachingStartDate} onChange={handleFormChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teachingHours" className="text-gray-900 dark:text-white">Teaching Hours</Label>
                <Input id="teachingHours" type="number" min={0} value={form.teachingHours} onChange={handleFormChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="markingHours" className="text-gray-900 dark:text-white">Marking Hours</Label>
                <Input id="markingHours" type="number" min={0} value={form.markingHours} onChange={handleFormChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-900 dark:text-white">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={handleFormChange} placeholder="Additional notes..." />
            </div>

            {/* Assessments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assessments</h3>
                <Button type="button" variant="outline" size="sm" onClick={addAssessment}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Assessment
                </Button>
              </div>
              
              {/* Assessment Form */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="assessmentTitle" className="text-gray-900 dark:text-white">Title</Label>
                  <Input 
                    id="assessmentTitle" 
                    value={assessmentForm.title} 
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, title: e.target.value }))} 
                    placeholder="Case Study Essay" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessmentType" className="text-gray-900 dark:text-white">Type</Label>
                  <Input 
                    id="assessmentType" 
                    value={assessmentForm.type} 
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, type: e.target.value }))} 
                    placeholder="A1" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessmentWeighting" className="text-gray-900 dark:text-white">Weighting (%)</Label>
                  <Input 
                    id="assessmentWeighting" 
                    type="number" 
                    min={0} 
                    max={100} 
                    value={assessmentForm.weighting} 
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, weighting: Number(e.target.value) }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessmentSubmissionDate" className="text-gray-900 dark:text-white">Submission Date</Label>
                  <Input 
                    id="assessmentSubmissionDate" 
                    type="date" 
                    value={assessmentForm.submissionDate} 
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, submissionDate: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessmentMarksDueDate" className="text-gray-900 dark:text-white">Marks Due Date</Label>
                  <Input 
                    id="assessmentMarksDueDate" 
                    type="date" 
                    value={assessmentForm.marksDueDate} 
                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, marksDueDate: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2 flex items-center space-x-2">
                  <Checkbox 
                    id="assessmentSecondAttempt" 
                    checked={assessmentForm.isSecondAttempt} 
                    onCheckedChange={(checked) => setAssessmentForm(prev => ({ ...prev, isSecondAttempt: checked as boolean }))} 
                  />
                  <Label htmlFor="assessmentSecondAttempt" className="text-gray-900 dark:text-white">Second Attempt</Label>
                </div>
                <div className="space-y-2 flex items-center space-x-2">
                  <Checkbox 
                    id="assessmentExternalExaminer" 
                    checked={assessmentForm.externalExaminerRequired} 
                    onCheckedChange={(checked) => setAssessmentForm(prev => ({ ...prev, externalExaminerRequired: checked as boolean }))} 
                  />
                  <Label htmlFor="assessmentExternalExaminer" className="text-gray-900 dark:text-white">External Examiner Required</Label>
                </div>
                <div className="space-y-2 flex items-center space-x-2">
                  <Checkbox 
                    id="assessmentAlertsTeam" 
                    checked={assessmentForm.alertsToTeam} 
                    onCheckedChange={(checked) => setAssessmentForm(prev => ({ ...prev, alertsToTeam: checked as boolean }))} 
                  />
                  <Label htmlFor="assessmentAlertsTeam" className="text-gray-900 dark:text-white">Alerts to Team</Label>
                </div>
              </div>

              {/* Assessments List */}
              {form.assessments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Current Assessments:</h4>
                  {form.assessments.map((assessment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{assessment.title} ({assessment.type})</div>
                        <div className="text-sm text-muted-foreground dark:text-gray-300">
                          {assessment.weighting}% • Due: {assessment.submissionDate}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeAssessment(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sites Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Teaching Sites</h3>
                <Button type="button" variant="outline" size="sm" onClick={addSite}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Site
                </Button>
              </div>
              
              {/* Site Form */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-gray-900 dark:text-white">Site Name</Label>
                  <Input 
                    id="siteName" 
                    value={siteForm.name} 
                    onChange={(e) => setSiteForm(prev => ({ ...prev, name: e.target.value }))} 
                    placeholder="Main Campus" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDeliveryTime" className="text-gray-900 dark:text-white">Delivery Time</Label>
                  <Input 
                    id="siteDeliveryTime" 
                    value={siteForm.deliveryTime} 
                    onChange={(e) => setSiteForm(prev => ({ ...prev, deliveryTime: e.target.value }))} 
                    placeholder="Tues AM" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteStudents" className="text-gray-900 dark:text-white">Number of Students</Label>
                  <Input 
                    id="siteStudents" 
                    type="number" 
                    min={0} 
                    value={siteForm.students} 
                    onChange={(e) => setSiteForm(prev => ({ ...prev, students: Number(e.target.value) }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteGroups" className="text-gray-900 dark:text-white">Number of Groups</Label>
                  <Input 
                    id="siteGroups" 
                    type="number" 
                    min={1} 
                    value={siteForm.groups} 
                    onChange={(e) => setSiteForm(prev => ({ ...prev, groups: Number(e.target.value) }))} 
                  />
                </div>
              </div>

              {/* Sites List */}
              {form.sites.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Current Sites:</h4>
                  {form.sites.map((site, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{site.name}</div>
                        <div className="text-sm text-muted-foreground dark:text-gray-300">
                          {site.deliveryTime} • {site.students} students • {site.groups} groups
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeSite(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lecturer Assignment Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Lecturers</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const availableLecturers = lecturers.filter(l => !form.assignedLecturerIds.includes(l._id));
                  if (availableLecturers.length > 0) {
                    setForm(prev => ({
                      ...prev,
                      assignedLecturerIds: [...prev.assignedLecturerIds, availableLecturers[0]._id]
                    }));
                  }
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lecturer
                </Button>
              </div>
              
              {form.assignedLecturerIds.length > 0 ? (
                <div className="space-y-2">
                  {form.assignedLecturerIds.map((lecturerId, index) => {
                    const lecturer = lecturers.find(l => l._id === lecturerId);
                    return (
                      <div key={lecturerId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {lecturer?.fullName || "Unknown Lecturer"}
                            </div>
                            <div className="text-sm text-muted-foreground dark:text-gray-300">
                              {lecturer?.team || lecturer?.specialism || "No team/specialism"}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground dark:text-gray-300">
                            Site: {index < form.sites.length ? form.sites[index].name : "Unassigned"}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setForm(prev => ({
                              ...prev,
                              assignedLecturerIds: prev.assignedLecturerIds.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground dark:text-gray-300">
                  No lecturers assigned yet. Click &quot;Add Lecturer&quot; to assign lecturers to this iteration.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>Cancel</Button>
            </DialogClose>
            <Button 
              onClick={isEditing ? handleUpdateIteration : handleCreateIteration} 
              disabled={submitting || !form.moduleCode || !form.title || !form.cohortId}
            >
              {submitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Iteration" : "Create Iteration")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this module iteration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 