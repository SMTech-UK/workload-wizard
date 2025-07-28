import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const file = searchParams.get('file')
    const download = searchParams.get('download')
    const testId = searchParams.get('testId')

    if (!file) {
      return NextResponse.json({ error: 'File parameter is required' }, { status: 400 })
    }

    // Security: Only allow access to test files
    if (!file.startsWith('src/__tests__/') && !file.startsWith('__tests__/')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Normalize file path
    const filePath = file.startsWith('src/__tests__/') ? file : `src/__tests__/${file}`
    const fullPath = join(process.cwd(), filePath)

    try {
      const code = await readFile(fullPath, 'utf-8')
      
      if (download === 'true') {
        // Return file for download
        const filename = filePath.split('/').pop() || 'test.ts'
        return new NextResponse(code, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        })
      }

      // Extract specific test section if testId is provided
      let extractedCode = code
      if (testId) {
        extractedCode = extractTestSection(code, testId)
      }

      // Return JSON response
      return NextResponse.json({ 
        code: extractedCode,
        file: filePath,
        size: extractedCode.length,
        isExtracted: !!testId
      })
    } catch (fileError) {
      console.error('File read error:', fileError)
      return NextResponse.json({ 
        error: 'File not found',
        file: filePath 
      }, { status: 404 })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function extractTestSection(code: string, testId: string): string {
  const lines = code.split('\n')
  let startLine = -1
  let endLine = -1
  let braceCount = 0
  let inTest = false

  // Try to find the test by name (common patterns)
  const testName = testId.replace(/[^a-zA-Z0-9]/g, ' ')
  const testPatterns = [
    new RegExp(`(it|test|describe)\\s*\\(\\s*['"](.*?${testName}.*?)['"]`, 'i'),
    new RegExp(`(it|test|describe)\\s*\\(\\s*['"](.*?)['"]\\s*,\\s*.*?${testName}`, 'i'),
    new RegExp(`${testName}`, 'i')
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if this line contains a test definition
    if (!inTest) {
      for (const pattern of testPatterns) {
        if (pattern.test(line)) {
          startLine = i
          inTest = true
          break
        }
      }
    }

    if (inTest) {
      // Count braces to find the end of the test
      const openBraces = (line.match(/\{/g) || []).length
      const closeBraces = (line.match(/\}/g) || []).length
      braceCount += openBraces - closeBraces

      if (braceCount === 0 && startLine !== i) {
        endLine = i + 1
        break
      }
    }
  }

  if (startLine !== -1 && endLine !== -1) {
    // Extract the test section with some context
    const contextLines = 3
    const actualStart = Math.max(0, startLine - contextLines)
    const actualEnd = Math.min(lines.length, endLine + contextLines)
    
    const extractedLines = lines.slice(actualStart, actualEnd)
    return extractedLines.join('\n')
  }

  // If we can't find the specific test, return the whole file
  return code
} 