# WorkloadWizard API Documentation

## 📋 Overview

WorkloadWizard uses Convex as its backend API, providing real-time database functionality with automatic synchronization. This document outlines the API structure, functions, and usage patterns.

## 🔗 Base URL

```
Production: https://your-deployment.convex.cloud
Development: http://localhost:8000 (when running convex dev)
```

## 🔐 Authentication

All API calls require authentication via Clerk JWT tokens. The authentication is handled automatically by the Convex client.

### Authentication Headers
```typescript
// Automatically handled by Convex client
const convex = useConvex();
```

## 📊 Database Schema

### Core Tables

#### `lecturer_profiles`
```typescript
interface LecturerProfile {
  _id: Id<"lecturer_profiles">;
  fullName: string;
  email: string;
  family: "Teaching Academic" | "Research Academic" | "Academic Practitioner";
  fte: number;
  capacity: number;
  maxTeachingHours: number;
  totalContract: number;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}
```

#### `lecturers`
```typescript
interface Lecturer {
  _id: Id<"lecturers">;
  profileId: Id<"lecturer_profiles">;
  academicYearId: Id<"academic_years">;
  teachingHours: number;
  adminHours: number;
  researchHours: number;
  cpdHours: number;
  leadershipHours: number;
  totalAllocated: number;
  utilization: number;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}
```

#### `modules`
```typescript
interface Module {
  _id: Id<"modules">;
  code: string;
  title: string;
  description?: string;
  level: number;
  credits: number;
  defaultTeachingHours: number;
  defaultMarkingHours: number;
  moduleLeaderId?: Id<"lecturer_profiles">;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}
```

#### `module_iterations`
```typescript
interface ModuleIteration {
  _id: Id<"module_iterations">;
  moduleId: Id<"modules">;
  academicYearId: Id<"academic_years">;
  semester: number;
  hours: {
    teaching: number;
    marking: number;
    cpd: number;
    leadership: number;
  };
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}
```

#### `module_allocations`
```typescript
interface ModuleAllocation {
  _id: Id<"module_allocations">;
  moduleIterationId: Id<"module_iterations">;
  lecturerId: Id<"lecturers">;
  hours: {
    teaching: number;
    marking: number;
    cpd: number;
    leadership: number;
  };
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}
```

## 🔧 API Functions

### Lecturer Management

#### `lecturer_profiles.getAll`
Get all lecturer profiles for the current organisation.

```typescript
// Query
const lecturerProfiles = useQuery(api.lecturer_profiles.getAll);

// Returns: LecturerProfile[]
```

#### `lecturer_profiles.create`
Create a new lecturer profile.

```typescript
// Mutation
const createProfile = useMutation(api.lecturer_profiles.create);

// Parameters
interface CreateProfileParams {
  fullName: string;
  email: string;
  family: "Teaching Academic" | "Research Academic" | "Academic Practitioner";
  fte: number;
  capacity: number;
  maxTeachingHours: number;
  totalContract: number;
}

// Usage
await createProfile({
  fullName: "Dr. John Smith",
  email: "john.smith@university.edu",
  family: "Teaching Academic",
  fte: 1.0,
  capacity: 1650,
  maxTeachingHours: 990,
  totalContract: 1650,
});
```

#### `lecturer_profiles.update`
Update an existing lecturer profile.

```typescript
// Mutation
const updateProfile = useMutation(api.lecturer_profiles.update);

// Parameters
interface UpdateProfileParams {
  id: Id<"lecturer_profiles">;
  updates: Partial<Omit<LecturerProfile, "_id" | "organisationId" | "createdAt" | "updatedAt">>;
}

// Usage
await updateProfile({
  id: "lecturer_profile_id",
  updates: {
    fullName: "Dr. John Smith Jr.",
    fte: 0.8,
  },
});
```

#### `lecturer_profiles.delete`
Delete a lecturer profile.

```typescript
// Mutation
const deleteProfile = useMutation(api.lecturer_profiles.delete);

// Parameters
interface DeleteProfileParams {
  id: Id<"lecturer_profiles">;
}

// Usage
await deleteProfile({ id: "lecturer_profile_id" });
```

### Module Management

#### `modules.getAll`
Get all modules for the current organisation.

```typescript
// Query
const modules = useQuery(api.modules.getAll);

// Returns: Module[]
```

#### `modules.create`
Create a new module.

