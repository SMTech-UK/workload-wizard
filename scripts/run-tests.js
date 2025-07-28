#!/usr/bin/env node

/**
 * Comprehensive Test Runner for WorkloadWizard
 * 
 * This script runs all tests in the project and generates detailed reports
 * with clear identification of bugs and issues.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logHeader(message) {
  log('\n' + '='.repeat(80), 'cyan')
  log(message, 'bright')
  log('='.repeat(80), 'cyan')
}

function logSection(message) {
  log('\n' + '-'.repeat(60), 'blue')
  log(message, 'bright')
  log('-'.repeat(60), 'blue')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

// Test categories and their patterns
const testCategories = {
  'Unit Tests': {
    pattern: '**/__tests__/lib/**/*.test.{js,ts,tsx}',
    description: 'Testing utility functions and business logic'
  },
  'Hook Tests': {
    pattern: '**/__tests__/hooks/**/*.test.{js,ts,tsx}',
    description: 'Testing React hooks and custom hooks'
  },
  'Component Tests': {
    pattern: '**/__tests__/components/**/*.test.{js,ts,tsx}',
    description: 'Testing React components'
  },
  'Integration Tests': {
    pattern: '**/__tests__/integration/**/*.test.{js,ts,tsx}',
    description: 'Testing component interactions'
  },
  'E2E Tests': {
    pattern: '**/__tests__/e2e/**/*.test.{js,ts,tsx}',
    description: 'End-to-end testing'
  }
}

// Known issues and their fixes
const knownIssues = {
  'Missing test files': {
    severity: 'medium',
    description: 'Some components or functions may not have corresponding test files',
    suggestion: 'Create test files for untested components/functions'
  },
  'Mock dependencies': {
    severity: 'low',
    description: 'External dependencies may need proper mocking',
    suggestion: 'Review and update mocks as needed'
  },
  'Accessibility tests': {
    severity: 'medium',
    description: 'Accessibility testing may be incomplete',
    suggestion: 'Add accessibility tests using @testing-library/jest-dom'
  },
  'Performance tests': {
    severity: 'low',
    description: 'Performance testing not implemented',
    suggestion: 'Consider adding performance benchmarks'
  }
}

function checkTestCoverage() {
  logSection('Checking Test Coverage')
  
  const srcDir = path.join(process.cwd(), 'src')
  const testDir = path.join(process.cwd(), 'src', '__tests__')
  
  if (!fs.existsSync(testDir)) {
    logError('Test directory not found. Creating test structure...')
    fs.mkdirSync(testDir, { recursive: true })
  }
  
  // Check for missing test files
  const componentsDir = path.join(srcDir, 'components')
  const libDir = path.join(srcDir, 'lib')
  const hooksDir = path.join(srcDir, 'hooks')
  
  const missingTests = []
  
  // Check components
  if (fs.existsSync(componentsDir)) {
    const componentFiles = fs.readdirSync(componentsDir)
      .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
      .map(file => file.replace(/\.(tsx|ts)$/, ''))
    
    componentFiles.forEach(component => {
      const testFile = path.join(testDir, 'components', `${component}.test.tsx`)
      if (!fs.existsSync(testFile)) {
        missingTests.push(`components/${component}`)
      }
    })
  }
  
  // Check lib functions
  if (fs.existsSync(libDir)) {
    const libFiles = fs.readdirSync(libDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => file.replace(/\.ts$/, ''))
    
    libFiles.forEach(lib => {
      const testFile = path.join(testDir, 'lib', `${lib}.test.ts`)
      if (!fs.existsSync(testFile)) {
        missingTests.push(`lib/${lib}`)
      }
    })
  }
  
  // Check hooks
  if (fs.existsSync(hooksDir)) {
    const hookFiles = fs.readdirSync(hooksDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
      .map(file => file.replace(/\.(ts|tsx)$/, ''))
    
    hookFiles.forEach(hook => {
      const testFile = path.join(testDir, 'hooks', `${hook}.test.ts`)
      if (!fs.existsSync(testFile)) {
        missingTests.push(`hooks/${hook}`)
      }
    })
  }
  
  if (missingTests.length > 0) {
    logWarning(`Found ${missingTests.length} files without tests:`)
    missingTests.forEach(test => {
      log(`   - ${test}`, 'yellow')
    })
  } else {
    logSuccess('All files have corresponding test files')
  }
  
  return missingTests
}

function runJestTests() {
  logSection('Running Jest Tests')
  
  try {
    logInfo('Running tests with coverage...')
    
    const command = 'npm test -- --coverage --verbose --watchAll=false'
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    })
    
    logSuccess('All tests completed successfully')
    return { success: true, output: result }
    
  } catch (error) {
    logError('Tests failed')
    log(error.stdout || error.message, 'red')
    return { success: false, output: error.stdout || error.message }
  }
}

