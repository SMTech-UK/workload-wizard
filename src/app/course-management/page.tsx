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
import { Plus, Search, Edit, Eye, X, GraduationCap, Users, BookOpen, Calendar, Building } from "lucide-react"
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import Navigation from "@/components/layout/navigation"
import SettingsModal, { TabType } from "@/components/modals/settings-modal"
import type { Id } from "../../../convex/_generated/dataModel";
import { useAcademicYear } from "@/hooks/useAcademicYear";
import { toast } from "sonner";

// Define interfaces based on the database schema
interface Course {
  _id: Id<'courses'>;
  code: string;
  title: string;
  description?: string;
  level: number;
  totalCredits: number;
  duration: number; // in years
  facultyId?: Id<'faculties'>;
  departmentId?: Id<'departments'>;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface Faculty {
  _id: Id<'faculties'>;
  name: string;
  code: string;
  isActive: boolean;
}

interface Department {
  _id: Id<'departments'>;
  name: string;
  code: string;
  facultyId?: Id<'faculties'>;
  isActive: boolean;
}

export default function CourseManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<TabType>("profile");

  // Fetch data from Convex
  const courses = useQuery(api.courses.getAll, {}) ?? [];
  const faculties = useQuery(api.faculties.getAll, {}) ?? [];
  const departments = useQuery(api.departments.getAll, {}) ?? [];
  const createCourse = useMutation(api.courses.create);
  const updateCourse = useMutation(api.courses.update);
  const deleteCourse = useMutation(api.courses.remove);
  const logRecentActivity = useLogRecentActivity();
  const { user } = useUser();
  const { currentAcademicYearId } = useAcademicYear();

  // Add levels array for dropdown
  const levels = [
    { value: 3, label: "Level 3" },
    { value: 4, label: "Level 4" },
    { value: 5, label: "Level 5" },
    { value: 6, label: "Level 6" },
    { value: 7, label: "Level 7" },
  ];

  // State for form fields
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    level: 0,
    totalCredits: 360,
    duration: 3,
    facultyId: "",
    departmentId: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCourse = async () => {
    if (!form.code || !form.title || !form.level || !form.totalCredits || !form.duration) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await createCourse({
        code: form.code.toUpperCase(),
        title: form.title,
        description: form.description,
        level: form.level,
        totalCredits: form.totalCredits,
        duration: form.duration,
        facultyId: form.facultyId || undefined,
        departmentId: form.departmentId || undefined,
      });

      logRecentActivity({
        type: "create",
        entity: "course",
        description: `Created course: ${form.title}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

      toast.success("Course created successfully");
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse || !form.code || !form.title || !form.level || !form.totalCredits || !form.duration) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await updateCourse({
        id: selectedCourse._id,
        code: form.code.toUpperCase(),
        title: form.title,
        description: form.description,
        level: form.level,
        totalCredits: form.totalCredits,
        duration: form.duration,
        facultyId: form.facultyId || undefined,
        departmentId: form.departmentId || undefined,
      });

      logRecentActivity({
        type: "edit",
        entity: "course",
        description: `Updated course: ${form.title}`,
        userId: user?.id || "",
        organisationId: user?.organizationId || "",
      });

      toast.success("Course updated successfully");
      resetForm();
      setModalOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      code: "",
      title: "",
      description: "",
      level: 0,
      totalCredits: 360,
      duration: 3,
      facultyId: "",
      departmentId: "",
    });
    setIsEditing(false);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setSelectedCourse(course);
    setForm({
      code: course.code,
      title: course.title,
      description: course.description || "",
      level: course.level,
      totalCredits: course.totalCredits,
      duration: course.duration,
      facultyId: course.facultyId || "",
      departmentId: course.departmentId || "",
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const getLevelBadge = (level: number) => {
    const colors = {
      3: "bg-blue-100 text-blue-800",
      4: "bg-green-100 text-green-800",
      5: "bg-yellow-100 text-yellow-800",
      6: "bg-purple-100 text-purple-800",
      7: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        Level {level}
      </Badge>
    );
  };

  const getFacultyName = (facultyId?: Id<'faculties'>) => {
    if (!facultyId) return "Not assigned";
    const faculty = faculties.find(f => f._id === facultyId);
    return faculty?.name || "Unknown";
  };

  const getDepartmentName = (departmentId?: Id<'departments'>) => {
    if (!departmentId) return "Not assigned";
    const department = departments.find(d => d._id === departmentId);
    return department?.name || "Unknown";
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
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
          activeTab="courses" 
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
              <GraduationCap className="w-8 h-8" />
              Course Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage academic courses and their configurations
            </p>
          </div>
          <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {courses.filter(c => c.isActive).length}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Faculties</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{faculties.length}</p>
                </div>
                <Building className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Departments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{departments.length}</p>
                </div>
                <Users className="w-8 h-8 text-amber-600" />
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
                  placeholder="Search courses by name or code..."
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

        {/* Courses Table */}
        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>
              A list of all academic courses in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{getLevelBadge(course.level)}</TableCell>
                    <TableCell>{course.totalCredits}</TableCell>
                    <TableCell>{course.duration} year{course.duration !== 1 ? 's' : ''}</TableCell>
                    <TableCell>{getFacultyName(course.facultyId)}</TableCell>
                    <TableCell>{getDepartmentName(course.departmentId)}</TableCell>
                    <TableCell>
                      <Badge variant={course.isActive ? "default" : "secondary"}>
                        {course.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(course)}
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

        {/* Create/Edit Course Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Course" : "Create New Course"}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? "Update course information" : "Add a new course to the system"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code *</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={handleFormChange}
                    placeholder="e.g., CS001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select value={form.level.toString()} onValueChange={(value) => handleSelectChange("level", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Course description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalCredits">Total Credits *</Label>
                  <Input
                    id="totalCredits"
                    type="number"
                    value={form.totalCredits}
                    onChange={handleFormChange}
                    placeholder="360"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Years) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={form.duration}
                    onChange={handleFormChange}
                    placeholder="3"
                    min="1"
                    max="6"
                  />
                </div>
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
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </DialogClose>
              <Button 
                onClick={isEditing ? handleUpdateCourse : handleCreateCourse}
                disabled={submitting}
              >
                {submitting ? "Saving..." : isEditing ? "Update Course" : "Create Course"}
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