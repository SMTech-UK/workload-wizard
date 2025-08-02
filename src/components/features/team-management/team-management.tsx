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
import { Plus, Search, Edit, Eye, AlertTriangle, X, Users, Building, MapPin, Phone, Mail } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import type { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// Define interfaces based on the database schema
interface Team {
  _id: Id<'teams'>;
  name: string;
  code: string;
  description?: string;
  departmentId?: Id<'departments'>;
  facultyId?: Id<'faculties'>;
  teamLeaderId?: Id<'user_profiles'>;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  teamType: string;
  level: string;
  isActive: boolean;
  notes?: string;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface Department {
  _id: Id<'departments'>;
  name: string;
  code: string;
}

interface Faculty {
  _id: Id<'faculties'>;
  name: string;
  code: string;
}

interface UserProfile {
  _id: Id<'user_profiles'>;
  fullName: string;
  email: string;
}

export default function TeamManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTeamData, setNewTeamData] = useState({
    name: "",
    code: "",
    description: "",
    departmentId: undefined as Id<'departments'> | undefined,
    facultyId: undefined as Id<'faculties'> | undefined,
    teamLeaderId: undefined as Id<'user_profiles'> | undefined,
    contactEmail: "",
    contactPhone: "",
    location: "",
    notes: "",
  });

  const { user } = useUser();
  const logActivity = useLogRecentActivity();
  
  // Fetch data
  const teams = useQuery('teams:getAllWithRelations' as any, {}) ?? [];
  const departments = useQuery('departments:getAll' as any, {}) ?? [];
  const faculties = useQuery('faculties:getAll' as any, {}) ?? [];
  const userProfiles = useQuery('user_profiles:getAll' as any, {}) ?? [];
  
  // Mutations
  const createTeam = useMutation('teams:create' as any);
  const updateTeam = useMutation('teams:update' as any);
  const deleteTeam = useMutation('teams:remove' as any);

  const filteredTeams = teams.filter((team: any) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDepartmentName = (departmentId?: Id<'departments'>) => {
    if (!departmentId) return "Not assigned";
    const department = departments.find((d: any) => d._id === departmentId);
    return department?.name || "Unknown";
  };

  const getFacultyName = (facultyId?: Id<'faculties'>) => {
    if (!facultyId) return "Not assigned";
    const faculty = faculties.find((f: any) => f._id === facultyId);
    return faculty?.name || "Unknown";
  };

  const getTeamLeaderName = (teamLeaderId?: Id<'user_profiles'>) => {
    if (!teamLeaderId) return "Not assigned";
    const teamLeader = userProfiles.find((u: any) => u._id === teamLeaderId);
    return teamLeader ? `${teamLeader.firstName} ${teamLeader.lastName}` : "Unknown";
  };

  const getTeamTypeBadgeColor = (teamType: string) => {
    switch (teamType.toLowerCase()) {
      case 'department': return 'bg-blue-100 text-blue-800';
      case 'faculty': return 'bg-purple-100 text-purple-800';
      case 'research': return 'bg-green-100 text-green-800';
      case 'administrative': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateTeam = async () => {
    try {
      if (!newTeamData.name || !newTeamData.code) {
        toast.error("Please fill in all required fields");
        return;
      }

      const teamId = await createTeam(newTeamData);

      toast.success("Team created successfully");
      setCreateModalOpen(false);
      setNewTeamData({
        name: "",
        code: "",
        description: "",
        departmentId: undefined,
        facultyId: undefined,
        teamLeaderId: undefined,
        contactEmail: "",
        contactPhone: "",
        location: "",
        notes: "",
      });

      if (user) {
        logActivity({
          type: "create",
          entity: "team",
          description: `Created team: ${newTeamData.name}`,
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to create team: ${error}`);
    }
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam) return;

    try {
      await updateTeam({
        id: selectedTeam._id,
        ...newTeamData,
      });

      toast.success("Team updated successfully");
      setModalOpen(false);
      setSelectedTeam(null);

      if (user) {
        logActivity({
          type: "edit",
          entity: "team",
          description: `Updated team: ${selectedTeam.name}`,
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to update team: ${error}`);
    }
  };

  const handleDeleteTeam = async (teamId: Id<'teams'>, teamName: string) => {
    if (!confirm(`Are you sure you want to delete the team "${teamName}"?`)) {
      return;
    }

    try {
      await deleteTeam({ id: teamId });
      toast.success("Team deleted successfully");

      if (user) {
        logActivity({
          type: "delete",
          entity: "team",
          description: `Deleted team: ${teamName}`,
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to delete team: ${error}`);
    }
  };

  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setNewTeamData({
      name: team.name,
      code: team.code,
      description: team.description || "",
      departmentId: team.departmentId,
      facultyId: team.facultyId,
      teamLeaderId: team.teamLeaderId,
      contactEmail: team.contactEmail || "",
      contactPhone: team.contactPhone || "",
      location: team.location || "",
      notes: team.notes || "",
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage academic teams and their organizational structure
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Team
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                {filteredTeams.length} active teams
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
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
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Team Leader</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team: any) => (
                <TableRow key={team._id}>
                  <TableCell className="font-medium">{team.code}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{team.name}</div>
                      {team.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {team.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTeamTypeBadgeColor(team.teamType)}>
                      {team.teamType}
                    </Badge>
                  </TableCell>
                  <TableCell>{getDepartmentName(team.departmentId)}</TableCell>
                  <TableCell>{getFacultyName(team.facultyId)}</TableCell>
                  <TableCell>{getTeamLeaderName(team.teamLeaderId)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {team.contactEmail && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {team.contactEmail}
                        </div>
                      )}
                      {team.contactPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {team.contactPhone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {team.location && (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {team.location}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={team.isActive ? "default" : "secondary"}>
                      {team.isActive ? "Active" : "Inactive"}
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
                              onClick={() => openEditModal(team)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit team</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTeam(team._id, team.name)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete team</TooltipContent>
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

      {/* Create Team Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Add a new academic team to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Team Code *</Label>
                <Input
                  id="code"
                  value={newTeamData.code}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., CS-TEAM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  value={newTeamData.name}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Computer Science Team"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTeamData.description}
                onChange={(e) => setNewTeamData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Team description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={newTeamData.departmentId}
                  onValueChange={(value) => setNewTeamData(prev => ({ ...prev, departmentId: value as Id<'departments'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department: any) => (
                      <SelectItem key={department._id} value={department._id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select
                  value={newTeamData.facultyId}
                  onValueChange={(value) => setNewTeamData(prev => ({ ...prev, facultyId: value as Id<'faculties'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty: any) => (
                      <SelectItem key={faculty._id} value={faculty._id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamLeader">Team Leader</Label>
              <Select
                value={newTeamData.teamLeaderId}
                onValueChange={(value) => setNewTeamData(prev => ({ ...prev, teamLeaderId: value as Id<'user_profiles'> }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team leader" />
                </SelectTrigger>
                <SelectContent>
                  {userProfiles.map((userProfile: any) => (
                    <SelectItem key={userProfile._id} value={userProfile._id}>
                      {`${userProfile.firstName} ${userProfile.lastName}`} ({userProfile.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newTeamData.contactEmail}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="team@university.edu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={newTeamData.contactPhone}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+44 123 456 7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newTeamData.location}
                onChange={(e) => setNewTeamData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Building A, Room 101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newTeamData.notes}
                onChange={(e) => setNewTeamData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the team..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateTeam}>Create Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Team Code *</Label>
                <Input
                  id="edit-code"
                  value={newTeamData.code}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., CS-TEAM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Team Name *</Label>
                <Input
                  id="edit-name"
                  value={newTeamData.name}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Computer Science Team"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newTeamData.description}
                onChange={(e) => setNewTeamData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Team description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select
                  value={newTeamData.departmentId}
                  onValueChange={(value) => setNewTeamData(prev => ({ ...prev, departmentId: value as Id<'departments'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department: any) => (
                      <SelectItem key={department._id} value={department._id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-faculty">Faculty</Label>
                <Select
                  value={newTeamData.facultyId}
                  onValueChange={(value) => setNewTeamData(prev => ({ ...prev, facultyId: value as Id<'faculties'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty: any) => (
                      <SelectItem key={faculty._id} value={faculty._id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-teamLeader">Team Leader</Label>
              <Select
                value={newTeamData.teamLeaderId}
                onValueChange={(value) => setNewTeamData(prev => ({ ...prev, teamLeaderId: value as Id<'user_profiles'> }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team leader" />
                </SelectTrigger>
                <SelectContent>
                  {userProfiles.map((userProfile: any) => (
                    <SelectItem key={userProfile._id} value={userProfile._id}>
                      {`${userProfile.firstName} ${userProfile.lastName}`} ({userProfile.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contactEmail">Contact Email</Label>
                <Input
                  id="edit-contactEmail"
                  type="email"
                  value={newTeamData.contactEmail}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="team@university.edu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                <Input
                  id="edit-contactPhone"
                  value={newTeamData.contactPhone}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+44 123 456 7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={newTeamData.location}
                onChange={(e) => setNewTeamData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Building A, Room 101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={newTeamData.notes}
                onChange={(e) => setNewTeamData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the team..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateTeam}>Update Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 