"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api";
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
import { Plus, Search, Edit, Eye, X, Users, Building, User, BarChart3, Calendar, Mail, Phone } from "lucide-react"
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import Navigation from "@/components/layout/navigation"
import SettingsModal, { TabType } from "@/components/modals/settings-modal"
import type { Id } from "../../../convex/_generated/dataModel";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { toast } from "sonner";

// Define interfaces based on the new database schema
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
  team?: string;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface AcademicYear {
  _id: Id<'academic_years'>;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function LecturerManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProfile, setSelectedProfile] = useState<LecturerProfile | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<TabType>("profile");

  // Fetch data from Convex
  const lecturerProfiles = useQuery(api.lecturer_profiles.getAll, {}) ?? [];
  const lecturers = useQuery(api.lecturers.getAll, {}) ?? [];
  const academicYears = useQuery(api.academic_years.getAll, {}) ?? [];
  const createLecturerProfile = useMutation(api.lecturer_profiles.create);
  const updateLecturerProfile = useMutation(api.lecturer_profiles.update);
  const deleteLecturerProfile = useMutation(api.lecturer_profiles.delete);
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();
  const { currentAcademicYearId } = useAcademicYear();

  // State for form fields
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    family: "",
    fte: 1.0,
    capacity: 0,
    maxTeachingHours: 0,
    totalContract: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateLecturerProfile = async () => {
    if (!form.fullName || !form.email || !form.family) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await createLecturerProfile({
        fullName: form.fullName,
        email: form.email,
        family: form.family,
        fte: form.fte,
        capacity: form.capacity,
        maxTeachingHours: form.maxTeachingHours,
        totalContract: form.totalContract,
      });

      logRecentActivity({
        type: "create",
        entity: "lecturer_profile",
        description: `Created lecturer profile: ${form.fullName}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

      toast.success("Lecturer profile created successfully");
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error("Error creating lecturer profile:", error);
      toast.error("Failed to create lecturer profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLecturerProfile = async () => {
    if (!selectedProfile || !form.fullName || !form.email || !form.family) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await updateLecturerProfile({
        id: selectedProfile._id,
        fullName: form.fullName,
        email: form.email,
        family: form.family,
        fte: form.fte,
        capacity: form.capacity,
        maxTeachingHours: form.maxTeachingHours,
        totalContract: form.totalContract,
      });

      logRecentActivity({
        type: "edit",
        entity: "lecturer_profile",
        description: `Updated lecturer profile: ${form.fullName}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

      toast.success("Lecturer profile updated successfully");
      resetForm();
      setModalOpen(false);
      setSelectedProfile(null);
    } catch (error) {
      console.error("Error updating lecturer profile:", error);
      toast.error("Failed to update lecturer profile");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      family: "",
      fte: 1.0,
      capacity: 0,
      maxTeachingHours: 0,
      totalContract: 0,
    });
    setIsEditing(false);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (profile: LecturerProfile) => {
    setSelectedProfile(profile);
    setForm({
      fullName: profile.fullName,
      email: profile.email,
      family: profile.family,
      fte: profile.fte,
      capacity: profile.capacity,
      maxTeachingHours: profile.maxTeachingHours,
      totalContract: profile.totalContract,
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const getCurrentYearLecturer = (profileId: Id<'lecturer_profiles'>) => {
    return lecturers.find(l => l.profileId === profileId && l.academicYearId === currentAcademicYearId);
  };

  const getStatusBadge = (profile: LecturerProfile) => {
    const currentLecturer = getCurrentYearLecturer(profile._id);
    if (!currentLecturer) {
      return <Badge variant="outline">No Year Data</Badge>;
    }

    const utilization = currentLecturer.totalContract > 0 
      ? (currentLecturer.totalAllocated / currentLecturer.totalContract) * 100 
      : 0;

    if (utilization > 100) {
      return <Badge variant="destructive">Overloaded</Badge>;
    } else if (utilization >= 90) {
      return <Badge variant="secondary">Near Capacity</Badge>;
    } else if (utilization >= 70) {
      return <Badge variant="default">Good</Badge>;
    } else {
      return <Badge variant="outline">Available</Badge>;
    }
  };

  const getUtilizationPercentage = (profile: LecturerProfile) => {
    const currentLecturer = getCurrentYearLecturer(profile._id);
    if (!currentLecturer || currentLecturer.totalContract === 0) return 0;
    return Math.round((currentLecturer.totalAllocated / currentLecturer.totalContract) * 100);
  };

  const filteredProfiles = lecturerProfiles.filter(profile =>
    profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.family.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          activeTab="lecturers" 
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
              <Users className="w-8 h-8" />
              Lecturer Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage lecturer profiles and their academic year data
            </p>
          </div>
          <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Lecturer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Profiles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{lecturerProfiles.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Profiles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lecturerProfiles.filter(p => p.isActive).length}
                  </p>
                </div>
                <User className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Year</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lecturers.filter(l => l.academicYearId === currentAcademicYearId).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Families</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(lecturerProfiles.map(p => p.family)).size}
                  </p>
                </div>
                <Building className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white dark:bg-zinc-900 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search lecturers by name, email, or family..."
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

        {/* Lecturers Table */}
        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle>Lecturer Profiles</CardTitle>
            <CardDescription>
              A list of all lecturer profiles in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>FTE</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Current Year</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => {
                  const currentLecturer = getCurrentYearLecturer(profile._id);
                  const utilization = getUtilizationPercentage(profile);
                  
                  return (
                    <TableRow key={profile._id}>
                      <TableCell className="font-medium">{profile.fullName}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>{profile.family}</TableCell>
                      <TableCell>{profile.fte}</TableCell>
                      <TableCell>{profile.totalContract}h</TableCell>
                      <TableCell>
                        {currentLecturer ? (
                          <div className="text-sm">
                            <div>Allocated: {currentLecturer.totalAllocated}h</div>
                            <div>Contract: {currentLecturer.totalContract || profile.totalContract}h</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No data</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {currentLecturer ? (
                          <div className="flex items-center gap-2">
                            <span>{utilization}%</span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  utilization > 100 ? 'bg-red-500' :
                                  utilization >= 90 ? 'bg-yellow-500' :
                                  utilization >= 70 ? 'bg-blue-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(profile)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(profile)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled>
                            <span className="text-xs">Coming Soon</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Lecturer Profile Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Lecturer Profile" : "Create New Lecturer Profile"}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? "Update lecturer profile information" : "Add a new lecturer profile to the system"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={handleFormChange}
                    placeholder="e.g., Dr. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="john.smith@university.edu"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="family">Family *</Label>
                  <Input
                    id="family"
                    value={form.family}
                    onChange={handleFormChange}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fte">FTE</Label>
                  <Input
                    id="fte"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={form.fte}
                    onChange={handleFormChange}
                    placeholder="1.0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (Hours)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={form.capacity}
                    onChange={handleFormChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTeachingHours">Max Teaching Hours</Label>
                  <Input
                    id="maxTeachingHours"
                    type="number"
                    value={form.maxTeachingHours}
                    onChange={handleFormChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalContract">Total Contract Hours</Label>
                  <Input
                    id="totalContract"
                    type="number"
                    value={form.totalContract}
                    onChange={handleFormChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </DialogClose>
              <Button 
                onClick={isEditing ? handleUpdateLecturerProfile : handleCreateLecturerProfile}
                disabled={submitting}
              >
                {submitting ? "Saving..." : isEditing ? "Update Profile" : "Create Profile"}
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