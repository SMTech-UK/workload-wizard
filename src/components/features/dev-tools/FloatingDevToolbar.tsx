'use client';

import React, { useState, useEffect } from 'react';
import { useDevMode } from '@/hooks/useDevMode';
import { useDevSettings } from '@/hooks/useDevSettings';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Bug, 
  TestTube, 
  Code, 
  Database, 
  Plus, 
  Play, 
  Settings, 
  ChevronUp, 
  ChevronDown,
  Users,
  BookOpen,
  FileText,
  Monitor,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

// Error boundary component for dev tools
function DevToolbarErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null; // Don't render anything if there's an error
  }

  return (
    <React.Fragment>
      {React.Children.map(children, (child) => {
        try {
          return child;
        } catch (error) {
          console.warn('Dev toolbar error:', error);
          setHasError(true);
          return null;
        }
      })}
    </React.Fragment>
  );
}

export default function FloatingDevToolbar() {
  const [isClient, setIsClient] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{
    passed: number;
    failed: number;
    total: number;
  } | null>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything until we're on the client
  if (!isClient) {
    return null;
  }

  return (
    <DevToolbarErrorBoundary>
      <FloatingDevToolbarContent 
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isRunningTests={isRunningTests}
        setIsRunningTests={setIsRunningTests}
        testResults={testResults}
        setTestResults={setTestResults}
      />
    </DevToolbarErrorBoundary>
  );
}

function FloatingDevToolbarContent({
  isExpanded,
  setIsExpanded,
  isRunningTests,
  setIsRunningTests,
  testResults,
  setTestResults
}: {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isRunningTests: boolean;
  setIsRunningTests: (running: boolean) => void;
  testResults: { passed: number; failed: number; total: number } | null;
  setTestResults: (results: { passed: number; failed: number; total: number } | null) => void;
}) {
  const { shouldShowDevTools, devMode } = useDevMode();
  const { openDevSettings } = useDevSettings();
  const router = useRouter();

  // Don't render if dev mode is not enabled
  if (!shouldShowDevTools) {
    return null;
  }

  const runQuickTests = async () => {
    setIsRunningTests(true);
    try {
      const response = await fetch('/api/test-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testPath: 'utils', includeCoverage: false }),
      });
      
      const data = await response.json();
      if (data.success) {
        const results = data.results;
        const passed = results.numPassedTests || 0;
        const failed = results.numFailedTests || 0;
        const total = results.numTotalTests || 0;
        
        setTestResults({ passed, failed, total });
        toast.success(`Tests completed: ${passed}/${total} passed`);
      } else {
        toast.error('Test execution failed');
      }
    } catch (error) {
      toast.error('Failed to run tests');
    } finally {
      setIsRunningTests(false);
    }
  };

  const addTestLecturer = async () => {
    try {
      const response = await fetch('/api/dev/add-test-lecturer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        toast.success('Test lecturer added successfully');
      } else {
        toast.error('Failed to add test lecturer');
      }
    } catch (error) {
      toast.error('Failed to add test lecturer');
    }
  };

  const addTestModule = async () => {
    try {
      const response = await fetch('/api/dev/add-test-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        toast.success('Test module added successfully');
      } else {
        toast.error('Failed to add test module');
      }
    } catch (error) {
      toast.error('Failed to add test module');
    }
  };

  const clearTestData = async () => {
    if (!confirm('Are you sure you want to clear all test data? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/dev/clear-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        toast.success('Test data cleared successfully');
      } else {
        toast.error('Failed to clear test data');
      }
    } catch (error) {
      toast.error('Failed to clear test data');
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50">
        {/* Main Toolbar */}
        <div className="flex flex-col items-end space-y-2">
          {/* Test Results Badge */}
          {testResults && (
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-2">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">{testResults.passed}</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">{testResults.failed}</span>
              </div>
              <span className="text-xs text-gray-500">/ {testResults.total}</span>
            </div>
          )}

          {/* Quick Actions */}
          {isExpanded && (
            <div className="flex flex-col items-end space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/test-dashboard?run=unit')}
                    className="bg-white dark:bg-gray-800 shadow-lg"
                  >
                    <TestTube className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run Unit Tests</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/test-dashboard?run=component')}
                    className="bg-white dark:bg-gray-800 shadow-lg"
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run Component Tests</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/test-dashboard?run=hook')}
                    className="bg-white dark:bg-gray-800 shadow-lg"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run Hook Tests</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/test-dashboard?run=all')}
                    className="bg-white dark:bg-gray-800 shadow-lg"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run All Tests</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={runQuickTests}
                    disabled={isRunningTests}
                    className="bg-white dark:bg-gray-800 shadow-lg"
                  >
                    {isRunningTests ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run Quick Tests</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/test-dashboard')}
                    className="bg-white dark:bg-gray-800 shadow-lg"
                  >
                    <TestTube className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Test Dashboard</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/dev-tools')}
                    className="bg-white dark:bg-gray-800 shadow-lg"
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dev Tools</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Main Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold shadow-lg"
              >
                <Bug className="w-4 h-4 mr-2" />
                DEV
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-yellow-500" />
                Development Tools
                <Badge variant="outline" className="bg-yellow-500 text-black">DEV</Badge>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => router.push('/dev-tools')}>
                <Code className="w-4 h-4 mr-2" />
                Dev Tools
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push('/test-dashboard')}>
                <TestTube className="w-4 h-4 mr-2" />
                Test Dashboard
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => router.push('/dev-tools?tab=api-tester')}>
                <Database className="w-4 h-4 mr-2" />
                API Tester
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push('/dev-tools?tab=component-explorer')}>
                <Code className="w-4 h-4 mr-2" />
                Component Explorer
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Testing Utilities</DropdownMenuLabel>
              
              <DropdownMenuItem onClick={runQuickTests} disabled={isRunningTests}>
                <Play className="w-4 h-4 mr-2" />
                {isRunningTests ? 'Running Tests...' : 'Run Quick Tests'}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => router.push('/test-dashboard?run=unit')}>
                <TestTube className="w-4 h-4 mr-2" />
                Run Unit Tests
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => router.push('/test-dashboard?run=component')}>
                <Code className="w-4 h-4 mr-2" />
                Run Component Tests
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => router.push('/test-dashboard?run=hook')}>
                <Settings className="w-4 h-4 mr-2" />
                Run Hook Tests
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => router.push('/test-dashboard?run=all')}>
                <Play className="w-4 h-4 mr-2" />
                Run All Tests
              </DropdownMenuItem>        
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Test Data</DropdownMenuLabel>
              
              <DropdownMenuItem onClick={addTestLecturer}>
                <Users className="w-4 h-4 mr-2" />
                Add Test Lecturer
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={addTestModule}>
                <BookOpen className="w-4 h-4 mr-2" />
                Add Test Module
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={clearTestData}>
                <FileText className="w-4 h-4 mr-2" />
                Clear Test Data
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => router.push('/dev-tools?tab=monitoring')}>
                <Monitor className="w-4 h-4 mr-2" />
                System Monitor
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => router.push('/dev-tools?tab=logs')}>
                <FileText className="w-4 h-4 mr-2" />
                View Logs
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={openDevSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Dev Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Expand/Collapse Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-white dark:bg-gray-800 shadow-lg"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isExpanded ? 'Collapse' : 'Expand'} Quick Actions</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
} 