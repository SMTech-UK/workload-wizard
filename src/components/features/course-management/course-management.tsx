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
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Edit, Eye, AlertTriangle, X, BookOpen, Users, Calendar, GraduationCap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogRecentActivity } from "@/lib/recentActivity";
import { useUser } from "@clerk/nextjs";
import type { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// Define interfaces based on the database schema
interface Course {
  _id: Id<'courses'>;
  name: string;
  code: string;
  description?: string;
  level: string;
  credits: number;
  duration: number;
  facultyId?: Id<'faculties'>;
  departmentId?: Id<'departments'>;
  courseLeaderId?: Id<'user_profiles'>;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  entryRequirements?: string;
  learningOutcomes?: string[];
  isAccredited: boolean;
  accreditationBody?: string;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface Faculty {
  _id: Id<'faculties'>;
  name: string;
  code: string;
}

interface Department {
  _id: Id<'departments'>;
  name: string;
  code: string;
}

export default function CourseManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    name: "",
    code: "",
    description: "",
    level: "Undergraduate",
    credits: 0,
    duration: 0,
    facultyId: undefined as Id<'faculties'> | undefined,
    departmentId: undefined as Id<'departments'> | undefined,
    contactEmail: "",
    contactPhone: "",
    website: "",
    entryRequirements: "",
    learningOutcomes: [] as string[],
    isAccredited: false,
    accreditationBody: "",
  });

  const { user } = useUser();
  const logActivity = useLogRecentActivity();
  
  // Fetch data
  const courses = useQuery('courses:getAll' as any, { isActive: true }) ?? [];
  const faculties = useQuery('faculties:getAll' as any, {}) ?? [];
  const departments = useQuery('departments:getAll' as any, {}) ?? [];
  
  // Mutations
  const createCourse = useMutation('courses:create' as any);
  const updateCourse = useMutation('courses:update' as any);
  const deleteCourse = useMutation('courses:deleteCourse' as any);

  const filteredCourses = courses.filter((course: any) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFacultyName = (facultyId?: Id<'faculties'>) => {
    if (!facultyId) return "Not assigned";
    const faculty = faculties.find((f: any) => f._id === facultyId);
    return faculty?.name || "Unknown";
  };

  const getDepartmentName = (departmentId?: Id<'departments'>) => {
    if (!departmentId) return "Not assigned";
    const department = departments.find((d: any) => d._id === departmentId);
    return department?.name || "Unknown";
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'undergraduate': return 'bg-blue-100 text-blue-800';
      case 'postgraduate': return 'bg-purple-100 text-purple-800';
      case 'foundation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateCourse = async () => {
    try {
      if (!newCourseData.name || !newCourseData.code || newCourseData.credits <= 0 || newCourseData.duration <= 0) {
        toast.error("Please fill in all required fields");
        return;
      }

      const courseId = await createCourse({
        ...newCourseData,
        learningOutcomes: newCourseData.learningOutcomes.filter(outcome => outcome.trim() !== ''),
      });

      toast.success("Course created successfully");
      setCreateModalOpen(false);
      setNewCourseData({
        name: "",
        code: "",
        description: "",
        level: "Undergraduate",
        credits: 0,
        duration: 0,
        facultyId: undefined,
        departmentId: undefined,
        contactEmail: "",
        contactPhone: "",
        website: "",
        entryRequirements: "",
        learningOutcomes: [],
        isAccredited: false,
        accreditationBody: "",
      });

      if (user) {
        logActivity({
          type: "create", // Change from 'action' to 'type'
          entity: "course", // Change from 'entityType' to 'entity'
          description: `Created course: ${newCourseData.name}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to create course: ${error}`);
    }
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;

    try {
      await updateCourse({
        id: selectedCourse._id,
        ...newCourseData,
        learningOutcomes: newCourseData.learningOutcomes.filter(outcome => outcome.trim() !== ''),
      });

      toast.success("Course updated successfully");
      setModalOpen(false);
      setSelectedCourse(null);

      if (user) {
        logActivity({
          type: "edit", // Change from 'action' to 'type'
          entity: "course", // Change from 'entityType' to 'entity'
          description: `Updated course: ${selectedCourse.name}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to update course: ${error}`);
    }
  };

  const handleDeleteCourse = async (courseId: Id<'courses'>, courseName: string) => {
    if (!confirm(`Are you sure you want to delete the course "${courseName}"?`)) {
      return;
    }

    try {
      await deleteCourse({ id: courseId });
      toast.success("Course deleted successfully");

      if (user) {
        logActivity({
          type: "delete", // Change from 'action' to 'type'
          entity: "course", // Change from 'entityType' to 'entity'
          description: `Deleted course: ${courseName}`, // Change from 'details' to 'description'
          userId: user?.id || "",
          organisationId: "",
        });
      }
    } catch (error) {
      toast.error(`Failed to delete course: ${error}`);
    }
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setNewCourseData({
      name: course.name,
      code: course.code,
      description: course.description || "",
      level: course.level,
      credits: course.credits,
      duration: course.duration,
      facultyId: course.facultyId,
      departmentId: course.departmentId,
      contactEmail: course.contactEmail || "",
      contactPhone: course.contactPhone || "",
      website: course.website || "",
      entryRequirements: course.entryRequirements || "",
      learningOutcomes: course.learningOutcomes || [],
      isAccredited: course.isAccredited,
      accreditationBody: course.accreditationBody || "",
    });
    setModalOpen(true);
  };

  const addLearningOutcome = () => {
    setNewCourseData(prev => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, ""]
    }));
  };

  const removeLearningOutcome = (index: number) => {
    setNewCourseData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  const updateLearningOutcome = (index: number, value: string) => {
    setNewCourseData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.map((outcome, i) => i === index ? value : outcome)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">
            Manage academic courses and their configurations
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>
                {filteredCourses.length} active courses
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
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
              {filteredCourses.map((course: any) => (
                <TableRow key={course._id}>
                  <TableCell className="font-medium">{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>
                    <Badge className={getLevelBadgeColor(course.level)}>
                      {course.level}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>{course.duration} years</TableCell>
                  <TableCell>{getFacultyName(course.facultyId)}</TableCell>
                  <TableCell>{getDepartmentName(course.departmentId)}</TableCell>
                  <TableCell>
                    <Badge variant={course.isActive ? "default" : "secondary"}>
                      {course.isActive ? "Active" : "Inactive"}
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
                              onClick={() => openEditModal(course)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit course</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCourse(course._id, course.name)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete course</TooltipContent>
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

      {/* Create Course Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a new academic course to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Course Code *</Label>
                <Input
                  id="code"
                  value={newCourseData.code}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., CS101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Course Name *</Label>
                <Input
                  id="name"
                  value={newCourseData.name}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCourseData.description}
                onChange={(e) => setNewCourseData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Course description..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select
                  value={newCourseData.level}
                  onValueChange={(value) => setNewCourseData(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  type="number"
                  min="0"
                  value={newCourseData.credits}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (years) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={newCourseData.duration}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select
                  value={newCourseData.facultyId}
                  onValueChange={(value) => setNewCourseData(prev => ({ ...prev, facultyId: value as Id<'faculties'> }))}
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
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={newCourseData.departmentId}
                  onValueChange={(value) => setNewCourseData(prev => ({ ...prev, departmentId: value as Id<'departments'> }))}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newCourseData.contactEmail}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="course@university.edu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={newCourseData.contactPhone}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+44 123 456 7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={newCourseData.website}
                onChange={(e) => setNewCourseData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://course-website.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryRequirements">Entry Requirements</Label>
              <Textarea
                id="entryRequirements"
                value={newCourseData.entryRequirements}
                onChange={(e) => setNewCourseData(prev => ({ ...prev, entryRequirements: e.target.value }))}
                placeholder="Entry requirements for this course..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Learning Outcomes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLearningOutcome}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Outcome
                </Button>
              </div>
              {newCourseData.learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={outcome}
                    onChange={(e) => updateLearningOutcome(index, e.target.value)}
                    placeholder={`Learning outcome ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLearningOutcome(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isAccredited"
                checked={newCourseData.isAccredited}
                onCheckedChange={(checked) => setNewCourseData(prev => ({ ...prev, isAccredited: checked }))}
              />
              <Label htmlFor="isAccredited">Course is accredited</Label>
            </div>

            {newCourseData.isAccredited && (
              <div className="space-y-2">
                <Label htmlFor="accreditationBody">Accreditation Body</Label>
                <Input
                  id="accreditationBody"
                  value={newCourseData.accreditationBody}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, accreditationBody: e.target.value }))}
                  placeholder="e.g., BCS, QAA"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateCourse}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Course Code *</Label>
                <Input
                  id="edit-code"
                  value={newCourseData.code}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., CS101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Course Name *</Label>
                <Input
                  id="edit-name"
                  value={newCourseData.name}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newCourseData.description}
                onChange={(e) => setNewCourseData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Course description..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-level">Level *</Label>
                <Select
                  value={newCourseData.level}
                  onValueChange={(value) => setNewCourseData(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-credits">Credits *</Label>
                <Input
                  id="edit-credits"
                  type="number"
                  min="0"
                  value={newCourseData.credits}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (years) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="0"
                  value={newCourseData.duration}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-faculty">Faculty</Label>
                <Select
                  value={newCourseData.facultyId}
                  onValueChange={(value) => setNewCourseData(prev => ({ ...prev, facultyId: value as Id<'faculties'> }))}
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
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select
                  value={newCourseData.departmentId}
                  onValueChange={(value) => setNewCourseData(prev => ({ ...prev, departmentId: value as Id<'departments'> }))}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contactEmail">Contact Email</Label>
                <Input
                  id="edit-contactEmail"
                  type="email"
                  value={newCourseData.contactEmail}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="course@university.edu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                <Input
                  id="edit-contactPhone"
                  value={newCourseData.contactPhone}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+44 123 456 7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={newCourseData.website}
                onChange={(e) => setNewCourseData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://course-website.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-entryRequirements">Entry Requirements</Label>
              <Textarea
                id="edit-entryRequirements"
                value={newCourseData.entryRequirements}
                onChange={(e) => setNewCourseData(prev => ({ ...prev, entryRequirements: e.target.value }))}
                placeholder="Entry requirements for this course..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Learning Outcomes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLearningOutcome}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Outcome
                </Button>
              </div>
              {newCourseData.learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={outcome}
                    onChange={(e) => updateLearningOutcome(index, e.target.value)}
                    placeholder={`Learning outcome ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLearningOutcome(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isAccredited"
                checked={newCourseData.isAccredited}
                onCheckedChange={(checked) => setNewCourseData(prev => ({ ...prev, isAccredited: checked }))}
              />
              <Label htmlFor="edit-isAccredited">Course is accredited</Label>
            </div>

            {newCourseData.isAccredited && (
              <div className="space-y-2">
                <Label htmlFor="edit-accreditationBody">Accreditation Body</Label>
                <Input
                  id="edit-accreditationBody"
                  value={newCourseData.accreditationBody}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, accreditationBody: e.target.value }))}
                  placeholder="e.g., BCS, QAA"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateCourse}>Update Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 