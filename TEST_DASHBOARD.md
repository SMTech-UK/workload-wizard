# Test Dashboard

A comprehensive test management and execution interface integrated into the WorkloadWizard dev tools.

## Features

### 🎯 Test Execution
- **Run All Tests**: Execute the complete test suite
- **Selective Testing**: Run specific test types (Unit, Component, Hook)
- **Real-time Results**: View test execution progress and results
- **Coverage Analysis**: Generate and view code coverage reports

### 📊 Visual Results
- **Test Overview**: Summary cards showing pass/fail rates and coverage
- **Detailed Results**: Expandable test suites with individual test results
- **Error Details**: View and copy test failure messages
- **Performance Metrics**: Test execution times and performance data

### 🔧 Integration
- **Dev Tools Integration**: Accessible via the dev tools dashboard
- **API Endpoints**: RESTful API for test execution
- **URL Parameters**: Direct access with query parameters
- **Auto-refresh**: Continuous monitoring with automatic updates

## Usage

### Accessing the Test Dashboard

1. **Via Dev Tools**: Navigate to `/dev-tools` and click the "Tests" tab
2. **Direct Access**: Visit `/test-dashboard` directly
3. **Quick Actions**: Use the quick action buttons in dev tools

### Running Tests

#### From the Dashboard
1. Select test type from the dropdown (All, Unit, Component, Hook)
2. Click "Run Tests" button
3. Monitor progress in real-time
4. View results in the Results tab

#### Via URL Parameters
- `/test-dashboard?type=unit` - Run unit tests only
- `/test-dashboard?type=component` - Run component tests only
- `/test-dashboard?type=hook` - Run hook tests only
- `/test-dashboard?tab=coverage` - Open coverage tab directly

### Understanding Results

#### Overview Tab
- **Total Tests**: Number of tests executed
- **Passed/Failed**: Success and failure counts with percentages
- **Coverage**: Code coverage percentage with progress bar
- **Test Suites**: Breakdown by test category with progress indicators

#### Results Tab
- **Expandable Suites**: Click to view individual test results
- **Test Details**: Duration, category, and timestamp for each test
- **Error Information**: Expand failed tests to see error messages
- **Rerun Options**: Individual test and suite rerun capabilities

#### Coverage Tab
- **Coverage Metrics**: Statements, branches, functions, and lines
- **File Breakdown**: Coverage by individual files
- **Threshold Indicators**: Visual indicators for coverage targets

#### Settings Tab
- **Test Configuration**: Environment, thresholds, timeouts
- **Export Options**: Download results in various formats

## API Reference

### Test Runner API

#### POST `/api/test-runner`
Execute tests with specified parameters.

**Request Body:**
```json
{
  "testType": "all" | "unit" | "component" | "hook",
  "coverage": boolean
}
```

**Response:**
```json
{
  "success": boolean,
  "results": {
    "summary": {
      "total": number,
      "passed": number,
      "failed": number,
      "running": number,
      "coverage": number,
      "duration": number
    },
    "suites": [
      {
        "name": string,
        "total": number,
        "passed": number,
        "failed": number,
        "running": number,
        "duration": number,
        "results": [
          {
            "id": string,
            "name": string,
            "status": "passed" | "failed" | "running" | "pending",
            "duration": number,
            "error": string,
            "category": string,
            "timestamp": string
          }
        ]
      }
    ],
    "timestamp": string
  }
}
```

#### GET `/api/test-runner`
Get available test files and their categories.

**Response:**
```json
{
  "success": boolean,
  "testFiles": [
    {
      "path": string,
      "name": string,
      "category": "unit" | "component" | "hook" | "other"
    }
  ],
  "timestamp": string
}
```

## Components

### TestResultsViewer
A reusable component for displaying test results with:
- Expandable test suites
- Individual test result details
- Error message display
- Rerun functionality

### useTestRunner Hook
Custom React hook for managing test execution:
- Test execution state
- API communication
- Error handling
- Result management

## Configuration

### Test Environment
- **Default**: jsdom (for component testing)
- **Alternatives**: Node.js, Happy DOM
- **Coverage Threshold**: Configurable (default: 70%)
- **Timeout**: Configurable (default: 5000ms)
- **Max Workers**: Configurable (default: 4 threads)

### Auto-refresh
- **Interval**: 30 seconds (configurable)
- **Trigger**: Only when tests are not running
- **Scope**: Respects selected test type

## Integration with Existing Tools

### Dev Tools
The test dashboard is fully integrated into the existing dev tools:
- **Overview Tab**: Test summary and quick actions
- **Quick Actions**: Direct links to specific test types
- **Status Indicators**: Real-time test status

### Test Scripts
Compatible with existing npm scripts:
- `npm test` - Standard test execution
- `npm run test:coverage` - Coverage generation
- `npm run test:watch` - Watch mode

## Best Practices

### Test Organization
1. **Unit Tests**: Place in `src/__tests__/lib/`
2. **Component Tests**: Place in `src/__tests__/components/`
3. **Hook Tests**: Place in `src/__tests__/hooks/`
4. **Integration Tests**: Place in `src/__tests__/integration/`

### Naming Conventions
- Test files: `*.test.{js,ts,tsx}`
- Test suites: Descriptive names matching source files
- Test cases: Clear, descriptive test names

### Coverage Goals
- **Minimum**: 70% overall coverage
- **Target**: 80%+ for critical business logic
- **Monitoring**: Regular coverage checks in CI/CD

## Troubleshooting

### Common Issues

#### Tests Not Running
- Check if Jest is properly configured
- Verify test file patterns match configuration
- Ensure all dependencies are installed

#### API Errors
- Check server logs for detailed error messages
- Verify API endpoint is accessible
- Ensure proper permissions for file system access

#### Coverage Issues
- Verify coverage reporters are configured
- Check if source maps are generated
- Ensure test files are properly instrumented

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=test-dashboard npm run dev
```

## Future Enhancements

### Planned Features
- **Parallel Test Execution**: Run tests in parallel for faster execution
- **Test History**: Track test results over time
- **Performance Profiling**: Detailed performance analysis
- **Test Generation**: AI-assisted test case generation
- **Integration with CI/CD**: Direct integration with build pipelines

### Performance Optimizations
- **Caching**: Cache test results for faster subsequent runs
- **Incremental Testing**: Only run tests for changed files
- **Smart Filtering**: Intelligent test selection based on changes

## Contributing

When adding new test features:
1. Follow existing component patterns
2. Add proper TypeScript types
3. Include error handling
4. Add tests for new functionality
5. Update documentation

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Examine test configuration
4. Check server logs for errors 