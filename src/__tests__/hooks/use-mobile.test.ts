import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  it('should return false for desktop width', () => {
    // Set desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should return true for mobile width', () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return true for tablet width (below breakpoint)', () => {
    // Set tablet width (767px, just below 768px breakpoint)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return false for tablet width (at breakpoint)', () => {
    // Set tablet width (768px, at breakpoint)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should handle window resize events', () => {
    // Mock matchMedia with addEventListener and removeEventListener
    const mockAddEventListener = jest.fn()
    const mockRemoveEventListener = jest.fn()
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      })),
    })

    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      // Trigger the change event
      const changeCallback = mockAddEventListener.mock.calls[0][1]
      changeCallback()
    })

    expect(result.current).toBe(true)

    // Verify event listeners were added and can be removed
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should clean up event listeners on unmount', () => {
    const mockAddEventListener = jest.fn()
    const mockRemoveEventListener = jest.fn()
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      })),
    })

    const { unmount } = renderHook(() => useIsMobile())

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should handle edge case of exactly 768px width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should handle edge case of 767px width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })
}) 