"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  Search, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar,
  Eye,
  FileText,
  Printer
} from "lucide-react"
import { useAcademicYear } from "@/hooks/useAcademicYear";
import type { Id } from "../../../../convex/_generated/dataModel";

// Define interfaces based on the database schema
interface WorkloadReport {
  _id: Id<'workload_reports'>;
  academicYearId: Id<'academic_years'>;
  reportType: string;
  reportName: string;
  generatedBy: Id<'user_profiles'>;
  reportData: any;
  filters: any;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface Lecturer {
  _id: Id<'lecturers'>;
  profileId: Id<'lecturer_profiles'>;
  academicYearId: Id<'academic_years'>;
  teachingAvailability: number;
  totalAllocated: number;
  allocatedTeachingHours: number;
  allocatedAdminHours: number;
  allocatedResearchHours: number;
  allocatedOtherHours: number;
  isActive: boolean;
}

interface LecturerProfile {
  _id: Id<'lecturer_profiles'>;
  fullName: string;
  email: string;
  family: string;
  fte: number;
  capacity: number;
  maxTeachingHours: number;
  totalContract: number;
  isActive: boolean;
}

interface ModuleAllocation {
  _id: Id<'module_allocations'>;
  lecturerId: Id<'lecturers'>;
  moduleIterationId: Id<'module_iterations'>;
  allocationTypeId: Id<'allocation_types'>;
  hours: number;
  percentage: number;
  isActive: boolean;
}

interface AdminAllocation {
  _id: Id<'admin_allocations'>;
  lecturerId: Id<'lecturers'>;
  academicYearId: Id<'academic_years'>;
  category: string;
  title: string;
  description?: string;
  hours: number;
  status: string;
  isActive: boolean;
}

export default function WorkloadReports() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReportType, setSelectedReportType] = useState("all")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("")
  const { currentAcademicYearId } = useAcademicYear();
  
  // Fetch data
  const workloadReports = useQuery('workload_reports:getAll' as any, { 
    academicYearId: currentAcademicYearId as any 
  }) ?? [];
  const lecturers = useQuery('lecturers:getAll' as any, { 
    academicYearId: currentAcademicYearId as any 
  }) ?? [];
  const lecturerProfiles = useQuery('lecturers:getProfiles' as any, {}) ?? [];
  const moduleAllocations = useQuery('module_allocations:getAll' as any, { 
    academicYearId: currentAcademicYearId as any 
  }) ?? [];
  const adminAllocations = useQuery('admin_allocations:getAll' as any, { 
    academicYearId: currentAcademicYearId as any 
  }) ?? [];
  const academicYears = useQuery('academic_years:getAll' as any, {}) ?? [];

  const filteredReports = workloadReports.filter((report: any) =>
    report.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLecturerName = (profileId: Id<'lecturer_profiles'>) => {
    const profile = lecturerProfiles.find((p: any) => p._id === profileId);
    return profile?.fullName || "Unknown Lecturer";
  };

  const getLecturerEmail = (profileId: Id<'lecturer_profiles'>) => {
    const profile = lecturerProfiles.find((p: any) => p._id === profileId);
    return profile?.email || "Unknown";
  };

  const getLecturerFamily = (profileId: Id<'lecturer_profiles'>) => {
    const profile = lecturerProfiles.find((p: any) => p._id === profileId);
    return profile?.family || "Unknown";
  };

  const getLecturerFTE = (profileId: Id<'lecturer_profiles'>) => {
    const profile = lecturerProfiles.find((p: any) => p._id === profileId);
    return profile?.fte || 0;
  };

  const getLecturerCapacity = (profileId: Id<'lecturer_profiles'>) => {
    const profile = lecturerProfiles.find((p: any) => p._id === profileId);
    return profile?.capacity || 0;
  };

  const getTotalTeachingHours = (lecturerId: Id<'lecturers'>) => {
    const allocations = moduleAllocations.filter((ma: any) => ma.lecturerId === lecturerId);
    return allocations.reduce((total: any, allocation: any) => total + allocation.hours, 0);
  };

  const getTotalAdminHours = (lecturerId: Id<'lecturers'>) => {
    const allocations = adminAllocations.filter((aa: any) => aa.lecturerId === lecturerId);
    return allocations.reduce((total: any, allocation: any) => total + allocation.hours, 0);
  };

  const getWorkloadPercentage = (lecturer: Lecturer) => {
    const totalAllocated = lecturer.totalAllocated;
    const capacity = getLecturerCapacity(lecturer.profileId);
    return capacity > 0 ? (totalAllocated / capacity) * 100 : 0;
  };

  const getWorkloadStatus = (percentage: number) => {
    if (percentage < 80) return { status: "Under Allocated", color: "bg-yellow-100 text-yellow-800" };
    if (percentage <= 100) return { status: "Well Allocated", color: "bg-green-100 text-green-800" };
    return { status: "Over Allocated", color: "bg-red-100 text-red-800" };
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateLecturerWorkloadReport = () => {
    const reportData = lecturers.map((lecturer: any) => {
      const profile = lecturerProfiles.find((p: any) => p._id === lecturer.profileId);
      const teachingHours = getTotalTeachingHours(lecturer._id);
      const adminHours = getTotalAdminHours(lecturer._id);
      const workloadPercentage = getWorkloadPercentage(lecturer);
      const status = getWorkloadStatus(workloadPercentage);

      return {
        lecturerId: lecturer._id,
        profileId: lecturer.profileId,
        name: profile?.fullName || "Unknown",
        email: profile?.email || "Unknown",
        family: profile?.family || "Unknown",
        fte: profile?.fte || 0,
        capacity: profile?.capacity || 0,
        teachingHours,
        adminHours,
        researchHours: lecturer.allocatedResearchHours,
        otherHours: lecturer.allocatedOtherHours,
        totalAllocated: lecturer.totalAllocated,
        workloadPercentage,
        status: status.status,
        statusColor: status.color
      };
    });

    return reportData;
  };

  const generateDepartmentSummary = () => {
    // Group lecturers by department (would need department info in lecturer profiles)
    const departmentData: any = {};
    
    lecturers.forEach((lecturer: any) => {
      const profile = lecturerProfiles.find((p: any) => p._id === lecturer.profileId);
      const family = profile?.family || "Unknown";
      
      if (!departmentData[family]) {
        departmentData[family] = {
          name: family,
          lecturerCount: 0,
          totalFTE: 0,
          totalTeachingHours: 0,
          totalAdminHours: 0,
          totalResearchHours: 0,
          totalOtherHours: 0,
          averageWorkloadPercentage: 0
        };
      }
      
      const teachingHours = getTotalTeachingHours(lecturer._id);
      const adminHours = getTotalAdminHours(lecturer._id);
      const workloadPercentage = getWorkloadPercentage(lecturer);
      
      departmentData[family].lecturerCount++;
      departmentData[family].totalFTE += getLecturerFTE(lecturer.profileId);
      departmentData[family].totalTeachingHours += teachingHours;
      departmentData[family].totalAdminHours += adminHours;
      departmentData[family].totalResearchHours += lecturer.allocatedResearchHours;
      departmentData[family].totalOtherHours += lecturer.allocatedOtherHours;
      departmentData[family].averageWorkloadPercentage += workloadPercentage;
    });

    // Calculate averages
    Object.values(departmentData).forEach((dept: any) => {
      dept.averageWorkloadPercentage = dept.lecturerCount > 0 
        ? dept.averageWorkloadPercentage / dept.lecturerCount 
        : 0;
    });

    return Object.values(departmentData);
  };

  const lecturerWorkloadData = generateLecturerWorkloadReport();
  const departmentSummaryData = generateDepartmentSummary();

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workload Reports</h1>
          <p className="text-muted-foreground">
            Generate and view academic workload reports and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCSV(lecturerWorkloadData, 'lecturer-workload-report')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={printReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active in current academic year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teaching Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lecturers.reduce((total: any, lecturer: any) => total + getTotalTeachingHours(lecturer._id), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Allocated across all modules
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admin Hours</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lecturers.reduce((total: any, lecturer: any) => total + getTotalAdminHours(lecturer._id), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Administrative workload
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Workload</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lecturerWorkloadData.length > 0 
                ? Math.round(lecturerWorkloadData.reduce((sum: any, lecturer: any) => sum + lecturer.workloadPercentage, 0) / lecturerWorkloadData.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of capacity utilization
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lecturers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lecturers">Lecturer Workload</TabsTrigger>
          <TabsTrigger value="departments">Department Summary</TabsTrigger>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="lecturers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lecturer Workload Report</CardTitle>
                  <CardDescription>
                    Detailed workload allocation for all lecturers
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search lecturers..."
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
                    <TableHead>Name</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>FTE</TableHead>
                    <TableHead>Teaching Hours</TableHead>
                    <TableHead>Admin Hours</TableHead>
                    <TableHead>Research Hours</TableHead>
                    <TableHead>Other Hours</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Workload %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lecturerWorkloadData
                    .filter((lecturer: any) => 
                      lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      lecturer.family.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((lecturer: any) => (
                    <TableRow key={lecturer.lecturerId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lecturer.name}</div>
                          <div className="text-sm text-muted-foreground">{lecturer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{lecturer.family}</TableCell>
                      <TableCell>{lecturer.fte}</TableCell>
                      <TableCell>{lecturer.teachingHours}</TableCell>
                      <TableCell>{lecturer.adminHours}</TableCell>
                      <TableCell>{lecturer.researchHours}</TableCell>
                      <TableCell>{lecturer.otherHours}</TableCell>
                      <TableCell className="font-medium">{lecturer.totalAllocated}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={lecturer.workloadPercentage} className="w-16" />
                          <span className="text-sm">{Math.round(lecturer.workloadPercentage)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={lecturer.statusColor}>
                          {lecturer.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Summary</CardTitle>
              <CardDescription>
                Workload summary by academic family/department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Lecturers</TableHead>
                    <TableHead>Total FTE</TableHead>
                    <TableHead>Teaching Hours</TableHead>
                    <TableHead>Admin Hours</TableHead>
                    <TableHead>Research Hours</TableHead>
                    <TableHead>Other Hours</TableHead>
                    <TableHead>Avg Workload %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentSummaryData.map((dept: any) => (
                    <TableRow key={dept.name}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.lecturerCount}</TableCell>
                      <TableCell>{dept.totalFTE.toFixed(2)}</TableCell>
                      <TableCell>{dept.totalTeachingHours}</TableCell>
                      <TableCell>{dept.totalAdminHours}</TableCell>
                      <TableCell>{dept.totalResearchHours}</TableCell>
                      <TableCell>{dept.totalOtherHours}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={dept.averageWorkloadPercentage} className="w-16" />
                          <span className="text-sm">{Math.round(dept.averageWorkloadPercentage)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Reports</CardTitle>
                  <CardDescription>
                    Previously generated workload reports
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="lecturer">Lecturer Reports</SelectItem>
                      <SelectItem value="department">Department Reports</SelectItem>
                      <SelectItem value="summary">Summary Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Generated By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report: any) => (
                    <TableRow key={report._id}>
                      <TableCell className="font-medium">{report.reportName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.reportType}</Badge>
                      </TableCell>
                      <TableCell>{getLecturerName(report.generatedBy)}</TableCell>
                      <TableCell>{formatDate(report.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={report.isActive ? "default" : "secondary"}>
                          {report.isActive ? "Active" : "Archived"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 