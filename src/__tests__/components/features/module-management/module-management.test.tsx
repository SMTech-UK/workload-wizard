import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModuleManagement, { Module } from '@/components/features/module-management/module-management';

// Mock Convex hooks
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      fullName: 'Test User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
    },
  }),
}));

// Mock recent activity hook
jest.mock('@/lib/recentActivity', () => ({
  useLogRecentActivity: () => jest.fn(),
}));

// Mock API
jest.mock('../../../../convex/_generated/api', () => ({
  api: {
    modules: {
      getAll: 'modules.getAll',
      createModule: 'modules.createModule',
      updateModule: 'modules.updateModule',
      deleteModule: 'modules.deleteModule',
    },
  },
}));

// Test data
const createMockModule = (overrides: Partial<Module> = {}): Module => ({
  _id: 'module1' as any,
  code: 'NS70133X',
  title: 'Effective and Creative Mental Health Care',
  credits: 20,
  level: 7,
  moduleLeader: 'Dr. Michael Johnson',
  defaultTeachingHours: 120,
  defaultMarkingHours: 40,
  ...overrides,
});

const createMockModules = (): Module[] => [
  createMockModule(),
  createMockModule({
    _id: 'module2' as any,
    code: 'NS70134Y',
    title: 'Advanced Nursing Practice',
    credits: 30,
    level: 6,
    moduleLeader: 'Dr. Sarah Wilson',
    defaultTeachingHours: 150,
    defaultMarkingHours: 50,
  }),
];

