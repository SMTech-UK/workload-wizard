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
import { Plus, Search, Edit, Eye, AlertTriangle, X, Users, Clock, Calendar, Building } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import type { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// Define interfaces based on the database schema
interface AdminAllocation {
  _id: Id<'admin_allocations'>;
  lecturerId: Id<'lecturers'>;
  academicYearId: Id<'academic_years'>;
  allocationTypeId?: Id<'allocation_types'>;
  category: string;
  title: string;
  description?: string;
  hours: number;
  status: string;
  startDate?: number; // Change to number
  endDate?: number; // Change to number
  isActive: boolean;
  priority: string; // Add missing field
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface Lecturer {
  _id: Id<'lecturers'>;
  profileId: Id<'lecturer_profiles'>;
  academicYearId: Id<'academic_years'>;
  teachingAvailability: number;
  totalAllocated: number;
  allocatedTeachingHours: number;
  allocatedAdminHours: number;
  allocatedResearchHours: number;
  allocatedOtherHours: number;
  isActive: boolean;
}

interface LecturerProfile {
  _id: Id<'lecturer_profiles'>;
  fullName: string;
  email: string;
  family: string;
  fte: number;
  capacity: number;
  maxTeachingHours: number;
  totalContract: number;
  isActive: boolean;
}

interface AllocationType {
  _id: Id<'allocation_types'>;
  name: string;
  description?: string;
  defaultHours: number;
  isActive: boolean;
}

export default function AdminAllocations() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAllocation, setSelectedAllocation] = useState<AdminAllocation | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAllocationData, setNewAllocationData] = useState({
    lecturerId: "" as Id<'lecturers'>,
    allocationTypeId: undefined as Id<'allocation_types'> | undefined,
    category: "",
    title: "",
    description: "",
    hours: 0,
    status: "active",
    startDate: "",
    endDate: "",
  });

  const { user } = useUser();
  const logActivity = useLogRecentActivity();
  const { currentAcademicYearId } = useAcademicYear();
  
  // Fetch data
  const adminAllocations = useQuery('admin_allocations:getAll' as any, { 
    academicYearId: currentAcademicYearId as any,
    isActive: true 
  }) ?? [];
  const lecturers = useQuery('lecturers:getAll' as any, { 
    academicYearId: currentAcademicYearId as any 
  }) ?? [];
  const lecturerProfiles = useQuery('lecturers:getProfiles' as any, {}) ?? [];
  const allocationTypes = useQuery('allocation_types:getAll' as any, {}) ?? [];
  
  // Mutations
  const createAdminAllocation = useMutation('admin_allocations:create' as any);
  const updateAdminAllocation = useMutation('admin_allocations:update' as any);
  const deleteAdminAllocation = useMutation('admin_allocations:remove' as any);

  const filteredAllocations = adminAllocations.filter((allocation: any) => {
    const lecturerName = getLecturerName(allocation.lecturerId);
    return lecturerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           allocation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           allocation.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getLecturerName = (lecturerId: Id<'lecturers'>) => {
    const lecturer = lecturers.find((l: any) => l._id === lecturerId);
    if (!lecturer) return "Unknown Lecturer";
    
    const profile = lecturerProfiles.find((p: any) => p._id === lecturer.profileId);
    return profile?.fullName || "Unknown Lecturer";
  };

  const getLecturerEmail = (lecturerId: Id<'lecturers'>) => {
    const lecturer = lecturers.find((l: any) => l._id === lecturerId);
    if (!lecturer) return "Unknown";
    
    const profile = lecturerProfiles.find((p: any) => p._id === lecturer.profileId);
    return profile?.email || "Unknown";
  };

  const getLecturerFamily = (lecturerId: Id<'lecturers'>) => {
    const lecturer = lecturers.find((l: any) => l._id === lecturerId);
    if (!lecturer) return "Unknown";
    
    const profile = lecturerProfiles.find((p: any) => p._id === lecturer.profileId);
    return profile?.family || "Unknown";
  };

  const getAllocationTypeName = (allocationTypeId?: Id<'allocation_types'>) => {
    if (!allocationTypeId) return "Not specified";
    const allocationType = allocationTypes.find((at: any) => at._id === allocationTypeId);
    return allocationType?.name || "Unknown";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'leadership': return 'bg-purple-100 text-purple-800';
      case 'committee': return 'bg-blue-100 text-blue-800';
      case 'administration': return 'bg-green-100 text-green-800';
      case 'quality assurance': return 'bg-orange-100 text-orange-800';
      case 'student support': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const handleCreateAllocation = async () => {
    try {
      if (!newAllocationData.lecturerId || !newAllocationData.title || !newAllocationData.category || newAllocationData.hours <= 0) {
        toast.error("Please fill in all required fields");
        return;
      }

      const allocationId = await createAdminAllocation({
        ...newAllocationData,
        academicYearId: currentAcademicYearId as any,
        isActive: true, // Add missing field
        priority: "medium", // Add missing field
        startDate: newAllocationData.startDate ? new Date(newAllocationData.startDate).getTime() : undefined, // Convert to number
        endDate: newAllocationData.endDate ? new Date(newAllocationData.endDate).getTime() : undefined, // Convert to number
      });

      toast.success("Admin allocation created successfully");
      setCreateModalOpen(false);
      setNewAllocationData({
        lecturerId: "" as Id<'lecturers'>,
        allocationTypeId: undefined,
        category: "",
        title: "",
        description: "",
        hours: 0,
        status: "active",
        startDate: "",
        endDate: "",
      });

      if (user) {
        logActivity({
          type: "create", // Change from 'action' to 'type'
          entity: "admin_allocation", // Change from 'entityType' to 'entity'
          description: `Created admin allocation: ${newAllocationData.title}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to create admin allocation: ${error}`);
    }
  };

  const handleUpdateAllocation = async () => {
    if (!selectedAllocation) return;

    try {
      await updateAdminAllocation({
        id: selectedAllocation._id,
        ...newAllocationData,
        startDate: newAllocationData.startDate ? new Date(newAllocationData.startDate).getTime() : undefined, // Convert to number
        endDate: newAllocationData.endDate ? new Date(newAllocationData.endDate).getTime() : undefined, // Convert to number
      });

      toast.success("Admin allocation updated successfully");
      setModalOpen(false);
      setSelectedAllocation(null);

      if (user) {
        logActivity({
          type: "edit", // Change from 'action' to 'type'
          entity: "admin_allocation", // Change from 'entityType' to 'entity'
          description: `Updated admin allocation: ${selectedAllocation.title}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to update admin allocation: ${error}`);
    }
  };

  const handleDeleteAllocation = async (allocationId: Id<'admin_allocations'>, allocationTitle: string) => {
    if (!confirm(`Are you sure you want to delete the admin allocation "${allocationTitle}"?`)) {
      return;
    }

    try {
      await deleteAdminAllocation({ id: allocationId });
      toast.success("Admin allocation deleted successfully");

      if (user) {
        logActivity({
          type: "delete", // Change from 'action' to 'type'
          entity: "admin_allocation", // Change from 'entityType' to 'entity'
          description: `Deleted admin allocation: ${allocationTitle}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to delete admin allocation: ${error}`);
    }
  };

  const openEditModal = (allocation: AdminAllocation) => {
    setSelectedAllocation(allocation);
    setNewAllocationData({
      lecturerId: allocation.lecturerId,
      allocationTypeId: allocation.allocationTypeId,
      category: allocation.category,
      title: allocation.title,
      description: allocation.description || "",
      hours: allocation.hours,
      status: allocation.status,
      startDate: allocation.startDate ? new Date(allocation.startDate).toISOString().slice(0, 10) : "", // Convert back to string
      endDate: allocation.endDate ? new Date(allocation.endDate).toISOString().slice(0, 10) : "", // Convert back to string
    });
    setModalOpen(true);
  };

  const getTotalAdminHours = () => {
    return adminAllocations.reduce((total: number, allocation: any) => total + allocation.hours, 0);
  };

  const getActiveAllocationsCount = () => {
    return adminAllocations.filter((allocation: any) => allocation.status === 'active').length;
  };

  const getAverageHoursPerAllocation = () => {
    return adminAllocations.length > 0 ? getTotalAdminHours() / adminAllocations.length : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Allocations</h1>
          <p className="text-muted-foreground">
            Manage administrative workload allocations for lecturers
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Allocation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminAllocations.length}</div>
            <p className="text-xs text-muted-foreground">
              Administrative allocations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalAdminHours()}</div>
            <p className="text-xs text-muted-foreground">
              Administrative hours allocated
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Allocations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveAllocationsCount()}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Hours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageHoursPerAllocation().toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Per allocation
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Allocations</CardTitle>
              <CardDescription>
                {filteredAllocations.length} administrative allocations
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search allocations..."
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
                <TableHead>Lecturer</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllocations.map((allocation: any) => (
                <TableRow key={allocation._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{getLecturerName(allocation.lecturerId)}</div>
                      <div className="text-sm text-muted-foreground">{getLecturerEmail(allocation.lecturerId)}</div>
                      <div className="text-xs text-muted-foreground">{getLecturerFamily(allocation.lecturerId)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{allocation.title}</div>
                      {allocation.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {allocation.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryBadgeColor(allocation.category)}>
                      {allocation.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{getAllocationTypeName(allocation.allocationTypeId)}</TableCell>
                  <TableCell className="font-medium">{allocation.hours}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(allocation.status)}>
                      {allocation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {allocation.startDate && allocation.endDate ? (
                        <div>
                          <div>{formatDate(new Date(allocation.startDate).toISOString().slice(0, 10))} - {formatDate(new Date(allocation.endDate).toISOString().slice(0, 10))}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not specified</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(allocation)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit allocation</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAllocation(allocation._id, allocation.title)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete allocation</TooltipContent>
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

      {/* Create Admin Allocation Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Admin Allocation</DialogTitle>
            <DialogDescription>
              Add a new administrative workload allocation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lecturer">Lecturer *</Label>
              <Select
                value={newAllocationData.lecturerId}
                onValueChange={(value) => setNewAllocationData(prev => ({ ...prev, lecturerId: value as Id<'lecturers'> }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lecturer" />
                </SelectTrigger>
                <SelectContent>
                  {lecturers.map((lecturer: any) => {
                    const profile = lecturerProfiles.find((p: any) => p._id === lecturer.profileId);
                    return (
                      <SelectItem key={lecturer._id} value={lecturer._id}>
                        {profile?.fullName || "Unknown"} ({profile?.family || "Unknown"})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newAllocationData.title}
                  onChange={(e) => setNewAllocationData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Course Leader"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newAllocationData.category}
                  onValueChange={(value) => setNewAllocationData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Committee">Committee</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                    <SelectItem value="Student Support">Student Support</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allocationType">Allocation Type</Label>
                <Select
                  value={newAllocationData.allocationTypeId}
                  onValueChange={(value) => setNewAllocationData(prev => ({ ...prev, allocationTypeId: value as Id<'allocation_types'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {allocationTypes.map((type: any) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Hours *</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  value={newAllocationData.hours}
                  onChange={(e) => setNewAllocationData(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAllocationData.description}
                onChange={(e) => setNewAllocationData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of the administrative role..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newAllocationData.startDate}
                  onChange={(e) => setNewAllocationData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newAllocationData.endDate}
                  onChange={(e) => setNewAllocationData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newAllocationData.status}
                onValueChange={(value) => setNewAllocationData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateAllocation}>Create Allocation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Allocation Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Admin Allocation</DialogTitle>
            <DialogDescription>
              Update administrative workload allocation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-lecturer">Lecturer *</Label>
              <Select
                value={newAllocationData.lecturerId}
                onValueChange={(value) => setNewAllocationData(prev => ({ ...prev, lecturerId: value as Id<'lecturers'> }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lecturer" />
                </SelectTrigger>
                <SelectContent>
                  {lecturers.map((lecturer: any) => {
                    const profile = lecturerProfiles.find((p: any) => p._id === lecturer.profileId);
                    return (
                      <SelectItem key={lecturer._id} value={lecturer._id}>
                        {profile?.fullName || "Unknown"} ({profile?.family || "Unknown"})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={newAllocationData.title}
                  onChange={(e) => setNewAllocationData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Course Leader"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={newAllocationData.category}
                  onValueChange={(value) => setNewAllocationData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Committee">Committee</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                    <SelectItem value="Student Support">Student Support</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-allocationType">Allocation Type</Label>
                <Select
                  value={newAllocationData.allocationTypeId}
                  onValueChange={(value) => setNewAllocationData(prev => ({ ...prev, allocationTypeId: value as Id<'allocation_types'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {allocationTypes.map((type: any) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hours">Hours *</Label>
                <Input
                  id="edit-hours"
                  type="number"
                  min="0"
                  value={newAllocationData.hours}
                  onChange={(e) => setNewAllocationData(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newAllocationData.description}
                onChange={(e) => setNewAllocationData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of the administrative role..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={newAllocationData.startDate}
                  onChange={(e) => setNewAllocationData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={newAllocationData.endDate}
                  onChange={(e) => setNewAllocationData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={newAllocationData.status}
                onValueChange={(value) => setNewAllocationData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateAllocation}>Update Allocation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 