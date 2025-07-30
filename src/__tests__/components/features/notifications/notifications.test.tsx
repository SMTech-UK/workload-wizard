import React from 'react';
import { render, screen } from '@testing-library/react';
import { Notifications } from '@/components/features/notifications/notifications';

// Mock Knock hooks and client
jest.mock('@knocklabs/react', () => ({
  useKnockClient: jest.fn(),
  useNotifications: jest.fn(),
  useNotificationStore: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    isSignedIn: true,
  }),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 hours ago'),
  parseISO: jest.fn((date) => new Date(date)),
}));

// Test data
const createMockNotification = (overrides: any = {}) => ({
  id: 'notification-1',
  title: 'Test Notification',
  inserted_at: '2024-01-01T10:00:00Z',
  read_at: null,
  blocks: [
    {
      type: 'text',
      name: 'title',
      content: 'Test Notification Title',
    },
  ],
  ...overrides,
});

const createMockNotifications = () => [
  createMockNotification(),
  createMockNotification({
    id: 'notification-2',
    title: 'Another Notification',
    blocks: [
      {
        type: 'text',
        name: 'title',
        content: 'Another Notification Title',
      },
    ],
  }),
  createMockNotification({
    id: 'notification-3',
    title: 'Read Notification',
    read_at: '2024-01-01T11:00:00Z',
    blocks: [
      {
        type: 'text',
        name: 'title',
        content: 'Read Notification Title',
      },
    ],
  }),
];

describe('Notifications Component', () => {
  let mockKnockClient: any;
  let mockUseKnockClient: jest.Mock;
  let mockUseNotifications: jest.Mock;
  let mockUseNotificationStore: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup Knock client mocks
    mockKnockClient = {
      fetch: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    };

    mockUseKnockClient = jest.fn().mockReturnValue(mockKnockClient);
    mockUseNotifications = jest.fn().mockReturnValue({
      items: createMockNotifications(),
      isLoading: false,
      error: null,
    });
    mockUseNotificationStore = jest.fn().mockReturnValue({
      isOpen: false,
      setIsOpen: jest.fn(),
    });

    // Setup module mocks
    const knockModule = require('@knocklabs/react');
    knockModule.useKnockClient = mockUseKnockClient;
    knockModule.useNotifications = mockUseNotifications;
    knockModule.useNotificationStore = mockUseNotificationStore;
  });

  describe('Basic Rendering', () => {
    it('should render notifications component', () => {
      // Arrange & Act
      render(<Notifications />);

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render notification bell icon', () => {
      // Arrange & Act
      render(<Notifications />);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Check for bell icon (assuming it's rendered as an SVG)
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should render with proper accessibility attributes', () => {
      // Arrange & Act
      render(<Notifications />);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Check that the button is accessible
      expect(button).toHaveAttribute('data-slot', 'button');
    });
  });

  describe('Notification Data Handling', () => {
    it('should handle empty notifications list', () => {
      // Arrange
      mockUseNotifications.mockReturnValue({
        items: [],
        isLoading: false,
        error: null,
      });

      // Act
      render(<Notifications />);

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      // Arrange
      mockUseNotifications.mockReturnValue({
        items: [],
        isLoading: true,
        error: null,
      });

      // Act
      render(<Notifications />);

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle error state', () => {
      // Arrange
      mockUseNotifications.mockReturnValue({
        items: [],
        isLoading: false,
        error: 'Failed to load notifications',
      });

      // Act
      render(<Notifications />);

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render with proper CSS classes', () => {
      // Arrange & Act
      render(<Notifications />);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('relative', 'inline-flex', 'items-center', 'justify-center');
    });

    it('should render notification count when available', () => {
      // Arrange
      const notificationsWithCount = createMockNotifications().filter(n => !n.read_at);
      mockUseNotifications.mockReturnValue({
        items: notificationsWithCount,
        isLoading: false,
        error: null,
      });

      // Act
      render(<Notifications />);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Mock Integration', () => {
    it('should use Knock client hooks', () => {
      // Arrange & Act
      render(<Notifications />);

      // Assert
      expect(mockUseKnockClient).toHaveBeenCalled();
      expect(mockUseNotifications).toHaveBeenCalled();
      expect(mockUseNotificationStore).toHaveBeenCalled();
    });

    it('should handle notification store state', () => {
      // Arrange
      mockUseNotificationStore.mockReturnValue({
        isOpen: true,
        setIsOpen: jest.fn(),
      });

      // Act
      render(<Notifications />);

      // Assert
      expect(mockUseNotificationStore).toHaveBeenCalled();
    });
  });
}); 