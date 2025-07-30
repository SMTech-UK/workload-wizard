import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useLoadingOverlay, LoadingOverlayProvider } from '@/hooks/useLoadingOverlay'

// Mock the LoadingOverlay component
jest.mock('@/components/layout/loading-overlay', () => {
  return function MockLoadingOverlay({ loading }: { loading: boolean }) {
    return loading ? <div data-testid="loading-overlay">Loading...</div> : null
  }
})

describe('useLoadingOverlay', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    // Run all pending timers before cleaning up
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  it('should return loading state and setLoading function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LoadingOverlayProvider>{children}</LoadingOverlayProvider>
    )

    const { result } = renderHook(() => useLoadingOverlay(), { wrapper })

    expect(result.current.loading).toBeDefined()
    expect(typeof result.current.setLoading).toBe('function')
  })

  it('should show loading overlay initially', () => {
    render(
      <LoadingOverlayProvider>
        <div>Test Content</div>
      </LoadingOverlayProvider>
    )

    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument()
  })

  it('should hide loading overlay after timeout', async () => {
    render(
      <LoadingOverlayProvider>
        <div>Test Content</div>
      </LoadingOverlayProvider>
    )

    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument()

    // Fast-forward time to trigger the timeout
    act(() => {
      jest.advanceTimersByTime(600) // 300ms buffer + 300ms timeout
    })

    await waitFor(() => {
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument()
    })
  })

  it('should have fallback timeout of 2 seconds', async () => {
    render(
      <LoadingOverlayProvider>
        <div>Test Content</div>
      </LoadingOverlayProvider>
    )

    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument()

    // Fast-forward time to trigger the fallback timeout
    act(() => {
      jest.advanceTimersByTime(2000)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument()
    })
  })

  it('should allow manual control of loading state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LoadingOverlayProvider>{children}</LoadingOverlayProvider>
    )

    const { result } = renderHook(() => useLoadingOverlay(), { wrapper })

    // Initially loading should be true
    expect(result.current.loading).toBe(true)

    // Manually set loading to false
    act(() => {
      result.current.setLoading(false)
    })

    expect(result.current.loading).toBe(false)

    // Manually set loading to true
    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.loading).toBe(true)
  })

  it('should render children content', () => {
    render(
      <LoadingOverlayProvider>
        <div data-testid="test-content">Test Content</div>
      </LoadingOverlayProvider>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should clean up timeouts on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    const { unmount } = render(
      <LoadingOverlayProvider>
        <div>Test Content</div>
      </LoadingOverlayProvider>
    )

    // Run timers to ensure they're set up
    act(() => {
      jest.runOnlyPendingTimers()
    })

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('should work with nested components', () => {
    const TestComponent = () => {
      const { loading, setLoading } = useLoadingOverlay()
      
      return (
        <div>
          <div data-testid="loading-state">{loading ? 'Loading' : 'Not Loading'}</div>
          <button 
            data-testid="toggle-button"
            onClick={() => setLoading(!loading)}
          >
            Toggle
          </button>
        </div>
      )
    }

    render(
      <LoadingOverlayProvider>
        <TestComponent />
      </LoadingOverlayProvider>
    )

    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading')
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument()
  })

  it('should handle multiple setLoading calls', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LoadingOverlayProvider>{children}</LoadingOverlayProvider>
    )

    const { result } = renderHook(() => useLoadingOverlay(), { wrapper })

    // Multiple rapid calls
    act(() => {
      result.current.setLoading(false)
      result.current.setLoading(true)
      result.current.setLoading(false)
    })

    expect(result.current.loading).toBe(false)
  })
}) 