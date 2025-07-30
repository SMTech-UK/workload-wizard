import { renderHook, act } from '@testing-library/react';
import { useDevSettings } from '@/hooks/useDevSettings';

describe('useDevSettings', () => {
  beforeEach(() => {
    // Reset the global state by clearing all listeners
    const { result } = renderHook(() => useDevSettings());
    act(() => {
      result.current.closeDevSettings();
    });
  });

  describe('initial state', () => {
    it('should initialize with dev settings closed', () => {
      const { result } = renderHook(() => useDevSettings());

      expect(result.current.isDevSettingsOpen).toBe(false);
    });
  });

  describe('openDevSettings', () => {
    it('should open dev settings', () => {
      const { result } = renderHook(() => useDevSettings());

      act(() => {
        result.current.openDevSettings();
      });

      expect(result.current.isDevSettingsOpen).toBe(true);
    });

    it('should notify all listeners when opening', () => {
      const { result: result1 } = renderHook(() => useDevSettings());
      const { result: result2 } = renderHook(() => useDevSettings());

      act(() => {
        result1.current.openDevSettings();
      });

      expect(result1.current.isDevSettingsOpen).toBe(true);
      expect(result2.current.isDevSettingsOpen).toBe(true);
    });
  });

  describe('closeDevSettings', () => {
    it('should close dev settings', () => {
      const { result } = renderHook(() => useDevSettings());

      // First open
      act(() => {
        result.current.openDevSettings();
      });
      expect(result.current.isDevSettingsOpen).toBe(true);

      // Then close
      act(() => {
        result.current.closeDevSettings();
      });
      expect(result.current.isDevSettingsOpen).toBe(false);
    });

    it('should notify all listeners when closing', () => {
      const { result: result1 } = renderHook(() => useDevSettings());
      const { result: result2 } = renderHook(() => useDevSettings());

      // Open first
      act(() => {
        result1.current.openDevSettings();
      });

      // Then close
      act(() => {
        result1.current.closeDevSettings();
      });

      expect(result1.current.isDevSettingsOpen).toBe(false);
      expect(result2.current.isDevSettingsOpen).toBe(false);
    });
  });

  describe('toggleDevSettings', () => {
    it('should toggle dev settings from closed to open', () => {
      const { result } = renderHook(() => useDevSettings());

      act(() => {
        result.current.toggleDevSettings();
      });

      expect(result.current.isDevSettingsOpen).toBe(true);
    });

    it('should toggle dev settings from open to closed', () => {
      const { result } = renderHook(() => useDevSettings());

      // First open
      act(() => {
        result.current.openDevSettings();
      });

      // Then toggle to close
      act(() => {
        result.current.toggleDevSettings();
      });

      expect(result.current.isDevSettingsOpen).toBe(false);
    });

    it('should notify all listeners when toggling', () => {
      const { result: result1 } = renderHook(() => useDevSettings());
      const { result: result2 } = renderHook(() => useDevSettings());

      act(() => {
        result1.current.toggleDevSettings();
      });

      expect(result1.current.isDevSettingsOpen).toBe(true);
      expect(result2.current.isDevSettingsOpen).toBe(true);
    });
  });

  describe('multiple instances', () => {
    it('should maintain consistent state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useDevSettings());
      const { result: result2 } = renderHook(() => useDevSettings());
      const { result: result3 } = renderHook(() => useDevSettings());

      // All should start closed
      expect(result1.current.isDevSettingsOpen).toBe(false);
      expect(result2.current.isDevSettingsOpen).toBe(false);
      expect(result3.current.isDevSettingsOpen).toBe(false);

      // Open from first instance
      act(() => {
        result1.current.openDevSettings();
      });

      // All should be open
      expect(result1.current.isDevSettingsOpen).toBe(true);
      expect(result2.current.isDevSettingsOpen).toBe(true);
      expect(result3.current.isDevSettingsOpen).toBe(true);

      // Close from second instance
      act(() => {
        result2.current.closeDevSettings();
      });

      // All should be closed
      expect(result1.current.isDevSettingsOpen).toBe(false);
      expect(result2.current.isDevSettingsOpen).toBe(false);
      expect(result3.current.isDevSettingsOpen).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should remove listeners when component unmounts', () => {
      const { result, unmount } = renderHook(() => useDevSettings());

      // Open settings
      act(() => {
        result.current.openDevSettings();
      });

      // Unmount the first hook
      unmount();

      // Create a new hook instance
      const { result: newResult } = renderHook(() => useDevSettings());

      // The new instance should still see the open state
      expect(newResult.current.isDevSettingsOpen).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useDevSettings());

      act(() => {
        result.current.openDevSettings();
        result.current.closeDevSettings();
        result.current.openDevSettings();
      });

      expect(result.current.isDevSettingsOpen).toBe(true);
    });

    it('should handle multiple rapid toggles', () => {
      const { result } = renderHook(() => useDevSettings());

      act(() => {
        result.current.toggleDevSettings(); // open
        result.current.toggleDevSettings(); // close
        result.current.toggleDevSettings(); // open
      });

      expect(result.current.isDevSettingsOpen).toBe(true);
    });
  });
}); 