```typescript
// Mutation
const createModule = useMutation(api.modules.create);

// Parameters
interface CreateModuleParams {
  code: string;
  title: string;
  description?: string;
  level: number;
  credits: number;
  defaultTeachingHours: number;
  defaultMarkingHours: number;
  moduleLeaderId?: Id<"lecturer_profiles">;
}

// Usage
await createModule({
  code: "CS101",
  title: "Introduction to Computer Science",
  description: "Basic concepts of programming and computer science",
  level: 4,
  credits: 20,
  defaultTeachingHours: 24,
  defaultMarkingHours: 8,
});
```

#### `modules.update`
Update an existing module.

```typescript
// Mutation
const updateModule = useMutation(api.modules.update);

// Parameters
interface UpdateModuleParams {
  id: Id<"modules">;
  updates: Partial<Omit<Module, "_id" | "organisationId" | "createdAt" | "updatedAt">>;
}

// Usage
await updateModule({
  id: "module_id",
  updates: {
    title: "Advanced Introduction to Computer Science",
    credits: 30,
  },
});
```

#### `modules.delete`
Delete a module.

```typescript
// Mutation
const deleteModule = useMutation(api.modules.delete);

// Parameters
interface DeleteModuleParams {
  id: Id<"modules">;
}

// Usage
await deleteModule({ id: "module_id" });
```

### Module Allocations

#### `module_allocations.getAll`
Get all module allocations for the current organisation.

```typescript
// Query
const allocations = useQuery(api.module_allocations.getAll);

// Returns: ModuleAllocation[]
```

#### `module_allocations.create`
Create a new module allocation.

```typescript
// Mutation
const createAllocation = useMutation(api.module_allocations.create);

// Parameters
interface CreateAllocationParams {
  moduleIterationId: Id<"module_iterations">;
  lecturerId: Id<"lecturers">;
  hours: {
    teaching: number;
    marking: number;
    cpd: number;
    leadership: number;
  };
}

// Usage
await createAllocation({
  moduleIterationId: "module_iteration_id",
  lecturerId: "lecturer_id",
  hours: {
    teaching: 24,
    marking: 8,
    cpd: 0,
    leadership: 0,
  },
});
```

#### `module_allocations.update`
Update an existing module allocation.

```typescript
// Mutation
const updateAllocation = useMutation(api.module_allocations.update);

// Parameters
interface UpdateAllocationParams {
  id: Id<"module_allocations">;
  updates: Partial<Omit<ModuleAllocation, "_id" | "organisationId" | "createdAt" | "updatedAt">>;
}

// Usage
await updateAllocation({
  id: "allocation_id",
  updates: {
    hours: {
      teaching: 30,
      marking: 10,
      cpd: 0,
      leadership: 0,
    },
  },
});
```

#### `module_allocations.delete`
Delete a module allocation.

```typescript
// Mutation
const deleteAllocation = useMutation(api.module_allocations.delete);

// Parameters
interface DeleteAllocationParams {
  id: Id<"module_allocations">;
}

// Usage
await deleteAllocation({ id: "allocation_id" });
```

### Course Management

#### `courses.getAll`
Get all courses for the current organisation.

```typescript
// Query
const courses = useQuery(api.courses.getAll);

// Returns: Course[]
```

#### `courses.create`
Create a new course.

```typescript
// Mutation
const createCourse = useMutation(api.courses.create);

// Parameters
interface CreateCourseParams {
  code: string;
  title: string;
  description?: string;
  facultyId: Id<"faculties">;
  departmentId: Id<"departments">;
  level: number;
  credits: number;
  duration: number;
}

// Usage
await createCourse({
  code: "BSC_CS",
  title: "Bachelor of Science in Computer Science",
  description: "Three-year undergraduate degree in computer science",
  facultyId: "faculty_id",
  departmentId: "department_id",
  level: 4,
  credits: 360,
  duration: 3,
});
```

### Cohort Management

#### `cohorts.getAll`
Get all cohorts for the current organisation.

```typescript
// Query
const cohorts = useQuery(api.cohorts.getAll);

// Returns: Cohort[]
```

#### `cohorts.create`
Create a new cohort.

```typescript
// Mutation
const createCohort = useMutation(api.cohorts.create);

// Parameters
interface CreateCohortParams {
  name: string;
  code: string;
  courseId: Id<"courses">;
  academicYearId: Id<"academic_years">;
  startDate: string;
  endDate: string;
  expectedGraduationDate: string;
  studentCount: number;
  maxStudentCount: number;
}

// Usage
await createCohort({
  name: "Computer Science 2024",
  code: "CS2024",
  courseId: "course_id",
  academicYearId: "academic_year_id",
  startDate: "2024-09-01",
  endDate: "2027-06-30",
  expectedGraduationDate: "2027-07-15",
  studentCount: 120,
  maxStudentCount: 150,
});
```

