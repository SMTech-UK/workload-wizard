import { NextRequest, NextResponse } from 'next/server'
import { testHistoryManager } from '@/lib/test-history'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '20')

    switch (action) {
      case 'history':
        const history = await testHistoryManager.getTestHistory(limit)
        return NextResponse.json({
          success: true,
          history
        })

      case 'stats':
        const stats = await testHistoryManager.getTestStats()
        return NextResponse.json({
          success: true,
          stats
        })

      case 'result':
        if (!id) {
          return NextResponse.json({
            success: false,
            error: 'Test result ID is required'
          }, { status: 400 })
        }
        
        const result = await testHistoryManager.getTestResult(id)
        if (!result) {
          return NextResponse.json({
            success: false,
            error: 'Test result not found'
          }, { status: 404 })
        }
        
        return NextResponse.json({
          success: true,
          result
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: history, stats, or result'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in test history API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')

    switch (action) {
      case 'clear':
        await testHistoryManager.clearHistory()
        return NextResponse.json({
          success: true,
          message: 'Test history cleared'
        })

      case 'delete':
        if (!id) {
          return NextResponse.json({
            success: false,
            error: 'Test result ID is required'
          }, { status: 400 })
        }
        
        const deleted = await testHistoryManager.deleteTestResult(id)
        if (!deleted) {
          return NextResponse.json({
            success: false,
            error: 'Test result not found'
          }, { status: 404 })
        }
        
        return NextResponse.json({
          success: true,
          message: 'Test result deleted'
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: clear or delete'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in test history DELETE API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 