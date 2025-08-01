# Developer Tools Suite

A comprehensive set of development and testing tools for the WorkloadWizard project.

## Quick Start

### 1. Enable Development Mode (Admin Only)
1. Go to Settings → General Settings
2. Toggle "Development Mode" (only visible to admins)
3. Save settings

### 2. Access Dev Tools
- **Test Dashboard**: Navigate to `/test-dashboard`
- **Dev Tools**: Navigate to `/dev-tools`
- **Navigation**: Dev tools will appear in the main navigation

### 3. Fix Test Issues
```bash
npm run dev:tools
```

### 4. Launch Test Dashboard
```bash
npm run test:ui
```

## Available Tools

### 🔐 Access Control
- **Admin Only**: Dev tools are restricted to users with `admin` or `administrator` role
- **Dev Mode Required**: Must enable development mode in settings
- **Route Protection**: Unauthorized access redirects to dashboard with explanation

### 🧪 Test Dashboard (`/test-dashboard`)
- **Run All Tests**: Execute complete test suite
- **Run Component Tests**: Test specific components
- **Real-time Results**: Live test execution feedback
- **Coverage Analysis**: Code coverage metrics
- **Error Details**: Detailed failure information

### 🔧 Dev Tools (`/dev-tools`)
Comprehensive development interface with 7 main sections:

#### 1. **Tests Tab**
- Test execution controls
- Real-time status monitoring
- Pass/fail statistics
- Coverage tracking

#### 2. **API Tab**
- REST API testing interface
- Request/response inspection
- Multiple HTTP methods
- JSON payload testing

#### 3. **Components Tab**
- Component explorer
- File structure overview
- Quick navigation to source files
- Component status tracking

#### 4. **Test Data Tab**
- Add test lecturers
- Add test modules
- Clear test data
- Test data management utilities

#### 5. **Database Tab**
- Convex function explorer
- Data model overview
- Database connection status
- Query testing interface

#### 6. **Logs Tab**
- System log viewer
- Real-time log streaming
- Error message tracking
- Performance monitoring

#### 7. **Monitor Tab**
- System resource monitoring
- CPU/Memory usage
- Network activity
- Database connection status

### 🎯 **Floating Dev Toolbar**
A Vercel-style floating toolbar that appears on all pages when dev mode is enabled:

#### **Features:**
- **Quick Actions**: Expandable toolbar with common dev tasks
- **Test Results**: Real-time test execution results display
- **Navigation**: Quick access to dev tools and test dashboard
- **Test Data**: Add test lecturers, modules, and clear test data
- **Dropdown Menu**: Comprehensive menu with all dev tools

#### **Quick Actions:**
- Run Quick Tests
- Test Dashboard
- Dev Tools
- API Tester
- Component Explorer
- System Monitor
- View Logs
- Dev Settings

## Issues Fixed

### ✅ Jest Configuration
- Fixed `moduleNameMapping` → `moduleNameMapper`
- Resolved validation warnings
- Improved module resolution

### ✅ Test Import Issues
- Updated navigation test imports
- Fixed React Testing Library imports
- Resolved module resolution errors

### ✅ API Error Handling
- Enhanced error parsing
- Better JSON response handling
- Improved error messages

### ✅ Component Mocking
- Fixed missing component imports
- Improved mock implementations
- Better error handling

## Usage Examples

### Running Tests
```bash
# Quick test run
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# UI dashboard
npm run test:ui
```

### API Testing
1. Navigate to `/dev-tools`
2. Click "API" tab
3. Enter endpoint URL (e.g., `/api/test-runner`)
4. Select HTTP method
5. Add request body if needed
6. Click "Test API"

### Component Testing
1. Navigate to `/dev-tools`
2. Click "Components" tab
3. Browse available components
4. Click on component to view details
5. Run specific component tests

## Troubleshooting

### Common Issues

#### 1. **Tests Not Running**
```bash
# Check Jest configuration
npm run dev:tools

# Verify dependencies
npm install

# Clear Jest cache
npx jest --clearCache
```

#### 2. **API Errors**
- Check development server is running
- Verify API route exists
- Check console for detailed errors
- Use API tester to debug endpoints

#### 3. **Component Import Errors**
- Verify component files exist
- Check import paths
- Update Jest module mapper
- Clear module cache

#### 4. **Coverage Issues**
- Run tests with coverage flag
- Check coverage thresholds
- Verify source file paths
- Update coverage configuration

### Debug Mode
```bash
# Enable debug logging
DEBUG=true npm run test:ui

# Verbose test output
npm test -- --verbose

# Watch mode with coverage
npm run test:coverage -- --watch
```

## Configuration

### Jest Settings
```javascript
// jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1'
},
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

### API Endpoints
- `POST /api/test-runner` - Execute tests
- `GET /api/test-runner` - Get test files
- `POST /api/test-runner` - Run with coverage

### Environment Variables
```bash
DEBUG=true          # Enable debug logging
NODE_ENV=development # Development mode
JEST_WORKERS=1      # Single worker for debugging
```

## Integration

### With IDEs
- VS Code: Use Jest extension
- WebStorm: Built-in Jest support
- Vim/Neovim: Jest plugins available

### With CI/CD
- GitHub Actions integration
- Automated test runs
- Coverage reporting
- Quality gates

### With Monitoring
- Performance tracking
- Error monitoring
- Usage analytics
- Health checks

## Future Enhancements

- [ ] Real-time test streaming
- [ ] Visual test results
- [ ] Performance benchmarking
- [ ] Code quality metrics
- [ ] Dependency analysis
- [ ] Security scanning
- [ ] Documentation generation
- [ ] Team collaboration features

## Support

For issues or questions:
1. Run `npm run dev:tools` for diagnostics
2. Check the troubleshooting section
3. Review error logs in `/dev-tools/logs`
4. Verify configuration files
5. Check browser console for errors 