describe('ModuleManagement Component', () => {
  let mockUseQuery: jest.Mock;
  let mockUseMutation: jest.Mock;
  let mockCreateModule: jest.Mock;
  let mockUpdateModule: jest.Mock;
  let mockDeleteModule: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mutation mocks
    mockCreateModule = jest.fn().mockResolvedValue('new-module-id');
    mockUpdateModule = jest.fn().mockResolvedValue(undefined);
    mockDeleteModule = jest.fn().mockResolvedValue(undefined);

    mockUseMutation = jest.fn().mockReturnValue({
      createModule: mockCreateModule,
      updateModule: mockUpdateModule,
      deleteModule: mockDeleteModule,
    });

    // Setup query mock
    mockUseQuery = jest.fn().mockReturnValue(createMockModules());

    // Apply mocks
    const { useQuery, useMutation } = require('convex/react');
    useQuery.mockImplementation(mockUseQuery);
    useMutation.mockImplementation(mockUseMutation);
  });

  describe('Component Rendering', () => {
    it('renders the main component with title and description', () => {
      // Arrange & Act
      render(<ModuleManagement />);

      // Assert
      expect(screen.getByText('Module Management')).toBeInTheDocument();
      expect(screen.getByText('Manage academic modules and their configurations')).toBeInTheDocument();
    });

    it('renders the add module button', () => {
      // Arrange & Act
      render(<ModuleManagement />);

      // Assert
      expect(screen.getByRole('button', { name: /add module/i })).toBeInTheDocument();
    });

    it('renders search functionality', () => {
      // Arrange & Act
      render(<ModuleManagement />);

      // Assert
      expect(screen.getByPlaceholderText(/search modules by code, title, or module leader/i)).toBeInTheDocument();
    });

    it('renders modules table with correct headers', () => {
      // Arrange & Act
      render(<ModuleManagement />);

      // Assert
      expect(screen.getByText('Code')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Level')).toBeInTheDocument();
      expect(screen.getByText('Credits')).toBeInTheDocument();
      expect(screen.getByText('Module Leader')).toBeInTheDocument();
      expect(screen.getByText('Teaching Hours')).toBeInTheDocument();
      expect(screen.getByText('Marking Hours')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Module Data Display', () => {
    it('displays all modules in the table', () => {
      // Arrange & Act
      render(<ModuleManagement />);

      // Assert
      expect(screen.getByText('NS70133X')).toBeInTheDocument();
      expect(screen.getByText('NS70134Y')).toBeInTheDocument();
      expect(screen.getByText('Effective and Creative Mental Health Care')).toBeInTheDocument();
      expect(screen.getByText('Advanced Nursing Practice')).toBeInTheDocument();
    });

    it('displays module details correctly', () => {
      // Arrange & Act
      render(<ModuleManagement />);

      // Assert
      expect(screen.getByText('Dr. Michael Johnson')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('120h')).toBeInTheDocument();
      expect(screen.getByText('40h')).toBeInTheDocument();
    });

    it('displays level badges correctly', () => {
      // Arrange & Act
      render(<ModuleManagement />);

      // Assert
      expect(screen.getByText('Level 7')).toBeInTheDocument();
      expect(screen.getByText('Level 6')).toBeInTheDocument();
    });

    it('shows correct module count in header', () => {
      // Arrange & Act
      render(<ModuleManagement />);

      // Assert
      expect(screen.getByText(/Academic Modules \(2\)/)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters modules by code', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const searchInput = screen.getByPlaceholderText(/search modules by code, title, or module leader/i);
      await user.type(searchInput, 'NS70133X');

      // Assert
      expect(screen.getByText('NS70133X')).toBeInTheDocument();
      expect(screen.queryByText('NS70134Y')).not.toBeInTheDocument();
    });

    it('filters modules by title', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const searchInput = screen.getByPlaceholderText(/search modules by code, title, or module leader/i);
      await user.type(searchInput, 'Mental Health');

      // Assert
      expect(screen.getByText('Effective and Creative Mental Health Care')).toBeInTheDocument();
      expect(screen.queryByText('Advanced Nursing Practice')).not.toBeInTheDocument();
    });

    it('filters modules by module leader', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const searchInput = screen.getByPlaceholderText(/search modules by code, title, or module leader/i);
      await user.type(searchInput, 'Michael Johnson');

      // Assert
      expect(screen.getByText('Dr. Michael Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Dr. Sarah Wilson')).not.toBeInTheDocument();
    });

    it('shows all modules when search is cleared', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const searchInput = screen.getByPlaceholderText(/search modules by code, title, or module leader/i);
      await user.type(searchInput, 'NS70133X');
      await user.clear(searchInput);

      // Assert
      expect(screen.getByText('NS70133X')).toBeInTheDocument();
      expect(screen.getByText('NS70134Y')).toBeInTheDocument();
    });
  });

  describe('Create Module Modal', () => {
    it('opens create module modal when add button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add module/i });
      await user.click(addButton);

      // Assert
      expect(screen.getByText('Add New Module')).toBeInTheDocument();
      expect(screen.getByText('Create a new module with details and default hours.')).toBeInTheDocument();
    });

    it('displays all form fields in create modal', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add module/i });
      await user.click(addButton);

      // Assert
      expect(screen.getByLabelText(/module code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/module title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/credits/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/module leader/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/default teaching hours/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/default marking hours/i)).toBeInTheDocument();
    });

    it('creates a new module when form is submitted with valid data', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add module/i });
      await user.click(addButton);

      // Fill form
      await user.type(screen.getByLabelText(/module code/i), 'NS70135Z');
      await user.type(screen.getByLabelText(/module title/i), 'Test Module');
      await user.type(screen.getByLabelText(/module leader/i), 'Dr. Test Leader');

      // Submit form
      const createButton = screen.getByRole('button', { name: /create module/i });
      await user.click(createButton);

      // Assert
      await waitFor(() => {
        expect(mockCreateModule).toHaveBeenCalledWith({
          code: 'NS70135Z',
          title: 'Test Module',
          credits: 20,
          level: 7,
          moduleLeader: 'Dr. Test Leader',
          defaultTeachingHours: 120,
          defaultMarkingHours: 40,
        });
      });
    });

    it('disables create button when required fields are empty', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add module/i });
      await user.click(addButton);

      // Assert
      const createButton = screen.getByRole('button', { name: /create module/i });
      expect(createButton).toBeDisabled();
    });

    it('closes modal when cancel button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add module/i });
      await user.click(addButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Assert
      expect(screen.queryByText('Add New Module')).not.toBeInTheDocument();
    });
  });

  describe('Edit Module Modal', () => {
    it('opens edit modal when edit button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      // Assert
      expect(screen.getByText('Edit Module')).toBeInTheDocument();
      expect(screen.getByDisplayValue('NS70133X')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Effective and Creative Mental Health Care')).toBeInTheDocument();
    });

    it('populates form with existing module data', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      // Assert
      expect(screen.getByDisplayValue('NS70133X')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Effective and Creative Mental Health Care')).toBeInTheDocument();
      expect(screen.getByDisplayValue('20')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Dr. Michael Johnson')).toBeInTheDocument();
    });

    it('updates module when form is submitted', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      // Update form
      const titleInput = screen.getByDisplayValue('Effective and Creative Mental Health Care');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Module Title');

      // Submit form
      const updateButton = screen.getByRole('button', { name: /update module/i });
      await user.click(updateButton);

      // Assert
      await waitFor(() => {
        expect(mockUpdateModule).toHaveBeenCalledWith({
          id: 'module1',
          code: 'NS70133X',
          title: 'Updated Module Title',
          credits: 20,
          level: 7,
          moduleLeader: 'Dr. Michael Johnson',
          defaultTeachingHours: 120,
          defaultMarkingHours: 40,
        });
      });
    });
  });

  describe('Delete Module Functionality', () => {
    it('opens delete confirmation dialog when delete button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Assert
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this module? This action cannot be undone.')).toBeInTheDocument();
    });

    it('deletes module when confirmation is accepted', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(confirmDeleteButton);

      // Assert
      await waitFor(() => {
        expect(mockDeleteModule).toHaveBeenCalledWith({ id: 'module1' });
      });
    });

    it('cancels deletion when cancel button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Assert
      expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
    });
  });

  describe('Empty State Handling', () => {
    it('displays empty state when no modules exist', () => {
      // Arrange
      mockUseQuery.mockReturnValue([]);

      // Act
      render(<ModuleManagement />);

      // Assert
      expect(screen.getByText('No modules to show.')).toBeInTheDocument();
    });

    it('shows correct count when no modules exist', () => {
      // Arrange
      mockUseQuery.mockReturnValue([]);

      // Act
      render(<ModuleManagement />);

      // Assert
      expect(screen.getByText(/Academic Modules \(0\)/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles module creation errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      mockCreateModule.mockRejectedValue(new Error('Creation failed'));
      render(<ModuleManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add module/i });
      await user.click(addButton);

      // Fill form
      await user.type(screen.getByLabelText(/module code/i), 'NS70135Z');
      await user.type(screen.getByLabelText(/module title/i), 'Test Module');
      await user.type(screen.getByLabelText(/module leader/i), 'Dr. Test Leader');

      // Submit form
      const createButton = screen.getByRole('button', { name: /create module/i });
      await user.click(createButton);

      // Assert - modal should remain open on error
      await waitFor(() => {
        expect(screen.getByText('Add New Module')).toBeInTheDocument();
      });
    });

    it('handles module update errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      mockUpdateModule.mockRejectedValue(new Error('Update failed'));
      render(<ModuleManagement />);

      // Act
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      const updateButton = screen.getByRole('button', { name: /update module/i });
      await user.click(updateButton);

      // Assert - modal should remain open on error
      await waitFor(() => {
        expect(screen.getByText('Edit Module')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('validates required fields in create form', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add module/i });
      await user.click(addButton);

      // Try to submit empty form
      const createButton = screen.getByRole('button', { name: /create module/i });
      await user.click(createButton);

      // Assert
      expect(mockCreateModule).not.toHaveBeenCalled();
    });

    it('validates required fields in edit form', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      // Clear required field
      const titleInput = screen.getByDisplayValue('Effective and Creative Mental Health Care');
      await user.clear(titleInput);

      // Try to submit form
      const updateButton = screen.getByRole('button', { name: /update module/i });
      await user.click(updateButton);

      // Assert
      expect(mockUpdateModule).not.toHaveBeenCalled();
    });
  });

  describe('Level Selection', () => {
    it('displays all available levels in dropdown', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add module/i });
      await user.click(addButton);

      const levelSelect = screen.getByLabelText(/level/i);
      await user.click(levelSelect);

      // Assert
      expect(screen.getByText('Level 4')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
      expect(screen.getByText('Level 6')).toBeInTheDocument();
      expect(screen.getByText('Level 7')).toBeInTheDocument();
    });

    it('selects level correctly', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ModuleManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add module/i });
      await user.click(addButton);

      const levelSelect = screen.getByLabelText(/level/i);
      await user.click(levelSelect);
      await user.click(screen.getByText('Level 5'));

      // Assert
      expect(levelSelect).toHaveValue('5');
    });
  });
}); 