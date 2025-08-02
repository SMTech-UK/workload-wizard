"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importType: "modules" | "module-iterations" | "lecturers";
}

interface CSVRow {
  [key: string]: string | number;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function CSVImportModal({ isOpen, onClose, importType }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importModules = useMutation('modules:bulkImport' as any);
  const importModuleIterations = useMutation('module_iterations:bulkImport' as any);
  const importLecturers = useMutation('lecturers:bulkImport' as any);

  const requiredFields = {
    modules: ["code", "title", "credits", "level", "moduleLeader", "defaultTeachingHours", "defaultMarkingHours"],
    "module-iterations": ["moduleCode", "title", "semester", "cohortId", "teachingStartDate", "teachingHours", "markingHours"],
    lecturers: ["fullName", "team", "specialism", "contract", "email", "capacity", "maxTeachingHours", "role"]
  };

  const availableTeams = [
    "Adult",
    "Children", 
    "Learning Disability",
    "Mental Health",
    "Post-Registration",
    "Simulation"
  ].sort(); // Alphabetical order

  const sampleCSV = {
    modules: `code,title,credits,level,moduleLeader,defaultTeachingHours,defaultMarkingHours
CS101,Introduction to Computer Science,20,4,Dr. Smith,40,10
CS102,Programming Fundamentals,20,4,Dr. Johnson,45,15`,
    "module-iterations": `moduleCode,title,semester,cohortId,teachingStartDate,teachingHours,markingHours,assignedStatus,notes
CS101,Introduction to Computer Science,1,2024-25,2024-09-23,40,10,unassigned,First semester offering
CS102,Programming Fundamentals,1,2024-25,2024-09-23,45,15,unassigned,Core programming module`,
    lecturers: `fullName,team,specialism,contract,email,capacity,maxTeachingHours,role,status,fte
Dr. John Smith,Adult,Clinical Practice,Full-time,john.smith@university.edu,40,35,Senior Lecturer,available,1.0
Dr. Sarah Johnson,Children,Paediatric Nursing,Part-time,sarah.johnson@university.edu,20,18,Lecturer,available,0.5`
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      toast.error("Please select a valid CSV file");
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data: CSVRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: CSVRow = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        }
      }

