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
import { Plus, Search, Edit, Eye, X, Users, GraduationCap, Calendar, Building, BookOpen } from "lucide-react"
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import Navigation from "@/components/layout/navigation"
import SettingsModal, { TabType } from "@/components/modals/settings-modal"
import type { Id } from "../../../convex/_generated/dataModel";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { toast } from "sonner";

// Define interfaces based on the database schema
interface Cohort {
  _id: Id<'cohorts'>;
  code: string;
  name: string;
  description?: string;
  courseId: Id<'courses'>;
  academicYearId: Id<'academic_years'>;
  startDate: string;
  endDate: string;
  expectedGraduationDate: string;
  studentCount: number;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface Course {
  _id: Id<'courses'>;
  code: string;
  title: string;
  level: number;
  totalCredits: number;
  duration: number;
}

interface AcademicYear {
  _id: Id<'academic_years'>;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function CohortManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<TabType>("profile");

  // Fetch data from Convex
  const cohorts = useQuery(api.cohorts.getAll, {}) ?? [];
  const courses = useQuery(api.courses.getAll, {}) ?? [];
  const academicYears = useQuery(api.academic_years.getAll, {}) ?? [];
  const createCohort = useMutation(api.cohorts.create);
  const updateCohort = useMutation(api.cohorts.update);
  const deleteCohort = useMutation(api.cohorts.delete);
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();
  const { currentAcademicYearId } = useAcademicYear();

  // State for form fields
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    courseId: "",
    academicYearId: "",
    startDate: "",
    endDate: "",
    expectedGraduationDate: "",
    studentCount: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCohort = async () => {
    if (!form.code || !form.name || !form.courseId || !form.academicYearId || !form.startDate || !form.endDate || !form.expectedGraduationDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await createCohort({
        code: form.code.toUpperCase(),
        name: form.name,
        description: form.description,
        courseId: form.courseId as Id<'courses'>,
        academicYearId: form.academicYearId as Id<'academic_years'>,
        startDate: form.startDate,
        endDate: form.endDate,
        expectedGraduationDate: form.expectedGraduationDate,
        studentCount: form.studentCount,
      });

      logRecentActivity({
        type: "create",
        entity: "cohort",
        description: `Created cohort: ${form.name}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

      toast.success("Cohort created successfully");
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error("Error creating cohort:", error);
      toast.error("Failed to create cohort");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCohort = async () => {
    if (!selectedCohort || !form.code || !form.name || !form.courseId || !form.academicYearId || !form.startDate || !form.endDate || !form.expectedGraduationDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await updateCohort({
        id: selectedCohort._id,
        code: form.code.toUpperCase(),
        name: form.name,
        description: form.description,
        courseId: form.courseId as Id<'courses'>,
        academicYearId: form.academicYearId as Id<'academic_years'>,
        startDate: form.startDate,
        endDate: form.endDate,
        expectedGraduationDate: form.expectedGraduationDate,
        studentCount: form.studentCount,
      });

      logRecentActivity({
        type: "edit",
        entity: "cohort",
        description: `Updated cohort: ${form.name}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

      toast.success("Cohort updated successfully");
      resetForm();
      setModalOpen(false);
      setSelectedCohort(null);
    } catch (error) {
      console.error("Error updating cohort:", error);
      toast.error("Failed to update cohort");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      description: "",
      courseId: "",
      academicYearId: "",
      startDate: "",
      endDate: "",
      expectedGraduationDate: "",
      studentCount: 0,
    });
    setIsEditing(false);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setForm({
      code: cohort.code,
      name: cohort.name,
      description: cohort.description || "",
      courseId: cohort.courseId,
      academicYearId: cohort.academicYearId,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      expectedGraduationDate: cohort.expectedGraduationDate,
      studentCount: cohort.studentCount,
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const getCourseName = (courseId: Id<'courses'>) => {
    const course = courses.find(c => c._id === courseId);
    return course ? `${course.code} - ${course.title}` : "Unknown Course";
  };

  const getAcademicYearName = (academicYearId: Id<'academic_years'>) => {
    const academicYear = academicYears.find(ay => ay._id === academicYearId);
    return academicYear?.name || "Unknown Year";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (cohort: Cohort) => {
    const now = new Date();
    const startDate = new Date(cohort.startDate);
    const endDate = new Date(cohort.endDate);
    const graduationDate = new Date(cohort.expectedGraduationDate);

    if (now < startDate) {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
    } else if (now >= startDate && now <= endDate) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else if (now > endDate && now <= graduationDate) {
      return <Badge className="bg-yellow-100 text-yellow-800">Graduating</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
    }
  };

  const filteredCohorts = cohorts.filter(cohort =>
    cohort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cohort.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCourseName(cohort.courseId).toLowerCase().includes(searchTerm.toLowerCase())
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
          activeTab="cohorts" 
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
              Cohort Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage student cohorts and their academic progression
            </p>
          </div>
          <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Cohort
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cohorts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{cohorts.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Cohorts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cohorts.filter(c => c.isActive).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cohorts.reduce((sum, cohort) => sum + cohort.studentCount, 0)}
                  </p>
                </div>
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(cohorts.map(c => c.courseId)).size}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-amber-600" />
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
                  placeholder="Search cohorts by name, code, or course..."
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

        {/* Cohorts Table */}
        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle>Cohorts</CardTitle>
            <CardDescription>
              A list of all student cohorts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCohorts.map((cohort) => (
                  <TableRow key={cohort._id}>
                    <TableCell className="font-medium">{cohort.code}</TableCell>
                    <TableCell>{cohort.name}</TableCell>
                    <TableCell>{getCourseName(cohort.courseId)}</TableCell>
                    <TableCell>{getAcademicYearName(cohort.academicYearId)}</TableCell>
                    <TableCell>{cohort.studentCount}</TableCell>
                    <TableCell>{formatDate(cohort.startDate)}</TableCell>
                    <TableCell>{formatDate(cohort.endDate)}</TableCell>
                    <TableCell>{getStatusBadge(cohort)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(cohort)}
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

        {/* Create/Edit Cohort Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Cohort" : "Create New Cohort"}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? "Update cohort information" : "Add a new cohort to the system"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Cohort Code *</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={handleFormChange}
                    placeholder="e.g., CS2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentCount">Student Count</Label>
                  <Input
                    id="studentCount"
                    type="number"
                    value={form.studentCount}
                    onChange={handleFormChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Cohort Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Computer Science 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Cohort description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseId">Course *</Label>
                  <Select value={form.courseId} onValueChange={(value) => handleSelectChange("courseId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.code} - {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYearId">Academic Year *</Label>
                  <Select value={form.academicYearId} onValueChange={(value) => handleSelectChange("academicYearId", value)}>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedGraduationDate">Graduation Date *</Label>
                  <Input
                    id="expectedGraduationDate"
                    type="date"
                    value={form.expectedGraduationDate}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </DialogClose>
              <Button 
                onClick={isEditing ? handleUpdateCohort : handleCreateCohort}
                disabled={submitting}
              >
                {submitting ? "Saving..." : isEditing ? "Update Cohort" : "Create Cohort"}
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