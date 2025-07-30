# Component Structure Guide

## Overview

This project follows a feature-based component organization optimized for Next.js App Router and comprehensive testing.

## Directory Structure

```
src/
├── components/
│   ├── ui/                    # Shared UI components (shadcn/ui)
│   ├── layout/                # Layout-related components
│   │   ├── navigation.tsx
│   │   ├── landing-nav.tsx
│   │   ├── footer.tsx
│   │   ├── loading-page.tsx
│   │   ├── loading-overlay.tsx
│   │   └── index.ts
│   ├── features/              # Feature-specific components
│   │   ├── dashboard/
│   │   │   ├── DashboardCard.tsx
│   │   │   ├── reports-section.tsx
│   │   │   └── index.ts
│   │   ├── lecturer-management/
│   │   │   ├── lecturer-management.tsx
│   │   │   └── index.ts
│   │   ├── module-management/
│   │   │   ├── module-management.tsx
│   │   │   ├── module-allocations.tsx
│   │   │   ├── module-iterations.tsx
│   │   │   ├── module-assignment.tsx
│   │   │   └── index.ts
│   │   ├── notifications/
│   │   │   ├── notifications.tsx
│   │   │   ├── notifications-inbox.tsx
│   │   │   ├── KnockErrorBoundary.tsx
│   │   │   └── index.ts
│   │   ├── dev-tools/
│   │   │   ├── DevToolsPage.tsx
│   │   │   ├── DevRouteGuard.tsx
│   │   │   ├── FloatingDevToolbar.tsx
│   │   │   ├── FloatingDevSettingsButton.tsx
│   │   │   ├── DevSettingsModal.tsx
│   │   │   ├── DevSettingsModalWrapper.tsx
│   │   │   ├── TestDataManager.tsx
│   │   │   └── index.ts
│   │   ├── landing-page.tsx
│   │   └── index.ts
│   ├── modals/                # Modal components
│   │   ├── settings-modal.tsx
│   │   ├── staff-profile-modal.tsx
│   │   ├── staff-edit-modal.tsx
│   │   ├── admin-allocations-edit-modal.tsx
│   │   ├── csv-import-modal.tsx
│   │   └── index.ts
│   ├── forms/                 # Form components
│   │   ├── user-profile-dropdown.tsx
│   │   ├── ComponentCard.tsx
│   │   └── index.ts
│   └── index.ts               # Main component exports
├── __tests__/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navigation.test.tsx
│   │   │   └── loading-page.test.tsx
│   │   ├── features/
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardCard.test.tsx
│   │   │   ├── lecturer-management/
│   │   │   ├── module-management/
│   │   │   ├── notifications/
│   │   │   └── dev-tools/
│   │   ├── forms/
│   │   └── modals/
│   ├── hooks/
│   ├── lib/
│   └── utils/
```

## Import Patterns

### Using Index Files (Recommended)
```typescript
// Clean imports using index files
import { Navigation } from '@/components/layout';
import { DashboardCard, ReportsSection } from '@/components/features/dashboard';
import { LecturerManagement } from '@/components/features/lecturer-management';
import { ModuleManagement, ModuleAllocations } from '@/components/features/module-management';
import { Notifications, NotificationsInbox } from '@/components/features/notifications';
import { DevToolsPage, DevRouteGuard } from '@/components/features/dev-tools';
import { SettingsModal, StaffProfileModal } from '@/components/modals';
import { UserProfileDropdown } from '@/components/forms';
```

### Direct Imports (Alternative)
```typescript
// Direct imports for specific components
import Navigation from '@/components/layout/navigation';
import DashboardCard from '@/components/features/dashboard/DashboardCard';
import SettingsModal from '@/components/modals/settings-modal';
```

## Testing Structure

Tests mirror the component structure:

```typescript
// Test file location: src/__tests__/components/layout/navigation.test.tsx
import Navigation from '@/components/layout/navigation';

// Test file location: src/__tests__/components/features/dashboard/DashboardCard.test.tsx
import { DashboardCard } from '@/components/features/dashboard/DashboardCard';
```

## Benefits

1. **Feature Organization**: Components are grouped by feature domain
2. **Scalability**: Easy to add new features without cluttering
3. **Testing**: Clear test organization that mirrors component structure
4. **Import Clarity**: Index files provide clean, consistent imports
5. **Maintainability**: Related components are co-located
6. **Next.js Compatibility**: Follows App Router best practices

## Adding New Components

1. **Feature Components**: Add to appropriate `features/` subdirectory
2. **Layout Components**: Add to `layout/` directory
3. **Modal Components**: Add to `modals/` directory
4. **Form Components**: Add to `forms/` directory
5. **UI Components**: Add to `ui/` directory (shadcn/ui components)
6. **Update Index Files**: Export new components from relevant `index.ts`
7. **Add Tests**: Create corresponding test files in `__tests__/components/`

## Migration Notes

- All existing imports have been updated to use the new structure
- Index files provide backward compatibility for imports
- Test files have been moved to mirror the new component structure
- Jest configuration supports the new directory structure 