      setCsvData(data);
      setMapping(createDefaultMapping(headers));
      validateData(data);
    };
    reader.readAsText(file);
  };

  const createDefaultMapping = (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {};
    const fields = requiredFields[importType];
    
    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().replace(/\s+/g, '');
      const matchingField = fields.find(field => 
        field.toLowerCase() === normalizedHeader ||
        field.toLowerCase().includes(normalizedHeader) ||
        normalizedHeader.includes(field.toLowerCase())
      );
      if (matchingField) {
        mapping[header] = matchingField;
      }
    });

    return mapping;
  };

  const validateData = (data: CSVRow[]) => {
    const errors: ValidationError[] = [];
    const fields = requiredFields[importType];

    data.forEach((row, index) => {
      fields.forEach(field => {
        const mappedField = Object.keys(mapping).find(key => mapping[key] === field);
        const value = mappedField ? row[mappedField] : row[field];
        
        if (!value || value.toString().trim() === '') {
          errors.push({
            row: index + 1,
            field,
            message: `${field} is required`
          });
        } else if (field === 'credits' || field === 'level' || field === 'defaultTeachingHours' || field === 'defaultMarkingHours' || field === 'semester' || field === 'teachingHours' || field === 'markingHours' || field === 'capacity' || field === 'maxTeachingHours' || field === 'fte') {
          const numValue = Number(value);
          if (isNaN(numValue) || numValue <= 0) {
            errors.push({
              row: index + 1,
              field,
              message: `${field} must be a positive number`
            });
          }
        } else if (field === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.toString())) {
            errors.push({
              row: index + 1,
              field,
              message: `${field} must be a valid email address`
            });
          }
        } else if (field === 'team') {
          if (!availableTeams.includes(value.toString())) {
            errors.push({
              row: index + 1,
              field,
              message: `${field} must be one of: ${availableTeams.join(', ')}`
            });
          }
        }
      });
    });

    setValidationErrors(errors);
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      toast.error("Please fix validation errors before importing");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const transformedData = csvData.map(row => {
        const transformed: any = {};
        Object.keys(mapping).forEach(csvField => {
          const dbField = mapping[csvField];
          let value = row[csvField];
          
          // Convert numeric fields
          if (['credits', 'level', 'defaultTeachingHours', 'defaultMarkingHours', 'semester', 'teachingHours', 'markingHours', 'capacity', 'maxTeachingHours', 'fte'].includes(dbField)) {
            value = Number(value);
          }
          
          transformed[dbField] = value;
        });
        return transformed;
      });

      if (importType === "modules") {
        await importModules({ modules: transformedData });
      } else if (importType === "module-iterations") {
        await importModuleIterations({ iterations: transformedData });
      } else if (importType === "lecturers") {
        await importLecturers({ lecturers: transformedData });
      }

      setProgress(100);
      const typeLabel = importType === "modules" ? "modules" : importType === "module-iterations" ? "module iterations" : "lecturers";
      toast.success(`Successfully imported ${transformedData.length} ${typeLabel}`);
      
      // Reset form
      setFile(null);
      setCsvData([]);
      setValidationErrors([]);
      setMapping({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => {
        onClose();
        setIsProcessing(false);
        setProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Import error:', error);
      toast.error("Failed to import data. Please check your CSV format and try again.");
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadSample = () => {
    const csvContent = sampleCSV[importType];
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importType}-sample.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFile(null);
    setCsvData([]);
    setValidationErrors([]);
    setMapping({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import {importType === "modules" ? "Modules" : importType === "module-iterations" ? "Module Iterations" : "Lecturers"} via CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import {importType === "modules" ? "modules" : importType === "module-iterations" ? "module iterations" : "lecturers"}. 
            Make sure your CSV matches the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 1: Upload CSV File</CardTitle>
              <CardDescription>
                Select a CSV file to import. The file should contain all required fields.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose CSV File
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadSample}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Sample
                </Button>
                {file && (
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">{file.name}</span>
                  <Badge variant="secondary">{csvData.length} rows</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Field Mapping Section */}
          {csvData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 2: Field Mapping</CardTitle>
                <CardDescription>
                  Map CSV columns to database fields. Required fields are marked with an asterisk (*).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(mapping).map(csvField => (
                    <div key={csvField} className="space-y-2">
                      <Label className="text-sm font-medium">
                        CSV Column: {csvField}
                      </Label>
                      <Select
                        value={mapping[csvField]}
                        onValueChange={(value) => {
                          setMapping(prev => ({ ...prev, [csvField]: value }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {requiredFields[importType].map(field => (
                            <SelectItem key={field} value={field}>
                              {field} *
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Show team dropdown for team field when importing lecturers */}
                      {importType === "lecturers" && mapping[csvField] === "team" && (
                        <div className="mt-2">
                          <Label className="text-xs text-muted-foreground">
                            Available Teams:
                          </Label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {availableTeams.map(team => (
                              <Badge key={team} variant="outline" className="text-xs">
                                {team}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Section */}
          {validationErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Validation Errors ({validationErrors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Row {error.row}: {error.field} - {error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Section */}
          {csvData.length > 0 && validationErrors.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 3: Preview Data</CardTitle>
                <CardDescription>
                  Preview of the first few rows that will be imported.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(mapping).map(field => (
                          <th key={field} className="text-left p-2 font-medium">
                            {field} → {mapping[field]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 3).map((row, index) => (
                        <tr key={index} className="border-b">
                          {Object.keys(mapping).map(field => (
                            <td key={field} className="p-2">
                              {row[field]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 3 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ... and {csvData.length - 3} more rows
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Section */}
          {isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Importing...</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  Processing {csvData.length} records...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={csvData.length === 0 || validationErrors.length > 0 || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import {csvData.length} {importType === "modules" ? "Modules" : importType === "module-iterations" ? "Module Iterations" : "Lecturers"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 