# WorkloadWizard Component Documentation

## 📋 Overview

This document provides comprehensive documentation for all React components in the WorkloadWizard application. Components are organized by category and include usage examples, props documentation, and best practices.

## 🏗️ Component Architecture

### Design Principles
- **Composition over Inheritance**: Prefer composition patterns for component reuse
- **Single Responsibility**: Each component has a single, well-defined purpose
- **Type Safety**: All components use TypeScript for type safety
- **Accessibility**: All components follow WCAG 2.1 AA guidelines
- **Responsive Design**: Components work across all device sizes

### Component Categories
1. **UI Components**: Reusable UI primitives (shadcn/ui based)
2. **Layout Components**: Page structure and navigation
3. **Feature Components**: Business logic specific components
4. **Form Components**: Data input and validation
5. **Data Display Components**: Tables, charts, and data visualization
6. **Feedback Components**: Alerts, notifications, and status indicators

## 🎨 UI Components

### Button Component
```typescript
import { Button } from "@/components/ui/button";

interface ButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Usage Examples:**
```tsx
// Primary button
<Button onClick={handleSave}>Save Changes</Button>

// Destructive button
<Button variant="destructive" onClick={handleDelete}>
  Delete Profile
</Button>

// Loading state
<Button loading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>

// Icon button
<Button size="icon" variant="ghost">
  <Plus className="h-4 w-4" />
</Button>
```

### Card Component
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}
```

**Usage Examples:**
```tsx
// Basic card
<Card>
  <CardHeader>
    <CardTitle>Lecturer Profile</CardTitle>
    <CardDescription>Manage lecturer information and workload</CardDescription>
  </CardHeader>
  <CardContent>
    <LecturerProfileForm />
  </CardContent>
</Card>

// Card with custom styling
<Card className="border-l-4 border-l-primary">
  <CardContent className="p-6">
    <WorkloadSummary />
  </CardContent>
</Card>
```

### Input Component
```typescript
import { Input } from "@/components/ui/input";

interface InputProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
}
```

**Usage Examples:**
```tsx
// Text input
<Input
  placeholder="Enter lecturer name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>

// Number input
<Input
  type="number"
  placeholder="Enter FTE value"
  value={fte}
  onChange={(e) => setFte(parseFloat(e.target.value))}
  min={0}
  max={2}
  step={0.1}
/>

// Error state
<Input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={!!emailError}
  aria-describedby="email-error"
/>
{emailError && (
  <p id="email-error" className="text-sm text-destructive">
    {emailError}
  </p>
)}
```

## 📐 Layout Components

### MainLayout Component
```typescript
import { MainLayout } from "@/components/layout/main-layout";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
}
```

**Usage Examples:**
```tsx
// Basic layout
<MainLayout title="Dashboard" description="Academic workload overview">
  <DashboardContent />
</MainLayout>

// Layout without sidebar
<MainLayout showSidebar={false}>
  <LoginForm />
</MainLayout>
```

### Sidebar Component
```typescript
import { Sidebar } from "@/components/layout/sidebar";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  user?: User;
  organisation?: Organisation;
}
```

**Navigation Items:**
```tsx
const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    badge: null,
  },
  {
    title: "Lecturer Management",
    href: "/lecturer-management",
    icon: Users,
    badge: lecturerCount,
  },
  {
    title: "Module Management",
    href: "/module-management",
    icon: BookOpen,
    badge: moduleCount,
  },
  {
    title: "Allocations",
    href: "/module-allocations",
    icon: Link,
    badge: allocationCount,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    badge: null,
  },
];
```

### Header Component
```typescript
import { Header } from "@/components/layout/header";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}
```

**Usage Examples:**
```tsx
// Basic header
<Header title="Lecturer Management" subtitle="Manage academic staff profiles" />

// Header with actions
<Header
  title="Module Allocations"
  subtitle="Assign lecturers to modules"
  actions={
    <div className="flex gap-2">
      <Button variant="outline">Export</Button>
      <Button>New Allocation</Button>
    </div>
  }
/>

// Header with breadcrumbs
<Header
  title="Dr. John Smith"
  breadcrumbs={[
    { label: "Lecturers", href: "/lecturer-management" },
    { label: "Profiles", href: "/lecturer-management/profiles" },
    { label: "Dr. John Smith", href: "#" },
  ]}
/>
```

