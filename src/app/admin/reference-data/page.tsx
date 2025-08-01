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
import { Plus, Search, Edit, Eye, X, Database, Building, Users, Calendar, BookOpen, Settings } from "lucide-react"
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import Navigation from "@/components/layout/navigation"
import SettingsModal, { TabType } from "@/components/modals/settings-modal"
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { toast } from "sonner";

// Define interfaces based on the database schema
interface Faculty {
  _id: Id<'faculties'>;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  organisationId?: Id<'organisations'>;
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
  organisationId?: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface AllocationType {
  _id: Id<'allocation_types'>;
  name: string;
  code: string;
  category: string;
  description?: string;
  defaultHours?: number;
  defaultStudents?: number;
  isTeaching: boolean;
  isAssessment: boolean;
  isAdministrative: boolean;
  requiresRoom: boolean;
  canBeGrouped: boolean;
  isActive: boolean;
  organisationId?: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface AssessmentType {
  _id: Id<'assessment_types'>;
  name: string;
  code: string;
  description?: string;
  category: string;
  defaultWeighting?: number;
  defaultDuration?: number;
  isGroupAssessment: boolean;
  requiresMarking: boolean;
  isActive: boolean;
  organisationId?: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

export default function ReferenceDataPage() {
  const [selectedTab, setSelectedTab] = useState("faculties");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<TabType>("profile");

  // Fetch data from Convex
  const organisation = useQuery(api.organisations.get, {}) ?? null;
  const faculties = useQuery(api.faculties.getAll, {}) ?? [];
  const departments = useQuery(api.departments.getAll, {}) ?? [];
  const allocationTypes = useQuery(api.allocation_types.getAll, {}) ?? [];
  const assessmentTypes = useQuery(api.assessment_types.getAll, {}) ?? [];
  
  // Mutations
  const createFaculty = useMutation(api.faculties.create);
  const updateFaculty = useMutation(api.faculties.update);
  const deleteFaculty = useMutation(api.faculties.remove);
  const createDepartment = useMutation(api.departments.create);
  const updateDepartment = useMutation(api.departments.update);
  const deleteDepartment = useMutation(api.departments.remove);
  const createAllocationType = useMutation(api.allocation_types.create);
  const updateAllocationType = useMutation(api.allocation_types.update);
  const deleteAllocationType = useMutation(api.allocation_types.remove);
  const createAssessmentType = useMutation(api.assessment_types.create);
  const updateAssessmentType = useMutation(api.assessment_types.update);
  const deleteAssessmentType = useMutation(api.assessment_types.remove);
  
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();
  const { currentAcademicYearId } = useAcademicYear();

  // Form state
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    facultyId: "",
    defaultHours: 0,
    defaultDuration: 0,
    defaultWeighting: 0,
    category: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      description: "",
      facultyId: "",
      defaultHours: 0,
      defaultDuration: 0,
      defaultWeighting: 0,
      category: "",
    });
    setIsEditing(false);
    setSelectedItem(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setSelectedItem(item);
    setForm({
      name: item.name,
      code: item.code,
      description: item.description || "",
      facultyId: item.facultyId || "",
      defaultHours: item.defaultHours || 0,
      defaultDuration: item.defaultDuration || 0,
      defaultWeighting: item.defaultWeighting || 0,
      category: item.category || "",
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleCreate = async () => {
    if (!form.name || !form.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      let result;
      const entityName = selectedTab.slice(0, -1); // Remove 's' from end

      switch (selectedTab) {
        case "faculties":
          result = await createFaculty({
            name: form.name,
            code: form.code.toUpperCase(),
            description: form.description,
          });
          break;
        case "departments":
          result = await createDepartment({
            name: form.name,
            code: form.code.toUpperCase(),
            description: form.description,
            facultyId: form.facultyId ? (form.facultyId as Id<'faculties'>) : undefined,
          });
          break;
        case "allocation_types":
          result = await createAllocationType({
            name: form.name,
            code: form.code.toUpperCase(),
            description: form.description,
            category: "General",
            defaultHours: form.defaultHours,
          });
          break;
        case "assessment_types":
          result = await createAssessmentType({
            name: form.name,
            code: form.code.toUpperCase(),
            description: form.description,
            category: form.category || "General",
            defaultWeighting: form.defaultWeighting,
            defaultDuration: form.defaultDuration,
          });
          break;
        default:
          throw new Error("Unknown entity type");
      }

      logRecentActivity({
        type: "create",
        entity: entityName,
        description: `Created ${entityName}: ${form.name}`,
        userId: user?.id || "",
        organisationId: organisation?._id || "",
      });

      toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} created successfully`);
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem || !form.name || !form.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      let result;
      const entityName = selectedTab.slice(0, -1);

      switch (selectedTab) {
        case "faculties":
          result = await updateFaculty({
            id: selectedItem._id,
            name: form.name,
            code: form.code.toUpperCase(),
            description: form.description,
          });
          break;
        case "departments":
          result = await updateDepartment({
            id: selectedItem._id,
            name: form.name,
            code: form.code.toUpperCase(),
            description: form.description,
            facultyId: form.facultyId ? (form.facultyId as Id<'faculties'>) : undefined,
          });
          break;
        case "allocation_types":
          result = await updateAllocationType({
            id: selectedItem._id,
            name: form.name,
            code: form.code.toUpperCase(),
            description: form.description,
            category: "General",
            defaultHours: form.defaultHours,
          });
          break;
        case "assessment_types":
          result = await updateAssessmentType({
            id: selectedItem._id,
            name: form.name,
            code: form.code.toUpperCase(),
            description: form.description,
            category: form.category || "General",
            defaultWeighting: form.defaultWeighting,
            defaultDuration: form.defaultDuration,
          });
          break;
        default:
          throw new Error("Unknown entity type");
      }

      logRecentActivity({
        type: "edit",
        entity: entityName,
        description: `Updated ${entityName}: ${form.name}`,
        userId: user?.id || "",
        organisationId: organisation?._id || "",
      });

      toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} updated successfully`);
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    } finally {
      setSubmitting(false);
    }
  };

  const getFacultyName = (facultyId?: Id<'faculties'>) => {
    if (!facultyId) return "Not assigned";
    const faculty = faculties.find(f => f._id === facultyId);
    return faculty?.name || "Unknown";
  };

  const getCurrentData = () => {
    switch (selectedTab) {
      case "faculties":
        return faculties.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case "departments":
        return departments.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getFacultyName(item.facultyId).toLowerCase().includes(searchTerm.toLowerCase())
        );
      case "allocation_types":
        return allocationTypes.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case "assessment_types":
        return assessmentTypes.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      default:
        return [];
    }
  };

  const getFilteredFaculties = () => {
    return faculties.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredDepartments = () => {
    return departments.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getFacultyName(item.facultyId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredAllocationTypes = () => {
    return allocationTypes.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredAssessmentTypes = () => {
    return assessmentTypes.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getTabTitle = () => {
    switch (selectedTab) {
      case "faculties":
        return "Faculties";
      case "departments":
        return "Departments";
      case "allocation_types":
        return "Allocation Types";
      case "assessment_types":
        return "Assessment Types";
      default:
        return "Reference Data";
    }
  };

  const getTabDescription = () => {
    switch (selectedTab) {
      case "faculties":
        return "Manage academic faculties and their configurations";
      case "departments":
        return "Manage departments within faculties";
      case "allocation_types":
        return "Manage types of administrative allocations";
      case "assessment_types":
        return "Manage types of assessments and their default hours";
      default:
        return "Manage system reference data";
    }
  };

  const handleProfileClick = () => {
    setUserProfileModalTab("profile");
    setUserProfileModalOpen(true);
  };
  
  const handleSettingsClick = () => {
    setUserProfileModalTab("general");
    setUserProfileModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="w-full bg-white dark:bg-zinc-900">
        <Navigation 
          activeTab="admin" 
          setActiveTab={() => {}} 
          onProfileClick={handleProfileClick} 
          onSettingsClick={handleSettingsClick} 
          onInboxClick={() => {}}
        />
      </div>
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="w-8 h-8" />
              Reference Data Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage system reference data and configurations
            </p>
          </div>
          <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add {getTabTitle().slice(0, -1)}
          </Button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Button
            variant={selectedTab === "faculties" ? "default" : "outline"}
            onClick={() => setSelectedTab("faculties")}
            className="flex items-center gap-2"
          >
            <Building className="w-4 h-4" />
            Faculties
          </Button>
          <Button
            variant={selectedTab === "departments" ? "default" : "outline"}
            onClick={() => setSelectedTab("departments")}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Departments
          </Button>
          <Button
            variant={selectedTab === "allocation_types" ? "default" : "outline"}
            onClick={() => setSelectedTab("allocation_types")}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Allocation Types
          </Button>
          <Button
            variant={selectedTab === "assessment_types" ? "default" : "outline"}
            onClick={() => setSelectedTab("assessment_types")}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Assessment Types
          </Button>
        </div>

        {/* Search */}
        <Card className="bg-white dark:bg-zinc-900 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Search ${getTabTitle().toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle>{getTabTitle()}</CardTitle>
            <CardDescription>{getTabDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  {selectedTab === "departments" && <TableHead>Faculty</TableHead>}
                  {selectedTab === "allocation_types" && <TableHead>Default Hours</TableHead>}
                  {selectedTab === "assessment_types" && <TableHead>Default Duration</TableHead>}
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTab === "faculties" && 
                  getFilteredFaculties().map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled>
                            <span className="text-xs">Coming Soon</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                }
                {selectedTab === "departments" && 
                  getFilteredDepartments().map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{getFacultyName(item.facultyId)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled>
                            <span className="text-xs">Coming Soon</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                }
                {selectedTab === "allocation_types" && 
                  getFilteredAllocationTypes().map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.defaultHours || 0}h</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled>
                            <span className="text-xs">Coming Soon</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                }
                {selectedTab === "assessment_types" && 
                  getFilteredAssessmentTypes().map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.defaultDuration || 0}h</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled>
                            <span className="text-xs">Coming Soon</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? `Edit ${getTabTitle().slice(0, -1)}` : `Create New ${getTabTitle().slice(0, -1)}`}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? `Update ${getTabTitle().slice(0, -1).toLowerCase()} information` : `Add a new ${getTabTitle().slice(0, -1).toLowerCase()} to the system`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={handleFormChange}
                    placeholder="e.g., CS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Description..."
                  rows={3}
                />
              </div>
              {selectedTab === "departments" && (
                <div className="space-y-2">
                  <Label htmlFor="facultyId">Faculty</Label>
                  <Select value={form.facultyId} onValueChange={(value) => handleSelectChange("facultyId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not assigned</SelectItem>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty._id} value={faculty._id}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedTab === "allocation_types" && (
                <div className="space-y-2">
                  <Label htmlFor="defaultHours">Default Hours</Label>
                  <Input
                    id="defaultHours"
                    type="number"
                    value={form.defaultHours}
                    onChange={handleFormChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              )}
              {selectedTab === "assessment_types" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultDuration">Default Duration (hours)</Label>
                    <Input
                      id="defaultDuration"
                      type="number"
                      value={form.defaultDuration}
                      onChange={handleFormChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultWeighting">Default Weighting (%)</Label>
                    <Input
                      id="defaultWeighting"
                      type="number"
                      value={form.defaultWeighting}
                      onChange={handleFormChange}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </DialogClose>
              <Button 
                onClick={isEditing ? handleUpdate : handleCreate}
                disabled={submitting}
              >
                {submitting ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <SettingsModal
        open={userProfileModalOpen}
        onOpenChange={setUserProfileModalOpen}
        initialTab={userProfileModalTab}
      />
    </div>
  )
} 