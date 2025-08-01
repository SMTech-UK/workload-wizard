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
import { Plus, Search, Edit, Eye, X, Calendar, BookOpen, GraduationCap } from "lucide-react"
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { toast } from "sonner";

// Define the Module interface based on new schema
export interface Module {
  _id: Id<'modules'>;
  code: string;
  title: string;
  description?: string;
  credits: number;
  level: number;
  moduleLeaderId?: Id<'lecturer_profiles'>;
  defaultTeachingHours: number;
  defaultMarkingHours: number;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface LecturerProfile {
  _id: Id<'lecturer_profiles'>;
  fullName: string;
  email: string;
  family: string;
  isActive: boolean;
}

interface ModuleIteration {
  _id: Id<'module_iterations'>;
  moduleId: Id<'modules'>;
  academicYearId: Id<'academic_years'>;
  semester: string;
  year: number;
  assignedLecturerIds: string[];
  assignedStatus: string;
  isActive: boolean;
}

export default function ModuleManagement() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data from Convex
  const modules = useQuery(api.modules.getAll, {}) ?? [];
  const lecturerProfiles = useQuery(api.lecturer_profiles.getAll, {}) ?? [];
  const moduleIterations = useQuery(api.module_iterations.getAll, {}) ?? [];
  const createModule = useMutation(api.modules.create);
  const updateModule = useMutation(api.modules.update);
  const deleteModule = useMutation(api.modules.delete);
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();
  const { currentAcademicYearId } = useAcademicYear();

  // Add levels array for dropdown
  const levels = [
    { value: 3, label: "Level 3" },
    { value: 4, label: "Level 4" },
    { value: 5, label: "Level 5" },
    { value: 6, label: "Level 6" },
    { value: 7, label: "Level 7" },
  ];

