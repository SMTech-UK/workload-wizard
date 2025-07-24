"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Search, Users, Clock, MapPin, GripVertical } from "lucide-react"

// Mock data
const modules = [
  {
    id: "CS101",
    title: "Introduction to Programming",
    credits: 20,
    semester: "Semester 1",
    sites: [
      { name: "Main Campus", groups: 3, students: 90 },
      { name: "City Campus", groups: 1, students: 25 },
    ],
    teachingHours: 120,
    assignedTo: null,
    status: "unassigned",
  },
  {
    id: "CS201",
    title: "Data Structures & Algorithms",
    credits: 20,
    semester: "Semester 1",
    sites: [{ name: "Main Campus", groups: 2, students: 60 }],
    teachingHours: 100,
    assignedTo: "Dr. Sarah Smith",
    status: "assigned",
  },
  {
    id: "MA101",
    title: "Calculus I",
    credits: 20,
    semester: "Semester 1",
    sites: [
      { name: "Main Campus", groups: 4, students: 120 },
      { name: "City Campus", groups: 2, students: 50 },
    ],
    teachingHours: 140,
    assignedTo: "Dr. Michael Johnson",
    status: "overloaded",
  },
]

const lecturers = [
  {
    id: "lecturer-1",
    name: "Dr. Sarah Smith",
    contractType: "AP",
    capacity: 1200,
    assigned: 1150,
    modules: ["CS201"],
  },
  {
    id: "lecturer-2",
    name: "Dr. Michael Johnson",
    contractType: "AP",
    capacity: 1200,
    assigned: 1250,
    modules: ["MA101"],
  },
  {
    id: "lecturer-3",
    name: "Dr. Emily Williams",
    contractType: "TA",
    capacity: 900,
    assigned: 800,
    modules: [],
  },
]

export default function ModuleAssignment() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [moduleList, setModuleList] = useState(modules)
  const [lecturerList, setLecturerList] = useState(lecturers)

  const filteredModules = moduleList.filter((module) => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = selectedSemester === "all" || module.semester === selectedSemester
    return matchesSearch && matchesSemester
  })

  const unassignedModules = filteredModules.filter((m) => m.status === "unassigned")

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    // Handle module assignment logic here
    console.log("Module assignment:", { destination, source, draggableId })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return (
          <Badge variant="default" className="bg-green-600">
            Assigned
          </Badge>
        )
      case "unassigned":
        return <Badge variant="secondary">Unassigned</Badge>
      case "overloaded":
        return <Badge variant="destructive">Overloaded</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getCapacityColor = (assigned: number, capacity: number) => {
    const percentage = (assigned / capacity) * 100
    if (percentage > 100) return "text-red-600"
    if (percentage > 90) return "text-amber-600"
    return "text-green-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Module Assignment</h1>
          <p className="text-gray-600 mt-1">Assign modules to lecturers and manage workload distribution</p>
        </div>
        <Button>Save Assignments</Button>
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
                  placeholder="Search modules by code or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="Semester 1">Semester 1</SelectItem>
                <SelectItem value="Semester 2">Semester 2</SelectItem>
                <SelectItem value="Summer School">Summer School</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unassigned Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Modules ({unassignedModules.length})</CardTitle>
              <CardDescription>Drag modules to assign them to lecturers</CardDescription>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="unassigned">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {unassignedModules.map((module, index) => (
                      <Draggable key={module.id} draggableId={module.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 border rounded-lg bg-white hover:shadow-md transition-shadow cursor-move"
                          >
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{module.id}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {module.semester}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{module.title}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {module.teachingHours}h
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {module.sites.reduce((total, site) => total + site.students, 0)} students
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* Lecturer Assignment Columns */}
          <div className="lg:col-span-2 space-y-4">
            {lecturerList.map((lecturer) => (
              <Card key={lecturer.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{lecturer.name}</CardTitle>
                      <CardDescription>
                        {lecturer.contractType} • {lecturer.assigned}h / {lecturer.capacity}h capacity
                      </CardDescription>
                    </div>
                    <div className={`text-sm font-medium ${getCapacityColor(lecturer.assigned, lecturer.capacity)}`}>
                      {Math.round((lecturer.assigned / lecturer.capacity) * 100)}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId={lecturer.id}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-24">
                        {lecturer.modules.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            Drop modules here to assign
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {lecturer.modules.map((moduleId, index) => {
                              const module = moduleList.find((m) => m.id === moduleId)
                              if (!module) return null

                              return (
                                <div key={moduleId} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-sm">{module.id}</div>
                                      <div className="text-sm text-gray-600">{module.title}</div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                      <div>{module.teachingHours}h</div>
                                      <div>
                                        {module.sites.reduce((total, site) => total + site.students, 0)} students
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* All Modules Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Modules</CardTitle>
          <CardDescription>Complete overview of all modules and their assignment status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Sites & Groups</TableHead>
                <TableHead>Teaching Hours</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{module.id}</div>
                      <div className="text-sm text-muted-foreground">{module.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{module.semester}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {module.sites.map((site, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span>{site.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {site.groups} groups, {site.students} students
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {module.teachingHours}h
                    </div>
                  </TableCell>
                  <TableCell>
                    {module.assignedTo || <span className="text-muted-foreground">Unassigned</span>}
                  </TableCell>
                  <TableCell>{getStatusBadge(module.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
