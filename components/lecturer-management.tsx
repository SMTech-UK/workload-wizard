"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Edit, Eye, AlertTriangle, X } from "lucide-react"
import StaffProfileModal from "./staff-profile-modal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function LecturerManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLecturer, setSelectedLecturer] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const lecturers = useQuery(api.lecturers.getAll) ?? [];
  const createLecturer = useMutation(api.lecturers.createLecturer)
  const adminAllocations = useQuery(api.admin_allocations.getAll) ?? [];
  const modules = useQuery(api.modules.getAll) ?? [];

  // Add careerFamilies and helper for FTE calculation
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
        return 0.6; // fallback
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

  // Add roles array for dropdown
  const roles = [
    { value: "Lecturer", label: "Lecturer" },
    { value: "Senior Lecturer", label: "Senior Lecturer" },
    { value: "Professional Lead", label: "Professional Lead" },
    { value: "Professor", label: "Professor" },
  ];

  // Add teams array for dropdown
  const teams = [
    { value: "Simulation", label: "Simulation" },
    { value: "Post-Registration", label: "Post-Registration" },
    { value: "Adult", label: "Adult" },
    { value: "Child/LD", label: "Child/LD" },
    { value: "Mental Health", label: "Mental Health" },
  ];

  // Add state for form fields
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contract: "AP", // default to AP, will be set based on family
    team: "",
    specialism: "",
    capacity: 0, // will be set on creation
    maxTeachingHours: 0, // will be set on creation
    role: "Lecturer",
    status: "available",
    teachingAvailability: 0, // will be set on creation
    totalAllocated: 0,
    totalContract: 0, // will be set on creation
    allocatedTeachingHours: 0,
    allocatedAdminHours: 0,
    family: "",
    fte: 1,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setForm((prev) => {
      let newForm = { ...prev, [id]: value };
      let fte = id === "fte" ? Number(value) : Number(prev.fte);
      let family = id === "family" ? value : prev.family;
      // Calculate contract code (e.g., 1AP, 0.6TA)
      const familyInitials = getFamilyInitialsForContract(family);
      const roundedFte = Math.round(fte * 100) / 100;
      const fteStr = Number.isInteger(roundedFte) ? String(roundedFte) : String(roundedFte).replace(/\.00$/, '');
      newForm.contract = `${fteStr}${familyInitials}`;
      // Calculate totalContract, maxTeachingHours, teachingAvailability, capacity
      if (id === "fte" || id === "family") {
        const teachingPct = getTeachingPercentage(family);
        const totalContract = Math.floor(fte * 1498);
        const maxTeachingHours = Math.floor(totalContract * teachingPct);
        newForm.totalContract = totalContract;
        newForm.maxTeachingHours = maxTeachingHours;
        newForm.teachingAvailability = maxTeachingHours;
        newForm.capacity = maxTeachingHours;
      }
      return newForm;
    })
  }

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, contract: value }))
  }

  const handleFamilyChange = (value: string) => {
    setForm((prev) => {
      const teachingPct = getTeachingPercentage(value);
      const fte = Number(prev.fte);
      const totalContract = Math.floor(fte * 1498);
      const maxTeachingHours = Math.floor(totalContract * teachingPct);
      const familyInitials = getFamilyInitialsForContract(value);
      const roundedFte = Math.round(fte * 100) / 100;
      const fteStr = Number.isInteger(roundedFte) ? String(roundedFte) : String(roundedFte).replace(/\.00$/, '');
      return {
        ...prev,
        family: value,
        contract: `${fteStr}${familyInitials}`,
        totalContract,
        maxTeachingHours,
        teachingAvailability: maxTeachingHours,
        capacity: maxTeachingHours,
      };
    });
  }

  const handleCreateLecturer = async () => {
    setSubmitting(true)
    try {
      await createLecturer(form)
      setModalOpen(false)
      setForm({
        fullName: "",
        email: "",
        contract: "AP",
        team: "",
        specialism: "",
        capacity: 0,
        maxTeachingHours: 0,
        role: "Lecturer",
        status: "available",
        teachingAvailability: 0,
        totalAllocated: 0,
        totalContract: 0,
        allocatedTeachingHours: 0,
        allocatedAdminHours: 0,
        family: "",
        fte: 1,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const [statusFilter, setStatusFilter] = useState('all');
  const filteredLecturers = lecturers.filter((lecturer) => {
    const matchesSearch =
      lecturer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.team?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || lecturer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  interface lecturer {
    fullName: string
    team: string
    specialism: string
    contract: string
    email: string
    capacity: number
    id: string
    maxTeachingHours: number
    role: string
    status: string
    teachingAvailability: number
    totalAllocated: number
    totalContract: number
    allocatedTeachingHours: number
    allocatedAdminHours: number
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overloaded":
        return <Badge variant="destructive">Overloaded</Badge>
      case "at-capacity":
        return <Badge variant="secondary">At Capacity</Badge>
      case "near-capacity":
        return <Badge variant="secondary">Near Capacity</Badge>
      case "available":
        return (
          <Badge variant="default" className="bg-green-600">
            Available
          </Badge>
        )
      case "n/a":
        return <Badge variant="outline">N/A</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getContractTypeBadge = (type: string) => {
    const colors = {
      AP: "bg-blue-100 text-blue-800",
      TA: "bg-green-100 text-green-800",
      RA: "bg-purple-100 text-purple-800",
    }
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lecturer Management</h1>
          <p className="text-gray-600 mt-1">Manage academic staff profiles and capacity</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lecturer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Lecturer</DialogTitle>
              <DialogDescription>
                Create a new lecturer profile with contract details and allocations.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={form.fullName} onChange={handleFormChange} placeholder="Dr. John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={handleFormChange} placeholder="j.doe@university.edu" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={form.role} onValueChange={value => setForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Removed contract type field, only FTE and Career Family remain */}
              <div className="space-y-2">
                <Label htmlFor="family">Career Family</Label>
                <Select value={form.family} onValueChange={handleFamilyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select career family">
                      {getFamilyLabel(form.family)}
                    </SelectValue>
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
                <Input id="fte" type="number" min={0.01} max={1} step={0.01} value={form.fte} onChange={handleFormChange} placeholder="1.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Select value={form.team} onValueChange={value => setForm(prev => ({ ...prev, team: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.value} value={team.value}>
                        {team.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialism">Specialism</Label>
                <Input id="specialism" value={form.specialism} onChange={handleFormChange} placeholder="Paramedic" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleCreateLecturer} disabled={submitting || !form.fullName || !form.email || !form.contract}>
                {submitting ? "Creating..." : "Create Lecturer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lecturers by name or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="near-capacity">Near Capacity</SelectItem>
                <SelectItem value="at-capacity">At Capacity</SelectItem>
                <SelectItem value="overloaded">Overloaded</SelectItem>
                <SelectItem value="n/a">N/A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lecturers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Staff ({filteredLecturers.length})</CardTitle>
          <CardDescription>Overview of all academic staff and their current workload</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLecturers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No lecturers to show.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLecturers.map((lecturer) => {
                  // If assigned and capacity are both 0, treat status as 'n/a'
                  const status = (lecturer.totalAllocated === 0 && lecturer.totalContract === 0) ? 'n/a' : lecturer.status;
                  const handleOpenModal = () => {
                    setSelectedLecturer(lecturer);
                    setModalOpen(true);
                  };
                  return (
                    <TableRow key={lecturer._id} className="cursor-pointer hover:bg-accent/40" onClick={handleOpenModal}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lecturer.fullName}</div>
                        <div className="text-sm text-muted-foreground">{lecturer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getContractTypeBadge(lecturer.contract)}
                        <div className="text-xs text-muted-foreground">FTE: {lecturer.fte.toFixed(1)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{lecturer.team || lecturer.specialism || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-2 min-w-32">
                        <div className="flex items-center justify-between text-sm">
                          <span>{lecturer.capacity}h</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-muted-foreground cursor-help">remaining</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Total Contract: {lecturer.totalContract}h
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Progress value={lecturer.totalContract ? (lecturer.totalAllocated / lecturer.totalContract) * 100 : 0} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(status)}
                        {status === "overloaded" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleOpenModal(); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Replace LecturerDetailsModal with StaffProfileModal */}
      <StaffProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lecturer={selectedLecturer}
        adminAllocations={selectedLecturer ? (adminAllocations.find(a => a.lecturerId === selectedLecturer.id)?.adminAllocations ?? []) : []}
      />
    </div>
  )
}