### Team Management

#### `teams.getAll`
Get all teams for the current organisation.

```typescript
// Query
const teams = useQuery(api.teams.getAll);

// Returns: Team[]
```

#### `teams.create`
Create a new team.

```typescript
// Mutation
const createTeam = useMutation(api.teams.create);

// Parameters
interface CreateTeamParams {
  name: string;
  code: string;
  description?: string;
  departmentId: Id<"departments">;
  facultyId: Id<"faculties">;
  teamLeaderId?: Id<"lecturer_profiles">;
  memberCount: number;
  maxMemberCount: number;
}

// Usage
await createTeam({
  name: "Software Engineering Team",
  code: "SE_TEAM",
  description: "Team responsible for software engineering modules",
  departmentId: "department_id",
  facultyId: "faculty_id",
  memberCount: 5,
  maxMemberCount: 8,
});
```

### Reporting and Analytics

#### `reports.generateWorkloadReport`
Generate a workload report for the current academic year.

```typescript
// Action
const generateReport = useAction(api.reports.generateWorkloadReport);

// Parameters
interface GenerateReportParams {
  academicYearId: Id<"academic_years">;
  format: "json" | "csv" | "html" | "pdf";
  filters?: {
    departmentId?: Id<"departments">;
    facultyId?: Id<"faculties">;
    teamId?: Id<"teams">;
  };
}

// Usage
const report = await generateReport({
  academicYearId: "academic_year_id",
  format: "pdf",
  filters: {
    departmentId: "department_id",
  },
});
```

#### `reports.generateUtilizationReport`
Generate a utilization report.

```typescript
// Action
const generateUtilizationReport = useAction(api.reports.generateUtilizationReport);

// Parameters
interface GenerateUtilizationReportParams {
  academicYearId: Id<"academic_years">;
  format: "json" | "csv" | "html" | "pdf";
}

// Usage
const report = await generateUtilizationReport({
  academicYearId: "academic_year_id",
  format: "csv",
});
```

### Audit Logging

#### `audit_logs.getRecentActivity`
Get recent audit log entries.

```typescript
// Query
const recentActivity = useQuery(api.audit_logs.getRecentActivity, {
  limit: 50,
});

// Returns: AuditLog[]
```

#### `audit_logs.create`
Create a new audit log entry.

```typescript
// Mutation
const createAuditLog = useMutation(api.audit_logs.create);

// Parameters
interface CreateAuditLogParams {
  type: "create" | "edit" | "delete" | "view" | "import" | "export";
  entity: string;
  description: string;
  entityId?: string;
  details?: Record<string, any>;
}

// Usage
await createAuditLog({
  type: "create",
  entity: "lecturer_profile",
  description: "Created lecturer profile for Dr. John Smith",
  entityId: "lecturer_profile_id",
  details: {
    fullName: "Dr. John Smith",
    email: "john.smith@university.edu",
  },
});
```

### Notifications

#### `notifications.getAll`
Get all notifications for the current user.

```typescript
// Query
const notifications = useQuery(api.notifications.getAll);

// Returns: Notification[]
```

#### `notifications.markAsRead`
Mark a notification as read.

```typescript
// Mutation
const markAsRead = useMutation(api.notifications.markAsRead);

// Parameters
interface MarkAsReadParams {
  id: Id<"notifications">;
}

// Usage
await markAsRead({ id: "notification_id" });
```

#### `notifications.create`
Create a new notification.

```typescript
// Mutation
const createNotification = useMutation(api.notifications.create);

// Parameters
interface CreateNotificationParams {
  type: "workload_alert" | "allocation_change" | "system_alert" | "reminder" | "report_ready";
  title: string;
  message: string;
  userId: string;
  priority: "low" | "medium" | "high" | "critical";
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
}

// Usage
await createNotification({
  type: "workload_alert",
  title: "Workload Alert",
  message: "Dr. John Smith has exceeded 100% utilization",
  userId: "user_id",
  priority: "high",
  entityId: "lecturer_id",
  entityType: "lecturer",
  metadata: {
    utilization: 105,
    threshold: 100,
  },
});
```

## 🔄 Real-time Updates

Convex provides automatic real-time updates. When you use `useQuery`, the data automatically updates when changes occur in the database.

