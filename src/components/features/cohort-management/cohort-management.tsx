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
import { Plus, Search, Edit, Eye, AlertTriangle, X, Users, Calendar, GraduationCap, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import type { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// Define interfaces based on the database schema
interface Cohort {
  _id: Id<'cohorts'>;
  courseId: Id<'courses'>;
  academicYearId: Id<'academic_years'>;
  name: string;
  code: string;
  entryYear: number;
  isFullTime: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface Course {
  _id: Id<'courses'>;
  name: string;
  code: string;
  level: string;
}

interface AcademicYear {
  _id: Id<'academic_years'>;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function CohortManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCohortData, setNewCohortData] = useState({
    courseId: "" as Id<'courses'>,
    academicYearId: "" as Id<'academic_years'>,
    name: "",
    code: "",
    entryYear: new Date().getFullYear(),
    isFullTime: true,
    startDate: "",
    endDate: "",
  });

  const { user } = useUser();
  const logActivity = useLogRecentActivity();
  const { currentAcademicYearId } = useAcademicYear();
  
  // Fetch data
  const cohorts = useQuery(api.cohorts.getAll, { 
    academicYearId: currentAcademicYearId as any,
    isActive: true 
  }) ?? [];
  const courses = useQuery(api.courses.getAll, { isActive: true }) ?? [];
  const academicYears = useQuery(api.academic_years.getAll, {}) ?? [];
  
  // Mutations
  const createCohort = useMutation(api.cohorts.create);
  const updateCohort = useMutation(api.cohorts.update);
  const deleteCohort = useMutation(api.cohorts.remove);

  const filteredCohorts = cohorts.filter(cohort =>
    cohort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cohort.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCourseName = (courseId: Id<'courses'>) => {
    const course = courses.find(c => c._id === courseId);
    return course?.name || "Unknown Course";
  };

  const getCourseCode = (courseId: Id<'courses'>) => {
    const course = courses.find(c => c._id === courseId);
    return course?.code || "Unknown";
  };

  const getAcademicYearName = (academicYearId: Id<'academic_years'>) => {
    const academicYear = academicYears.find(ay => ay._id === academicYearId);
    return academicYear?.name || "Unknown Year";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getCohortStatus = (cohort: Cohort) => {
    const now = new Date();
    const startDate = new Date(cohort.startDate);
    const endDate = new Date(cohort.endDate);
    
    if (now < startDate) return { status: "Upcoming", color: "bg-yellow-100 text-yellow-800" };
    if (now > endDate) return { status: "Completed", color: "bg-gray-100 text-gray-800" };
    return { status: "Active", color: "bg-green-100 text-green-800" };
  };

  const handleCreateCohort = async () => {
    try {
      if (!newCohortData.courseId || !newCohortData.academicYearId || !newCohortData.name || !newCohortData.code || !newCohortData.startDate || !newCohortData.endDate) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (newCohortData.startDate >= newCohortData.endDate) {
        toast.error("Start date must be before end date");
        return;
      }

      const cohortId = await createCohort(newCohortData);

      toast.success("Cohort created successfully");
      setCreateModalOpen(false);
      setNewCohortData({
        courseId: "" as Id<'courses'>,
        academicYearId: "" as Id<'academic_years'>,
        name: "",
        code: "",
        entryYear: new Date().getFullYear(),
        isFullTime: true,
        startDate: "",
        endDate: "",
      });

      if (user) {
        logActivity({
          action: "Created cohort",
          details: newCohortData.name,
          entityType: "cohort",
          entityId: cohortId,
        });
      }
    } catch (error) {
      toast.error(`Failed to create cohort: ${error}`);
    }
  };

  const handleUpdateCohort = async () => {
    if (!selectedCohort) return;

    try {
      if (newCohortData.startDate >= newCohortData.endDate) {
        toast.error("Start date must be before end date");
        return;
      }

      await updateCohort({
        id: selectedCohort._id,
        ...newCohortData,
      });

      toast.success("Cohort updated successfully");
      setModalOpen(false);
      setSelectedCohort(null);

      if (user) {
        logActivity({
          action: "Updated cohort",
          details: selectedCohort.name,
          entityType: "cohort",
          entityId: selectedCohort._id,
        });
      }
    } catch (error) {
      toast.error(`Failed to update cohort: ${error}`);
    }
  };

  const handleDeleteCohort = async (cohortId: Id<'cohorts'>, cohortName: string) => {
    if (!confirm(`Are you sure you want to delete the cohort "${cohortName}"?`)) {
      return;
    }

    try {
      await deleteCohort({ id: cohortId });
      toast.success("Cohort deleted successfully");

      if (user) {
        logActivity({
          action: "Deleted cohort",
          details: cohortName,
          entityType: "cohort",
          entityId: cohortId,
        });
      }
    } catch (error) {
      toast.error(`Failed to delete cohort: ${error}`);
    }
  };

  const openEditModal = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setNewCohortData({
      courseId: cohort.courseId,
      academicYearId: cohort.academicYearId,
      name: cohort.name,
      code: cohort.code,
      entryYear: cohort.entryYear,
      isFullTime: cohort.isFullTime,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cohort Management</h1>
          <p className="text-muted-foreground">
            Manage student cohorts and their academic year assignments
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Cohort
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cohorts</CardTitle>
              <CardDescription>
                {filteredCohorts.length} active cohorts
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cohorts..."
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
                <TableHead>Course</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Entry Year</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCohorts.map((cohort) => {
                const status = getCohortStatus(cohort);
                return (
                  <TableRow key={cohort._id}>
                    <TableCell className="font-medium">{cohort.code}</TableCell>
                    <TableCell>{cohort.name}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getCourseName(cohort.courseId)}</div>
                        <div className="text-sm text-muted-foreground">{getCourseCode(cohort.courseId)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getAcademicYearName(cohort.academicYearId)}</TableCell>
                    <TableCell>{cohort.entryYear}</TableCell>
                    <TableCell>
                      <Badge variant={cohort.isFullTime ? "default" : "secondary"}>
                        {cohort.isFullTime ? "Full Time" : "Part Time"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(cohort.startDate)} - {formatDate(cohort.endDate)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        {status.status}
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
                                onClick={() => openEditModal(cohort)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit cohort</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCohort(cohort._id, cohort.name)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete cohort</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Cohort Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Cohort</DialogTitle>
            <DialogDescription>
              Add a new student cohort to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Cohort Code *</Label>
                <Input
                  id="code"
                  value={newCohortData.code}
                  onChange={(e) => setNewCohortData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., CS2024FT"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Cohort Name *</Label>
                <Input
                  id="name"
                  value={newCohortData.name}
                  onChange={(e) => setNewCohortData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Computer Science 2024 Full Time"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={newCohortData.courseId}
                  onValueChange={(value) => setNewCohortData(prev => ({ ...prev, courseId: value as Id<'courses'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Select
                  value={newCohortData.academicYearId}
                  onValueChange={(value) => setNewCohortData(prev => ({ ...prev, academicYearId: value as Id<'academic_years'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((academicYear) => (
                      <SelectItem key={academicYear._id} value={academicYear._id}>
                        {academicYear.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryYear">Entry Year *</Label>
                <Input
                  id="entryYear"
                  type="number"
                  min="2000"
                  max="2100"
                  value={newCohortData.entryYear}
                  onChange={(e) => setNewCohortData(prev => ({ ...prev, entryYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isFullTime">Study Type</Label>
                <Select
                  value={newCohortData.isFullTime ? "true" : "false"}
                  onValueChange={(value) => setNewCohortData(prev => ({ ...prev, isFullTime: value === "true" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Full Time</SelectItem>
                    <SelectItem value="false">Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newCohortData.startDate}
                  onChange={(e) => setNewCohortData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newCohortData.endDate}
                  onChange={(e) => setNewCohortData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateCohort}>Create Cohort</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cohort Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Cohort</DialogTitle>
            <DialogDescription>
              Update cohort information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Cohort Code *</Label>
                <Input
                  id="edit-code"
                  value={newCohortData.code}
                  onChange={(e) => setNewCohortData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., CS2024FT"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Cohort Name *</Label>
                <Input
                  id="edit-name"
                  value={newCohortData.name}
                  onChange={(e) => setNewCohortData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Computer Science 2024 Full Time"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-course">Course *</Label>
                <Select
                  value={newCohortData.courseId}
                  onValueChange={(value) => setNewCohortData(prev => ({ ...prev, courseId: value as Id<'courses'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-academicYear">Academic Year *</Label>
                <Select
                  value={newCohortData.academicYearId}
                  onValueChange={(value) => setNewCohortData(prev => ({ ...prev, academicYearId: value as Id<'academic_years'> }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((academicYear) => (
                      <SelectItem key={academicYear._id} value={academicYear._id}>
                        {academicYear.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-entryYear">Entry Year *</Label>
                <Input
                  id="edit-entryYear"
                  type="number"
                  min="2000"
                  max="2100"
                  value={newCohortData.entryYear}
                  onChange={(e) => setNewCohortData(prev => ({ ...prev, entryYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-isFullTime">Study Type</Label>
                <Select
                  value={newCohortData.isFullTime ? "true" : "false"}
                  onValueChange={(value) => setNewCohortData(prev => ({ ...prev, isFullTime: value === "true" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Full Time</SelectItem>
                    <SelectItem value="false">Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={newCohortData.startDate}
                  onChange={(e) => setNewCohortData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date *</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={newCohortData.endDate}
                  onChange={(e) => setNewCohortData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateCohort}>Update Cohort</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 