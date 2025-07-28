# Test Dashboard

A web-based interface for running and monitoring tests in your Next.js project.

## Quick Start

### Option 1: Launch Test Dashboard UI
```bash
npm run test:ui
```
This will:
- Start the development server (if not already running)
- Open the test dashboard in your browser
- Navigate to `http://localhost:3000/test-dashboard`

### Option 2: Manual Navigation
1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:3000/test-dashboard`
3. Or click the "Tests" link in the main navigation

## Features

### 🎯 Test Execution
- **Run All Tests**: Execute the complete test suite
- **Run Component Tests**: Run only component-specific tests
- **Real-time Results**: See test progress and results as they execute
- **Stop Execution**: Cancel running tests at any time

### 📊 Results Display
- **Overview Tab**: Summary statistics and quick status
- **Test Suites Tab**: Detailed breakdown of each test suite
- **Coverage Tab**: Code coverage metrics and progress bars
- **Logs Tab**: Real-time execution logs and error messages

### 🔍 Test Control
- **Individual Suite Testing**: Run specific test suites
- **Coverage Analysis**: Include coverage data in test runs
- **Error Details**: View detailed error messages for failed tests
- **Performance Metrics**: See test execution times

## Dashboard Sections

### Overview
- Total test count and pass/fail statistics
- Overall pass rate with visual progress bar
- Number of test suites and their status
- Current execution status

### Test Suites
- Individual test suite results
- Test-by-test breakdown
- Error messages and stack traces
- Execution duration for each test

### Coverage
- Statement coverage percentage
- Branch coverage percentage
- Function coverage percentage
- Line coverage percentage
- Visual progress bars for each metric

### Logs
- Real-time execution logs
- Timestamped entries
- Error messages and warnings
- Command execution details

## API Endpoints

The dashboard uses the following API endpoints:

- `POST /api/test-runner` - Execute tests
- `GET /api/test-runner` - Get available test files

## Configuration

### Test Execution Options
- **Include Coverage**: Toggle coverage analysis
- **Test Path Pattern**: Filter tests by path pattern
- **Verbose Output**: Enable detailed logging
- **JSON Output**: Structured test results

### Coverage Thresholds
- **Statements**: 70% minimum
- **Branches**: 70% minimum
- **Functions**: 70% minimum
- **Lines**: 70% minimum

## Troubleshooting

### Common Issues

1. **Tests Not Running**
   - Ensure Jest is properly configured
   - Check that test files follow naming conventions
   - Verify all dependencies are installed

2. **Coverage Not Showing**
   - Run tests with coverage enabled
   - Check Jest coverage configuration
   - Ensure source files are properly instrumented

3. **API Errors**
   - Check development server is running
   - Verify API route is accessible
   - Check console for detailed error messages

### Debug Mode
Enable debug logging by adding `DEBUG=true` to your environment:
```bash
DEBUG=true npm run test:ui
```

## Integration

### With CI/CD
The test dashboard can be integrated with CI/CD pipelines:
- Use the API endpoints for automated testing
- Parse JSON output for reporting
- Set coverage thresholds for quality gates

### With IDEs
- Use the dashboard alongside your IDE's test runner
- Compare results between local and dashboard execution
- Use coverage data for code quality analysis

## Future Enhancements

- [ ] Real-time test execution streaming
- [ ] Test history and trends
- [ ] Performance benchmarking
- [ ] Test dependency visualization
- [ ] Integration with external test runners
- [ ] Custom test configurations
- [ ] Team collaboration features

## Contributing

To enhance the test dashboard:
1. Modify `src/components/TestDashboard.tsx`
2. Update API routes in `src/app/api/test-runner/`
3. Add new features to the UI components
4. Update this documentation

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the test configuration
3. Check the browser console for errors
4. Verify all dependencies are up to date 