function analyzeTestResults(testOutput) {
  logSection('Analyzing Test Results')
  
  const issues = []
  
  // Parse Jest output for failures
  const failurePattern = /FAIL\s+(.+)/g
  let match
  while ((match = failurePattern.exec(testOutput)) !== null) {
    issues.push({
      type: 'error',
      severity: 'high',
      category: 'test',
      title: 'Test Failure',
      description: match[1],
      location: 'Jest output'
    })
  }
  
  // Check for coverage issues
  const coveragePattern = /Statements\s+:\s+(\d+\.?\d*)%/g
  while ((match = coveragePattern.exec(testOutput)) !== null) {
    const coverage = parseFloat(match[1])
    if (coverage < 70) {
      issues.push({
        type: 'warning',
        severity: 'medium',
        category: 'coverage',
        title: 'Low Test Coverage',
        description: `Test coverage is ${coverage}%, below recommended 70%`,
        location: 'Coverage report',
        suggestion: 'Add more tests to improve coverage'
      })
    }
  }
  
  return issues
}

function generateTestReport(missingTests, testResults, issues) {
  logSection('Generating Test Report')
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: missingTests.length + (testResults.success ? 1 : 0),
      missingTests: missingTests.length,
      testSuccess: testResults.success,
      issuesFound: issues.length
    },
    missingTests,
    testResults: {
      success: testResults.success,
      output: testResults.output
    },
    issues,
    recommendations: [
      'Review and fix any failed tests',
      'Add tests for missing components/functions',
      'Improve test coverage to at least 70%',
      'Add accessibility tests',
      'Consider adding integration tests',
      'Review and update mocks as needed'
    ]
  }
  
  const reportPath = path.join(process.cwd(), 'test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  logSuccess(`Test report saved to: ${reportPath}`)
  
  return report
}

function printSummary(report) {
  logHeader('TEST SUMMARY')
  
  log(`📊 Coverage Analysis:`, 'bright')
  log(`   Files without tests: ${report.summary.missingTests}`, 
      report.summary.missingTests > 0 ? 'yellow' : 'green')
  log(`   Test execution: ${report.summary.testSuccess ? '✅ Passed' : '❌ Failed'}`, 
      report.summary.testSuccess ? 'green' : 'red')
  log(`   Issues found: ${report.summary.issuesFound}`, 
      report.summary.issuesFound > 0 ? 'yellow' : 'green')
  
  if (report.issues.length > 0) {
    log(`\n⚠️  Issues Found:`, 'bright')
    report.issues.forEach((issue, index) => {
      const severityColor = issue.severity === 'high' ? 'red' : 
                           issue.severity === 'medium' ? 'yellow' : 'blue'
      log(`   ${index + 1}. ${issue.title} (${issue.severity})`, severityColor)
      log(`      ${issue.description}`, 'reset')
      if (issue.suggestion) {
        log(`      💡 ${issue.suggestion}`, 'cyan')
      }
    })
  }
  
  log(`\n📋 Recommendations:`, 'bright')
  report.recommendations.forEach((rec, index) => {
    log(`   ${index + 1}. ${rec}`, 'blue')
  })
  
  log(`\n📄 Full report available at: test-report.json`, 'cyan')
}

function main() {
  logHeader('🧪 WORKLOAD WIZARD TEST RUNNER')
  
  try {
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      logError('package.json not found. Please run this script from the project root.')
      process.exit(1)
    }
    
    // Check test coverage
    const missingTests = checkTestCoverage()
    
    // Run Jest tests
    const testResults = runJestTests()
    
    // Analyze results
    const issues = analyzeTestResults(testResults.output)
    
    // Generate report
    const report = generateTestReport(missingTests, testResults, issues)
    
    // Print summary
    printSummary(report)
    
    // Exit with appropriate code
    if (!testResults.success || issues.some(issue => issue.severity === 'high')) {
      logError('Tests completed with errors. Please review and fix issues.')
      process.exit(1)
    } else {
      logSuccess('All tests completed successfully!')
      process.exit(0)
    }
    
  } catch (error) {
    logError(`Unexpected error: ${error.message}`)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = {
  checkTestCoverage,
  runJestTests,
  analyzeTestResults,
  generateTestReport,
  printSummary
} 