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

// Mock API
jest.mock('../../../convex/_generated/api', () => ({
  api: {
    users: {
      update: 'users.update',
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
  let mockUpdateUser: jest.Mock;

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
    mockUpdateUser = jest.fn().mockResolvedValue({ success: true });
    mockUseMutation = jest.fn().mockReturnValue(mockUpdateUser);
    mockUseQuery = jest.fn().mockReturnValue(null);

    // Setup dev mode mock
    mockUseDevMode = jest.fn().mockReturnValue({
      devMode: false,
      isAdmin: false,
      toggleDevMode: jest.fn(),
    });

    // Setup callbacks
    mockOnOpenChange = jest.fn();

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
      expect(screen.getByText('Developer')).toBeInTheDocument();
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
      expect(screen.getByText('General Settings')).toBeInTheDocument();
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
      expect(screen.getByText('Lecturer')).toBeInTheDocument();
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Software Engineering')).toBeInTheDocument();
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
      const avatar = screen.getByAltText('User avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('allows editing profile information', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Act
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Assert
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Lecturer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Computer Science')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Software Engineering')).toBeInTheDocument();
    });

    it('saves profile changes', async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = require('sonner');

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Act
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const nameInput = screen.getByDisplayValue('John Doe');
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Doe');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
      });
    });

    it('cancels profile editing', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Act
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const nameInput = screen.getByDisplayValue('John Doe');
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Doe');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Assert
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    it('handles avatar upload', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Act
      const avatarInput = screen.getByLabelText(/upload avatar/i);
      await user.upload(avatarInput, file);

      // Assert
      expect(avatarInput).toBeInTheDocument();
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
      expect(screen.getByText('Notification Settings')).toBeInTheDocument();
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    });

    it('toggles notification settings', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="settings"
        />
      );

      // Act
      const emailToggle = screen.getByLabelText(/email notifications/i);
      await user.click(emailToggle);

      // Assert
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
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    });

    it('saves settings changes', async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = require('sonner');

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="settings"
        />
      );

      // Act
      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Settings saved successfully');
      });
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
      expect(screen.getByText('General Settings')).toBeInTheDocument();
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      expect(screen.getByText('Show Tooltips')).toBeInTheDocument();
      expect(screen.getByText('Compact Mode')).toBeInTheDocument();
    });

    it('toggles general settings', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="general"
        />
      );

      // Act
      const keyboardShortcutsToggle = screen.getByLabelText(/keyboard shortcuts/i);
      await user.click(keyboardShortcutsToggle);

      // Assert
      expect(keyboardShortcutsToggle).toBeInTheDocument();
    });

    it('changes landing page preference', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="general"
        />
      );

      // Act
      const landingPageSelect = screen.getByLabelText(/landing page/i);
      await user.click(landingPageSelect);
      const dashboardOption = screen.getByText('Dashboard');
      await user.click(dashboardOption);

      // Assert
      expect(screen.getByDisplayValue('Dashboard')).toBeInTheDocument();
    });

    it('saves general settings', async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = require('sonner');

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="general"
        />
      );

      // Act
      const saveButton = screen.getByRole('button', { name: /save general settings/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('General settings saved successfully');
      });
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
      expect(screen.getByText('Lecturer Preferences')).toBeInTheDocument();
    });

    it('allows adding teaching interests', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="lecturer-preferences"
        />
      );

      // Act
      const interestInput = screen.getByPlaceholderText(/add teaching interest/i);
      await user.type(interestInput, 'Software Engineering');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      // Assert
      expect(screen.getByText('Software Engineering')).toBeInTheDocument();
    });

    it('removes teaching interests', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="lecturer-preferences"
        />
      );

      // Act
      const interestInput = screen.getByPlaceholderText(/add teaching interest/i);
      await user.type(interestInput, 'Software Engineering');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      // Assert
      expect(screen.queryByText('Software Engineering')).not.toBeInTheDocument();
    });

    it('saves lecturer preferences', async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = require('sonner');

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="lecturer-preferences"
        />
      );

      // Act
      const saveButton = screen.getByRole('button', { name: /save preferences/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Preferences saved successfully');
      });
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
      expect(screen.getByText('Developer Settings')).toBeInTheDocument();
    });

    it('toggles developer mode', async () => {
      // Arrange
      const user = userEvent.setup();
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

      // Act
      const devModeToggle = screen.getByLabelText(/developer mode/i);
      await user.click(devModeToggle);

      // Assert
      expect(mockToggleDevMode).toHaveBeenCalled();
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
      expect(screen.getByText('Experimental Features')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('switches between tabs', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Act
      const settingsTab = screen.getByText('Settings');
      await user.click(settingsTab);

      // Assert
      expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    });

    it('maintains tab state when switching', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Act
      const generalTab = screen.getByText('General');
      await user.click(generalTab);

      const profileTab = screen.getByText('Profile');
      await user.click(profileTab);

      const generalTabAgain = screen.getByText('General');
      await user.click(generalTabAgain);

      // Assert
      expect(screen.getByText('General Settings')).toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('closes modal when close button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Act
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Assert
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
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
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles save errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = require('sonner');
      mockUpdateUser.mockRejectedValue(new Error('Save failed'));

      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          initialTab="profile"
        />
      );

      // Act
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update profile');
      });
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
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
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
      expect(screen.getByLabelText(/upload avatar/i)).toBeInTheDocument();
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
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('provides proper tab labels', () => {
      // Arrange & Act
      render(
        <SettingsModal
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Assert
      expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /general/i })).toBeInTheDocument();
    });
  });
}); 