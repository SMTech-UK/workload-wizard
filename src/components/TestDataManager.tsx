'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function TestDataManager() {
  const [isLoading, setIsLoading] = useState({
    addLecturer: false,
    addModule: false,
    clearData: false,
  });

  const addTestLecturer = async () => {
    setIsLoading(prev => ({ ...prev, addLecturer: true }));
    try {
      const response = await fetch('/api/dev/add-test-lecturer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Test lecturer added successfully');
        console.log('Added lecturer:', data.lecturer);
      } else {
        toast.error('Failed to add test lecturer');
      }
    } catch (error) {
      toast.error('Failed to add test lecturer');
    } finally {
      setIsLoading(prev => ({ ...prev, addLecturer: false }));
    }
  };

  const addTestModule = async () => {
    setIsLoading(prev => ({ ...prev, addModule: true }));
    try {
      const response = await fetch('/api/dev/add-test-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Test module added successfully');
        console.log('Added module:', data.module);
      } else {
        toast.error('Failed to add test module');
      }
    } catch (error) {
      toast.error('Failed to add test module');
    } finally {
      setIsLoading(prev => ({ ...prev, addModule: false }));
    }
  };

  const clearTestData = async () => {
    if (!confirm('Are you sure you want to clear all test data? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(prev => ({ ...prev, clearData: true }));
    try {
      const response = await fetch('/api/dev/clear-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Test data cleared successfully');
        console.log('Cleared data:', data.deletedCount);
      } else {
        toast.error('Failed to clear test data');
      }
    } catch (error) {
      toast.error('Failed to clear test data');
    } finally {
      setIsLoading(prev => ({ ...prev, clearData: false }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Test Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These actions will add or remove test data from your development environment. 
              Test data is marked with "test-" prefix and can be safely cleared.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Test Lecturers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Add test lecturer data for development and testing purposes.
                </p>
                <Button 
                  onClick={addTestLecturer} 
                  disabled={isLoading.addLecturer}
                  className="w-full"
                >
                  {isLoading.addLecturer ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Test Lecturer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Test Modules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Add test module data for development and testing purposes.
                </p>
                <Button 
                  onClick={addTestModule} 
                  disabled={isLoading.addModule}
                  className="w-full"
                >
                  {isLoading.addModule ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Test Module
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear Test Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Remove all test data from the development environment.
                </p>
                <Button 
                  onClick={clearTestData} 
                  disabled={isLoading.clearData}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading.clearData ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Clear All Test Data
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Test Data Information</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Test data is prefixed with "test-" for easy identification</p>
              <p>• Test lecturers include sample teaching preferences and interests</p>
              <p>• Test modules include sample learning outcomes and assessment methods</p>
              <p>• Clearing test data removes all records with "test-" prefix</p>
              <p>• This action only affects development/test environment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 