## 🎯 Feature Components

### LecturerProfileCard Component
```typescript
import { LecturerProfileCard } from "@/components/features/lecturer-profile-card";

interface LecturerProfileCardProps {
  profile: LecturerProfile;
  lecturer?: Lecturer;
  onEdit?: (profile: LecturerProfile) => void;
  onDelete?: (profile: LecturerProfile) => void;
  showActions?: boolean;
  showUtilization?: boolean;
}
```

**Usage Examples:**
```tsx
// Basic profile card
<LecturerProfileCard
  profile={lecturerProfile}
  lecturer={lecturer}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// Read-only card
<LecturerProfileCard
  profile={lecturerProfile}
  showActions={false}
  showUtilization={true}
/>
```

**Component Features:**
- Displays lecturer profile information
- Shows current utilization and workload
- Provides edit and delete actions
- Responsive design for mobile and desktop
- Accessibility compliant with proper ARIA labels

### ModuleAllocationTable Component
```typescript
import { ModuleAllocationTable } from "@/components/features/module-allocation-table";

interface ModuleAllocationTableProps {
  allocations: ModuleAllocation[];
  lecturers: Lecturer[];
  modules: Module[];
  onAllocationChange?: (allocation: ModuleAllocation, changes: Partial<ModuleAllocation>) => void;
  onAllocationDelete?: (allocation: ModuleAllocation) => void;
  loading?: boolean;
  filters?: AllocationFilters;
}
```

**Usage Examples:**
```tsx
// Basic allocation table
<ModuleAllocationTable
  allocations={allocations}
  lecturers={lecturers}
  modules={modules}
  onAllocationChange={handleAllocationChange}
  onAllocationDelete={handleAllocationDelete}
/>

// Table with filters
<ModuleAllocationTable
  allocations={filteredAllocations}
  lecturers={lecturers}
  modules={modules}
  filters={{
    academicYear: "2024-25",
    department: "Computer Science",
    semester: 1,
  }}
/>
```

**Table Features:**
- Sortable columns
- Filterable data
- Inline editing
- Bulk operations
- Export functionality
- Responsive design

### WorkloadSummaryCard Component
```typescript
import { WorkloadSummaryCard } from "@/components/features/workload-summary-card";

interface WorkloadSummaryCardProps {
  summary: WorkloadSummary;
  academicYear: AcademicYear;
  onViewDetails?: () => void;
  showTrends?: boolean;
}
```

**Usage Examples:**
```tsx
// Basic summary card
<WorkloadSummaryCard
  summary={workloadSummary}
  academicYear={academicYear}
  onViewDetails={handleViewDetails}
/>

// Card with trends
<WorkloadSummaryCard
  summary={workloadSummary}
  academicYear={academicYear}
  showTrends={true}
/>
```

## 📝 Form Components

### LecturerProfileForm Component
```typescript
import { LecturerProfileForm } from "@/components/forms/lecturer-profile-form";

interface LecturerProfileFormProps {
  profile?: LecturerProfile;
  onSubmit: (data: CreateProfileParams) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  mode?: "create" | "edit";
}
```

**Usage Examples:**
```tsx
// Create new profile
<LecturerProfileForm
  onSubmit={handleCreateProfile}
  onCancel={handleCancel}
  loading={isSubmitting}
  mode="create"
/>

// Edit existing profile
<LecturerProfileForm
  profile={existingProfile}
  onSubmit={handleUpdateProfile}
  onCancel={handleCancel}
  loading={isSubmitting}
  mode="edit"
/>
```

**Form Features:**
- Comprehensive validation
- Real-time field validation
- Error handling and display
- Loading states
- Accessibility compliance
- Responsive design

### ModuleForm Component
```typescript
import { ModuleForm } from "@/components/forms/module-form";

interface ModuleFormProps {
  module?: Module;
  onSubmit: (data: CreateModuleParams) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  lecturers?: LecturerProfile[];
}
```