```typescript
// This will automatically update when lecturer profiles change
const lecturerProfiles = useQuery(api.lecturer_profiles.getAll);

// This will automatically update when module allocations change
const allocations = useQuery(api.module_allocations.getAll);
```

## 🚨 Error Handling

### Error Types
```typescript
interface ConvexError {
  code: string;
  message: string;
  data?: any;
}
```

### Common Error Codes
- `UNAUTHORIZED`: User is not authenticated
- `FORBIDDEN`: User does not have permission
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMITED`: Too many requests

### Error Handling Example
```typescript
try {
  await createProfile(profileData);
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // Handle authentication error
    console.error('User not authenticated');
  } else if (error.code === 'VALIDATION_ERROR') {
    // Handle validation error
    console.error('Invalid data:', error.data);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## 📊 Rate Limiting

- **Queries**: 1000 requests per minute per user
- **Mutations**: 100 requests per minute per user
- **Actions**: 50 requests per minute per user

## 🔒 Security

### Authentication
- All API calls require valid Clerk JWT tokens
- Tokens are automatically refreshed by the Convex client
- Unauthenticated requests return 401 Unauthorized

### Authorization
- Users can only access data from their organisation
- Role-based access control for different operations
- Admin functions require admin privileges

### Data Validation
- All input data is validated against TypeScript schemas
- SQL injection protection through parameterized queries
- XSS protection through automatic escaping

## 📝 Best Practices

### 1. Use TypeScript
```typescript
// Good: Type-safe API calls
const createProfile = useMutation(api.lecturer_profiles.create);
const profile: CreateProfileParams = {
  fullName: "Dr. John Smith",
  email: "john.smith@university.edu",
  family: "Teaching Academic",
  fte: 1.0,
  capacity: 1650,
  maxTeachingHours: 990,
  totalContract: 1650,
};
await createProfile(profile);

// Bad: Untyped API calls
await createProfile({
  fullName: "Dr. John Smith",
  // Missing required fields
});
```

### 2. Handle Loading States
```typescript
const lecturerProfiles = useQuery(api.lecturer_profiles.getAll);

if (lecturerProfiles === undefined) {
  return <div>Loading...</div>;
}

if (lecturerProfiles.length === 0) {
  return <div>No lecturer profiles found</div>;
}

return (
  <div>
    {lecturerProfiles.map(profile => (
      <div key={profile._id}>{profile.fullName}</div>
    ))}
  </div>
);
```

### 3. Optimistic Updates
```typescript
const updateProfile = useMutation(api.lecturer_profiles.update);

const handleUpdate = async (id: Id<"lecturer_profiles">, updates: any) => {
  // Optimistically update the UI
  const optimisticUpdate = {
    ...currentProfile,
    ...updates,
  };
  
  try {
    await updateProfile({ id, updates });
  } catch (error) {
    // Revert optimistic update on error
    console.error('Update failed:', error);
  }
};
```

### 4. Batch Operations
```typescript
// Good: Batch multiple operations
const batchUpdate = useMutation(api.batch.updateMultipleProfiles);

await batchUpdate({
  updates: [
    { id: "profile1", updates: { fte: 0.8 } },
    { id: "profile2", updates: { fte: 1.0 } },
  ],
});

// Bad: Multiple individual operations
const updateProfile = useMutation(api.lecturer_profiles.update);
await updateProfile({ id: "profile1", updates: { fte: 0.8 } });
await updateProfile({ id: "profile2", updates: { fte: 1.0 } });
```

## 🔗 Integration Examples

### React Hook Example
```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

export function useLecturerProfiles() {
  const profiles = useQuery(api.lecturer_profiles.getAll);
  const createProfile = useMutation(api.lecturer_profiles.create);
  const updateProfile = useMutation(api.lecturer_profiles.update);
  const deleteProfile = useMutation(api.lecturer_profiles.delete);

  return {
    profiles,
    createProfile,
    updateProfile,
    deleteProfile,
    isLoading: profiles === undefined,
  };
}
```

### Form Submission Example
```typescript
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

export function LecturerProfileForm() {
  const createProfile = useMutation(api.lecturer_profiles.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateProfileParams) => {
    setIsSubmitting(true);
    try {
      await createProfile(data);
      // Show success message
    } catch (error) {
      // Handle error
      console.error('Failed to create profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Profile'}
      </button>
    </form>
  );
}
```

---

*This documentation is maintained alongside the codebase and should be updated when API changes are made.* 