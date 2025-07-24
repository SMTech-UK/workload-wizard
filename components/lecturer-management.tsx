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

  // Add state for form fields
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contract: "",
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
  })
  const [submitting, setSubmitting] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setForm((prev) => ({ ...prev, [id]: id === "capacity" || id === "maxTeachingHours" ? Number(value) : value }))
  }

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, contract: value }))
  }

  const handleCreateLecturer = async () => {
    setSubmitting(true)
    try {
      await createLecturer(form)
      setModalOpen(false)
      setForm({
        fullName: "",
        email: "",
        contract: "",
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
                <Label htmlFor="contract">Contract Type</Label>
                <Select value={form.contract} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AP">Academic Practitioner (AP)</SelectItem>
                    <SelectItem value="TA">Teaching Academic (TA)</SelectItem>
                    <SelectItem value="RA">Research Academic (RA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" value={form.capacity} onChange={handleFormChange} placeholder="1200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTeachingHours">Max Teaching Hours</Label>
                <Input id="maxTeachingHours" type="number" value={form.maxTeachingHours} onChange={handleFormChange} placeholder="520" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Input id="team" value={form.team} onChange={handleFormChange} placeholder="Simulation" />
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
              {filteredLecturers.map((lecturer) => {
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
              })}
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
        moduleAllocations={selectedLecturer && selectedLecturer.moduleAllocations ? selectedLecturer.moduleAllocations.map((alloc: any) => {
          const module = modules.find((m: any) => m.id === alloc.moduleCode);
          return {
            ...alloc,
            moduleName: module ? module.title : alloc.moduleName,
            semester: module ? module.semester : alloc.semester,
            type: module ? (module.status === 'core' ? 'Core' : 'Elective') : alloc.type,
            credits: module ? module.credits : undefined,
            teachingHours: module ? module.teachingHours : undefined,
          };
        }) : []}
      />
    </div>
  )
}
