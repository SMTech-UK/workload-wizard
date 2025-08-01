"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api";
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
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Edit, Eye, AlertTriangle, X, FileText, Clock, Calendar, CheckCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import type { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// Define interfaces based on the database schema
interface AssessmentType {
  _id: Id<'assessment_types'>;
  name: string;
  code: string;
  description?: string;
  defaultWeighting: number;
  defaultHours: number;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface ModuleIterationAssessment {
  _id: Id<'module_iteration_assessments'>;
  moduleIterationId: Id<'module_iterations'>;
  assessmentTypeId: Id<'assessment_types'>;
  name: string;
  description?: string;
  weighting: number;
  hours: number;
  dueDate?: string;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface ModuleIteration {
  _id: Id<'module_iterations'>;
  moduleId: Id<'modules'>;
  academicYearId: Id<'academic_years'>;
  cohortId?: Id<'cohorts'>;
  semester: number;
  deliveryMode: string;
  isActive: boolean;
}

interface Module {
  _id: Id<'modules'>;
  name: string;
  code: string;
  credits: number;
  isActive: boolean;
}

export default function AssessmentManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<AssessmentType | null>(null)
  const [selectedModuleAssessment, setSelectedModuleAssessment] = useState<ModuleIterationAssessment | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [moduleAssessmentModalOpen, setModuleAssessmentModalOpen] = useState(false);
  const [createModuleAssessmentModalOpen, setCreateModuleAssessmentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"types" | "assessments">("types");
  
  const [newAssessmentTypeData, setNewAssessmentTypeData] = useState({
    name: "",
    code: "",
    description: "",
    defaultWeighting: 0,
    defaultHours: 0,
  });

  const [newModuleAssessmentData, setNewModuleAssessmentData] = useState({
    moduleIterationId: "" as Id<'module_iterations'>,
    assessmentTypeId: "" as Id<'assessment_types'>,
    name: "",
    description: "",
    weighting: 0,
    hours: 0,
    dueDate: "",
  });

  const { user } = useUser();
  const logActivity = useLogRecentActivity();
  
  // Fetch data
  const assessmentTypes = useQuery(api.assessment_types.getAll, {}) ?? [];
  const moduleIterationAssessments = useQuery(api.module_iteration_assessments.getAll, {}) ?? [];
  const moduleIterations = useQuery(api.module_iterations.getAll, {}) ?? [];
  const modules = useQuery(api.modules.getAll, {}) ?? [];
  
  // Mutations
  const createAssessmentType = useMutation(api.assessment_types.create);
  const updateAssessmentType = useMutation(api.assessment_types.update);
  const deleteAssessmentType = useMutation(api.assessment_types.remove);
  const createModuleIterationAssessment = useMutation(api.module_iteration_assessments.create);
  const updateModuleIterationAssessment = useMutation(api.module_iteration_assessments.update);
  const deleteModuleIterationAssessment = useMutation(api.module_iteration_assessments.remove);

  const filteredAssessmentTypes = assessmentTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModuleAssessments = moduleIterationAssessments.filter(assessment => {
    const moduleIteration = moduleIterations.find(mi => mi._id === assessment.moduleIterationId);
    const module = moduleIteration ? modules.find(m => m._id === moduleIteration.moduleId) : null;
    const assessmentType = assessmentTypes.find(at => at._id === assessment.assessmentTypeId);
    
    return (module?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
           (assessmentType?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
           assessment.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getModuleName = (moduleIterationId: Id<'module_iterations'>) => {
    const moduleIteration = moduleIterations.find(mi => mi._id === moduleIterationId);
    if (!moduleIteration) return "Unknown Module";
    
    const module = modules.find(m => m._id === moduleIteration.moduleId);
    return module?.name || "Unknown Module";
  };

  const getModuleCode = (moduleIterationId: Id<'module_iterations'>) => {
    const moduleIteration = moduleIterations.find(mi => mi._id === moduleIterationId);
    if (!moduleIteration) return "Unknown";
    
    const module = modules.find(m => m._id === moduleIteration.moduleId);
    return module?.code || "Unknown";
  };

  const getAssessmentTypeName = (assessmentTypeId: Id<'assessment_types'>) => {
    const assessmentType = assessmentTypes.find(at => at._id === assessmentTypeId);
    return assessmentType?.name || "Unknown";
  };

  const getAssessmentTypeCode = (assessmentTypeId: Id<'assessment_types'>) => {
    const assessmentType = assessmentTypes.find(at => at._id === assessmentTypeId);
    return assessmentType?.code || "Unknown";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const handleCreateAssessmentType = async () => {
    try {
      if (!newAssessmentTypeData.name || !newAssessmentTypeData.code || newAssessmentTypeData.defaultWeighting <= 0 || newAssessmentTypeData.defaultHours <= 0) {
        toast.error("Please fill in all required fields");
        return;
      }

      const assessmentTypeId = await createAssessmentType(newAssessmentTypeData);

      toast.success("Assessment type created successfully");
      setCreateModalOpen(false);
      setNewAssessmentTypeData({
        name: "",
        code: "",
        description: "",
        defaultWeighting: 0,
        defaultHours: 0,
      });

      if (user) {
        logActivity({
          action: "Created assessment type",
          details: newAssessmentTypeData.name,
          entityType: "assessment_type",
          entityId: assessmentTypeId,
        });
      }
    } catch (error) {
      toast.error(`Failed to create assessment type: ${error}`);
    }
  };

  const handleUpdateAssessmentType = async () => {
    if (!selectedAssessmentType) return;

    try {
      await updateAssessmentType({
        id: selectedAssessmentType._id,
        ...newAssessmentTypeData,
      });

      toast.success("Assessment type updated successfully");
      setModalOpen(false);
      setSelectedAssessmentType(null);

      if (user) {
        logActivity({
          action: "Updated assessment type",
          details: selectedAssessmentType.name,
          entityType: "assessment_type",
          entityId: selectedAssessmentType._id,
        });
      }
    } catch (error) {
      toast.error(`Failed to update assessment type: ${error}`);
    }
  };

  const handleDeleteAssessmentType = async (assessmentTypeId: Id<'assessment_types'>, assessmentTypeName: string) => {
    if (!confirm(`Are you sure you want to delete the assessment type "${assessmentTypeName}"?`)) {
      return;
    }

    try {
      await deleteAssessmentType({ id: assessmentTypeId });
      toast.success("Assessment type deleted successfully");

      if (user) {
        logActivity({
          action: "Deleted assessment type",
          details: assessmentTypeName,
          entityType: "assessment_type",
          entityId: assessmentTypeId,
        });
      }
    } catch (error) {
      toast.error(`Failed to delete assessment type: ${error}`);
    }
  };

  const handleCreateModuleAssessment = async () => {
    try {
      if (!newModuleAssessmentData.moduleIterationId || !newModuleAssessmentData.assessmentTypeId || !newModuleAssessmentData.name || newModuleAssessmentData.weighting <= 0 || newModuleAssessmentData.hours <= 0) {
        toast.error("Please fill in all required fields");
        return;
      }

      const moduleAssessmentId = await createModuleIterationAssessment(newModuleAssessmentData);

      toast.success("Module assessment created successfully");
      setCreateModuleAssessmentModalOpen(false);
      setNewModuleAssessmentData({
        moduleIterationId: "" as Id<'module_iterations'>,
        assessmentTypeId: "" as Id<'assessment_types'>,
        name: "",
        description: "",
        weighting: 0,
        hours: 0,
        dueDate: "",
      });

      if (user) {
        logActivity({
          action: "Created module assessment",
          details: newModuleAssessmentData.name,
          entityType: "module_iteration_assessment",
          entityId: moduleAssessmentId,
        });
      }
    } catch (error) {
      toast.error(`Failed to create module assessment: ${error}`);
    }
  };

  const handleUpdateModuleAssessment = async () => {
    if (!selectedModuleAssessment) return;

    try {
      await updateModuleIterationAssessment({
        id: selectedModuleAssessment._id,
        ...newModuleAssessmentData,
      });

      toast.success("Module assessment updated successfully");
      setModuleAssessmentModalOpen(false);
      setSelectedModuleAssessment(null);

      if (user) {
        logActivity({
          action: "Updated module assessment",
          details: selectedModuleAssessment.name,
          entityType: "module_iteration_assessment",
          entityId: selectedModuleAssessment._id,
        });
      }
    } catch (error) {
      toast.error(`Failed to update module assessment: ${error}`);
    }
  };

  const handleDeleteModuleAssessment = async (assessmentId: Id<'module_iteration_assessments'>, assessmentName: string) => {
    if (!confirm(`Are you sure you want to delete the module assessment "${assessmentName}"?`)) {
      return;
    }

    try {
      await deleteModuleIterationAssessment({ id: assessmentId });
      toast.success("Module assessment deleted successfully");

      if (user) {
        logActivity({
          action: "Deleted module assessment",
          details: assessmentName,
          entityType: "module_iteration_assessment",
          entityId: assessmentId,
        });
      }
    } catch (error) {
      toast.error(`Failed to delete module assessment: ${error}`);
    }
  };

  const openEditAssessmentTypeModal = (assessmentType: AssessmentType) => {
    setSelectedAssessmentType(assessmentType);
    setNewAssessmentTypeData({
      name: assessmentType.name,
      code: assessmentType.code,
      description: assessmentType.description || "",
      defaultWeighting: assessmentType.defaultWeighting,
      defaultHours: assessmentType.defaultHours,
    });
    setModalOpen(true);
  };

  const openEditModuleAssessmentModal = (moduleAssessment: ModuleIterationAssessment) => {
    setSelectedModuleAssessment(moduleAssessment);
    setNewModuleAssessmentData({
      moduleIterationId: moduleAssessment.moduleIterationId,
      assessmentTypeId: moduleAssessment.assessmentTypeId,
      name: moduleAssessment.name,
      description: moduleAssessment.description || "",
      weighting: moduleAssessment.weighting,
      hours: moduleAssessment.hours,
      dueDate: moduleAssessment.dueDate || "",
    });
    setModuleAssessmentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessment Management</h1>
          <p className="text-muted-foreground">
            Manage assessment types and module assessments
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "types" && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Assessment Type
            </Button>
          )}
          {activeTab === "assessments" && (
            <Button onClick={() => setCreateModuleAssessmentModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Module Assessment
            </Button>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          variant={activeTab === "types" ? "default" : "outline"}
          onClick={() => setActiveTab("types")}
        >
          Assessment Types
        </Button>
        <Button
          variant={activeTab === "assessments" ? "default" : "outline"}
          onClick={() => setActiveTab("assessments")}
        >
          Module Assessments
        </Button>
      </div>

      {activeTab === "types" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assessment Types</CardTitle>
                <CardDescription>
                  {filteredAssessmentTypes.length} assessment types
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assessment types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Default Weighting</TableHead>
                  <TableHead>Default Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessmentTypes.map((assessmentType) => (
                  <TableRow key={assessmentType._id}>
                    <TableCell className="font-medium">{assessmentType.code}</TableCell>
                    <TableCell>{assessmentType.name}</TableCell>
                    <TableCell>
                      {assessmentType.description ? (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {assessmentType.description}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No description</span>
                      )}
                    </TableCell>
                    <TableCell>{assessmentType.defaultWeighting}%</TableCell>
                    <TableCell>{assessmentType.defaultHours} hours</TableCell>
                    <TableCell>
                      <Badge variant={assessmentType.isActive ? "default" : "secondary"}>
                        {assessmentType.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditAssessmentTypeModal(assessmentType)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit assessment type</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAssessmentType(assessmentType._id, assessmentType.name)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete assessment type</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "assessments" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Module Assessments</CardTitle>
                <CardDescription>
                  {filteredModuleAssessments.length} module assessments
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search module assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Weighting</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModuleAssessments.map((moduleAssessment) => (
                  <TableRow key={moduleAssessment._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getModuleName(moduleAssessment.moduleIterationId)}</div>
                        <div className="text-sm text-muted-foreground">{getModuleCode(moduleAssessment.moduleIterationId)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{moduleAssessment.name}</div>
                        {moduleAssessment.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {moduleAssessment.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getAssessmentTypeName(moduleAssessment.assessmentTypeId)}</div>
                        <div className="text-sm text-muted-foreground">{getAssessmentTypeCode(moduleAssessment.assessmentTypeId)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{moduleAssessment.weighting}%</TableCell>
                    <TableCell>{moduleAssessment.hours} hours</TableCell>
                    <TableCell>{formatDate(moduleAssessment.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant={moduleAssessment.isActive ? "default" : "secondary"}>
                        {moduleAssessment.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModuleAssessmentModal(moduleAssessment)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit module assessment</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteModuleAssessment(moduleAssessment._id, moduleAssessment.name)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete module assessment</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Assessment Type Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Assessment Type</DialogTitle>
            <DialogDescription>
              Add a new assessment type to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={newAssessmentTypeData.code}
                  onChange={(e) => setNewAssessmentTypeData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., EXAM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newAssessmentTypeData.name}
                  onChange={(e) => setNewAssessmentTypeData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Final Examination"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAssessmentTypeData.description}
                onChange={(e) => setNewAssessmentTypeData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of the assessment type..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultWeighting">Default Weighting (%) *</Label>
                <Input
                  id="defaultWeighting"
                  type="number"
                  min="0"
                  max="100"
                  value={newAssessmentTypeData.defaultWeighting}
                  onChange={(e) => setNewAssessmentTypeData(prev => ({ ...prev, defaultWeighting: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultHours">Default Hours *</Label>
                <Input
                  id="defaultHours"
                  type="number"
                  min="0"
                  value={newAssessmentTypeData.defaultHours}
                  onChange={(e) => setNewAssessmentTypeData(prev => ({ ...prev, defaultHours: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateAssessmentType}>Create Assessment Type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assessment Type Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Assessment Type</DialogTitle>
            <DialogDescription>
              Update assessment type information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code *</Label>
                <Input
                  id="edit-code"
                  value={newAssessmentTypeData.code}
                  onChange={(e) => setNewAssessmentTypeData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., EXAM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={newAssessmentTypeData.name}
                  onChange={(e) => setNewAssessmentTypeData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Final Examination"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newAssessmentTypeData.description}
                onChange={(e) => setNewAssessmentTypeData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of the assessment type..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-defaultWeighting">Default Weighting (%) *</Label>
                <Input
                  id="edit-defaultWeighting"
                  type="number"
                  min="0"
                  max="100"
                  value={newAssessmentTypeData.defaultWeighting}
                  onChange={(e) => setNewAssessmentTypeData(prev => ({ ...prev, defaultWeighting: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-defaultHours">Default Hours *</Label>
                <Input
                  id="edit-defaultHours"
                  type="number"
                  min="0"
                  value={newAssessmentTypeData.defaultHours}
                  onChange={(e) => setNewAssessmentTypeData(prev => ({ ...prev, defaultHours: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateAssessmentType}>Update Assessment Type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Module Assessment Modal */}
      <Dialog open={createModuleAssessmentModalOpen} onOpenChange={setCreateModuleAssessmentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Module Assessment</DialogTitle>
            <DialogDescription>
              Add a new assessment to a module iteration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="moduleIteration">Module Iteration *</Label>
              <Select
                value={newModuleAssessmentData.moduleIterationId}
                onValueChange={(value) => setNewModuleAssessmentData(prev => ({ ...prev, moduleIterationId: value as Id<'module_iterations'> }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select module iteration" />
                </SelectTrigger>
                <SelectContent>
                  {moduleIterations.map((moduleIteration) => {
                    const module = modules.find(m => m._id === moduleIteration.moduleId);
                    return (
                      <SelectItem key={moduleIteration._id} value={moduleIteration._id}>
                        {module?.name || "Unknown"} - Semester {moduleIteration.semester}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentType">Assessment Type *</Label>
              <Select
                value={newModuleAssessmentData.assessmentTypeId}
                onValueChange={(value) => setNewModuleAssessmentData(prev => ({ ...prev, assessmentTypeId: value as Id<'assessment_types'> }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment type" />
                </SelectTrigger>
                <SelectContent>
                  {assessmentTypes.map((assessmentType) => (
                    <SelectItem key={assessmentType._id} value={assessmentType._id}>
                      {assessmentType.name} ({assessmentType.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentName">Assessment Name *</Label>
              <Input
                id="assessmentName"
                value={newModuleAssessmentData.name}
                onChange={(e) => setNewModuleAssessmentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Final Project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentDescription">Description</Label>
              <Textarea
                id="assessmentDescription"
                value={newModuleAssessmentData.description}
                onChange={(e) => setNewModuleAssessmentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of the assessment..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weighting">Weighting (%) *</Label>
                <Input
                  id="weighting"
                  type="number"
                  min="0"
                  max="100"
                  value={newModuleAssessmentData.weighting}
                  onChange={(e) => setNewModuleAssessmentData(prev => ({ ...prev, weighting: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Hours *</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  value={newModuleAssessmentData.hours}
                  onChange={(e) => setNewModuleAssessmentData(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newModuleAssessmentData.dueDate}
                onChange={(e) => setNewModuleAssessmentData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateModuleAssessment}>Create Module Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Module Assessment Modal */}
      <Dialog open={moduleAssessmentModalOpen} onOpenChange={setModuleAssessmentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Module Assessment</DialogTitle>
            <DialogDescription>
              Update module assessment information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-moduleIteration">Module Iteration *</Label>
              <Select
                value={newModuleAssessmentData.moduleIterationId}
                onValueChange={(value) => setNewModuleAssessmentData(prev => ({ ...prev, moduleIterationId: value as Id<'module_iterations'> }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select module iteration" />
                </SelectTrigger>
                <SelectContent>
                  {moduleIterations.map((moduleIteration) => {
                    const module = modules.find(m => m._id === moduleIteration.moduleId);
                    return (
                      <SelectItem key={moduleIteration._id} value={moduleIteration._id}>
                        {module?.name || "Unknown"} - Semester {moduleIteration.semester}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-assessmentType">Assessment Type *</Label>
              <Select
                value={newModuleAssessmentData.assessmentTypeId}
                onValueChange={(value) => setNewModuleAssessmentData(prev => ({ ...prev, assessmentTypeId: value as Id<'assessment_types'> }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment type" />
                </SelectTrigger>
                <SelectContent>
                  {assessmentTypes.map((assessmentType) => (
                    <SelectItem key={assessmentType._id} value={assessmentType._id}>
                      {assessmentType.name} ({assessmentType.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-assessmentName">Assessment Name *</Label>
              <Input
                id="edit-assessmentName"
                value={newModuleAssessmentData.name}
                onChange={(e) => setNewModuleAssessmentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Final Project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-assessmentDescription">Description</Label>
              <Textarea
                id="edit-assessmentDescription"
                value={newModuleAssessmentData.description}
                onChange={(e) => setNewModuleAssessmentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of the assessment..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-weighting">Weighting (%) *</Label>
                <Input
                  id="edit-weighting"
                  type="number"
                  min="0"
                  max="100"
                  value={newModuleAssessmentData.weighting}
                  onChange={(e) => setNewModuleAssessmentData(prev => ({ ...prev, weighting: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hours">Hours *</Label>
                <Input
                  id="edit-hours"
                  type="number"
                  min="0"
                  value={newModuleAssessmentData.hours}
                  onChange={(e) => setNewModuleAssessmentData(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={newModuleAssessmentData.dueDate}
                onChange={(e) => setNewModuleAssessmentData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateModuleAssessment}>Update Module Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 