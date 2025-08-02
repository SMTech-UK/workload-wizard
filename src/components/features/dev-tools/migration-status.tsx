"use client"

import React from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Database,
  FileText,
  Users,
  Settings,
  Calendar,
  BarChart3,
  Archive
} from "lucide-react";

interface MigrationStatus {
  _id: string;
  name: string;
  version: string;
  status: "pending" | "running" | "completed" | "failed" | "completed_with_errors";
  appliedAt: number;
  duration: number;
  details: any;
  createdAt: number;
}

export function MigrationStatus() {
  const migrationStatus = useQuery('migrations:getMigrationStatus' as any, {});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "completed_with_errors":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case "completed_with_errors":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Completed with Errors</Badge>;
      case "running":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Running</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getMigrationIcon = (name: string) => {
    if (name.includes("profile")) return <Users className="h-4 w-4" />;
    if (name.includes("academic")) return <Calendar className="h-4 w-4" />;
    if (name.includes("normalization")) return <Database className="h-4 w-4" />;
    if (name.includes("seed")) return <Settings className="h-4 w-4" />;
    if (name.includes("report")) return <BarChart3 className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  const getMigrationStats = () => {
    if (!migrationStatus) return null;

    const total = migrationStatus.length;
    const completed = migrationStatus.filter((m: any) => m.status === "completed").length;
    const failed = migrationStatus.filter((m: any) => m.status === "failed").length;
    const withErrors = migrationStatus.filter((m: any) => m.status === "completed_with_errors").length;
    const running = migrationStatus.filter((m: any) => m.status === "running").length;

    return { total, completed, failed, withErrors, running };
  };

  const stats = getMigrationStats();

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
          <p className="text-muted-foreground">Checking migration history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Migration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.withErrors}</div>
                <div className="text-sm text-muted-foreground">With Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
                <div className="text-sm text-muted-foreground">Running</div>
              </div>
            </div>
          )}

          {stats && stats.total > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Success Rate</span>
                <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
              </div>
              <Progress 
                value={(stats.completed / stats.total) * 100} 
                className="w-full" 
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Migrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Recent Migrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {migrationStatus.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No migrations found</p>
                </div>
              ) : (
                migrationStatus.map((migration: any, index: any) => (
                  <div key={migration._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getMigrationIcon(migration.name)}
                        <div>
                          <h4 className="font-medium">{migration.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Version {migration.version}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(migration.status)}
                        {getStatusBadge(migration.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Applied:</span>
                        <div>{new Date(migration.appliedAt).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <div>{formatDuration(migration.duration)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Records:</span>
                        <div>{migration.details?.recordsProcessed || 0}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Errors:</span>
                        <div>{migration.details?.errors || 0}</div>
                      </div>
                    </div>

                    {migration.details?.errorDetails && migration.details.errorDetails.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <div className="font-medium">Migration completed with errors:</div>
                            {migration.details.errorDetails.slice(0, 3).map((error: any, idx: any) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium">{error.step}:</span> {error.error}
                              </div>
                            ))}
                            {migration.details.errorDetails.length > 3 && (
                              <div className="text-sm text-muted-foreground">
                                ... and {migration.details.errorDetails.length - 3} more errors
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {migration.details?.steps && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Steps:</div>
                        <div className="flex flex-wrap gap-1">
                          {migration.details.steps.map((step: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {step}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Migration Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Migration Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats && stats.failed > 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {stats.failed} migration{stats.failed > 1 ? 's have' : ' has'} failed and may need attention.
                Check the migration details above for more information.
              </AlertDescription>
            </Alert>
          ) : stats && stats.withErrors > 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {stats.withErrors} migration{stats.withErrors > 1 ? 's completed' : ' completed'} with errors.
                While the migration succeeded, some issues were encountered.
              </AlertDescription>
            </Alert>
          ) : stats && stats.completed > 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All migrations completed successfully! Your database is up to date.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                No migrations have been run yet. Use the migration dashboard to start the migration process.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 