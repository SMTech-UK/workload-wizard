"use client"

import { useState } from "react"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Edit, Eye, AlertTriangle } from "lucide-react"

// Mock lecturer data
const lecturers = [
  {
    id: 1,
    name: "Dr. Sarah Smith",
    email: "s.smith@university.edu",
    contractType: "AP",
    fte: 1.0,
    totalHours: 1200,
    assignedHours: 1150,
    qualifications: ["PhD Computer Science", "FHEA"],
    department: "Computer Science",
    status: "near-capacity",
  },
  {
    id: 2,
    name: "Dr. Michael Johnson",
    email: "m.johnson@university.edu",
    contractType: "AP",
    fte: 1.0,
    totalHours: 1200,
    assignedHours: 1250,
    qualifications: ["PhD Mathematics", "HEA"],
    department: "Mathematics",
    status: "overloaded",
  },
  {
    id: 3,
    name: "Dr. Emily Williams",
    email: "e.williams@university.edu",
    contractType: "TA",
    fte: 0.8,
    totalHours: 900,
    assignedHours: 800,
    qualifications: ["PhD Physics", "PGCHE"],
    department: "Physics",
    status: "available",
  },
  {
    id: 4,
    name: "Dr. James Brown",
    email: "j.brown@university.edu",
    contractType: "RA",
    fte: 0.5,
    totalHours: 450,
    assignedHours: 400,
    qualifications: ["PhD Chemistry"],
    department: "Chemistry",
    status: "available",
  },
]

export default function LecturerManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLecturer, setSelectedLecturer] = useState(null)

  const filteredLecturers = lecturers.filter(
    (lecturer) =>
      lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overloaded":
        return <Badge variant="destructive">Overloaded</Badge>
      case "near-capacity":
        return <Badge variant="secondary">Near Capacity</Badge>
      case "available":
        return (
          <Badge variant="default" className="bg-green-600">
            Available
          </Badge>
        )
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
                Create a new lecturer profile with contract details and qualifications.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Dr. John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="j.doe@university.edu" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract">Contract Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AP">Academic Permanent (AP)</SelectItem>
                    <SelectItem value="TA">Teaching Associate (TA)</SelectItem>
                    <SelectItem value="RA">Research Associate (RA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fte">FTE</Label>
                <Input id="fte" type="number" step="0.1" min="0" max="1" placeholder="1.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" placeholder="Computer Science" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input id="qualifications" placeholder="PhD, FHEA, etc." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Create Lecturer</Button>
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
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by contract" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contracts</SelectItem>
                <SelectItem value="AP">Academic Permanent</SelectItem>
                <SelectItem value="TA">Teaching Associate</SelectItem>
                <SelectItem value="RA">Research Associate</SelectItem>
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
                <TableHead>Department</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLecturers.map((lecturer) => (
                <TableRow key={lecturer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{lecturer.name}</div>
                      <div className="text-sm text-muted-foreground">{lecturer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getContractTypeBadge(lecturer.contractType)}
                      <div className="text-xs text-muted-foreground">FTE: {lecturer.fte}</div>
                    </div>
                  </TableCell>
                  <TableCell>{lecturer.department}</TableCell>
                  <TableCell>
                    <div className="space-y-2 min-w-32">
                      <div className="flex items-center justify-between text-sm">
                        <span>{lecturer.assignedHours}h</span>
                        <span className="text-muted-foreground">/ {lecturer.totalHours}h</span>
                      </div>
                      <Progress value={(lecturer.assignedHours / lecturer.totalHours) * 100} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(lecturer.status)}
                      {lecturer.status === "overloaded" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
