import { renderHook, act } from '@testing-library/react';
import { useDevMode } from '@/hooks/useDevMode';

// Mock the dependencies
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
}));

const mockUseUser = require('@clerk/nextjs').useUser;
const mockUseQuery = require('convex/react').useQuery;

describe('useDevMode Hook - Critical Development Logic', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock user as admin
    mockUseUser.mockReturnValue({
      user: { id: 'test-user-id' },
      isLoaded: true,
    });
    
    // Mock profile fields as admin
    mockUseQuery.mockReturnValue({
      systemRole: 'admin',
    });
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initial State Detection', () => {
    it('should detect dev mode from localStorage when set to true', () => {
      // Arrange
      localStorage.setItem('devMode', 'true');
      
      // Act
      const { result } = renderHook(() => useDevMode());
      
      // Assert
      expect(result.current.devMode).toBe(true);
    });

    it('should detect dev mode from localStorage when set to false', () => {
      // Arrange
      localStorage.setItem('devMode', 'false');
      
      // Act
      const { result } = renderHook(() => useDevMode());
      
      // Assert
      expect(result.current.devMode).toBe(false);
    });

    it('should default to false when localStorage is not set', () => {
      // Arrange & Act
      const { result } = renderHook(() => useDevMode());
      
      // Assert
      expect(result.current.devMode).toBe(false);
    });

    it('should identify admin user correctly', () => {
      // Arrange & Act
      const { result } = renderHook(() => useDevMode());
      
      // Assert
      expect(result.current.isAdmin).toBe(true);
    });

    it('should show dev tools when admin and dev mode is enabled', () => {
      // Arrange
      localStorage.setItem('devMode', 'true');
      
      // Act
      const { result } = renderHook(() => useDevMode());
      
      // Assert
      expect(result.current.shouldShowDevTools).toBe(true);
    });
  });

  describe('Toggle Functionality', () => {
    it('should toggle dev mode from false to true', () => {
      // Arrange
      localStorage.setItem('devMode', 'false');
      const { result } = renderHook(() => useDevMode());
      
      // Act
      act(() => {
        result.current.toggleDevMode(true);
      });
      
      // Assert
      expect(result.current.devMode).toBe(true);
      expect(localStorage.getItem('devMode')).toBe('true');
    });

    it('should toggle dev mode from true to false', () => {
      // Arrange
      localStorage.setItem('devMode', 'true');
      const { result } = renderHook(() => useDevMode());
      
      // Act
      act(() => {
        result.current.toggleDevMode(false);
      });
      
      // Assert
      expect(result.current.devMode).toBe(false);
      expect(localStorage.getItem('devMode')).toBe('false');
    });

    it('should not toggle dev mode when user is not admin', () => {
      // Arrange
      mockUseQuery.mockReturnValue({
        systemRole: 'user',
      });
      localStorage.setItem('devMode', 'false');
      const { result } = renderHook(() => useDevMode());
      
      // Act
      act(() => {
        result.current.toggleDevMode(true);
      });
      
      // Assert
      expect(result.current.devMode).toBe(false);
      expect(result.current.isAdmin).toBe(false);
    });

    it('should handle multiple toggles correctly', () => {
      // Arrange
      const { result } = renderHook(() => useDevMode());
      
      // Act & Assert
      act(() => {
        result.current.toggleDevMode(true);
      });
      expect(result.current.devMode).toBe(true);
      
      act(() => {
        result.current.toggleDevMode(false);
      });
      expect(result.current.devMode).toBe(false);
      
      act(() => {
        result.current.toggleDevMode(true);
      });
      expect(result.current.devMode).toBe(true);
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should persist dev mode state in localStorage', () => {
      // Arrange
      const { result } = renderHook(() => useDevMode());
      
      // Act
      act(() => {
        result.current.toggleDevMode(true);
      });
      
      // Assert
      expect(localStorage.getItem('devMode')).toBe('true');
    });

    it('should update localStorage when toggling', () => {
      // Arrange
      const { result } = renderHook(() => useDevMode());
      
      // Act
      act(() => {
        result.current.toggleDevMode(true);
      });
      
      // Assert
      expect(localStorage.getItem('devMode')).toBe('true');
      
      act(() => {
        result.current.toggleDevMode(false);
      });
      expect(localStorage.getItem('devMode')).toBe('false');
    });

    it('should handle localStorage errors gracefully', () => {
      // Arrange
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      // Act & Assert
      const { result } = renderHook(() => useDevMode());
      
      expect(() => {
        act(() => {
          result.current.toggleDevMode(true);
        });
      }).not.toThrow();
      
      // Cleanup
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid localStorage values gracefully', () => {
      // Arrange
      localStorage.setItem('devMode', 'invalid');
      
      // Act
      const { result } = renderHook(() => useDevMode());
      
      // Assert
      expect(result.current.devMode).toBe(false);
    });

    it('should handle empty localStorage value', () => {
      // Arrange
      localStorage.setItem('devMode', '');
      
      // Act
      const { result } = renderHook(() => useDevMode());
      
      // Assert
      expect(result.current.devMode).toBe(false);
    });

    it('should handle null localStorage value', () => {
      // Arrange
      localStorage.setItem('devMode', 'null');
      
      // Act
      const { result } = renderHook(() => useDevMode());
      
      // Assert
      expect(result.current.devMode).toBe(false);
    });

    it('should handle user not loaded state', () => {
      // Arrange
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
      });
      
      // Act
      const { result } = renderHook(() => useDevMode());
      
      // Assert
      expect(result.current.devMode).toBe(false);
      expect(result.current.isAdmin).toBe(false);
    });

    it('should handle missing profile fields', () => {
      // Arrange
      mockUseQuery.mockReturnValue(null);
      
      // Act
      const { result } = renderHook(() => useDevMode());
      
      // Assert
      expect(result.current.devMode).toBe(false);
      expect(result.current.isAdmin).toBe(null);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work correctly with admin user and dev mode interaction', () => {
      // Arrange
      localStorage.setItem('devMode', 'false');
      
      // Act
      const { result } = renderHook(() => useDevMode());
      
      // Assert - Should be false initially
      expect(result.current.devMode).toBe(false);
      expect(result.current.shouldShowDevTools).toBe(false);
      
      // Act - Enable dev mode
      act(() => {
        result.current.toggleDevMode(true);
      });
      
      // Assert - Should now be enabled
      expect(result.current.devMode).toBe(true);
      expect(result.current.shouldShowDevTools).toBe(true);
      expect(localStorage.getItem('devMode')).toBe('true');
    });

    it('should maintain state across multiple hook instances', () => {
      // Arrange
      const { result: result1 } = renderHook(() => useDevMode());
      
      // Act
      act(() => {
        result1.current.toggleDevMode(true);
      });
      
      // Assert
      expect(result1.current.devMode).toBe(true);
      expect(localStorage.getItem('devMode')).toBe('true');
      
      // Create second instance after state change
      const { result: result2 } = renderHook(() => useDevMode());
      expect(result2.current.devMode).toBe(true);
    });

    it('should handle rapid state changes correctly', () => {
      // Arrange
      const { result } = renderHook(() => useDevMode());
      
      // Act
      act(() => {
        result.current.toggleDevMode(true);
        result.current.toggleDevMode(false);
        result.current.toggleDevMode(true);
      });
      
      // Assert
      expect(result.current.devMode).toBe(true);
      expect(localStorage.getItem('devMode')).toBe('true');
    });
  });
}); 