import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock matchMedia before tests
const mockMatchMedia = jest.fn();

beforeEach(() => {
  // Reset the mock before each test
  mockMatchMedia.mockClear();
  
  // Mock matchMedia globally
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });
});

describe('useIsMobile', () => {
  it('should return false for desktop screens', () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should return true for mobile screens', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should handle window resize events', () => {
    const mockAddEventListener = jest.fn();
    const mockRemoveEventListener = jest.fn();

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    renderHook(() => useIsMobile());

    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should clean up event listeners on unmount', () => {
    const mockAddEventListener = jest.fn();
    const mockRemoveEventListener = jest.fn();

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
}); 