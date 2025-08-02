"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { useMutation } from "convex/react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Eye, AlertTriangle, X, Building, Users, Clock, Settings } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import type { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// Define interfaces based on the database schema
interface Faculty {
  _id: Id<'faculties'>;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface Department {
  _id: Id<'departments'>;
  name: string;
  code: string;
  description?: string;
  facultyId?: Id<'faculties'>;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface AllocationType {
  _id: Id<'allocation_types'>;
  name: string;
  description?: string;
  defaultHours: number;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

export default function ReferenceDataManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [selectedAllocationType, setSelectedAllocationType] = useState<AllocationType | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"faculties" | "departments" | "allocationTypes">("faculties");
  
  const [newFacultyData, setNewFacultyData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [newDepartmentData, setNewDepartmentData] = useState({
    name: "",
    code: "",
    description: "",
    facultyId: undefined as Id<'faculties'> | undefined,
  });

  const [newAllocationTypeData, setNewAllocationTypeData] = useState({
    name: "",
    description: "",
    defaultHours: 0,
  });

  const { user } = useUser();
  const logActivity = useLogRecentActivity();
  
  // Fetch data
  const faculties = useQuery('faculties:getAll' as any, {}) ?? [];
  const departments = useQuery('departments:getAll' as any, {}) ?? [];
  const allocationTypes = useQuery('allocation_types:getAll' as any, {}) ?? [];
  
  // Mutations
  const createFaculty = useMutation('faculties:create' as any);
  const updateFaculty = useMutation('faculties:update' as any);
  const deleteFaculty = useMutation('faculties:remove' as any);
  const createDepartment = useMutation('departments:create' as any);
  const updateDepartment = useMutation('departments:update' as any);
  const deleteDepartment = useMutation('departments:remove' as any);
  const createAllocationType = useMutation('allocation_types:create' as any);
  const updateAllocationType = useMutation('allocation_types:update' as any);
  const deleteAllocationType = useMutation('allocation_types:remove' as any);

  const filteredFaculties = faculties.filter((faculty: any) =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDepartments = departments.filter((department: any) =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAllocationTypes = allocationTypes.filter((allocationType: any) =>
    allocationType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFacultyName = (facultyId?: Id<'faculties'>) => {
    if (!facultyId) return "Not assigned";
    const faculty = faculties.find((f: any) => f._id === facultyId);
    return faculty?.name || "Unknown";
  };

  const handleCreateFaculty = async () => {
    try {
      if (!newFacultyData.name || !newFacultyData.code) {
        toast.error("Please fill in all required fields");
        return;
      }

      const facultyId = await createFaculty(newFacultyData);

      toast.success("Faculty created successfully");
      setCreateModalOpen(false);
      setNewFacultyData({
        name: "",
        code: "",
        description: "",
      });

      if (user) {
        logActivity({
          type: "create", // Change from 'action' to 'type'
          entity: "faculty", // Change from 'entityType' to 'entity'
          description: `Created faculty: ${newFacultyData.name}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to create faculty: ${error}`);
    }
  };

  const handleUpdateFaculty = async () => {
    if (!selectedFaculty) return;

    try {
      await updateFaculty({
        id: selectedFaculty._id,
        ...newFacultyData,
      });

      toast.success("Faculty updated successfully");
      setModalOpen(false);
      setSelectedFaculty(null);

      if (user) {
        logActivity({
          type: "edit", // Change from 'action' to 'type'
          entity: "faculty", // Change from 'entityType' to 'entity'
          description: `Updated faculty: ${selectedFaculty.name}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to update faculty: ${error}`);
    }
  };

  const handleDeleteFaculty = async (facultyId: Id<'faculties'>, facultyName: string) => {
    if (!confirm(`Are you sure you want to delete the faculty "${facultyName}"?`)) {
      return;
    }

    try {
      await deleteFaculty({ id: facultyId });
      toast.success("Faculty deleted successfully");

      if (user) {
        logActivity({
          type: "delete", // Change from 'action' to 'type'
          entity: "faculty", // Change from 'entityType' to 'entity'
          description: `Deleted faculty: ${facultyName}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to delete faculty: ${error}`);
    }
  };

  const handleCreateDepartment = async () => {
    try {
      if (!newDepartmentData.name || !newDepartmentData.code) {
        toast.error("Please fill in all required fields");
        return;
      }

      const departmentId = await createDepartment(newDepartmentData);

      toast.success("Department created successfully");
      setCreateModalOpen(false);
      setNewDepartmentData({
        name: "",
        code: "",
        description: "",
        facultyId: undefined,
      });

      if (user) {
        logActivity({
          type: "create", // Change from 'action'
          entity: "department", // Change from 'entityType'
          description: `Created department: ${newDepartmentData.name}`, // Change from 'details'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to create department: ${error}`);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      await updateDepartment({
        id: selectedDepartment._id,
        ...newDepartmentData,
      });

      toast.success("Department updated successfully");
      setModalOpen(false);
      setSelectedDepartment(null);

      if (user) {
        logActivity({
          type: "edit", // Change from 'action'
          entity: "department", // Change from 'entityType'
          description: `Updated department: ${selectedDepartment.name}`, // Change from 'details'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to update department: ${error}`);
    }
  };

  const handleDeleteDepartment = async (departmentId: Id<'departments'>, departmentName: string) => {
    if (!confirm(`Are you sure you want to delete the department "${departmentName}"?`)) {
      return;
    }

    try {
      await deleteDepartment({ id: departmentId });
      toast.success("Department deleted successfully");

      if (user) {
        logActivity({
          type: "delete", // Change from 'action'
          entity: "department", // Change from 'entityType'
          description: `Deleted department: ${departmentName}`, // Change from 'details'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to delete department: ${error}`);
    }
  };

  const handleCreateAllocationType = async () => {
    try {
      if (!newAllocationTypeData.name || newAllocationTypeData.defaultHours <= 0) {
        toast.error("Please fill in all required fields");
        return;
      }

      const allocationTypeId = await createAllocationType(newAllocationTypeData);

      toast.success("Allocation type created successfully");
      setCreateModalOpen(false);
      setNewAllocationTypeData({
        name: "",
        description: "",
        defaultHours: 0,
      });

      if (user) {
        logActivity({
          type: "create", // Change from 'action'
          entity: "allocation_type", // Change from 'entityType'
          description: `Created allocation type: ${newAllocationTypeData.name}`, // Change from 'details'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to create allocation type: ${error}`);
    }
  };

  const handleUpdateAllocationType = async () => {
    if (!selectedAllocationType) return;

    try {
      await updateAllocationType({
        id: selectedAllocationType._id,
        ...newAllocationTypeData,
      });

      toast.success("Allocation type updated successfully");
      setModalOpen(false);
      setSelectedAllocationType(null);

      if (user) {
        logActivity({
          type: "edit", // Change from 'action'
          entity: "allocation_type", // Change from 'entityType'
          description: `Updated allocation type: ${selectedAllocationType.name}`, // Change from 'details'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to update allocation type: ${error}`);
    }
  };

  const handleDeleteAllocationType = async (allocationTypeId: Id<'allocation_types'>, allocationTypeName: string) => {
    if (!confirm(`Are you sure you want to delete the allocation type "${allocationTypeName}"?`)) {
      return;
    }

    try {
      await deleteAllocationType({ id: allocationTypeId });
      toast.success("Allocation type deleted successfully");

      if (user) {
        logActivity({
          type: "delete", // Change from 'action'
          entity: "allocation_type", // Change from 'entityType'
          description: `Deleted allocation type: ${allocationTypeName}`, // Change from 'details'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to delete allocation type: ${error}`);
    }
  };

  const openEditFacultyModal = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setNewFacultyData({
      name: faculty.name,
      code: faculty.code,
      description: faculty.description || "",
    });
    setModalOpen(true);
  };

  const openEditDepartmentModal = (department: Department) => {
    setSelectedDepartment(department);
    setNewDepartmentData({
      name: department.name,
      code: department.code,
      description: department.description || "",
      facultyId: department.facultyId,
    });
    setModalOpen(true);
  };

  const openEditAllocationTypeModal = (allocationType: AllocationType) => {
    setSelectedAllocationType(allocationType);
    setNewAllocationTypeData({
      name: allocationType.name,
      description: allocationType.description || "",
      defaultHours: allocationType.defaultHours,
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reference Data Management</h1>
          <p className="text-muted-foreground">
            Manage academic reference data and system configurations
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add {activeTab === "faculties" ? "Faculty" : activeTab === "departments" ? "Department" : "Allocation Type"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="faculties">Faculties</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="allocationTypes">Allocation Types</TabsTrigger>
        </TabsList>

        <TabsContent value="faculties" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Faculties</CardTitle>
                  <CardDescription>
                    {filteredFaculties.length} faculties
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search faculties..."
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaculties.map((faculty: any) => (
                    <TableRow key={faculty._id}>
                      <TableCell className="font-medium">{faculty.code}</TableCell>
                      <TableCell>{faculty.name}</TableCell>
                      <TableCell>
                        {faculty.description ? (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {faculty.description}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No description</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={faculty.isActive ? "default" : "secondary"}>
                          {faculty.isActive ? "Active" : "Inactive"}
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
                                  onClick={() => openEditFacultyModal(faculty)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit faculty</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteFaculty(faculty._id, faculty.name)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete faculty</TooltipContent>
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
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription>
                    {filteredDepartments.length} departments
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search departments..."
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
                    <TableHead>Faculty</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((department: any) => (
                    <TableRow key={department._id}>
                      <TableCell className="font-medium">{department.code}</TableCell>
                      <TableCell>{department.name}</TableCell>
                      <TableCell>{getFacultyName(department.facultyId)}</TableCell>
                      <TableCell>
                        {department.description ? (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {department.description}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No description</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={department.isActive ? "default" : "secondary"}>
                          {department.isActive ? "Active" : "Inactive"}
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
                                  onClick={() => openEditDepartmentModal(department)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit department</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDepartment(department._id, department.name)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete department</TooltipContent>
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
        </TabsContent>

        <TabsContent value="allocationTypes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Allocation Types</CardTitle>
                  <CardDescription>
                    {filteredAllocationTypes.length} allocation types
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search allocation types..."
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
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Default Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAllocationTypes.map((allocationType: any) => (
                    <TableRow key={allocationType._id}>
                      <TableCell className="font-medium">{allocationType.name}</TableCell>
                      <TableCell>
                        {allocationType.description ? (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {allocationType.description}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No description</span>
                        )}
                      </TableCell>
                      <TableCell>{allocationType.defaultHours} hours</TableCell>
                      <TableCell>
                        <Badge variant={allocationType.isActive ? "default" : "secondary"}>
                          {allocationType.isActive ? "Active" : "Inactive"}
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
                                  onClick={() => openEditAllocationTypeModal(allocationType)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit allocation type</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAllocationType(allocationType._id, allocationType.name)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete allocation type</TooltipContent>
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
        </TabsContent>
      </Tabs>

      {/* Create Faculty Modal */}
      {activeTab === "faculties" && (
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Faculty</DialogTitle>
              <DialogDescription>
                Add a new faculty to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Faculty Code *</Label>
                  <Input
                    id="code"
                    value={newFacultyData.code}
                    onChange={(e) => setNewFacultyData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., ENG"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Faculty Name *</Label>
                  <Input
                    id="name"
                    value={newFacultyData.name}
                    onChange={(e) => setNewFacultyData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Engineering"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newFacultyData.description}
                  onChange={(e) => setNewFacultyData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of the faculty..."
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateFaculty}>Create Faculty</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Department Modal */}
      {activeTab === "departments" && (
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new department to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Department Code *</Label>
                  <Input
                    id="code"
                    value={newDepartmentData.code}
                    onChange={(e) => setNewDepartmentData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., CS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Department Name *</Label>
                  <Input
                    id="name"
                    value={newDepartmentData.name}
                    onChange={(e) => setNewDepartmentData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select
                  value={newDepartmentData.facultyId}
                  onValueChange={(value) => setNewDepartmentData(prev => ({ ...prev, facultyId: value as Id<'faculties'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty: any) => (
                      <SelectItem key={faculty._id} value={faculty._id}>
                        {faculty.name} ({faculty.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDepartmentData.description}
                  onChange={(e) => setNewDepartmentData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of the department..."
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateDepartment}>Create Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Allocation Type Modal */}
      {activeTab === "allocationTypes" && (
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Allocation Type</DialogTitle>
              <DialogDescription>
                Add a new allocation type to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Allocation Type Name *</Label>
                <Input
                  id="name"
                  value={newAllocationTypeData.name}
                  onChange={(e) => setNewAllocationTypeData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Lecture"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAllocationTypeData.description}
                  onChange={(e) => setNewAllocationTypeData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of the allocation type..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultHours">Default Hours *</Label>
                <Input
                  id="defaultHours"
                  type="number"
                  min="0"
                  value={newAllocationTypeData.defaultHours}
                  onChange={(e) => setNewAllocationTypeData(prev => ({ ...prev, defaultHours: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 2"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateAllocationType}>Create Allocation Type</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Faculty Modal */}
      {activeTab === "faculties" && selectedFaculty && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Faculty</DialogTitle>
              <DialogDescription>
                Update faculty information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Faculty Code *</Label>
                  <Input
                    id="edit-code"
                    value={newFacultyData.code}
                    onChange={(e) => setNewFacultyData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., ENG"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Faculty Name *</Label>
                  <Input
                    id="edit-name"
                    value={newFacultyData.name}
                    onChange={(e) => setNewFacultyData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Engineering"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newFacultyData.description}
                  onChange={(e) => setNewFacultyData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of the faculty..."
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateFaculty}>Update Faculty</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Department Modal */}
      {activeTab === "departments" && selectedDepartment && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Update department information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Department Code *</Label>
                  <Input
                    id="edit-code"
                    value={newDepartmentData.code}
                    onChange={(e) => setNewDepartmentData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., CS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Department Name *</Label>
                  <Input
                    id="edit-name"
                    value={newDepartmentData.name}
                    onChange={(e) => setNewDepartmentData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-faculty">Faculty</Label>
                <Select
                  value={newDepartmentData.facultyId}
                  onValueChange={(value) => setNewDepartmentData(prev => ({ ...prev, facultyId: value as Id<'faculties'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty: any) => (
                      <SelectItem key={faculty._id} value={faculty._id}>
                        {faculty.name} ({faculty.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newDepartmentData.description}
                  onChange={(e) => setNewDepartmentData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of the department..."
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateDepartment}>Update Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Allocation Type Modal */}
      {activeTab === "allocationTypes" && selectedAllocationType && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Allocation Type</DialogTitle>
              <DialogDescription>
                Update allocation type information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Allocation Type Name *</Label>
                <Input
                  id="edit-name"
                  value={newAllocationTypeData.name}
                  onChange={(e) => setNewAllocationTypeData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Lecture"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newAllocationTypeData.description}
                  onChange={(e) => setNewAllocationTypeData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of the allocation type..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-defaultHours">Default Hours *</Label>
                <Input
                  id="edit-defaultHours"
                  type="number"
                  min="0"
                  value={newAllocationTypeData.defaultHours}
                  onChange={(e) => setNewAllocationTypeData(prev => ({ ...prev, defaultHours: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 2"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateAllocationType}>Update Allocation Type</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 