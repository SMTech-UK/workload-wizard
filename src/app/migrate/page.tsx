"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Database, RefreshCw } from "lucide-react";

interface MigrationResult {
  name: string;
  success: boolean;
  recordsProcessed?: number;
  recordsTotal?: number;
  error?: string;
}

interface DataIntegrityIssue {
  table: string;
  recordId: string;
  issue: string;
  value: string;
}

export default function MigrationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [migrationResults, setMigrationResults] = useState<MigrationResult[]>([]);
  const [dataIntegrity, setDataIntegrity] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<string>("");

  const handleRunMigrations = async () => {
    setIsRunning(true);
    setMigrationResults([]);
    setCurrentStep("Starting migrations...");

    try {
      setCurrentStep("Running database migrations...");
      
      const response = await fetch("/api/migrations/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add a simple token for basic auth
          "Authorization": "Bearer migrate-2024",
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setMigrationResults(result.migrations);
        setDataIntegrity(result.dataIntegrity);
        setCurrentStep("Migrations completed");
      } else {
        setCurrentStep("Migration failed");
        console.error("Migration failed:", result);
      }
    } catch (error) {
      console.error("Migration failed:", error);
      setCurrentStep("Migration failed");
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (success: boolean) => {
    if (success) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
    }
    return <Badge variant="destructive">Failed</Badge>;
  };

  const successfulMigrations = migrationResults.filter(r => r.success).length;
  const totalMigrations = migrationResults.length;
  const progress = totalMigrations > 0 ? (successfulMigrations / totalMigrations) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Database Migration</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Run database migrations to normalize legacy data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Migration Runner
          </CardTitle>
          <CardDescription>
            Execute database migrations to normalize legacy data and ensure schema compliance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will migrate all legacy data to match the new normalized schema. 
              Make sure to backup your data before running migrations.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <Button 
              onClick={handleRunMigrations} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Run All Migrations
                </>
              )}
            </Button>

            {isRunning && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {currentStep}
              </div>
            )}
          </div>

          {migrationResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Migration Progress</h3>
                <span className="text-sm text-muted-foreground">
                  {successfulMigrations} / {totalMigrations} successful
                </span>
              </div>
              
              <Progress value={progress} className="w-full" />
              
              <div className="space-y-2">
                {migrationResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.success)}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        {result.recordsProcessed !== undefined && (
                          <div className="text-sm text-muted-foreground">
                            {result.recordsProcessed} / {result.recordsTotal} records processed
                          </div>
                        )}
                        {result.error && (
                          <div className="text-sm text-red-600">{result.error}</div>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(result.success)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Integrity Check */}
      {dataIntegrity && (
        <Card>
          <CardHeader>
            <CardTitle>Data Integrity Check</CardTitle>
            <CardDescription>
              Validation results for data consistency and referential integrity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataIntegrity.totalIssues === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                No data integrity issues found
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {dataIntegrity.totalIssues} issues found
                </div>
                <div className="space-y-1">
                  {dataIntegrity.issues.slice(0, 5).map((issue: DataIntegrityIssue, index: number) => (
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 