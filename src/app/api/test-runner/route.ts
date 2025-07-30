import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { testHistoryManager } from '@/lib/test-history'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { 
      testType = 'all', 
      coverage = false,
      testName,
      testId,
      config = {
        environment: 'jsdom',
        coverageThreshold: 70,
        timeout: 5000,
        maxWorkers: 4
      }
    } = await request.json()

    // Build the Jest command based on parameters
    let jestArgs: string[] = []
    
    // Add configuration-based arguments
    if (config.timeout) {
      jestArgs.push(`--testTimeout=${config.timeout}`)
    }
    
    if (config.maxWorkers) {
      jestArgs.push(`--maxWorkers=${config.maxWorkers}`)
    }
    
    // Set test environment if specified
    if (config.environment && config.environment !== 'jsdom') {
      jestArgs.push(`--testEnvironment=${config.environment}`)
    }
    
    if (testType === 'individual' && testName && testId) {
      // For individual test, use testNamePattern to run specific test
      const testPattern = testName.replace(/\.test\.(js|ts|tsx)$/, '')
      jestArgs.push(`--testPathPattern=${testPattern}`)
      // Escape the test ID for Jest pattern matching
      const escapedTestId = testId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      jestArgs.push(`--testNamePattern="${escapedTestId}"`)

    } else if (testType !== 'all') {
      // Map test types to Jest patterns based on actual file structure
      const testPatterns = {
        'unit': 'lib',
        'component': 'components',
        'hook': 'hooks',
        'integration': 'integration',
        'simple': 'simple'
      }
      
      if (testPatterns[testType as keyof typeof testPatterns]) {
        jestArgs.push(`--testPathPattern=${testPatterns[testType as keyof typeof testPatterns]}`)
      }
    }

    jestArgs.push('--watchAll=false', '--json', '--passWithNoTests', '--outputFile=test-results.json')

    // Add coverage to main test command if requested
    if (coverage) {
      jestArgs.push('--coverage', '--silent')
    }

    const command = `npx jest ${jestArgs.join(' ')}`
    
    // Remove the separate coverage command since we're including it in the main command
    // let coverageCommand = `npx jest --coverage --watchAll=false --passWithNoTests --silent`
    
    // Add configuration-based arguments to coverage command
    // if (config.timeout) {
    //   coverageCommand += ` --testTimeout=${config.timeout}`
    // }
    
    // if (config.maxWorkers) {
    //   coverageCommand += ` --maxWorkers=${config.maxWorkers}`
    // }
    
    // if (config.environment && config.environment !== 'jsdom') {
    //   coverageCommand += ` --testEnvironment=${config.environment}`
    // }
    
    // Don't add coverage threshold to coverage command as it causes failures
    // The threshold is only for the main test command
    
    // if (testType !== 'all') {
    //   const testPatterns = {
    //     'unit': 'lib',
    //     'component': 'components',
    //     'hook': 'hooks',
    //     'integration': 'integration',
    //     'simple': 'simple'
    //   }
    //   if (testPatterns[testType as keyof typeof testPatterns]) {
    //     coverageCommand += ` --testPathPattern=${testPatterns[testType as keyof typeof testPatterns]}`
    //   }
    // }

    console.log(`Running test command: ${command}`)

    // Execute the test command
    let stdout, stderr
    try {
      // Use longer timeout and larger buffer for "all" tests
      const timeout = testType === 'all' ? 300000 : (config.timeout || 120000) // 5 minutes for all tests, 2 minutes for others
      const maxBuffer = testType === 'all' ? 200 * 1024 * 1024 : 50 * 1024 * 1024 // 200MB for all tests, 50MB for others
      console.log('Executing command with timeout:', timeout, 'and maxBuffer:', maxBuffer)
      
      const result = await execAsync(command, {
        cwd: process.cwd(),
        timeout: timeout,
        maxBuffer: maxBuffer
      })
      stdout = result.stdout
      stderr = result.stderr
      console.log('Command executed successfully')
      console.log('stdout length:', stdout.length)
      console.log('stderr length:', stderr.length)
      console.log('stdout first 500 chars:', stdout.substring(0, 500))
      console.log('stdout last 500 chars:', stdout.substring(Math.max(0, stdout.length - 500)))
      console.log('stderr first 500 chars:', stderr.substring(0, 500))
    } catch (execError: any) {
      // Jest exits with code 1 when tests fail, but we still want to capture the output
      console.log('Command execution error:', execError)
      console.log('Error code:', execError.code)
      console.log('Error message:', execError.message)
      
      if (execError.stdout) {
        stdout = execError.stdout
        console.log('Captured stdout from error:', stdout.length, 'chars')
      }
      if (execError.stderr) {
        stderr = execError.stderr
        console.log('Captured stderr from error:', stderr.length, 'chars')
      }
      
      // If we have no output at all, this is a real error
      if (!stdout && !stderr) {
        throw new Error(`Failed to execute test command: ${execError.message}`)
      }
    }

    // Execute coverage command to get detailed coverage data
    let coverageOutput = ''
    let coverageData: { statements: number; branches: number; functions: number; lines: number; } | undefined = undefined
    
    // Parse coverage data from coverage files if coverage was requested
    if (coverage) {
      try {
        const fs = require('fs')
        const path = require('path')
        const coverageSummaryPath = path.join(process.cwd(), 'coverage', 'coverage-summary.json')
        
        if (fs.existsSync(coverageSummaryPath)) {
          const coverageSummaryContent = fs.readFileSync(coverageSummaryPath, 'utf8')
          const coverageSummary = JSON.parse(coverageSummaryContent)
          
          if (coverageSummary.total) {
            coverageData = {
              statements: coverageSummary.total.statements.pct,
              branches: coverageSummary.total.branches.pct,
              functions: coverageSummary.total.functions.pct,
              lines: coverageSummary.total.lines.pct
            }
            console.log('Successfully parsed coverage data from coverage-summary.json:', coverageData)
          }
        } else {
          console.log('Coverage summary file not found at:', coverageSummaryPath)
        }
      } catch (parseError) {
        console.log('Could not parse coverage data from coverage files:', parseError)
      }
    }

    // Parse Jest JSON output
    let testResults
    try {
      // Try to read JSON from the output file first
      let jsonContent = null
      const fs = require('fs')
      const path = require('path')
      const outputFilePath = path.join(process.cwd(), 'test-results.json')
      
      try {
        if (fs.existsSync(outputFilePath)) {
          const fileContent = fs.readFileSync(outputFilePath, 'utf8')
          const parsed = JSON.parse(fileContent)
          if (parsed && typeof parsed === 'object' && 
              (parsed.testResults !== undefined || 
               parsed.numTotalTests !== undefined ||
               parsed.numPassedTests !== undefined ||
               parsed.numFailedTests !== undefined)) {
            jsonContent = fileContent
            console.log('Successfully read JSON from output file')
          }
        }
      } catch (fileError) {
        console.log('Failed to read from output file:', fileError instanceof Error ? fileError.message : String(fileError))
      }
      
      // Fallback: Look for JSON output in both stdout and stderr
      if (!jsonContent) {
        const allOutput = stdout + '\n' + stderr
        console.log(`Looking for JSON in ${allOutput.split('\n').length} lines of output`)
        
        // Method 1: Look for the start of a JSON object
        const jsonStartIndex = allOutput.indexOf('{')
        
        if (jsonStartIndex !== -1) {
          // Find the matching closing brace
          let braceCount = 0
          let jsonEndIndex = -1
          
          for (let i = jsonStartIndex; i < allOutput.length; i++) {
            if (allOutput[i] === '{') {
              braceCount++
            } else if (allOutput[i] === '}') {
              braceCount--
              if (braceCount === 0) {
                jsonEndIndex = i
                break
              }
            }
          }
          
          if (jsonEndIndex !== -1) {
            const jsonString = allOutput.substring(jsonStartIndex, jsonEndIndex + 1)
            
            try {
              const parsed = JSON.parse(jsonString)
              if (parsed && typeof parsed === 'object' && 
                  (parsed.testResults !== undefined || 
                   parsed.numTotalTests !== undefined ||
                   parsed.numPassedTests !== undefined ||
                   parsed.numFailedTests !== undefined)) {
                jsonContent = jsonString
                console.log('Successfully extracted JSON object from output')
              }
            } catch (parseError) {
              console.log('Failed to parse extracted JSON object:', parseError instanceof Error ? parseError.message : String(parseError))
            }
          }
        }
        
        // Method 2: Try to parse the entire output as JSON (fallback)
        if (!jsonContent) {
          try {
            const parsed = JSON.parse(allOutput.trim())
            if (parsed && typeof parsed === 'object' && 
                (parsed.testResults !== undefined || 
                 parsed.numTotalTests !== undefined ||
                 parsed.numPassedTests !== undefined ||
                 parsed.numFailedTests !== undefined)) {
              jsonContent = allOutput.trim()
              console.log('Successfully parsed entire output as JSON object')
            }
          } catch (parseError) {
            console.log('Could not parse entire output as JSON:', parseError instanceof Error ? parseError.message : String(parseError))
          }
        }
      }
      
      if (jsonContent) {
        const parsed = JSON.parse(jsonContent)
        console.log('Parsed JSON structure:', {
          isArray: Array.isArray(parsed),
          hasTestResults: parsed.testResults !== undefined,
          testResultsLength: parsed.testResults ? parsed.testResults.length : 'N/A',
          numTotalTests: parsed.numTotalTests,
          numPassedTests: parsed.numPassedTests,
          numFailedTests: parsed.numFailedTests
        })
        
        // If it's a Jest result object with testResults array
        if (parsed.testResults && Array.isArray(parsed.testResults)) {
          testResults = {
            success: true,
            numTotalTests: parsed.numTotalTests || 0,
            numPassedTests: parsed.numPassedTests || 0,
            numFailedTests: parsed.numFailedTests || 0,
            numTotalTestSuites: parsed.numTotalTestSuites || parsed.testResults.length,
            numPassedTestSuites: parsed.numPassedTestSuites || 0,
            numFailedTestSuites: parsed.numFailedTestSuites || 0,
            testResults: parsed.testResults
          }
          
          // If the summary data is missing, calculate it from testResults
          if (!parsed.numTotalTests || !parsed.numPassedTests || !parsed.numFailedTests) {
            let totalTests = 0
            let passedTests = 0
            let failedTests = 0
            let passedSuites = 0
            let failedSuites = 0
            
            for (const suite of parsed.testResults) {
              if (suite.assertionResults && Array.isArray(suite.assertionResults)) {
                totalTests += suite.assertionResults.length
                passedTests += suite.assertionResults.filter((test: any) => test.status === 'passed').length
                failedTests += suite.assertionResults.filter((test: any) => test.status === 'failed').length
              }
              
              // Count test suites
              if (suite.status === 'passed') {
                passedSuites++
              } else if (suite.status === 'failed') {
                failedSuites++
              }
            }
            
            testResults.numTotalTests = totalTests
            testResults.numPassedTests = passedTests
            testResults.numFailedTests = failedTests
            testResults.numPassedTestSuites = passedSuites
            testResults.numFailedTestSuites = failedSuites
          }
        } else {
          // It's already a Jest result object
          testResults = {
            success: true,
            ...parsed
          }
        }
      } else {
        console.log('No valid JSON found in test output')
        testResults = {
          success: false,
          error: 'No valid JSON found in test output',
          rawOutput: (stdout + '\n' + stderr).substring(0, 1000) // Include first 1000 chars for debugging
        }
      }
    } catch (parseError) {
      console.log('Error parsing test results:', parseError)
      testResults = {
        success: false,
        error: 'Failed to parse test results',
        parseError: parseError instanceof Error ? parseError.message : String(parseError)
      }
    }

    // Calculate coverage percentage from coverage data
    let coveragePercentage = 0
    if (coverage && coverageData) {
      coveragePercentage = coverageData.lines
    }

    // Transform Jest output to our format
    const transformedResults = {
      success: testResults.success && testResults.numFailedTests === 0,
      summary: {
        total: testResults.numTotalTests || 0,
        passed: testResults.numPassedTests || 0,
        failed: testResults.numFailedTests || 0,
        running: 0,
        coverage: coveragePercentage,
        duration: testResults.testResults?.reduce((total: number, suite: any) => {
          return total + (suite.endTime && suite.startTime ? (suite.endTime - suite.startTime) / 1000 : 0)
        }, 0) || 0
      },
      coverageDetails: coverageData || undefined,
      suites: testResults.testResults?.map((suite: any) => {
        const suiteName = suite.name.replace(process.cwd(), '').replace(/\\/g, '/').replace(/^\//, '')
        const category = suite.name.includes('/utils/') || suite.name.includes('/lib/') ? 'unit' : 
                        suite.name.includes('/components/') ? 'component' : 
                        suite.name.includes('/hooks/') ? 'hook' : 'other'
        
        const passedTests = suite.assertionResults?.filter((test: any) => test.status === 'passed') || []
        const failedTests = suite.assertionResults?.filter((test: any) => test.status === 'failed') || []
        
        return {
          name: suiteName,
          total: suite.assertionResults?.length || 0,
          passed: passedTests.length,
          failed: failedTests.length,
          running: 0,
          duration: suite.endTime && suite.startTime ? (suite.endTime - suite.startTime) / 1000 : 0,
          results: suite.assertionResults?.map((test: any) => ({
            id: `${suiteName}-${test.fullName}`,
            name: test.fullName,
            status: test.status === 'passed' ? 'passed' :
                    test.status === 'failed' ? 'failed' : 'pending',
            duration: test.duration ? test.duration / 1000 : 0,
            error: test.failureMessages?.join('\n') || '',
            category,
            timestamp: new Date().toISOString()
          })) || []
        }
      }) || [],
      timestamp: new Date().toISOString(),
      error: testResults.error || null
    }

    // Save test result to history
    try {
      const historyEntry = {
        testType,
        testName: testType === 'individual' ? testName : undefined,
        testId: testType === 'individual' ? testId : undefined,
        coverage,
        config, // Include the configuration used
        isIndividualTest: testType === 'individual',
        ...transformedResults
      }
      const historyId = await testHistoryManager.saveTestResult(historyEntry)
    } catch (historyError) {
      console.error('Failed to save test result to history:', historyError)
      // Don't fail the request if history saving fails
    }

    return NextResponse.json({
      success: true, // Always return success since we have results to display
      results: transformedResults,
      hasFailures: transformedResults.summary.failed > 0
    })

  } catch (error) {
    console.error('Test execution error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get test status and available test files
    const { stdout } = await execAsync('find src/__tests__ -name "*.test.*" -type f', {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 // 1MB buffer for file listing
    })

    const testFiles = stdout.split('\n').filter(Boolean).map(file => ({
      path: file,
      name: file.split('/').pop()?.replace(/\.test\.(js|ts|tsx)$/, ''),
      category: file.includes('/components/') ? 'component' :
                file.includes('/hooks/') ? 'hook' :
                file.includes('/utils/') || file.includes('/lib/') ? 'unit' : 'other'
    }))

    return NextResponse.json({
      success: true,
      testFiles,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting test files:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 