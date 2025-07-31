"use client"

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Database, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function DataMigration() {
  const [selectedAcademicYearId, setSelectedAcademicYearId] = React.useState<string>("");
  const [isMigrating, setIsMigrating] = React.useState(false);
  const [isMigratingProfiles, setIsMigratingProfiles] = React.useState(false);
  
  const migrationStatus = useQuery(api.migrations.getMigrationStatus);
  const profileMigrationStatus = useQuery(api.migrations.getProfileMigrationStatus);
  const academicYears = useQuery(api.academic_years.getAll);
  const migrateData = useMutation(api.migrations.migrateDataToAcademicYear);
  const migrateToProfiles = useMutation(api.migrations.migrateToProfileStructure);

  const handleMigration = async () => {
    if (!selectedAcademicYearId) {
      toast.error("Please select an academic year");
      return;
    }

    setIsMigrating(true);
    try {
      const result = await migrateData({ academicYearId: selectedAcademicYearId as any });
      toast.success(`Migration completed! ${result.moduleIterations} iterations, ${result.lecturers} lecturers, ${result.modules} modules migrated.`);
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error("Migration failed. Please try again.");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleProfileMigration = async () => {
    setIsMigratingProfiles(true);
    try {
      const result = await migrateToProfiles({});
      toast.success(`Profile migration completed! ${result.lecturerProfiles} lecturer profiles, ${result.moduleProfiles} module profiles created.`);
    } catch (error) {
      console.error("Profile migration failed:", error);
      toast.error("Profile migration failed. Please try again.");
    } finally {
      setIsMigratingProfiles(false);
    }
  };

  if (!migrationStatus || !profileMigrationStatus) {
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

  return (
    <div className="space-y-4">
      {/* Profile Migration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Profile Structure Migration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Migration Status */}
          <div className="space-y-2">
            <h4 className="font-medium">Profile Migration Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Records without Profiles:</p>
                <p>• Lecturers: {profileMigrationStatus.lecturersWithoutProfiles}</p>
                <p>• Modules: {profileMigrationStatus.modulesWithoutProfiles}</p>
              </div>
            </div>
          </div>

          {/* Profile Migration Alert */}
          {profileMigrationStatus.needsProfileMigration ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have {profileMigrationStatus.lecturersWithoutProfiles + profileMigrationStatus.modulesWithoutProfiles} records that need to be migrated to the new profile structure.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All data has been successfully migrated to the profile structure!
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Migration Controls */}
          {profileMigrationStatus.needsProfileMigration && (
            <div className="space-y-4">
              <Button
                onClick={handleProfileMigration}
                disabled={isMigratingProfiles}
                className="w-full"
              >
                {isMigratingProfiles ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Migrating Profiles...
                  </>
                ) : (
                  "Migrate to Profile Structure"
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground">
                This will create profiles for existing lecturers and modules, separating core data from year-specific data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Year Migration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Academic Year Migration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {/* Migration Status */}
        <div className="space-y-2">
          <h4 className="font-medium">Migration Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Unassigned Records:</p>
              <p>• Module Iterations: {migrationStatus.unassignedIterations}</p>
              <p>• Lecturers: {migrationStatus.unassignedLecturers}</p>
              <p>• Modules: {migrationStatus.unassignedModules}</p>
            </div>
          </div>
        </div>

        {/* Migration Alert */}
        {migrationStatus.hasUnassignedData ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have {migrationStatus.unassignedIterations + migrationStatus.unassignedLecturers + migrationStatus.unassignedModules} records that need to be assigned to an academic year.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All data has been successfully assigned to academic years!
            </AlertDescription>
          </Alert>
        )}

        {/* Migration Controls */}
        {migrationStatus.hasUnassignedData && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Academic Year for Migration</label>
              <Select value={selectedAcademicYearId} onValueChange={setSelectedAcademicYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears?.map((year) => (
                    <SelectItem key={year._id} value={year._id}>
                      <div className="flex items-center gap-2">
                        <span>{year.name}</span>
                        {year.isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                        {year.isStaging && <Badge variant="secondary" className="text-xs">Staging</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleMigration}
              disabled={!selectedAcademicYearId || isMigrating}
              className="w-full"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Migrating Data...
                </>
              ) : (
                "Migrate Data to Selected Academic Year"
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              This will assign all unassigned records to the selected academic year. 
              This action cannot be undone, but you can manually reassign records later.
            </p>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
} 