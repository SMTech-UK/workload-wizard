import { renderHook, act, waitFor } from '@testing-library/react';
import { useTestRunner } from '@/hooks/useTestRunner';

// Mock fetch globally
global.fetch = jest.fn();

describe('useTestRunner Hook - Critical Test Execution Logic', () => {
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
    it('should initialize with correct default state', () => {
      // Arrange & Act
      const { result } = renderHook(() => useTestRunner());
      
      // Assert
      expect(result.current.isRunning).toBe(false);
      expect(result.current.testReport).toBeNull();
      expect(result.current.error).toBeNull();
      expect(typeof result.current.runTests).toBe('function');
      expect(typeof result.current.runIndividualTest).toBe('function');
      expect(typeof result.current.stopTests).toBe('function');
      expect(typeof result.current.clearResults).toBe('function');
    });
  });

  describe('runTests Function', () => {
    it('should run tests successfully with default parameters', async () => {
      // Arrange
      const mockReport = {
        summary: { total: 10, passed: 8, failed: 2, running: 0, coverage: 80, duration: 1500 },
        suites: [],
        timestamp: new Date().toISOString()
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, results: mockReport })
      });

      const { result } = renderHook(() => useTestRunner());

      // Act
      await act(async () => {
        result.current.runTests();
      });

      // Assert - Check that fetch was called correctly
      expect(fetch).toHaveBeenCalledWith('/api/test-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'all', coverage: true, config: undefined })
      });

      // Wait for completion and check final state
      await waitFor(() => {
        expect(result.current.isRunning).toBe(false);
      }, { timeout: 2000 });

      expect(result.current.testReport).toEqual(mockReport);
      expect(result.current.error).toBeNull();
    });

    it('should handle test failures gracefully', async () => {
      // Arrange
      const mockError = { message: 'Test execution failed' };
      
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTestRunner());

      // Act
      await act(async () => {
        result.current.runTests();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isRunning).toBe(false);
      }, { timeout: 2000 });
      
      expect(result.current.error).toBeTruthy();
      expect(result.current.testReport).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const { result } = renderHook(() => useTestRunner());

      // Act
      await act(async () => {
        result.current.runTests();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isRunning).toBe(false);
      }, { timeout: 2000 });
      
      expect(result.current.error).toBeTruthy();
    });

    it('should handle custom test parameters', async () => {
      // Arrange
      const mockReport = {
        summary: { total: 5, passed: 5, failed: 0, running: 0, coverage: 90, duration: 800 },
        suites: [],
        timestamp: new Date().toISOString()
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, results: mockReport })
      });

      const { result } = renderHook(() => useTestRunner());

      // Act
      await act(async () => {
        result.current.runTests('unit', true, { timeout: 5000 });
      });

      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/test-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'unit', coverage: true, config: { timeout: 5000 } })
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.isRunning).toBe(false);
      }, { timeout: 2000 });
    });
  });

  describe('runIndividualTest Function', () => {
    it('should run individual test successfully', async () => {
      // Arrange
      const mockReport = {
        summary: { total: 1, passed: 1, failed: 0, running: 0, coverage: 100, duration: 100 },
        suites: [],
        timestamp: new Date().toISOString()
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, results: mockReport })
      });

      const { result } = renderHook(() => useTestRunner());

      // Act
      await act(async () => {
        result.current.runIndividualTest('test-name', 'test-id');
      });

      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/test-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'individual', testName: 'test-name', testId: 'test-id', coverage: false })
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.isRunning).toBe(false);
      }, { timeout: 2000 });
    });

    it('should call completion callback after individual test', async () => {
      // Arrange
      const onComplete = jest.fn();
      const mockReport = {
        summary: { total: 1, passed: 1, failed: 0, running: 0, coverage: 100, duration: 100 },
        suites: [],
        timestamp: new Date().toISOString()
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, results: mockReport })
      });

      const { result } = renderHook(() => useTestRunner());

      // Act
      await act(async () => {
        result.current.runIndividualTest('test-name', 'test-id', onComplete);
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('stopTests Function', () => {
    it('should stop running tests', async () => {
      // Arrange
      const { result } = renderHook(() => useTestRunner());

      // Act
      await act(async () => {
        result.current.stopTests();
      });

      // Assert
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('clearResults Function', () => {
    it('should clear test results and errors', async () => {
      // Arrange
      const { result } = renderHook(() => useTestRunner());

      // First run some tests to set state
      const mockReport = {
        summary: { total: 1, passed: 1, failed: 0, running: 0, coverage: 100, duration: 100 },
        suites: [],
        timestamp: new Date().toISOString()
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, results: mockReport })
      });

      await act(async () => {
        result.current.runTests();
      });

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isRunning).toBe(false);
      }, { timeout: 2000 });

      // Verify state is set
      expect(result.current.testReport).toEqual(mockReport);

      // Act - Clear results
      await act(async () => {
        result.current.clearResults();
      });

      // Assert
      expect(result.current.testReport).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed response', async () => {
      // Arrange
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Test execution failed' })
      });

      const { result } = renderHook(() => useTestRunner());

      // Act
      await act(async () => {
        result.current.runTests();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isRunning).toBe(false);
      }, { timeout: 2000 });
      
      expect(result.current.error).toBe('Test execution failed');
    });

    it('should handle JSON parsing errors', async () => {
      // Arrange
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('JSON parse error'); }
      });

      const { result } = renderHook(() => useTestRunner());

      // Act
      await act(async () => {
        result.current.runTests();
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isRunning).toBe(false);
      }, { timeout: 2000 });
      
      expect(result.current.error).toBe('JSON parse error');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete test workflow', async () => {
      // Arrange
      const mockReport = {
        summary: { total: 20, passed: 18, failed: 2, running: 0, coverage: 85, duration: 2000 },
        suites: [],
        timestamp: new Date().toISOString()
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, results: mockReport })
      });

      const { result } = renderHook(() => useTestRunner());

      // Act - Run tests
      await act(async () => {
        result.current.runTests('integration', true);
      });

      // Wait for completion
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // Assert - Check results
      await waitFor(() => {
        expect(result.current.isRunning).toBe(false);
      }, { timeout: 3000 });
      expect(result.current.testReport).toEqual(mockReport);

      // Act - Clear results
      await act(async () => {
        result.current.clearResults();
      });

      // Assert - Results cleared
      expect(result.current.testReport).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
}); 