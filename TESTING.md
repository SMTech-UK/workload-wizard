# Testing Guide for WorkloadWizard

This document provides a comprehensive guide to testing in the WorkloadWizard project, including how to run tests, understand test results, and fix common issues.

## 🧪 Testing Setup

The project uses the following testing stack:

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers
- **MSW (Mock Service Worker)** - API mocking
- **Custom Test Runner** - Comprehensive test reporting

## 📁 Test Structure

```
src/
├── __tests__/
│   ├── components/          # Component tests
│   ├── hooks/              # Hook tests
│   ├── lib/                # Utility function tests
│   ├── integration/        # Integration tests
│   ├── e2e/               # End-to-end tests
│   └── utils/
│       └── test-utils.tsx  # Test utilities and helpers
├── components/             # Components to test
├── hooks/                  # Hooks to test
└── lib/                    # Utility functions to test
```

## 🚀 Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with verbose output
npm run test:ui

# Run comprehensive test suite with reporting
npm run test:full

# Generate test report
npm run test:report

# Check test coverage without failing
npm run test:check
```

### Test Categories

1. **Unit Tests** (`src/__tests__/lib/`)
   - Test individual utility functions
   - Pure functions with no side effects
   - Business logic validation

2. **Hook Tests** (`src/__tests__/hooks/`)
   - Test custom React hooks
   - State management validation
   - Effect cleanup verification

3. **Component Tests** (`src/__tests__/components/`)
   - Test React components
   - User interaction simulation
   - Props and state validation

4. **Integration Tests** (`src/__tests__/integration/`)
   - Test component interactions
   - Multi-component workflows
   - API integration testing

## 📊 Understanding Test Results

### Test Report Structure

The test runner generates detailed reports with the following sections:

1. **Coverage Analysis**
   - Files without tests
   - Test execution status
   - Issues found

2. **Issues Found**
   - High priority (🔴) - Must fix
   - Medium priority (🟡) - Should fix
   - Low priority (🟢) - Nice to fix

3. **Recommendations**
   - Actionable steps to improve testing

### Coverage Thresholds

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## 🛠️ Writing Tests

### Component Test Example

```tsx
import React from 'react'
import { render, screen, fireEvent } from '@/__tests__/utils/test-utils'
import { DashboardCard } from '@/components/DashboardCard'

describe('DashboardCard', () => {
  const defaultProps = {
    title: 'Test Card',
    value: '100',
    order: 1,
  }

  it('should render with basic props', () => {
    render(<DashboardCard {...defaultProps} />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('should apply highlight styling when highlight is true', () => {
    render(<DashboardCard {...defaultProps} value="50" highlight={true} />)
    const valueElement = screen.getByText('50')
    expect(valueElement).toHaveClass('text-red-600')
  })
})
```

### Hook Test Example

```tsx
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile', () => {
  it('should return false for desktop width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })
})
```

### Utility Function Test Example

```tsx
import { cn, updateSettings } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2 py-1', 'px-3')).toBe('py-1 px-3')
    })
  })

  describe('updateSettings', () => {
    it('should update nested settings correctly', () => {
      const initialSettings = {
        notifications: { email: true, push: false },
        theme: { mode: 'light' }
      }

      const updated = updateSettings(
        initialSettings,
        'notifications',
        'email',
        false
      )

      expect(updated.notifications.email).toBe(false)
    })
  })
})
```

## 🔧 Test Utilities

### Custom Render Function

The project includes a custom render function that provides all necessary providers:

```tsx
import { render, screen } from '@/__tests__/utils/test-utils'

// Automatically includes:
// - ThemeProvider
// - ConvexProvider (mocked)
// - ClerkProvider (mocked)
// - KnockProvider (mocked)

render(<YourComponent />)
```

### Test Data Factories

```tsx
import { 
  createMockUser, 
  createMockLecturer, 
  createMockModule 
} from '@/__tests__/utils/test-utils'

const user = createMockUser({ firstName: 'John' })
const lecturer = createMockLecturer({ department: 'Computer Science' })
const module = createMockModule({ credits: 20 })
```

## 🐛 Common Issues and Fixes

### 1. Missing Test Files

**Issue**: Component or function has no corresponding test file.

**Fix**: Create a test file following the naming convention:
- Components: `ComponentName.test.tsx`
- Hooks: `hookName.test.ts`
- Utilities: `utilityName.test.ts`

### 2. Mock Dependencies

**Issue**: External dependencies not properly mocked.

**Fix**: Add mocks in `jest.setup.js` or individual test files:

```tsx
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: true,
    user: { id: 'test-user-id' }
  })
}))
```

### 3. Async Test Failures

**Issue**: Tests fail due to async operations not being awaited.

**Fix**: Use `waitFor` or `act` for async operations:

```tsx
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### 4. Coverage Issues

**Issue**: Test coverage below 70%.

**Fix**: Add tests for uncovered code paths:

```tsx
it('should handle error state', () => {
  // Test error scenarios
})

it('should handle edge cases', () => {
  // Test boundary conditions
})
```

## 📋 Test Checklist

Before committing code, ensure:

- [ ] All new components have tests
- [ ] All new functions have tests
- [ ] All new hooks have tests
- [ ] Tests cover error scenarios
- [ ] Tests cover edge cases
- [ ] Coverage is above 70%
- [ ] All tests pass
- [ ] No console errors in tests

## 🎯 Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the component does, not how it does it
   - Test user interactions and outcomes

2. **Use Descriptive Test Names**
   - Test names should describe the expected behavior
   - Use the format: "should [expected behavior] when [condition]"

3. **Keep Tests Simple**
   - One assertion per test when possible
   - Avoid complex test setup

4. **Use Test Data Factories**
   - Create reusable test data
   - Keep tests maintainable

5. **Mock External Dependencies**
   - Mock APIs, services, and external libraries
   - Keep tests fast and reliable

6. **Test Accessibility**
   - Use `@testing-library/jest-dom` accessibility matchers
   - Test keyboard navigation and screen readers

## 📈 Continuous Integration

The test suite runs automatically on:

- Pull requests
- Main branch pushes
- Scheduled runs

### CI Pipeline

1. Install dependencies
2. Run linting
3. Run type checking
4. Run tests with coverage
5. Generate test report
6. Upload coverage to service

## 🔍 Debugging Tests

### Debug Mode

Run tests in debug mode:

```bash
npm run test:watch -- --verbose
```

### Debug Specific Test

```bash
npm test -- --testNamePattern="DashboardCard"
```

### Debug with Chrome DevTools

```bash
npm test -- --runInBand --no-cache --watchAll=false
```

Then open Chrome DevTools and set breakpoints.

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [MSW Documentation](https://mswjs.io/docs/)

## 🤝 Contributing

When adding new tests:

1. Follow the existing patterns
2. Use the provided test utilities
3. Add comprehensive coverage
4. Update this documentation if needed
5. Ensure all tests pass before submitting

For questions or issues with testing, please create an issue in the repository. 