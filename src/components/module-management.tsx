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
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Eye, X } from "lucide-react"
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import type { Id } from "../../convex/_generated/dataModel";

// Define the Module interface
export interface Module {
  _id: Id<'modules'>;
  code: string;
  title: string;
  credits: number;
  level: number;
  moduleLeader: string;
  defaultTeachingHours: number;
  defaultMarkingHours: number;
}

export default function ModuleManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const modules = useQuery(api.modules.getAll) ?? [];
  const createModule = useMutation(api.modules.createModule)
  const updateModule = useMutation(api.modules.updateModule)
  const deleteModule = useMutation(api.modules.deleteModule)
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();

  // Add levels array for dropdown
  const levels = [
    { value: 4, label: "Level 4" },
    { value: 5, label: "Level 5" },
    { value: 6, label: "Level 6" },
    { value: 7, label: "Level 7" },
  ];

  // State for form fields
  const [form, setForm] = useState({
    code: "",
    title: "",
    credits: 20,
    level: 7,
    moduleLeader: "",
    defaultTeachingHours: 120,
    defaultMarkingHours: 40,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: id === "credits" || id === "level" || id === "defaultTeachingHours" || id === "defaultMarkingHours" 
        ? Number(value) 
        : value
    }));
  }

  const handleSelectChange = (field: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: typeof value === "number" ? value : Number(value)
    }));
  }

  const handleCreateModule = async () => {
    // Validate form
    if (!form.code.trim() || !form.title.trim() || !form.moduleLeader.trim()) {
      return;
    }

    setSubmitting(true)
    try {
      const newModuleId = await createModule(form);
      // Log recent activity
      await logRecentActivity({
        action: "module created",
        changeType: "create",
        entity: "module",
        entityId: newModuleId,
        fullName: form.title,
        modifiedBy: user ? [{ name: user.fullName ?? "", email: user.primaryEmailAddress?.emailAddress ?? "" }] : [],
        permission: "default"
      });
      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create module:', error);
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateModule = async () => {
    if (!selectedModule) return;

    // Validate form
    if (!form.code.trim() || !form.title.trim() || !form.moduleLeader.trim()) {
      return;
    }

    setSubmitting(true)
    try {
      await updateModule({
        id: selectedModule._id,
        ...form
      });
      // Log recent activity
      await logRecentActivity({
        action: "module updated",
        changeType: "update",
        entity: "module",
        entityId: selectedModule._id,
        fullName: form.title,
        modifiedBy: user ? [{ name: user.fullName ?? "", email: user.primaryEmailAddress?.emailAddress ?? "" }] : [],
        permission: "default"
      });
      setModalOpen(false)
      setSelectedModule(null)
      setIsEditing(false)
      resetForm()
    } catch (error) {
      console.error('Failed to update module:', error);
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm({
      code: "",
      title: "",
      credits: 20,
      level: 7,
      moduleLeader: "",
      defaultTeachingHours: 120,
      defaultMarkingHours: 40,
    })
  }

  const handleOpenCreateModal = () => {
    setIsEditing(false)
    setSelectedModule(null)
    resetForm()
    setModalOpen(true)
  }

  const handleOpenEditModal = (module: Module) => {
    setIsEditing(true)
    setSelectedModule(module)
    setForm({
      code: module.code,
      title: module.title,
      credits: module.credits,
      level: module.level,
      moduleLeader: module.moduleLeader,
      defaultTeachingHours: module.defaultTeachingHours,
      defaultMarkingHours: module.defaultMarkingHours,
    })
    setModalOpen(true)
  }

  const filteredModules = modules.filter((module) => {
    return (
      module.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.moduleLeader?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getLevelBadge = (level: number) => {
    const colors = {
      4: "bg-blue-100 text-blue-800",
      5: "bg-green-100 text-green-800",
      6: "bg-yellow-100 text-yellow-800",
      7: "bg-purple-100 text-purple-800",
    }
    return <Badge className={colors[level as keyof typeof colors]}>Level {level}</Badge>
  }

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);

  const confirmDeleteModule = (module: Module) => {
    setModuleToDelete(module);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!moduleToDelete || !moduleToDelete._id) return;
    await deleteModule({ id: moduleToDelete._id });
    await logRecentActivity({
      action: "module deleted",
      changeType: "delete",
      entity: "module",
      entityId: moduleToDelete._id,
      fullName: moduleToDelete.title,
      modifiedBy: user ? [{ name: user.fullName ?? "", email: user.primaryEmailAddress?.emailAddress ?? "" }] : [],
      permission: "default"
    });
    setDeleteDialogOpen(false);
    setModuleToDelete(null);
  };

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Module Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage academic modules and their configurations</p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Module
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
              placeholder="Search modules by code, title, or module leader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Modules Table */}
      <Card className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Academic Modules ({filteredModules.length})</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Overview of all academic modules and their configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-900 dark:text-white">Code</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Title</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Level</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Credits</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Module Leader</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Teaching Hours</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Marking Hours</TableHead>
                <TableHead className="text-gray-900 dark:text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground dark:text-gray-300">
                    No modules to show.
                  </TableCell>
                </TableRow>
              ) : (
                filteredModules.map((module) => (
                  <TableRow key={module._id} className="cursor-pointer hover:bg-accent/40 dark:hover:bg-zinc-800">
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-white">{module.code}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-gray-900 dark:text-white" title={module.title}>
                        {module.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getLevelBadge(module.level)}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{module.credits}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{module.moduleLeader}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{module.defaultTeachingHours}h</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{module.defaultMarkingHours}h</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleOpenEditModal(module); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900" onClick={e => { e.stopPropagation(); confirmDeleteModule(module); }}>
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

      {/* Create/Edit Module Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {isEditing ? "Edit Module" : "Add New Module"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {isEditing ? "Update module details and configurations." : "Create a new module with details and default hours."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-900 dark:text-white">Module Code</Label>
              <Input id="code" value={form.code} onChange={handleFormChange} placeholder="NS70133X" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level" className="text-gray-900 dark:text-white">Level</Label>
              <Select value={form.level.toString()} onValueChange={(value) => handleSelectChange("level", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title" className="text-gray-900 dark:text-white">Module Title</Label>
              <Input id="title" value={form.title} onChange={handleFormChange} placeholder="Effective and Creative Mental Health Care" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits" className="text-gray-900 dark:text-white">Credits</Label>
              <Input id="credits" type="number" min={1} max={60} value={form.credits} onChange={handleFormChange} placeholder="20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleLeader" className="text-gray-900 dark:text-white">Module Leader</Label>
              <Input id="moduleLeader" value={form.moduleLeader} onChange={handleFormChange} placeholder="Dr. Michael Johnson" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultTeachingHours" className="text-gray-900 dark:text-white">Default Teaching Hours</Label>
              <Input id="defaultTeachingHours" type="number" min={0} value={form.defaultTeachingHours} onChange={handleFormChange} placeholder="120" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultMarkingHours" className="text-gray-900 dark:text-white">Default Marking Hours</Label>
              <Input id="defaultMarkingHours" type="number" min={0} value={form.defaultMarkingHours} onChange={handleFormChange} placeholder="40" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>Cancel</Button>
            </DialogClose>
            <Button 
              onClick={isEditing ? handleUpdateModule : handleCreateModule} 
              disabled={submitting || !form.code || !form.title || !form.moduleLeader}
            >
              {submitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Module" : "Create Module")}
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
              Are you sure you want to delete this module? This action cannot be undone.
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