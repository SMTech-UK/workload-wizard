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
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Edit, Eye, AlertTriangle, X, User, Calendar, Clock } from "lucide-react"
import StaffProfileModal from "@/components/modals/staff-profile-modal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import type { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// Define interfaces based on the actual schema from DATABASE_SCHEMA_REFERENCE.md
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
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface LecturerInstance {
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
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

export default function LecturerManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLecturer, setSelectedLecturer] = useState<LecturerProfile | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newLecturerData, setNewLecturerData] = useState({
    fullName: "",
    email: "",
    family: "Teaching Academic",
    fte: 1.0,
    capacity: 100,
    maxTeachingHours: 42,
    totalContract: 42,
  });

  // Get current academic year context
  const { currentAcademicYearId } = useAcademicYear();
  
  // Fetch data with academic year context - using the correct API calls
  const lecturerProfiles = useQuery(api.lecturers.getProfiles, {}) ?? [];
  const lecturerInstances = useQuery(api.lecturers.getAll, { 
    academicYearId: currentAcademicYearId as any
  }) ?? [];
  const adminAllocations = useQuery(api.admin_allocations.getAll, { 
    academicYearId: currentAcademicYearId as any
  }) ?? [];
  const modules = useQuery(api.modules.getAll, { 
    academicYearId: currentAcademicYearId as any
  }) ?? [];
  const academicYears = useQuery(api.academic_years.getAll, {}) ?? [];
  
  // Use the correct mutations for the new schema
  const createLecturerProfile = useMutation(api.lecturers.createNewLecturer);
  const createLecturerInstance = useMutation(api.lecturers.createLecturer);
  const deleteLecturerProfile = useMutation(api.lecturers.deleteProfile);
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();

  // Career families for the new structure
  const careerFamilies = [
    { value: "Academic Practitioner", label: "Academic Practitioner (AP)" },
    { value: "Teaching Academic", label: "Teaching Academic (TA)" },
    { value: "Research Academic", label: "Research Academic (RA)" },
  ];

  function getFamilyLabel(value: string) {
    const found = careerFamilies.find(f => f.value === value);
    return found ? found.label : '';
  }

  function getTeachingPercentage(family: string) {
    switch (family) {
      case 'Research Academic':
        return 0.3;
      case 'Teaching Academic':
        return 0.6;
      case 'Academic Practitioner':
        return 0.8;
      default:
        return 0.6;
    }
  }

  function getFamilyInitialsForContract(family: string) {
    const map: Record<string, string> = {
      'Academic Practitioner': 'AP',
      'Teaching Academic': 'TA',
      'Research Academic': 'RA',
    };
    return map[family] || family;
  }

  // Combine profile and instance data with proper type safety
  const lecturersWithInstances = lecturerProfiles.map((profile: any) => {
    const instance = lecturerInstances.find((inst: any) => inst.profileId === profile._id);
    return {
      profile: {
        _id: profile._id,
        fullName: profile.fullName || "Unknown",
        email: profile.email || "",
        family: profile.family || "Teaching Academic",
        fte: profile.fte || 1.0,
        capacity: profile.capacity || 100,
        maxTeachingHours: profile.maxTeachingHours || 42,
        totalContract: profile.totalContract || 42,
        isActive: profile.isActive ?? true,
        organisationId: profile.organisationId,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      } as LecturerProfile,
      instance: instance as LecturerInstance | undefined,
      // Calculate workload percentages
      teachingPercentage: instance ? (instance.allocatedTeachingHours / (profile.totalContract || 42)) * 100 : 0,
      adminPercentage: instance ? (instance.allocatedAdminHours / (profile.totalContract || 42)) * 100 : 0,
      researchPercentage: instance ? (instance.allocatedResearchHours / (profile.totalContract || 42)) * 100 : 0,
      otherPercentage: instance ? (instance.allocatedOtherHours / (profile.totalContract || 42)) * 100 : 0,
      totalAllocatedPercentage: instance ? (instance.totalAllocated / (profile.totalContract || 42)) * 100 : 0,
    };
  });

  // Filter lecturers based on search term
  const filteredLecturers = lecturersWithInstances.filter(lecturer =>
    lecturer.profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.profile.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateLecturer = async () => {
    if (!currentAcademicYearId) {
      toast.error("No academic year selected");
      return;
    }

    try {
      // Create lecturer profile first with the correct fields
      const profileId = await createLecturerProfile({
        fullName: newLecturerData.fullName,
        email: newLecturerData.email,
        family: newLecturerData.family,
        fte: newLecturerData.fte,
        capacity: newLecturerData.capacity,
        maxTeachingHours: newLecturerData.maxTeachingHours,
        totalContract: newLecturerData.totalContract,
        // Add legacy fields that the API still expects
        contract: "Permanent",
        team: "",
        specialism: "",
        role: "lecturer",
      }) as any;

      // Create lecturer instance for current academic year
      await createLecturerInstance({
        profileId: profileId as any,
        academicYearId: currentAcademicYearId as any,
        teachingAvailability: newLecturerData.maxTeachingHours,
        totalAllocated: 0,
        allocatedTeachingHours: 0,
        allocatedAdminHours: 0,
        allocatedResearchHours: 0,
        allocatedOtherHours: 0,
      });

      // Reset form
      setNewLecturerData({
        fullName: "",
        email: "",
        family: "Teaching Academic",
        fte: 1.0,
        capacity: 100,
        maxTeachingHours: 42,
        totalContract: 42,
      });

      setCreateModalOpen(false);
      toast.success("Lecturer created successfully");
      
      // Log activity
      if (user) {
        logRecentActivity({
          type: "create", // Change from 'changeType' to 'type'
          entity: "lecturer", // Keep 'entity'
          description: `Added ${newLecturerData.fullName} to the system`, // Change from 'details' to 'description'
          userId: user?.id || "", // Add 'userId'
          organisationId: "", // Add 'organisationId'
        });
      }
    } catch (error) {
      console.error('Failed to create lecturer:', error);
      toast.error("Failed to create lecturer");
    }
  };

  const handleDeleteLecturer = async (profileId: Id<'lecturer_profiles'>, fullName: string) => {
    if (confirm(`Are you sure you want to delete ${fullName}? This action cannot be undone.`)) {
      try {
        await deleteLecturerProfile({ id: profileId });
        toast.success(`${fullName} deleted successfully`);
        
        // Log activity
        if (user) {
          logRecentActivity({
            type: "delete", // Change from 'changeType' to 'type'
            entity: "lecturer", // Keep 'entity'
            description: `Removed ${fullName} from the system`, // Change from 'details' to 'description'
            userId: user?.id || "", // Add 'userId'
            organisationId: "", // Add 'organisationId'
          });
        }
      } catch (error) {
        console.error('Failed to delete lecturer:', error);
        toast.error("Failed to delete lecturer");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lecturer Management</h1>
          <p className="text-muted-foreground">
            Manage lecturer profiles and their year-specific allocations
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lecturer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturerProfiles.length}</div>
            <p className="text-xs text-muted-foreground">
              {lecturerProfiles.filter((l: any) => l.isActive).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturerInstances.length}</div>
            <p className="text-xs text-muted-foreground">
              {academicYears.find((ay: any) => ay._id === currentAcademicYearId)?.name || 'Unknown'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Workload</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lecturerInstances.length > 0 
                ? Math.round(lecturerInstances.reduce((sum: number, inst: any) => sum + (inst.totalAllocated || 0), 0) / lecturerInstances.length)
                : 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              per lecturer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminAllocations.length}</div>
            <p className="text-xs text-muted-foreground">
              allocated tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Lecturers</CardTitle>
          <CardDescription>
            Manage lecturer profiles and view their current year allocations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lecturers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Lecturers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>FTE</TableHead>
                  <TableHead>Workload</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLecturers.map(({ profile, instance, teachingPercentage, adminPercentage, researchPercentage, otherPercentage, totalAllocatedPercentage }) => (
                  <TableRow key={profile._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{profile.fullName}</div>
                        <div className="text-sm text-muted-foreground">{profile.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getFamilyInitialsForContract(profile.family)}
                      </Badge>
                    </TableCell>
                    <TableCell>{profile.fte}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>Total: {instance?.totalAllocated || 0}h</span>
                          <span>{Math.round(totalAllocatedPercentage)}%</span>
                        </div>
                        <Progress value={totalAllocatedPercentage} className="h-2" />
                        <div className="flex gap-1 text-xs text-muted-foreground">
                          <span>T: {Math.round(teachingPercentage)}%</span>
                          <span>A: {Math.round(adminPercentage)}%</span>
                          <span>R: {Math.round(researchPercentage)}%</span>
                          <span>O: {Math.round(otherPercentage)}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.isActive ? "default" : "secondary"}>
                        {profile.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedLecturer(profile);
                                  setModalOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedLecturer(profile);
                                  setModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLecturer(profile._id, profile.fullName)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Lecturer Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Lecturer</DialogTitle>
            <DialogDescription>
              Create a new lecturer profile and instance for the current academic year
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={newLecturerData.fullName}
                onChange={(e) => setNewLecturerData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newLecturerData.email}
                onChange={(e) => setNewLecturerData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john.doe@university.ac.uk"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="family">Career Family</Label>
              <Select
                value={newLecturerData.family}
                onValueChange={(value) => setNewLecturerData(prev => ({ ...prev, family: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {careerFamilies.map(family => (
                    <SelectItem key={family.value} value={family.value}>
                      {family.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fte">FTE</Label>
              <Input
                id="fte"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={newLecturerData.fte}
                onChange={(e) => setNewLecturerData(prev => ({ ...prev, fte: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (%)</Label>
              <Input
                id="capacity"
                type="number"
                min="0"
                max="100"
                value={newLecturerData.capacity}
                onChange={(e) => setNewLecturerData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxTeachingHours">Max Teaching Hours</Label>
              <Input
                id="maxTeachingHours"
                type="number"
                min="0"
                value={newLecturerData.maxTeachingHours}
                onChange={(e) => setNewLecturerData(prev => ({ ...prev, maxTeachingHours: parseInt(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalContract">Total Contract Hours</Label>
              <Input
                id="totalContract"
                type="number"
                min="0"
                value={newLecturerData.totalContract}
                onChange={(e) => setNewLecturerData(prev => ({ ...prev, totalContract: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLecturer}>
              Create Lecturer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lecturer Details Modal */}
      {selectedLecturer && (
        <StaffProfileModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          lecturer={{
            _id: selectedLecturer._id as any,
            fullName: selectedLecturer.fullName,
            email: selectedLecturer.email,
            team: "",
            specialism: "",
            contract: "",
            capacity: selectedLecturer.capacity,
            maxTeachingHours: selectedLecturer.maxTeachingHours,
            role: "lecturer",
            status: "active",
            teachingAvailability: lecturerInstances.find((inst: any) => inst.profileId === selectedLecturer._id)?.teachingAvailability || 0,
            totalAllocated: lecturerInstances.find((inst: any) => inst.profileId === selectedLecturer._id)?.totalAllocated || 0,
            totalContract: selectedLecturer.totalContract,
            allocatedTeachingHours: lecturerInstances.find((inst: any) => inst.profileId === selectedLecturer._id)?.allocatedTeachingHours || 0,
            allocatedAdminHours: lecturerInstances.find((inst: any) => inst.profileId === selectedLecturer._id)?.allocatedAdminHours || 0,
            family: selectedLecturer.family,
            fte: selectedLecturer.fte,
            profileId: selectedLecturer._id,
          } as any}
          adminAllocations={adminAllocations.filter((allocation: any) => 
            lecturerInstances.find((inst: any) => inst.profileId === selectedLecturer._id)?._id === allocation.lecturerId
          ).map((allocation: any) => ({
            category: allocation.category || "",
            description: allocation.description || "",
            hours: allocation.hours || 0,
          }))}
        />
      )}
    </div>
  )
} 