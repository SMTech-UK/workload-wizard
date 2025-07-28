import { useState, useEffect, useCallback } from 'react'
import type { TestHistoryEntry, TestHistoryStats } from '@/lib/test-history'

interface UseTestHistoryReturn {
  history: TestHistoryEntry[]
  stats: TestHistoryStats | null
  loading: boolean
  error: string | null
  loadHistory: (limit?: number) => Promise<void>
  loadStats: () => Promise<void>
  loadTestResult: (id: string) => Promise<TestHistoryEntry | null>
  deleteTestResult: (id: string) => Promise<boolean>
  clearHistory: () => Promise<void>
  refresh: () => Promise<void>
}

export function useTestHistory(): UseTestHistoryReturn {
  const [history, setHistory] = useState<TestHistoryEntry[]>([])
  const [stats, setStats] = useState<TestHistoryStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = useCallback(async (limit: number = 20) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/test-history?action=history&limit=${limit}`)
      const data = await response.json()
      
      if (data.success) {
        setHistory(data.history)
      } else {
        setError(data.error || 'Failed to load test history')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test history')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/test-history?action=stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      } else {
        setError(data.error || 'Failed to load test stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test stats')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTestResult = useCallback(async (id: string): Promise<TestHistoryEntry | null> => {
    try {
      const response = await fetch(`/api/test-history?action=result&id=${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.result
      } else {
        setError(data.error || 'Failed to load test result')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test result')
      return null
    }
  }, [])

  const deleteTestResult = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/test-history?action=delete&id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        // Remove from local state
        setHistory(prev => prev.filter(entry => entry.id !== id))
        return true
      } else {
        setError(data.error || 'Failed to delete test result')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete test result')
      return false
    }
  }, [])

  const clearHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/test-history?action=clear', {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        setHistory([])
        setStats(null)
      } else {
        setError(data.error || 'Failed to clear test history')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear test history')
    }
  }, [])

  const refresh = useCallback(async () => {
    await Promise.all([loadHistory(), loadStats()])
  }, [loadHistory, loadStats])

  // Load initial data
  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    history,
    stats,
    loading,
    error,
    loadHistory,
    loadStats,
    loadTestResult,
    deleteTestResult,
    clearHistory,
    refresh
  }
} 