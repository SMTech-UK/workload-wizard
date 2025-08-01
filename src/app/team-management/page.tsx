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
import { Plus, Search, Edit, Eye, X, Users, Building, User, BarChart3, Calendar } from "lucide-react"
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import Navigation from "@/components/layout/navigation"
import SettingsModal, { TabType } from "@/components/modals/settings-modal"
import type { Id } from "../../../convex/_generated/dataModel";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { toast } from "sonner";

// Define interfaces based on the database schema
interface Team {
  _id: Id<'teams'>;
  name: string;
  code: string;
  description?: string;
  departmentId?: Id<'departments'>;
  facultyId?: Id<'faculties'>;
  teamLeaderId?: Id<'users'>;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface Department {
  _id: Id<'departments'>;
  name: string;
  code: string;
  facultyId?: Id<'faculties'>;
  isActive: boolean;
}

interface Faculty {
  _id: Id<'faculties'>;
  name: string;
  code: string;
  isActive: boolean;
}

interface User {
  _id: Id<'users'>;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

interface Lecturer {
  _id: Id<'lecturers'>;
  profileId: Id<'lecturer_profiles'>;
  academicYearId: Id<'academic_years'>;
  team?: string;
  isActive: boolean;
}

interface LecturerProfile {
  _id: Id<'lecturer_profiles'>;
  fullName: string;
  email: string;
  isActive: boolean;
}

export default function TeamManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<TabType>("profile");

  // Fetch data from Convex
  const teams = useQuery(api.teams.getAll, {}) ?? [];
  const departments = useQuery(api.departments.getAll, {}) ?? [];
  const faculties = useQuery(api.faculties.getAll, {}) ?? [];
  const users = useQuery(api.users.getAll, {}) ?? [];
  const lecturers = useQuery(api.lecturers.getAll, {}) ?? [];
  const lecturerProfiles = useQuery(api.lecturer_profiles.getAll, {}) ?? [];
  const createTeam = useMutation(api.teams.create);
  const updateTeam = useMutation(api.teams.update);
  const deleteTeam = useMutation(api.teams.delete);
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();
  const { currentAcademicYearId } = useAcademicYear();

  // State for form fields
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    departmentId: "",
    facultyId: "",
    teamLeaderId: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTeam = async () => {
    if (!form.name || !form.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await createTeam({
        name: form.name,
        code: form.code.toUpperCase(),
        description: form.description,
        departmentId: form.departmentId || undefined,
        facultyId: form.facultyId || undefined,
        teamLeaderId: form.teamLeaderId || undefined,
      });

      logRecentActivity({
        type: "create",
        entity: "team",
        description: `Created team: ${form.name}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

      toast.success("Team created successfully");
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam || !form.name || !form.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await updateTeam({
        id: selectedTeam._id,
        name: form.name,
        code: form.code.toUpperCase(),
        description: form.description,
        departmentId: form.departmentId || undefined,
        facultyId: form.facultyId || undefined,
        teamLeaderId: form.teamLeaderId || undefined,
      });

      logRecentActivity({
        type: "edit",
        entity: "team",
        description: `Updated team: ${form.name}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

      toast.success("Team updated successfully");
      resetForm();
      setModalOpen(false);
      setSelectedTeam(null);
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Failed to update team");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      description: "",
      departmentId: "",
      facultyId: "",
      teamLeaderId: "",
    });
    setIsEditing(false);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (team: Team) => {
    setSelectedTeam(team);
    setForm({
      name: team.name,
      code: team.code,
      description: team.description || "",
      departmentId: team.departmentId || "",
      facultyId: team.facultyId || "",
      teamLeaderId: team.teamLeaderId || "",
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const getDepartmentName = (departmentId?: Id<'departments'>) => {
    if (!departmentId) return "Not assigned";
    const department = departments.find(d => d._id === departmentId);
    return department?.name || "Unknown";
  };

  const getFacultyName = (facultyId?: Id<'faculties'>) => {
    if (!facultyId) return "Not assigned";
    const faculty = faculties.find(f => f._id === facultyId);
    return faculty?.name || "Unknown";
  };

  const getTeamLeaderName = (teamLeaderId?: Id<'users'>) => {
    if (!teamLeaderId) return "Not assigned";
    const teamLeader = users.find(u => u._id === teamLeaderId);
    if (!teamLeader) return "Unknown";
    return `${teamLeader.firstName || ''} ${teamLeader.lastName || ''}`.trim() || teamLeader.email;
  };

  const getTeamMemberCount = (teamName: string) => {
    return lecturers.filter(lecturer => lecturer.team === teamName).length;
  };

  const getTeamMembers = (teamName: string) => {
    const teamLecturers = lecturers.filter(lecturer => lecturer.team === teamName);
    return teamLecturers.map(lecturer => {
      const profile = lecturerProfiles.find(p => p._id === lecturer.profileId);
      return profile?.fullName || "Unknown";
    });
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDepartmentName(team.departmentId).toLowerCase().includes(searchTerm.toLowerCase())
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
          activeTab="teams" 
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
              Team Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage academic teams and their members
            </p>
          </div>
          <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Team
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teams</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teams.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Teams</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {teams.filter(t => t.isActive).length}
                  </p>
                </div>
                <Building className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lecturers.length}
                  </p>
                </div>
                <User className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Departments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {departments.length}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-amber-600" />
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
                  placeholder="Search teams by name, code, or department..."
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

        {/* Teams Table */}
        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>
              A list of all academic teams in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Team Leader</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((team) => (
                  <TableRow key={team._id}>
                    <TableCell className="font-medium">{team.code}</TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{getDepartmentName(team.departmentId)}</TableCell>
                    <TableCell>{getFacultyName(team.facultyId)}</TableCell>
                    <TableCell>{getTeamLeaderName(team.teamLeaderId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTeamMemberCount(team.name)} members
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={team.isActive ? "default" : "secondary"}>
                        {team.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(team)}
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

        {/* Create/Edit Team Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Team" : "Create New Team"}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? "Update team information" : "Add a new team to the system"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Team Code *</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={handleFormChange}
                    placeholder="e.g., CS_TEAM"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Computer Science Team"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Team description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department</Label>
                  <Select value={form.departmentId} onValueChange={(value) => handleSelectChange("departmentId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not assigned</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department._id} value={department._id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamLeaderId">Team Leader</Label>
                <Select value={form.teamLeaderId} onValueChange={(value) => handleSelectChange("teamLeaderId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team leader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not assigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
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
                onClick={isEditing ? handleUpdateTeam : handleCreateTeam}
                disabled={submitting}
              >
                {submitting ? "Saving..." : isEditing ? "Update Team" : "Create Team"}
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