  // State for form fields
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    credits: 20,
    level: 0,
    moduleLeaderId: "",
    defaultTeachingHours: 120,
    defaultMarkingHours: 40,
  })
  const [submitting, setSubmitting] = useState(false)

  // Function to extract level from module code
  const extractLevelFromCode = (code: string): number | null => {
    const levelPattern = /^[A-Z]{2}(\d)[0-9]{4}[A-Z]$/;
    const match = code.toUpperCase().match(levelPattern);
    
    if (match) {
      const level = parseInt(match[1]);
      if (level >= 3 && level <= 7) {
        return level;
      }
    }
    return null;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));

    // Auto-detect level from code
    if (id === "code" && !form.level) {
      const detectedLevel = extractLevelFromCode(value);
      if (detectedLevel) {
        setForm(prev => ({ ...prev, level: detectedLevel }));
      }
    }
  };

  const handleSelectChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateModule = async () => {
    if (!form.code || !form.title || !form.level || !form.credits) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await createModule({
        code: form.code.toUpperCase(),
        title: form.title,
        description: form.description,
        credits: form.credits,
        level: form.level,
        moduleLeaderId: form.moduleLeaderId || undefined,
        defaultTeachingHours: form.defaultTeachingHours,
        defaultMarkingHours: form.defaultMarkingHours,
      });

      logRecentActivity({
        type: "create",
        entity: "module",
        description: `Created module: ${form.title}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

      toast.success("Module created successfully");
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error("Error creating module:", error);
      toast.error("Failed to create module");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateModule = async () => {
    if (!selectedModule || !form.code || !form.title || !form.level || !form.credits) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await updateModule({
        id: selectedModule._id,
        code: form.code.toUpperCase(),
        title: form.title,
        description: form.description,
        credits: form.credits,
        level: form.level,
        moduleLeaderId: form.moduleLeaderId || undefined,
        defaultTeachingHours: form.defaultTeachingHours,
        defaultMarkingHours: form.defaultMarkingHours,
      });

      logRecentActivity({
        type: "edit",
        entity: "module",
        description: `Updated module: ${form.title}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

      toast.success("Module updated successfully");
      resetForm();
      setModalOpen(false);
      setSelectedModule(null);
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("Failed to update module");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      code: "",
      title: "",
      description: "",
      credits: 20,
      level: 0,
      moduleLeaderId: "",
      defaultTeachingHours: 120,
      defaultMarkingHours: 40,
    });
    setIsEditing(false);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (module: Module) => {
    setSelectedModule(module);
    setForm({
      code: module.code,
      title: module.title,
      description: module.description || "",
      credits: module.credits,
      level: module.level,
      moduleLeaderId: module.moduleLeaderId || "",
      defaultTeachingHours: module.defaultTeachingHours,
      defaultMarkingHours: module.defaultMarkingHours,
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const getLevelBadge = (level: number) => {
    const colors = {
      3: "bg-blue-100 text-blue-800",
      4: "bg-green-100 text-green-800",
      5: "bg-yellow-100 text-yellow-800",
      6: "bg-purple-100 text-purple-800",
      7: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        Level {level}
      </Badge>
    );
  };

  const getModuleLeaderName = (moduleLeaderId?: Id<'lecturer_profiles'>) => {
    if (!moduleLeaderId) return "Not assigned";
    const leader = lecturerProfiles.find(p => p._id === moduleLeaderId);
    return leader?.fullName || "Unknown";
  };

  const getIterationCount = (moduleId: Id<'modules'>) => {
    return moduleIterations.filter(mi => mi.moduleId === moduleId).length;
  };

  const getCurrentYearIterations = (moduleId: Id<'modules'>) => {
    return moduleIterations.filter(mi => 
      mi.moduleId === moduleId && mi.academicYearId === currentAcademicYearId
    ).length;
  };

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getModuleLeaderName(module.moduleLeaderId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Module Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage academic modules and their configurations
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Module
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{modules.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Modules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {modules.filter(m => m.isActive).length}
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Iterations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{moduleIterations.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-zinc-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Year</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {moduleIterations.filter(mi => mi.academicYearId === currentAcademicYearId).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white dark:bg-zinc-900">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search modules by name, code, or module leader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" disabled>
              <span className="text-xs">Coming Soon</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modules Table */}
      <Card className="bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle>Modules</CardTitle>
          <CardDescription>
            A list of all academic modules in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Module Leader</TableHead>
                <TableHead>Teaching Hours</TableHead>
                <TableHead>Iterations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.map((module) => (
                <TableRow key={module._id}>
                  <TableCell className="font-medium">{module.code}</TableCell>
                  <TableCell>{module.title}</TableCell>
                  <TableCell>{getLevelBadge(module.level)}</TableCell>
                  <TableCell>{module.credits}</TableCell>
                  <TableCell>{getModuleLeaderName(module.moduleLeaderId)}</TableCell>
                  <TableCell>{module.defaultTeachingHours}h</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Total: {getIterationCount(module._id)}</div>
                      <div>Current: {getCurrentYearIterations(module._id)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={module.isActive ? "default" : "secondary"}>
                      {module.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(module)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" disabled>
                        <span className="text-xs">Coming Soon</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Module Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Module" : "Create New Module"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Update module information" : "Add a new module to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Module Code *</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={handleFormChange}
                  placeholder="e.g., CS70133X"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select value={form.level.toString()} onValueChange={(value) => handleSelectChange("level", parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value.toString()}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Module Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g., Advanced Software Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Module description..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  type="number"
                  value={form.credits}
                  onChange={handleFormChange}
                  placeholder="20"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTeachingHours">Teaching Hours</Label>
                <Input
                  id="defaultTeachingHours"
                  type="number"
                  value={form.defaultTeachingHours}
                  onChange={handleFormChange}
                  placeholder="120"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultMarkingHours">Marking Hours</Label>
                <Input
                  id="defaultMarkingHours"
                  type="number"
                  value={form.defaultMarkingHours}
                  onChange={handleFormChange}
                  placeholder="40"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleLeaderId">Module Leader</Label>
              <Select value={form.moduleLeaderId} onValueChange={(value) => handleSelectChange("moduleLeaderId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not assigned</SelectItem>
                  {lecturerProfiles.map((profile) => (
                    <SelectItem key={profile._id} value={profile._id}>
                      {profile.fullName} ({profile.family})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </DialogClose>
            <Button 
              onClick={isEditing ? handleUpdateModule : handleCreateModule}
              disabled={submitting}
            >
              {submitting ? "Saving..." : isEditing ? "Update Module" : "Create Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 