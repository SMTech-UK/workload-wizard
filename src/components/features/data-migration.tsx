"use client"

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  BookOpen, 
  Calendar,
  Settings,
  FileText,
  BarChart3,
  Shield,
  Archive
} from "lucide-react";
import { toast } from "sonner";

interface MigrationPhase {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  error?: string;
}

export function DataMigration() {
  const [currentPhase, setCurrentPhase] = React.useState<string>("");
  const [migrationPhases, setMigrationPhases] = React.useState<MigrationPhase[]>([
    {
      id: "core-tables",
      name: "Core Organization Tables",
      description: "Migrate organizations, users, roles, and settings",
      icon: <Shield className="h-4 w-4" />,
      status: "pending",
      progress: 0
    },
    {
      id: "academic-structure",
      name: "Academic Structure Tables",
      description: "Migrate academic years, semesters, departments, faculties, and teams",
      icon: <Calendar className="h-4 w-4" />,
      status: "pending",
      progress: 0
    },
    {
      id: "staff-management",
      name: "Staff Management Tables",
      description: "Migrate lecturer profiles, statuses, and admin allocations",
      icon: <Users className="h-4 w-4" />,
      status: "pending",
      progress: 0
    },
    {
      id: "course-module",
      name: "Course & Module Tables",
      description: "Migrate courses, cohorts, modules, and course-module relationships",
      icon: <BookOpen className="h-4 w-4" />,
      status: "pending",
      progress: 0
    },
    {
      id: "module-delivery",
      name: "Module Delivery Tables",
      description: "Migrate module iterations, groups, sites, assessments, and allocations",
      icon: <FileText className="h-4 w-4" />,
      status: "pending",
      progress: 0
    },
    {
      id: "reporting-analytics",
      name: "Reporting & Analytics Tables",
      description: "Migrate team summaries, workload reports, and calculation rules",
      icon: <BarChart3 className="h-4 w-4" />,
      status: "pending",
      progress: 0
    },
    {
      id: "system-tables",
      name: "System Tables",
      description: "Migrate settings, notifications, audit logs, and system data",
      icon: <Settings className="h-4 w-4" />,
      status: "pending",
      progress: 0
    }
  ]);

  const [isMigrating, setIsMigrating] = React.useState(false);
  const [overallProgress, setOverallProgress] = React.useState(0);
  
  const migrationStatus = useQuery(api.migrations.getMigrationStatus);
  const dataIntegrity = useQuery(api.migrations.validateDataIntegrity);

  const migrateAcademicYears = useMutation(api.migrations.migrateAcademicYears);
  const migrateLecturers = useMutation(api.migrations.migrateLecturers);
  const migrateModuleIterations = useMutation(api.migrations.migrateModuleIterations);
  const migrateModuleAllocations = useMutation(api.migrations.migrateModuleAllocations);
  const migrateAdminAllocations = useMutation(api.migrations.migrateAdminAllocations);
  const migrateCohorts = useMutation(api.migrations.migrateCohorts);
  const migrateDeptSummary = useMutation(api.migrations.migrateDeptSummary);

  const handleFullMigration = async () => {
    setIsMigrating(true);
    setOverallProgress(0);
    
    const migrations = [
      { name: "Academic Years", fn: migrateAcademicYears, phase: "academic-structure" },
      { name: "Lecturers", fn: migrateLecturers, phase: "staff-management" },
      { name: "Module Iterations", fn: migrateModuleIterations, phase: "module-delivery" },
      { name: "Module Allocations", fn: migrateModuleAllocations, phase: "module-delivery" },
      { name: "Admin Allocations", fn: migrateAdminAllocations, phase: "staff-management" },
      { name: "Cohorts", fn: migrateCohorts, phase: "course-module" },
      { name: "Department Summary", fn: migrateDeptSummary, phase: "reporting-analytics" },
    ];

    let completedMigrations = 0;
    const totalMigrations = migrations.length;

    for (const migration of migrations) {
      try {
        setCurrentPhase(`Running ${migration.name}...`);
        
        // Update phase status
        setMigrationPhases(prev => prev.map(phase => 
          phase.id === migration.phase 
            ? { ...phase, status: "running" as const }
            : phase
        ));

        const result = await migration.fn({ skipAuth: true });
        completedMigrations++;
        
        // Update progress
        const progress = (completedMigrations / totalMigrations) * 100;
        setOverallProgress(progress);
        
        // Update phase status
        setMigrationPhases(prev => prev.map(phase => 
          phase.id === migration.phase 
            ? { 
                ...phase, 
                status: "completed" as const, 
                progress: Math.min(phase.progress + (100 / migrations.filter(m => m.phase === phase.id).length), 100)
              }
            : phase
        ));

        toast.success(`${migration.name} completed successfully!`);
        
      } catch (error) {
        console.error(`${migration.name} failed:`, error);
        
        // Update phase status
        setMigrationPhases(prev => prev.map(phase => 
          phase.id === migration.phase 
            ? { 
                ...phase, 
                status: "failed" as const, 
                error: String(error)
              }
            : phase
        ));
        
        toast.error(`${migration.name} failed: ${String(error)}`);
      }
    }

    setCurrentPhase("Migration completed");
    setIsMigrating(false);
    
    if (completedMigrations === totalMigrations) {
      toast.success("All migrations completed successfully!");
    } else {
      toast.error(`${completedMigrations}/${totalMigrations} migrations completed successfully.`);
    }
  };

  const handlePhaseMigration = async (phaseId: string) => {
    setIsMigrating(true);
    setCurrentPhase(`Running ${phaseId} migration...`);
    
    // Update phase status
    setMigrationPhases(prev => prev.map(phase => 
      phase.id === phaseId 
        ? { ...phase, status: "running" as const }
        : phase
    ));

    try {
      // Define migrations for each phase
      const phaseMigrations: Record<string, Array<{ name: string; fn: any }>> = {
        "academic-structure": [
          { name: "Academic Years", fn: migrateAcademicYears }
        ],
        "staff-management": [
          { name: "Lecturers", fn: migrateLecturers },
          { name: "Admin Allocations", fn: migrateAdminAllocations }
        ],
        "module-delivery": [
          { name: "Module Iterations", fn: migrateModuleIterations },
          { name: "Module Allocations", fn: migrateModuleAllocations }
        ],
        "course-module": [
          { name: "Cohorts", fn: migrateCohorts }
        ],
        "reporting-analytics": [
          { name: "Department Summary", fn: migrateDeptSummary }
        ]
      };

      const migrations = phaseMigrations[phaseId] || [];
      
      for (const migration of migrations) {
        await migration.fn({ skipAuth: true });
      }

      // Update phase status
      setMigrationPhases(prev => prev.map(phase => 
        phase.id === phaseId 
          ? { ...phase, status: "completed" as const, progress: 100 }
          : phase
      ));

      toast.success(`${phaseId} migration completed successfully!`);
      
    } catch (error) {
      console.error(`${phaseId} migration failed:`, error);
      
      // Update phase status
      setMigrationPhases(prev => prev.map(phase => 
        phase.id === phaseId 
          ? { ...phase, status: "failed" as const, error: String(error) }
          : phase
      ));
      
      toast.error(`${phaseId} migration failed: ${String(error)}`);
    }

    setCurrentPhase("");
    setIsMigrating(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Archive className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case "running":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Running</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!migrationStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Migration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Checking data migration status...</p>
        </CardContent>
      </Card>
    );
  }

  const completedPhases = migrationPhases.filter(p => p.status === "completed").length;
  const totalPhases = migrationPhases.length;
  const overallPhaseProgress = (completedPhases / totalPhases) * 100;

  return (
    <div className="space-y-6">
      {/* Migration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Migration Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Overall Progress</h4>
              <span className="text-sm text-muted-foreground">
                {completedPhases} / {totalPhases} phases completed
              </span>
            </div>
            <Progress value={overallPhaseProgress} className="w-full" />
          </div>

          {isMigrating && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                {currentPhase || "Running migration..."}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleFullMigration}
              disabled={isMigrating}
              className="flex-1"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Full Migration...
                </>
              ) : (
                "Run Full Migration"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            This will migrate all data to the new normalized schema structure as defined in the DATABASE_SCHEMA_REFERENCE.md
          </p>
        </CardContent>
      </Card>

      {/* Migration Phases */}
      <Tabs defaultValue="phases" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="phases">Migration Phases</TabsTrigger>
          <TabsTrigger value="integrity">Data Integrity</TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className="space-y-4">
          <div className="grid gap-4">
            {migrationPhases.map((phase) => (
              <Card key={phase.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {phase.icon}
                      {phase.name}
                    </CardTitle>
                    {getStatusBadge(phase.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{phase.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(phase.progress)}%</span>
                    </div>
                    <Progress value={phase.progress} className="w-full" />
                  </div>

                  {phase.error && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {phase.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {phase.status === "pending" && (
                    <Button
                      onClick={() => handlePhaseMigration(phase.id)}
                      disabled={isMigrating}
                      variant="outline"
                      size="sm"
                    >
                      Run Phase Migration
                    </Button>
                  )}

                  {phase.status === "failed" && (
                    <Button
                      onClick={() => handlePhaseMigration(phase.id)}
                      disabled={isMigrating}
                      variant="outline"
                      size="sm"
                    >
                      Retry Migration
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Integrity Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dataIntegrity ? (
                dataIntegrity.totalIssues === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No data integrity issues found! All foreign key references are valid.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Found {dataIntegrity.totalIssues} data integrity issues that need to be resolved.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <h4 className="font-medium">Issues Found:</h4>
                      <div className="space-y-1">
                        {dataIntegrity.issues.slice(0, 5).map((issue, index) => (
                          <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                            <div className="font-medium">{issue.table}</div>
                            <div className="text-muted-foreground">{issue.issue}</div>
                            <div className="text-xs text-red-600">Value: {issue.value}</div>
                          </div>
                        ))}
                        {dataIntegrity.issues.length > 5 && (
                          <div className="text-sm text-muted-foreground">
                            ... and {dataIntegrity.issues.length - 5} more issues
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Checking data integrity...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Migration History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {migrationStatus && migrationStatus.length > 0 ? (
                <div className="space-y-2">
                  {migrationStatus.slice(0, 10).map((migration, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{migration.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(migration.appliedAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={migration.status === "completed" ? "default" : "destructive"}>
                        {migration.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No migration history found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 