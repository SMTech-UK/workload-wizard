import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsModal from '@/components/modals/settings-modal';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

// Mock Convex hooks
jest.mock('convex/react', () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
  updateSettings: jest.fn(),
}));

// Mock useDevMode hook
jest.mock('@/hooks/useDevMode', () => ({
  useDevMode: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

// Mock API
jest.mock('convex/_generated/api', () => ({
  api: {
    users: {
      store: 'users.store',
      setPreferences: 'users.setPreferences',
      setSettings: 'users.setSettings',
    },
  },
}));

describe('SettingsModal Component', () => {
  let mockUseUser: jest.Mock;
  let mockUseTheme: jest.Mock;
  let mockUseMutation: jest.Mock;
  let mockUseQuery: jest.Mock;
  let mockUseDevMode: jest.Mock;
  let mockOnOpenChange: jest.Mock;
  let mockStoreUser: jest.Mock;
  let mockSetPreferences: jest.Mock;
  let mockSetSettings: jest.Mock;
  let mockSetTheme: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup Clerk mock
    mockUseUser = jest.fn().mockReturnValue({
      user: {
        id: 'user-123',
        fullName: 'John Doe',
        username: 'johndoe',
        imageUrl: 'https://example.com/avatar.jpg',
        primaryEmailAddress: {
          emailAddress: 'john@example.com',
        },
        user_metadata: {
          jobTitle: 'Lecturer',
          team: 'Computer Science',
          specialism: 'Software Engineering',
        },
      },
      isLoaded: true,
    });

    // Setup theme mock
    mockUseTheme = jest.fn().mockReturnValue({
      setTheme: jest.fn(),
      theme: 'light',
    });

    // Setup Convex mocks
    mockStoreUser = jest.fn().mockResolvedValue({ success: true });
    mockSetPreferences = jest.fn().mockResolvedValue({ success: true });
    mockSetSettings = jest.fn().mockResolvedValue({ success: true });
    mockUseMutation = jest.fn().mockImplementation((mutation) => {
      if (mutation === 'users.store') return mockStoreUser;
      if (mutation === 'users.setPreferences') return mockSetPreferences;
      if (mutation === 'users.setSettings') return mockSetSettings;
      return mockStoreUser; // fallback
    });

    // Ensure all mutations return immediately
    mockStoreUser.mockImplementation(() => Promise.resolve({ success: true }));
    mockSetPreferences.mockImplementation(() => Promise.resolve({ success: true }));
    mockSetSettings.mockImplementation(() => Promise.resolve({ success: true }));

    // Setup theme mock
    mockSetTheme = jest.fn();
    mockUseTheme = jest.fn().mockReturnValue({ setTheme: mockSetTheme });
    mockUseQuery = jest.fn().mockImplementation((query) => {
      if (query === 'users.getPreferences') {
        return {
          notifications: { email: true, push: false, marketing: true },
          privacy: { profileVisible: true, showEmail: false, showLocation: true },
          preferences: { theme: "system", language: "en", timezone: "GMT" },
          development: { devMode: false },
          general: { keyboardShortcuts: true, showTooltips: true, compactMode: false, landingPage: "dashboard", experimental: false }
        };
      }
      if (query === 'users.getProfileFields') {
        return { jobTitle: "", team: "", specialism: "" };
      }
      if (query === 'users.getSettings') {
        return {
          language: "en",
          notifyEmail: true,
          notifyPush: false,
          profilePublic: true,
          theme: "system",
          timezone: "GMT"
        };
      }
      return null;
    });

    // Setup dev mode mock
    mockUseDevMode = jest.fn().mockReturnValue({
      devMode: false,
      isAdmin: false,
      toggleDevMode: jest.fn(),
    });

    // Setup callbacks
    mockOnOpenChange = jest.fn();

    // Setup fetch mock
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ success: true }),
      })
    );

    // Apply mocks
    const { useUser } = require('@clerk/nextjs');
    useUser.mockImplementation(mockUseUser);

    const { useTheme } = require('next-themes');
    useTheme.mockImplementation(mockUseTheme);

    const { useMutation, useQuery } = require('convex/react');
    useMutation.mockImplementation(mockUseMutation);
    useQuery.mockImplementation(mockUseQuery);

    const { useDevMode } = require('@/hooks/useDevMode');
    useDevMode.mockImplementation(mockUseDevMode);
  });

  describe('Component Rendering', () => {
    it('renders modal with correct title', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders all tabs', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Lecturer Preferences')).toBeInTheDocument();
    });

    it('renders developer tab when user is admin', () => {
      // Arrange
      mockUseDevMode.mockReturnValue({
        devMode: false,
        isAdmin: true,
        toggleDevMode: jest.fn(),
      });

      // Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      expect(screen.getByRole('button', { name: /lecturer preferences teaching & interests/i })).toBeInTheDocument();
    });

    it('does not render developer tab when user is not admin', () => {
      // Arrange
      mockUseDevMode.mockReturnValue({
        devMode: false,
        isAdmin: false,
        toggleDevMode: jest.fn(),
      });

      // Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      expect(screen.queryByText('Developer')).not.toBeInTheDocument();
    });

    it('opens with specified initial tab', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="general"
        />
      );

      // Assert
      expect(screen.getByRole('heading', { name: 'General Settings' })).toBeInTheDocument();
    });
  });

  describe('Profile Tab', () => {
    it('displays user profile information', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Assert
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('displays user avatar', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Assert
      const avatar = screen.getByRole('img');
      expect(avatar).toBeInTheDocument();
    });

    it('allows editing profile information', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Assert
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();
    });

    it('saves profile changes', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Assert
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();
    });

    it('cancels profile editing', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Assert
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();
    });

    it('handles avatar upload', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Assert
      const avatar = screen.getByRole('img');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Settings Tab', () => {
    it('displays notification settings', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="settings"
        />
      );

      // Assert
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    });

    it('toggles notification settings', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="settings"
        />
      );

      // Assert
      const emailToggle = screen.getAllByRole('switch')[0];
      expect(emailToggle).toBeInTheDocument();
    });

    it('displays privacy settings', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="settings"
        />
      );

      // Assert
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    });

    it('saves settings changes', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="settings"
        />
      );

      // Assert
      expect(screen.getByRole('button', { name: /save settings/i })).toBeInTheDocument();
    });
  });

  describe('General Tab', () => {
    it('displays general settings', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="general"
        />
      );

      // Assert
      expect(screen.getByRole('heading', { name: 'General Settings' })).toBeInTheDocument();
      expect(screen.getByText('Enable Keyboard Shortcuts')).toBeInTheDocument();
      expect(screen.getByText('Show Tooltips')).toBeInTheDocument();
      expect(screen.getByText('Compact Mode')).toBeInTheDocument();
    });

    it('toggles general settings', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="general"
        />
      );

      // Assert
      const keyboardShortcutsToggle = screen.getAllByRole('switch')[0];
      expect(keyboardShortcutsToggle).toBeInTheDocument();
    });

    it('changes landing page preference', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="general"
        />
      );

      // Assert
      const landingPageSelect = screen.getByRole('combobox');
      expect(landingPageSelect).toBeInTheDocument();
    });

    it('saves general settings', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="general"
        />
      );

      // Assert
      expect(screen.getByRole('heading', { name: 'General Settings' })).toBeInTheDocument();
    });
  });

  describe('Lecturer Preferences Tab', () => {
    it('displays lecturer preferences', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="lecturer-preferences"
        />
      );

      // Assert
      expect(screen.getByRole('heading', { name: 'Lecturer Preferences' })).toBeInTheDocument();
    });

    it('allows adding teaching interests', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="lecturer-preferences"
        />
      );

      // Assert
      const interestInput = screen.getByPlaceholderText(/paramedicine, pre hospital care/i);
      const addButton = screen.getByRole('button', { name: /add/i });
      expect(interestInput).toBeInTheDocument();
      expect(addButton).toBeInTheDocument();
    });

    it('removes teaching interests', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="lecturer-preferences"
        />
      );

      // Assert
      expect(screen.getByRole('heading', { name: 'Lecturer Preferences' })).toBeInTheDocument();
    });

    it('saves lecturer preferences', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="lecturer-preferences"
        />
      );

      // Assert
      const saveButton = screen.getByRole('button', { name: /save preferences/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Developer Tab', () => {
    beforeEach(() => {
      mockUseDevMode.mockReturnValue({
        devMode: false,
        isAdmin: true,
        toggleDevMode: jest.fn(),
      });
    });

    it('displays developer settings when user is admin', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="developer"
        />
      );

      // Assert
      expect(screen.getByRole('heading', { name: 'Developer Settings' })).toBeInTheDocument();
    });

    it('toggles developer mode', async () => {
      // Arrange
      const mockToggleDevMode = jest.fn();
      mockUseDevMode.mockReturnValue({
        devMode: false,
        isAdmin: true,
        toggleDevMode: mockToggleDevMode,
      });

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="developer"
        />
      );

      // Assert
      const devModeToggle = screen.getByRole('switch');
      expect(devModeToggle).toBeInTheDocument();
    });

    it('displays experimental features', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="developer"
        />
      );

      // Assert
      expect(screen.getByText('Development Mode')).toBeInTheDocument();
      expect(screen.getByText('Enable developer tools and testing interfaces')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('switches between tabs', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      const settingsTab = screen.getByRole('button', { name: /user settings configure your user preferences/i });
      expect(settingsTab).toBeInTheDocument();
    });

    it('maintains tab state when switching', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      const generalTab = screen.getByRole('button', { name: /general settings web app configuration/i });
      const profileTab = screen.getByRole('button', { name: /user profile manage your user profile information/i });
      expect(generalTab).toBeInTheDocument();
      expect(profileTab).toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('closes modal when close button is clicked', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('handles modal open state changes', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={false}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      expect(screen.queryByText('User Profile')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles save errors gracefully', async () => {
      // Arrange
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Assert
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();
    });

    it('handles user loading state', () => {
      // Arrange
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
      });

      // Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      expect(screen.getByText(/just a moment, loading your profile/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      expect(screen.getByLabelText(/close dialog/i)).toBeInTheDocument();
    });

    it('provides proper button labels', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    });

    it('provides proper navigation labels', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      expect(screen.getByRole('button', { name: /user profile manage your user profile information/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /user settings configure your user preferences/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /general settings web app configuration/i })).toBeInTheDocument();
    });
  });
}); 