"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api";
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
  Printer,
  Building,
  Target,
  AlertTriangle
} from "lucide-react"
import { useAcademicYear } from "@/hooks/useAcademicYear";
import type { Id } from "../../../../convex/_generated/dataModel";

// Define interfaces based on the database schema
interface TeamSummary {
  _id: Id<'team_summaries'>;
  teamId: Id<'teams'>;
  academicYearId: Id<'academic_years'>;
  totalLecturers: number;
  totalFTE: number;
  totalTeachingHours: number;
  totalAdminHours: number;
  totalResearchHours: number;
  totalOtherHours: number;
  averageWorkloadPercentage: number;
  underAllocatedCount: number;
  wellAllocatedCount: number;
  overAllocatedCount: number;
  isActive: boolean;
  organisationId: Id<'organisations'>;
  createdAt: number;
  updatedAt: number;
}

interface Team {
  _id: Id<'teams'>;
  name: string;
  code: string;
  description?: string;
  departmentId?: Id<'departments'>;
  facultyId?: Id<'faculties'>;
  teamLeaderId?: Id<'user_profiles'>;
  teamType: string;
  level: string;
  isActive: boolean;
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

export default function TeamSummaries() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeamType, setSelectedTeamType] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const { currentAcademicYearId } = useAcademicYear();
  
  // Fetch data
  const teamSummaries = useQuery(api.team_summaries.getAll, { 
    academicYearId: currentAcademicYearId as any 
  }) ?? [];
  const teams = useQuery(api.teams.getAllWithRelations, {}) ?? [];
  const lecturers = useQuery(api.lecturers.getAll, { 
    academicYearId: currentAcademicYearId as any 
  }) ?? [];
  const lecturerProfiles = useQuery(api.lecturers.getProfiles, {}) ?? [];
  const departments = useQuery(api.departments.getAll, {}) ?? [];
  const faculties = useQuery(api.faculties.getAll, {}) ?? [];

  const filteredTeamSummaries = teamSummaries.filter(summary => {
    const team = teams.find(t => t._id === summary.teamId);
    if (!team) return false;
    
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTeamType === "all" || team.teamType === selectedTeamType;
    const matchesDepartment = selectedDepartment === "all" || team.departmentId === selectedDepartment;
    
    return matchesSearch && matchesType && matchesDepartment;
  });

  const getTeamName = (teamId: Id<'teams'>) => {
    const team = teams.find(t => t._id === teamId);
    return team?.name || "Unknown Team";
  };

  const getTeamCode = (teamId: Id<'teams'>) => {
    const team = teams.find(t => t._id === teamId);
    return team?.code || "Unknown";
  };

  const getDepartmentName = (departmentId?: Id<'departments'>) => {
    if (!departmentId) return "Not assigned";
    const department = departments.find(d => d._id === departmentId);
    return department?.name || "Unknown";
  };

  const getFacultyName = (facultyId?: Id<'faculties'>) => {
    if (!facultyId) return "Not assigned";
    const faculty = faculties.find(f => f._id === facultyId);
    return faculty?.name || "Unknown";
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

  const getWorkloadStatusColor = (percentage: number) => {
    if (percentage < 80) return "bg-yellow-100 text-yellow-800";
    if (percentage <= 100) return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  const getWorkloadStatus = (percentage: number) => {
    if (percentage < 80) return "Under Allocated";
    if (percentage <= 100) return "Well Allocated";
    return "Over Allocated";
  };

  const generateTeamSummaryData = () => {
    return filteredTeamSummaries.map(summary => {
      const team = teams.find(t => t._id === summary.teamId);
      const workloadStatus = getWorkloadStatus(summary.averageWorkloadPercentage);
      const statusColor = getWorkloadStatusColor(summary.averageWorkloadPercentage);

      return {
        ...summary,
        teamName: team?.name || "Unknown",
        teamCode: team?.code || "Unknown",
        teamType: team?.teamType || "Unknown",
        department: team?.departmentId ? getDepartmentName(team.departmentId) : "Not assigned",
        faculty: team?.facultyId ? getFacultyName(team.facultyId) : "Not assigned",
        workloadStatus,
        statusColor
      };
    });
  };

  const generateOverallSummary = () => {
    const totalTeams = filteredTeamSummaries.length;
    const totalLecturers = filteredTeamSummaries.reduce((sum, summary) => sum + summary.totalLecturers, 0);
    const totalFTE = filteredTeamSummaries.reduce((sum, summary) => sum + summary.totalFTE, 0);
    const totalTeachingHours = filteredTeamSummaries.reduce((sum, summary) => sum + summary.totalTeachingHours, 0);
    const totalAdminHours = filteredTeamSummaries.reduce((sum, summary) => sum + summary.totalAdminHours, 0);
    const totalResearchHours = filteredTeamSummaries.reduce((sum, summary) => sum + summary.totalResearchHours, 0);
    const totalOtherHours = filteredTeamSummaries.reduce((sum, summary) => sum + summary.totalOtherHours, 0);
    
    const totalUnderAllocated = filteredTeamSummaries.reduce((sum, summary) => sum + summary.underAllocatedCount, 0);
    const totalWellAllocated = filteredTeamSummaries.reduce((sum, summary) => sum + summary.wellAllocatedCount, 0);
    const totalOverAllocated = filteredTeamSummaries.reduce((sum, summary) => sum + summary.overAllocatedCount, 0);

    const averageWorkloadPercentage = totalTeams > 0 
      ? filteredTeamSummaries.reduce((sum, summary) => sum + summary.averageWorkloadPercentage, 0) / totalTeams
      : 0;

    return {
      totalTeams,
      totalLecturers,
      totalFTE,
      totalTeachingHours,
      totalAdminHours,
      totalResearchHours,
      totalOtherHours,
      totalUnderAllocated,
      totalWellAllocated,
      totalOverAllocated,
      averageWorkloadPercentage
    };
  };

  const generateDepartmentBreakdown = () => {
    const departmentData = {};
    
    filteredTeamSummaries.forEach(summary => {
      const team = teams.find(t => t._id === summary.teamId);
      const departmentName = team?.departmentId ? getDepartmentName(team.departmentId) : "Not assigned";
      
      if (!departmentData[departmentName]) {
        departmentData[departmentName] = {
          name: departmentName,
          teamCount: 0,
          totalLecturers: 0,
          totalFTE: 0,
          totalTeachingHours: 0,
          totalAdminHours: 0,
          totalResearchHours: 0,
          totalOtherHours: 0,
          averageWorkloadPercentage: 0
        };
      }
      
      departmentData[departmentName].teamCount++;
      departmentData[departmentName].totalLecturers += summary.totalLecturers;
      departmentData[departmentName].totalFTE += summary.totalFTE;
      departmentData[departmentName].totalTeachingHours += summary.totalTeachingHours;
      departmentData[departmentName].totalAdminHours += summary.totalAdminHours;
      departmentData[departmentName].totalResearchHours += summary.totalResearchHours;
      departmentData[departmentName].totalOtherHours += summary.totalOtherHours;
      departmentData[departmentName].averageWorkloadPercentage += summary.averageWorkloadPercentage;
    });

    // Calculate averages
    Object.values(departmentData).forEach((dept: any) => {
      dept.averageWorkloadPercentage = dept.teamCount > 0 
        ? dept.averageWorkloadPercentage / dept.teamCount 
        : 0;
    });

    return Object.values(departmentData);
  };

  const teamSummaryData = generateTeamSummaryData();
  const overallSummary = generateOverallSummary();
  const departmentBreakdown = generateDepartmentBreakdown();

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
          <h1 className="text-3xl font-bold tracking-tight">Team Summaries</h1>
          <p className="text-muted-foreground">
            View team workload summaries and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCSV(teamSummaryData, 'team-summaries-report')}>
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
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallSummary.totalTeams}</div>
            <p className="text-xs text-muted-foreground">
              Active teams in current year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallSummary.totalLecturers}</div>
            <p className="text-xs text-muted-foreground">
              Across all teams
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total FTE</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallSummary.totalFTE.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Full-time equivalent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Workload</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallSummary.averageWorkloadPercentage)}%</div>
            <p className="text-xs text-muted-foreground">
              Of capacity utilization
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Allocated</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overallSummary.totalUnderAllocated}</div>
            <p className="text-xs text-muted-foreground">
              Lecturers below 80% capacity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Well Allocated</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallSummary.totalWellAllocated}</div>
            <p className="text-xs text-muted-foreground">
              Lecturers at optimal capacity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Allocated</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallSummary.totalOverAllocated}</div>
            <p className="text-xs text-muted-foreground">
              Lecturers above 100% capacity
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams">Team Summaries</TabsTrigger>
          <TabsTrigger value="departments">Department Breakdown</TabsTrigger>
          <TabsTrigger value="workload">Workload Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Workload Summaries</CardTitle>
                  <CardDescription>
                    Detailed workload summaries for all teams
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedTeamType} onValueChange={setSelectedTeamType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Lecturers</TableHead>
                    <TableHead>FTE</TableHead>
                    <TableHead>Teaching Hours</TableHead>
                    <TableHead>Admin Hours</TableHead>
                    <TableHead>Research Hours</TableHead>
                    <TableHead>Other Hours</TableHead>
                    <TableHead>Avg Workload %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamSummaryData.map((summary) => (
                    <TableRow key={summary._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{summary.teamName}</div>
                          <div className="text-sm text-muted-foreground">{summary.teamCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTeamTypeBadgeColor(summary.teamType)}>
                          {summary.teamType}
                        </Badge>
                      </TableCell>
                      <TableCell>{summary.department}</TableCell>
                      <TableCell>{summary.faculty}</TableCell>
                      <TableCell>{summary.totalLecturers}</TableCell>
                      <TableCell>{summary.totalFTE.toFixed(2)}</TableCell>
                      <TableCell>{summary.totalTeachingHours}</TableCell>
                      <TableCell>{summary.totalAdminHours}</TableCell>
                      <TableCell>{summary.totalResearchHours}</TableCell>
                      <TableCell>{summary.totalOtherHours}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={summary.averageWorkloadPercentage} className="w-16" />
                          <span className="text-sm">{Math.round(summary.averageWorkloadPercentage)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={summary.statusColor}>
                          {summary.workloadStatus}
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
              <CardTitle>Department Breakdown</CardTitle>
              <CardDescription>
                Workload summary by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Teams</TableHead>
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
                  {departmentBreakdown.map((dept: any) => (
                    <TableRow key={dept.name}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.teamCount}</TableCell>
                      <TableCell>{dept.totalLecturers}</TableCell>
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

        <TabsContent value="workload" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Workload Distribution</CardTitle>
                <CardDescription>
                  Breakdown of workload allocation across teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Teaching Hours</span>
                    <span className="text-sm text-muted-foreground">
                      {overallSummary.totalTeachingHours} hours
                    </span>
                  </div>
                  <Progress 
                    value={(overallSummary.totalTeachingHours / (overallSummary.totalTeachingHours + overallSummary.totalAdminHours + overallSummary.totalResearchHours + overallSummary.totalOtherHours)) * 100} 
                    className="w-full" 
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Admin Hours</span>
                    <span className="text-sm text-muted-foreground">
                      {overallSummary.totalAdminHours} hours
                    </span>
                  </div>
                  <Progress 
                    value={(overallSummary.totalAdminHours / (overallSummary.totalTeachingHours + overallSummary.totalAdminHours + overallSummary.totalResearchHours + overallSummary.totalOtherHours)) * 100} 
                    className="w-full" 
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Research Hours</span>
                    <span className="text-sm text-muted-foreground">
                      {overallSummary.totalResearchHours} hours
                    </span>
                  </div>
                  <Progress 
                    value={(overallSummary.totalResearchHours / (overallSummary.totalTeachingHours + overallSummary.totalAdminHours + overallSummary.totalResearchHours + overallSummary.totalOtherHours)) * 100} 
                    className="w-full" 
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Other Hours</span>
                    <span className="text-sm text-muted-foreground">
                      {overallSummary.totalOtherHours} hours
                    </span>
                  </div>
                  <Progress 
                    value={(overallSummary.totalOtherHours / (overallSummary.totalTeachingHours + overallSummary.totalAdminHours + overallSummary.totalResearchHours + overallSummary.totalOtherHours)) * 100} 
                    className="w-full" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allocation Status</CardTitle>
                <CardDescription>
                  Distribution of lecturer allocation status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-600">Under Allocated</span>
                    <span className="text-sm text-muted-foreground">
                      {overallSummary.totalUnderAllocated} lecturers
                    </span>
                  </div>
                  <Progress 
                    value={(overallSummary.totalUnderAllocated / overallSummary.totalLecturers) * 100} 
                    className="w-full" 
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Well Allocated</span>
                    <span className="text-sm text-muted-foreground">
                      {overallSummary.totalWellAllocated} lecturers
                    </span>
                  </div>
                  <Progress 
                    value={(overallSummary.totalWellAllocated / overallSummary.totalLecturers) * 100} 
                    className="w-full" 
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-600">Over Allocated</span>
                    <span className="text-sm text-muted-foreground">
                      {overallSummary.totalOverAllocated} lecturers
                    </span>
                  </div>
                  <Progress 
                    value={(overallSummary.totalOverAllocated / overallSummary.totalLecturers) * 100} 
                    className="w-full" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 