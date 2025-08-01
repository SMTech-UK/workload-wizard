# CSV Import Guide

This guide explains how to use the CSV import functionality for modules and module iterations in the Workload Wizard application.

## Overview

The CSV import feature allows you to bulk import modules and module iterations from CSV files. This is useful for:
- Setting up initial data for a new academic year
- Importing data from external systems
- Bulk updates to existing data

## Accessing the Import Feature

1. Navigate to the Dashboard
2. Scroll down to the "Quick Actions" section
3. Click either:
   - "Import Lecturers" for lecturer data
   - "Import Modules" for module data
   - "Import Module Iterations" for module iteration data

## CSV Format Requirements

### Lecturers CSV Format

Required columns:
- `fullName` - Full name of the lecturer (e.g., "Dr. John Smith")
- `team` - Department or team (must be one of: Adult, Children, Learning Disability, Mental Health, Post-Registration, Simulation)
- `specialism` - Area of expertise (e.g., "Clinical Practice", "Paediatric Nursing")
- `contract` - Contract type (e.g., "Full-time", "Part-time")
- `email` - Email address (must be valid format)
- `capacity` - Total capacity in hours (must be a positive number)
- `maxTeachingHours` - Maximum teaching hours (must be a positive number)
- `role` - Academic role (e.g., "Lecturer", "Senior Lecturer", "Professor")

Optional columns:
- `status` - Current status (defaults to "available")
- `fte` - Full-time equivalent (defaults to 1.0)

**Available Teams:**
The following teams are available for assignment:
- Adult
- Children
- Learning Disability
- Mental Health
- Post-Registration
- Simulation

Example:
```csv
fullName,team,specialism,contract,email,capacity,maxTeachingHours,role,status,fte
Dr. John Smith,Adult,Clinical Practice,Full-time,john.smith@university.edu,40,35,Senior Lecturer,available,1.0
Dr. Sarah Johnson,Children,Paediatric Nursing,Part-time,sarah.johnson@university.edu,20,18,Lecturer,available,0.5
```

### Modules CSV Format

Required columns:
- `code` - Module code (e.g., "CS101")
- `title` - Module title (e.g., "Introduction to Computer Science")
- `credits` - Number of credits (must be a positive number)
- `level` - Academic level (must be a positive number)
- `moduleLeader` - Name of the module leader
- `defaultTeachingHours` - Default teaching hours (must be a positive number)
- `defaultMarkingHours` - Default marking hours (must be a positive number)

Example:
```csv
code,title,credits,level,moduleLeader,defaultTeachingHours,defaultMarkingHours
CS101,Introduction to Computer Science,20,4,Dr. Smith,40,10
CS102,Programming Fundamentals,20,4,Dr. Johnson,45,15
```

### Module Iterations CSV Format

Required columns:
- `moduleCode` - Module code (must match an existing module)
- `title` - Module title
- `semester` - Semester number (must be a positive number)
- `cohortId` - Cohort identifier (e.g., "2024-25")
- `teachingStartDate` - Teaching start date (YYYY-MM-DD format)
- `teachingHours` - Teaching hours (must be a positive number)
- `markingHours` - Marking hours (must be a positive number)

Optional columns:
- `assignedStatus` - Assignment status (defaults to "unassigned")
- `notes` - Additional notes

Example:
```csv
moduleCode,title,semester,cohortId,teachingStartDate,teachingHours,markingHours,assignedStatus,notes
CS101,Introduction to Computer Science,1,2024-25,2024-09-23,40,10,unassigned,First semester offering
CS102,Programming Fundamentals,1,2024-25,2024-09-23,45,15,unassigned,Core programming module
```

## Import Process

### Step 1: Upload CSV File
1. Click "Choose CSV File" to select your CSV file
2. The system will automatically parse the file and attempt to map columns
3. You can download a sample CSV file to see the correct format

### Step 2: Field Mapping
1. Review the automatic column mapping
2. Adjust mappings if needed using the dropdown menus
3. All required fields must be mapped

### Step 3: Validation
1. The system validates your data for:
   - Required fields are present
   - Numeric fields contain valid numbers
   - Data format is correct
2. Fix any validation errors before proceeding

### Step 4: Preview
1. Review a preview of the data that will be imported
2. Confirm the data looks correct

### Step 5: Import
1. Click "Import" to start the import process
2. Monitor the progress bar
3. Review the success/error messages

## Best Practices

### Data Preparation
1. **Use consistent formatting**: Ensure dates are in YYYY-MM-DD format
2. **Check for duplicates**: Avoid importing duplicate module codes
3. **Validate data**: Use the sample files as templates
4. **Backup existing data**: Always backup before bulk imports

### File Format
1. **Use UTF-8 encoding**: Ensure special characters display correctly
2. **Include headers**: Always include column headers in the first row
3. **Use commas as separators**: Standard CSV format
4. **Quote text fields**: Use quotes around text that contains commas

### Import Strategy
1. **Start small**: Test with a few records first
2. **Import in order**: Import lecturers first, then modules, then module iterations
3. **Verify results**: Check the imported data after completion
4. **Handle errors**: Review and fix any import errors

## Troubleshooting

### Common Issues

**"Please select a valid CSV file"**
- Ensure the file has a .csv extension
- Check that the file is not corrupted

**"Validation errors"**
- Check that all required fields are present
- Ensure numeric fields contain valid numbers
- Verify date formats are correct

**"Import failed"**
- Check the browser console for detailed error messages
- Verify the CSV format matches the requirements
- Ensure the server is running and accessible

**"Field mapping issues"**
- Column names should match or be similar to the required field names
- Use the sample files as reference for correct column names

### Error Messages

- **"Field is required"**: A required field is missing or empty
- **"Field must be a positive number"**: A numeric field contains invalid data
- **"Field must be a valid email address"**: Email field contains invalid format
- **"Field must be one of: Adult, Children, Learning Disability, Mental Health, Post-Registration, Simulation"**: Team field contains an invalid team name
- **"Invalid date format"**: Date fields should be in YYYY-MM-DD format

## Sample Files

Sample CSV files are available for download from the import interface:
- `sample-lecturers.csv` - Example lecturer data
- `sample-modules.csv` - Example module data
- `sample-module-iterations.csv` - Example module iteration data

You can download these samples directly from the import modal or use them as templates for your own data.

## Support

If you encounter issues with the CSV import functionality:
1. Check this guide for common solutions
2. Verify your CSV format matches the requirements
3. Test with the provided sample files
4. Contact the development team for assistance 