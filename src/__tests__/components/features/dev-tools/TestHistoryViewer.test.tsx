import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestHistoryViewer } from '@/components/features/dev-tools/TestHistoryViewer';

// Mock the useTestHistory hook
jest.mock('@/hooks/useTestHistory');
const mockUseTestHistory = require('@/hooks/useTestHistory').useTestHistory;

describe('TestHistoryViewer Component - Critical Test History Display', () => {
  // Mock data that matches TestHistoryEntry interface
  const mockHistory = [
    {
      id: 'test-1',
      timestamp: '2024-01-01T00:00:00.000Z',
      testType: 'unit',
      isIndividualTest: false,
      coverage: true,
      suites: [],
      success: true,
      summary: {
        total: 10,
        passed: 10,
        failed: 0,
        running: 0,
        coverage: 85.5,
        duration: 1500
      },
      config: {
        environment: 'jsdom',
        coverageThreshold: 80,
        timeout: 5000,
        maxWorkers: 4
      },
      coverageDetails: {
        statements: 85,
        branches: 80,
        functions: 90,
        lines: 85
      }
    },
    {
      id: 'test-2',
      timestamp: '2024-01-02T00:00:00.000Z',
      testType: 'integration',
      isIndividualTest: false,
      coverage: false,
      suites: [],
      success: false,
      summary: {
        total: 5,
        passed: 3,
        failed: 2,
        running: 0,
        coverage: 60,
        duration: 800
      },
      error: 'Some tests failed'
    }
  ];

  const mockStats = {
    totalRuns: 2,
    totalTests: 15,
    totalPassed: 13,
    totalFailed: 2,
    successRate: 86.7,
    averageCoverage: 72.75,
    averageDuration: 1150,
    lastRun: '2024-01-02T00:00:00.000Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTestHistory.mockReturnValue({
      history: mockHistory,
      stats: mockStats,
      loading: false,
      error: null,
      loadHistory: jest.fn(),
      loadStats: jest.fn(),
      loadTestResult: jest.fn(),
      deleteTestResult: jest.fn(),
      clearHistory: jest.fn(),
      refresh: jest.fn()
    });
  });

  describe('Rendering', () => {
    it('should render test history viewer with data', () => {
      // Arrange & Act
      render(<TestHistoryViewer />);
      
      // Assert
      expect(screen.getByText('Test History')).toBeInTheDocument();
      expect(screen.getByText('Unit')).toBeInTheDocument();
      expect(screen.getByText('Integration')).toBeInTheDocument();
    });

    it('should display test statistics correctly', () => {
      // Arrange & Act
      render(<TestHistoryViewer />);
      
      // Assert
      expect(screen.getByText('Total Runs')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg Coverage')).toBeInTheDocument();
      expect(screen.getByText('Avg Duration')).toBeInTheDocument();
    });

    it('should show loading state when loading', () => {
      // Arrange
      mockUseTestHistory.mockReturnValue({
        history: [],
        stats: null,
        loading: true,
        error: null,
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: jest.fn()
      });

      // Act
      render(<TestHistoryViewer />);
      
      // Assert
      expect(screen.getByText('Loading test history...')).toBeInTheDocument();
    });

    it('should show error state when there is an error', () => {
      // Arrange
      mockUseTestHistory.mockReturnValue({
        history: [],
        stats: null,
        loading: false,
        error: 'Failed to load test history',
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: jest.fn()
      });

      // Act
      render(<TestHistoryViewer />);
      
      // Assert
      expect(screen.getByText('Error loading test history: Failed to load test history')).toBeInTheDocument();
    });

    it('should display empty state when no history', () => {
      // Arrange
      mockUseTestHistory.mockReturnValue({
        history: [],
        stats: null,
        loading: false,
        error: null,
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: jest.fn()
      });

      // Act
      render(<TestHistoryViewer />);
      
      // Assert
      expect(screen.getByText('No test history found')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should open history modal when clicking view button', async () => {
      // Arrange
      mockUseTestHistory.mockReturnValue({
        history: mockHistory,
        stats: mockStats,
        loading: false,
        error: null,
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: jest.fn()
      });

      // Act
      render(<TestHistoryViewer />);
      
      // Find the first view button
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      fireEvent.click(viewButtons[0]);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Result Details')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should close history modal when clicking close button', async () => {
      // Arrange
      mockUseTestHistory.mockReturnValue({
        history: mockHistory,
        stats: mockStats,
        loading: false,
        error: null,
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: jest.fn()
      });

      // Act
      render(<TestHistoryViewer />);
      
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Test Result Details')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Close the modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Test Result Details')).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle refresh button click', () => {
      // Arrange
      const mockRefresh = jest.fn();
      mockUseTestHistory.mockReturnValue({
        history: mockHistory,
        stats: mockStats,
        loading: false,
        error: null,
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: mockRefresh
      });

      // Act
      render(<TestHistoryViewer />);
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Assert
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('Test Type Display', () => {
    it('should display test type with proper formatting', () => {
      // Arrange
      const historyWithMultipleTypes = [
        {
          id: 'test-1',
          timestamp: '2024-01-01T00:00:00.000Z',
          testType: 'unit,component',
          isIndividualTest: false,
          coverage: true,
          suites: [],
          success: true,
          summary: {
            total: 10,
            passed: 10,
            failed: 0,
            running: 0,
            coverage: 85.5,
            duration: 1500
          }
        }
      ];

      mockUseTestHistory.mockReturnValue({
        history: historyWithMultipleTypes,
        stats: mockStats,
        loading: false,
        error: null,
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: jest.fn()
      });

      // Act
      render(<TestHistoryViewer />);
      
      // Assert
      expect(screen.getByText('Unit, Component')).toBeInTheDocument();
    });

    it('should handle single test type', () => {
      // Arrange & Act
      render(<TestHistoryViewer />);
      
      // Assert
      expect(screen.getByText('Unit')).toBeInTheDocument();
      expect(screen.getByText('Integration')).toBeInTheDocument();
    });
  });

  describe('Modal Content', () => {
    it('should open modal when clicking view button', async () => {
      // Arrange
      mockUseTestHistory.mockReturnValue({
        history: mockHistory,
        stats: mockStats,
        loading: false,
        error: null,
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: jest.fn()
      });

      // Act
      render(<TestHistoryViewer />);
      
      // Wait for the component to render
      await waitFor(() => {
        expect(screen.getByText('Unit')).toBeInTheDocument();
      });
      
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      fireEvent.click(viewButtons[0]);

      // Assert - Just check that the modal opens
      await waitFor(() => {
        expect(screen.getByText('Test Result Details')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display test type in modal', async () => {
      // Arrange
      mockUseTestHistory.mockReturnValue({
        history: mockHistory,
        stats: mockStats,
        loading: false,
        error: null,
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: jest.fn()
      });

      // Act
      render(<TestHistoryViewer />);
      
      // Wait for the component to render
      await waitFor(() => {
        expect(screen.getByText('Unit')).toBeInTheDocument();
      });
      
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      fireEvent.click(viewButtons[0]);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Result Details')).toBeInTheDocument();
        expect(screen.getByText(/Test Type:/)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle failed tests display', async () => {
      // Arrange
      const failedTestHistory = [
        {
          id: 'test-failed',
          timestamp: '2024-01-03T00:00:00.000Z',
          testType: 'unit',
          isIndividualTest: false,
          coverage: false,
          suites: [],
          success: false,
          summary: {
            total: 5,
            passed: 3,
            failed: 2,
            running: 0,
            coverage: 60,
            duration: 800
          },
          error: 'Test execution failed'
        }
      ];

      mockUseTestHistory.mockReturnValue({
        history: failedTestHistory,
        stats: mockStats,
        loading: false,
        error: null,
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: jest.fn()
      });

      // Act
      render(<TestHistoryViewer />);
      
      // Wait for the component to render
      await waitFor(() => {
        expect(screen.getByText('Unit')).toBeInTheDocument();
      });
      
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      fireEvent.click(viewButtons[0]);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Result Details')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing coverage details gracefully', async () => {
      // Arrange
      const historyWithoutCoverage = [
        {
          id: 'test-no-coverage',
          timestamp: '2024-01-01T00:00:00.000Z',
          testType: 'unit',
          isIndividualTest: false,
          coverage: false,
          suites: [],
          success: true,
          summary: {
            total: 5,
            passed: 5,
            failed: 0,
            running: 0,
            coverage: 0,
            duration: 500
          }
        }
      ];

      mockUseTestHistory.mockReturnValue({
        history: historyWithoutCoverage,
        stats: mockStats,
        loading: false,
        error: null,
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: jest.fn()
      });

      // Act
      render(<TestHistoryViewer />);
      
      // Wait for the component to render
      await waitFor(() => {
        expect(screen.getByText('Unit')).toBeInTheDocument();
      });
      
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      fireEvent.click(viewButtons[0]);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Result Details')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle missing configuration gracefully', async () => {
      // Arrange
      const historyWithoutConfig = [
        {
          id: 'test-no-config',
          timestamp: '2024-01-01T00:00:00.000Z',
          testType: 'unit',
          isIndividualTest: false,
          coverage: true,
          suites: [],
          success: true,
          summary: {
            total: 5,
            passed: 5,
            failed: 0,
            running: 0,
            coverage: 80,
            duration: 500
          }
          // No config property
        }
      ];

      mockUseTestHistory.mockReturnValue({
        history: historyWithoutConfig,
        stats: mockStats,
        loading: false,
        error: null,
        loadHistory: jest.fn(),
        loadStats: jest.fn(),
        loadTestResult: jest.fn(),
        deleteTestResult: jest.fn(),
        clearHistory: jest.fn(),
        refresh: jest.fn()
      });

      // Act
      render(<TestHistoryViewer />);
      
      // Wait for the component to render
      await waitFor(() => {
        expect(screen.getByText('Unit')).toBeInTheDocument();
      });
      
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      fireEvent.click(viewButtons[0]);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Result Details')).toBeInTheDocument();
        // Should not crash when config is missing
      }, { timeout: 5000 });
    });
  });
}); 