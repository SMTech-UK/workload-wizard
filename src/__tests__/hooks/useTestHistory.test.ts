import { renderHook, act, waitFor } from '@testing-library/react';
import { useTestHistory } from '@/hooks/useTestHistory';

// Mock fetch globally
global.fetch = jest.fn();

describe('useTestHistory Hook - Critical Test History Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      // Arrange & Act
      const { result } = renderHook(() => useTestHistory());
      
      // Assert
      expect(result.current.history).toEqual([]);
      expect(result.current.stats).toBeNull();
      expect(result.current.loading).toBe(true); // Initially loading due to useEffect
      expect(typeof result.current.loadHistory).toBe('function');
      expect(typeof result.current.loadStats).toBe('function');
      expect(typeof result.current.clearHistory).toBe('function');
    });
  });

  describe('loadHistory Function', () => {
    it('should load test history successfully', async () => {
      // Arrange
      const mockHistory = [
        {
          id: 'test-1',
          summary: { coverage: 85, duration: 1000, failed: 0, passed: 5, total: 5, running: 0 },
          testType: 'unit',
          timestamp: '2024-01-01T00:00:00.000Z',
          coverage: true,
          suites: [],
          success: true
        }
      ];
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, history: mockHistory })
      });

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Act - Load history again
      await act(async () => {
        result.current.loadHistory();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.history).toEqual(mockHistory);
      }, { timeout: 2000 });
      
      expect(fetch).toHaveBeenCalledWith('/api/test-history?action=history&limit=20');
    });

    it('should handle different limit parameters', async () => {
      // Arrange
      const mockHistory = [{ id: 'test-1', summary: { coverage: 85, duration: 1000, failed: 0, passed: 5, total: 5, running: 0 }, testType: 'unit', timestamp: '2024-01-01T00:00:00.000Z', coverage: true, suites: [], success: true }];
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, history: mockHistory })
      });

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Act
      await act(async () => {
        result.current.loadHistory(10);
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.history).toEqual(mockHistory);
      }, { timeout: 2000 });
      
      expect(fetch).toHaveBeenCalledWith('/api/test-history?action=history&limit=10');
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Act
      await act(async () => {
        result.current.loadHistory();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.history).toEqual([]);
      }, { timeout: 2000 });
    });

    it('should handle malformed response', async () => {
      // Arrange
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Invalid response' })
      });

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Act
      await act(async () => {
        result.current.loadHistory();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.history).toEqual([]);
      }, { timeout: 2000 });
    });
  });

  describe('loadStats Function', () => {
    it('should load test statistics successfully', async () => {
      // Arrange
      const mockStats = { totalRuns: 5, totalTests: 50, totalPassed: 45, totalFailed: 5, successRate: 90, averageCoverage: 82.5, averageDuration: 1200, lastRun: '2024-01-01T00:00:00.000Z' };
      const mockHistory = [{ id: 'test-1', summary: { coverage: 85, duration: 1000, failed: 0, passed: 5, total: 5, running: 0 }, testType: 'unit', timestamp: '2024-01-01T00:00:00.000Z', coverage: true, suites: [], success: true }];
      
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, history: mockHistory })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, stats: mockStats })
        });

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Act
      await act(async () => {
        result.current.loadStats();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.stats).toEqual(mockStats);
      }, { timeout: 2000 });
      
      expect(fetch).toHaveBeenCalledWith('/api/test-history?action=stats');
    });

    it('should handle stats loading errors', async () => {
      // Arrange
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Stats loading failed'));

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Act
      await act(async () => {
        result.current.loadStats();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.stats).toBeNull();
      }, { timeout: 2000 });
    });
  });

  describe('clearHistory Function', () => {
    it('should clear history and stats', async () => {
      // Arrange - Mock initial load
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, history: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, stats: null })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Wait for loading to finish
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 2000 });

      // Act
      await act(async () => {
        result.current.clearHistory();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.history).toEqual([]);
        expect(result.current.stats).toBeNull();
      }, { timeout: 2000 });
    });
  });

  describe('Loading States', () => {
    it('should set loading state during API calls', async () => {
      // Arrange - Mock initial load
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, history: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, stats: null })
        });

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Wait for loading to finish
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 2000 });

      // Mock a delayed fetch for the test
      let resolveFetch: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      
      (fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

      // Act - Start loading history (this should set loading to true immediately)
      act(() => {
        result.current.loadHistory();
      });

      // Assert - Should be loading immediately after calling the function
      expect(result.current.loading).toBe(true);

      // Resolve the fetch
      resolveFetch!({
        ok: true,
        json: async () => ({ success: true, history: [] })
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert - Should not be loading anymore
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 2000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error responses', async () => {
      // Arrange - Mock initial load
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, history: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, stats: null })
        });

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Mock another fetch for the test
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      // Act
      await act(async () => {
        result.current.loadHistory();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      expect(result.current.error).toBeTruthy();
    });

    it('should handle JSON parsing errors', async () => {
      // Arrange - Mock initial load
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, history: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, stats: null })
        });

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Mock another fetch for the test
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('JSON parse error'); }
      });

      // Act
      await act(async () => {
        result.current.loadHistory();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      expect(result.current.error).toBe('JSON parse error');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete workflow', async () => {
      // Arrange
      const mockHistory = [
        { id: 'test-1', summary: { coverage: 85.5, duration: 1500, failed: 0, passed: 10, total: 10, running: 0 }, testType: 'unit', timestamp: '2024-01-01T00:00:00.000Z', coverage: true, suites: [], success: true },
        { id: 'test-2', summary: { coverage: 85.5, duration: 1500, failed: 0, passed: 10, total: 10, running: 0 }, testType: 'unit', timestamp: '2024-01-02T00:00:00.000Z', coverage: true, suites: [], success: true }
      ];
      const mockStats = { totalRuns: 2, totalTests: 20, totalPassed: 20, totalFailed: 0, successRate: 100, averageCoverage: 85.5, averageDuration: 1500, lastRun: '2024-01-02T00:00:00.000Z' };
      
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, history: mockHistory })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, stats: mockStats })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert - History loaded
      await waitFor(() => {
        expect(result.current.history).toEqual(mockHistory);
      }, { timeout: 2000 });

      // Assert - Stats should also be loaded from initial load
      await waitFor(() => {
        expect(result.current.stats).toEqual(mockStats);
      }, { timeout: 2000 });

      // Act - Clear everything
      await act(async () => {
        result.current.clearHistory();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert - Everything cleared
      await waitFor(() => {
        expect(result.current.history).toEqual([]);
        expect(result.current.stats).toBeNull();
        expect(result.current.error).toBeNull();
      }, { timeout: 2000 });
    });

    it('should handle concurrent API calls', async () => {
      // Arrange
      const mockHistory = [{ id: 'test-1', summary: { coverage: 85, duration: 1000, failed: 0, passed: 5, total: 5, running: 0 }, testType: 'unit', timestamp: '2024-01-01T00:00:00.000Z', coverage: true, suites: [], success: true }];
      const mockStats = { totalRuns: 1, totalTests: 5, totalPassed: 5, totalFailed: 0, successRate: 100, averageCoverage: 85, averageDuration: 1000, lastRun: '2024-01-01T00:00:00.000Z' };
      
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, history: mockHistory })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, stats: mockStats })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, history: mockHistory })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, stats: mockStats })
        });

      const { result } = renderHook(() => useTestHistory());

      // Wait for initial load to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Act - Make concurrent calls
      await act(async () => {
        result.current.loadHistory();
        result.current.loadStats();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert - Both should complete successfully
      await waitFor(() => {
        expect(result.current.history).toEqual(mockHistory);
        expect(result.current.stats).toEqual(mockStats);
      }, { timeout: 2000 });
    });
  });
}); 