**Usage Examples:**
```tsx
// Create new module
<ModuleForm
  onSubmit={handleCreateModule}
  onCancel={handleCancel}
  loading={isSubmitting}
  lecturers={lecturers}
/>

// Edit existing module
<ModuleForm
  module={existingModule}
  onSubmit={handleUpdateModule}
  onCancel={handleCancel}
  loading={isSubmitting}
  lecturers={lecturers}
/>
```

## 📊 Data Display Components

### DataTable Component
```typescript
import { DataTable } from "@/components/data-display/data-table";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  filters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
  searchable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selection: T[]) => void;
}
```

**Usage Examples:**
```tsx
// Basic data table
<DataTable
  data={lecturerProfiles}
  columns={lecturerColumns}
  loading={isLoading}
/>

// Table with pagination and sorting
<DataTable
  data={lecturerProfiles}
  columns={lecturerColumns}
  pagination={pagination}
  onPaginationChange={setPagination}
  sorting={sorting}
  onSortingChange={setSorting}
  searchable={true}
  selectable={true}
  onSelectionChange={setSelection}
/>
```

### WorkloadChart Component
```typescript
import { WorkloadChart } from "@/components/data-display/workload-chart";

interface WorkloadChartProps {
  data: WorkloadData[];
  type: "bar" | "line" | "pie" | "radar";
  title?: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  colors?: string[];
}
```

**Usage Examples:**
```tsx
// Bar chart
<WorkloadChart
  data={workloadData}
  type="bar"
  title="Workload Distribution"
  height={400}
  showLegend={true}
/>

// Pie chart
<WorkloadChart
  data={utilizationData}
  type="pie"
  title="Utilization by Department"
  showTooltip={true}
/>
```

### StatusBadge Component
```typescript
import { StatusBadge } from "@/components/data-display/status-badge";

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "completed" | "overdue";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}
```

**Usage Examples:**
```tsx
// Basic status badge
<StatusBadge status="active" />

// Badge with icon
<StatusBadge status="overdue" showIcon={true} size="lg" />
```

## 🔔 Feedback Components

### Alert Component
```typescript
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertProps {
  variant?: "default" | "destructive" | "warning" | "info" | "success";
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}
```

**Usage Examples:**
```tsx
// Success alert
<Alert variant="success">
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Lecturer profile has been created successfully.
  </AlertDescription>
</Alert>

// Error alert
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to create lecturer profile. Please try again.
  </AlertDescription>
</Alert>

// Dismissible alert
<Alert variant="warning" dismissible onDismiss={handleDismiss}>
  <AlertDescription>
    You have unsaved changes. Please save before leaving.
  </AlertDescription>
</Alert>
```

### Toast Component
```typescript
import { useToast } from "@/components/ui/use-toast";

const { toast } = useToast();
```

**Usage Examples:**
```tsx
// Success toast
toast({
  title: "Success",
  description: "Lecturer profile updated successfully",
  variant: "default",
});

// Error toast
toast({
  title: "Error",
  description: "Failed to update lecturer profile",
  variant: "destructive",
});

// Toast with action
toast({
  title: "Profile Updated",
  description: "Dr. John Smith's profile has been updated",
  action: (
    <ToastAction altText="View profile" onClick={handleViewProfile}>
      View
    </ToastAction>
  ),
});
```

### LoadingSpinner Component
```typescript
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  overlay?: boolean;
}
```

**Usage Examples:**
```tsx
// Basic spinner
<LoadingSpinner />

// Spinner with text
<LoadingSpinner text="Loading lecturer profiles..." />

// Overlay spinner
<LoadingSpinner overlay={true} text="Saving changes..." />
```

## 🎨 Styling and Theming

### CSS Variables
```css
:root {
  /* Primary colors */
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  
  /* Academic-specific colors */
  --academic-teaching: 142.1 76.2% 36.3%;
  --academic-research: 221.2 83.2% 53.3%;
  --academic-admin: 262.1 83.3% 57.8%;
  --academic-cpd: 47.9 95.8% 53.1%;
  --academic-leadership: 12 76% 61%;
  
  /* Status colors */
  --status-active: 142.1 76.2% 36.3%;
  --status-inactive: 215.4 16.3% 46.9%;
  --status-pending: 47.9 95.8% 53.1%;
  --status-completed: 221.2 83.2% 53.3%;
  --status-overdue: 0 84.2% 60.2%;
}
```

### Tailwind Classes
```tsx
// Academic-specific classes
<div className="bg-academic-teaching text-white">Teaching Hours</div>
<div className="bg-academic-research text-white">Research Hours</div>
<div className="bg-academic-admin text-white">Admin Hours</div>

// Status classes
<div className="bg-status-active text-white">Active</div>
<div className="bg-status-overdue text-white">Overdue</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## ♿ Accessibility

### ARIA Labels
```tsx
// Proper labeling
<button
  aria-label="Edit lecturer profile"
  onClick={handleEdit}
>
  <Edit className="h-4 w-4" />
</button>

// Form labels
<label htmlFor="email" className="sr-only">
  Email Address
</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={!!emailError}
/>

// Table headers
<th scope="col" className="text-left">
  Lecturer Name
</th>
```

### Keyboard Navigation
```tsx
// Focus management
const focusRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (isOpen) {
    focusRef.current?.focus();
  }
}, [isOpen]);

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [onClose]);
```

## 🧪 Testing Components

### Component Testing Example
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LecturerProfileCard } from './lecturer-profile-card';

describe('LecturerProfileCard', () => {
  const mockProfile = {
    _id: '1',
    fullName: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    family: 'Teaching Academic' as const,
    fte: 1.0,
    capacity: 1650,
    maxTeachingHours: 990,
    totalContract: 1650,
    isActive: true,
    organisationId: 'org1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it('renders lecturer information correctly', () => {
    render(<LecturerProfileCard profile={mockProfile} />);
    
    expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
    expect(screen.getByText('john.smith@university.edu')).toBeInTheDocument();
    expect(screen.getByText('Teaching Academic')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(
      <LecturerProfileCard
        profile={mockProfile}
        onEdit={onEdit}
        showActions={true}
      />
    );
    
    fireEvent.click(screen.getByLabelText('Edit profile'));
    expect(onEdit).toHaveBeenCalledWith(mockProfile);
  });
});
```

## 📚 Best Practices

### 1. Component Composition
```tsx
// Good: Use composition for flexible components
<Card>
  <CardHeader>
    <CardTitle>Workload Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <WorkloadSummary data={workloadData} />
  </CardContent>
  <CardFooter>
    <Button onClick={handleViewDetails}>View Details</Button>
  </CardFooter>
</Card>

// Bad: Monolithic component
<WorkloadSummaryCard
  data={workloadData}
  showHeader={true}
  showFooter={true}
  headerTitle="Workload Summary"
  footerButtonText="View Details"
  onFooterButtonClick={handleViewDetails}
/>
```

### 2. Props Interface Design
```tsx
// Good: Clear, focused props interface
interface LecturerProfileCardProps {
  profile: LecturerProfile;
  onEdit?: (profile: LecturerProfile) => void;
  onDelete?: (profile: LecturerProfile) => void;
  showActions?: boolean;
}

// Bad: Overly complex props interface
interface LecturerProfileCardProps {
  profile: LecturerProfile;
  onEdit?: (profile: LecturerProfile) => void;
  onDelete?: (profile: LecturerProfile) => void;
  showActions?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showAddress?: boolean;
  showDepartment?: boolean;
  showFaculty?: boolean;
  showUtilization?: boolean;
  showWorkload?: boolean;
  showAllocations?: boolean;
  // ... many more props
}
```

### 3. Error Boundaries
```tsx
// Error boundary for feature components
class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Feature error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-muted-foreground">
            Please refresh the page and try again.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 4. Performance Optimization
```tsx
// Use React.memo for expensive components
const LecturerProfileCard = React.memo(({ profile, onEdit, onDelete }) => {
  return (
    <Card>
      {/* Component content */}
    </Card>
  );
});

// Use useMemo for expensive calculations
const WorkloadSummary = ({ data }) => {
  const summary = useMemo(() => {
    return calculateWorkloadSummary(data);
  }, [data]);

  return (
    <div>
      {/* Render summary */}
    </div>
  );
};

// Use useCallback for event handlers
const LecturerProfileForm = ({ onSubmit }) => {
  const handleSubmit = useCallback((data) => {
    onSubmit(data);
  }, [onSubmit]);

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
};
```

---

*This documentation should be updated whenever new components are added or existing components are modified.* 