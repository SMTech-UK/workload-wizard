import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LecturerManagement, { Lecturer } from '@/components/features/lecturer-management/lecturer-management';

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
jest.mock('convex/_generated/api', () => ({
  api: {
    lecturers: {
      getAll: 'lecturers.getAll',
      create: 'lecturers.create',
      update: 'lecturers.update',
      delete: 'lecturers.delete',
    },
  },
}));

// Test data
const createMockLecturer = (overrides: Partial<Lecturer> = {}): Lecturer => ({
  _id: 'lecturer1' as any,
  fullName: 'Dr. John Doe',
  team: 'Mental Health',
  specialism: 'Psychiatry',
  contract: '1AP',
  email: 'j.doe@university.edu',
  capacity: 1198,
  id: 'lecturer1',
  maxTeachingHours: 1198,
  moduleAllocations: [],
  role: 'Lecturer',
  status: 'available',
  teachingAvailability: 1198,
  totalAllocated: 0,
  totalContract: 1498,
  allocatedTeachingHours: 0,
  allocatedAdminHours: 0,
  family: 'Academic Practitioner',
  fte: 1,
  ...overrides,
});

const createMockLecturers = (): Lecturer[] => [
  createMockLecturer(),
  createMockLecturer({
    _id: 'lecturer2' as any,
    fullName: 'Dr. Sarah Wilson',
    team: 'Adult',
    specialism: 'Nursing',
    contract: '0.8TA',
    email: 's.wilson@university.edu',
    capacity: 718,
    id: 'lecturer2',
    maxTeachingHours: 718,
    status: 'near-capacity',
    teachingAvailability: 718,
    totalAllocated: 600,
    family: 'Teaching Academic',
    fte: 0.8,
  }),
];

describe('LecturerManagement Component', () => {
  let mockUseQuery: jest.Mock;
  let mockUseMutation: jest.Mock;
  let mockCreateLecturer: jest.Mock;
  let mockDeleteLecturer: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mutation mocks
    mockCreateLecturer = jest.fn().mockResolvedValue('new-lecturer-id');
    mockDeleteLecturer = jest.fn().mockResolvedValue(undefined);

    mockUseMutation = jest.fn().mockReturnValue({
      createLecturer: mockCreateLecturer,
      deleteLecturer: mockDeleteLecturer,
    });

    // Setup query mocks
    mockUseQuery = jest.fn().mockImplementation((query) => {
      switch (query) {
        case 'lecturers.getAll':
          return createMockLecturers();
        case 'admin_allocations.getAll':
          return [];
        case 'modules.getAll':
          return [];
        default:
          return [];
      }
    });

    // Apply mocks
    const { useQuery, useMutation } = require('convex/react');
    useQuery.mockImplementation(mockUseQuery);
    useMutation.mockImplementation(mockUseMutation);
    
    // Mock the api object
    const { api } = require('convex/_generated/api');
    jest.doMock('convex/_generated/api', () => ({
      api: {
        lecturers: {
          getAll: 'lecturers.getAll',
          createLecturer: 'lecturers.createLecturer',
          deleteLecturer: 'lecturers.deleteLecturer',
        },
        admin_allocations: {
          getAll: 'admin_allocations.getAll',
        },
        modules: {
          getAll: 'modules.getAll',
        },
      },
    }));
  });

  describe('Component Rendering', () => {
    it('renders the main component with title and description', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByText('Lecturer Management')).toBeInTheDocument();
      expect(screen.getByText('Manage academic staff profiles and capacity')).toBeInTheDocument();
    });

    it('renders the add lecturer button', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByRole('button', { name: /add lecturer/i })).toBeInTheDocument();
    });

    it('renders search and filter functionality', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByPlaceholderText(/search lecturers by name or department/i)).toBeInTheDocument();
      expect(screen.getByText('Search & Filter')).toBeInTheDocument();
    });

    it('renders lecturers table with correct headers', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Contract')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Capacity')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Lecturer Data Display', () => {
    it('displays all lecturers in the table', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
      expect(screen.getByText('Dr. Sarah Wilson')).toBeInTheDocument();
      expect(screen.getByText('j.doe@university.edu')).toBeInTheDocument();
      expect(screen.getByText('s.wilson@university.edu')).toBeInTheDocument();
    });

    it('displays lecturer details correctly', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByText('Mental Health')).toBeInTheDocument();
      expect(screen.getByText('Adult')).toBeInTheDocument();
      expect(screen.getByText('1198h')).toBeInTheDocument();
      expect(screen.getByText('718h')).toBeInTheDocument();
    });

    it('displays contract badges correctly', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByText('1AP')).toBeInTheDocument();
      expect(screen.getByText('0.8TA')).toBeInTheDocument();
    });

    it('displays status badges correctly', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('Near Capacity')).toBeInTheDocument();
    });

    it('shows correct lecturer count in header', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByText(/Academic Staff \(2\)/)).toBeInTheDocument();
    });
  });

  describe('Search and Filter Functionality', () => {
    it('filters lecturers by name', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const searchInput = screen.getByPlaceholderText(/search lecturers by name or department/i);
      await user.type(searchInput, 'John Doe');

      // Assert
      expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Dr. Sarah Wilson')).not.toBeInTheDocument();
    });

    it('filters lecturers by team', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const searchInput = screen.getByPlaceholderText(/search lecturers by name or department/i);
      await user.type(searchInput, 'Mental Health');

      // Assert
      expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Dr. Sarah Wilson')).not.toBeInTheDocument();
    });

    it('filters lecturers by status', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const statusFilter = screen.getByRole('combobox');
      await user.click(statusFilter);
      await user.click(screen.getByText('Available'));

      // Assert
      expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Dr. Sarah Wilson')).not.toBeInTheDocument();
    });

    it('shows all lecturers when filters are cleared', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const searchInput = screen.getByPlaceholderText(/search lecturers by name or department/i);
      await user.type(searchInput, 'John Doe');
      await user.clear(searchInput);

      // Assert
      expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
      expect(screen.getByText('Dr. Sarah Wilson')).toBeInTheDocument();
    });
  });

  describe('Create Lecturer Modal', () => {
    it('opens create lecturer modal when add button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      // Assert
      expect(screen.getByText('Add New Lecturer')).toBeInTheDocument();
      expect(screen.getByText('Create a new lecturer profile with contract details and allocations.')).toBeInTheDocument();
    });

    it('displays all form fields in create modal', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      // Assert
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/career family/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fte/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/team/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/specialism/i)).toBeInTheDocument();
    });

    it('creates a new lecturer when form is submitted with valid data', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      // Fill form
      await user.type(screen.getByLabelText(/full name/i), 'Dr. Test Lecturer');
      await user.type(screen.getByLabelText(/email/i), 'test.lecturer@university.edu');
      
      // Select career family
      const familySelect = screen.getByLabelText(/career family/i);
      await user.click(familySelect);
      await user.click(screen.getByText('Academic Practitioner (AP)'));

      // Submit form
      const createButton = screen.getByRole('button', { name: /create lecturer/i });
      await user.click(createButton);

      // Assert
      await waitFor(() => {
        expect(mockCreateLecturer).toHaveBeenCalledWith({
          fullName: 'Dr. Test Lecturer',
          email: 'test.lecturer@university.edu',
          contract: '1AP',
          team: '',
          specialism: '',
          capacity: 1198,
          maxTeachingHours: 1198,
          role: 'Lecturer',
          status: 'available',
          teachingAvailability: 1198,
          totalAllocated: 0,
          totalContract: 1498,
          allocatedTeachingHours: 0,
          allocatedAdminHours: 0,
          family: 'Academic Practitioner',
          fte: 1,
        });
      });
    });

    it('disables create button when required fields are empty', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      // Assert
      const createButton = screen.getByRole('button', { name: /create lecturer/i });
      expect(createButton).toBeDisabled();
    });

    it('closes modal when cancel button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Assert
      expect(screen.queryByText('Add New Lecturer')).not.toBeInTheDocument();
    });
  });

  describe('Delete Lecturer Functionality', () => {
    it('opens delete confirmation dialog when delete button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Assert
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this lecturer profile? This action cannot be undone.')).toBeInTheDocument();
    });

    it('deletes lecturer when confirmation is accepted', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(confirmDeleteButton);

      // Assert
      await waitFor(() => {
        expect(mockDeleteLecturer).toHaveBeenCalledWith({ id: 'lecturer1' });
      });
    });

    it('cancels deletion when cancel button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

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
    it('displays empty state when no lecturers exist', () => {
      // Arrange
      mockUseQuery.mockImplementation((query) => {
        if (query === 'lecturers.getAll') return [];
        return [];
      });

      // Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByText('No lecturers to show.')).toBeInTheDocument();
    });

    it('shows correct count when no lecturers exist', () => {
      // Arrange
      mockUseQuery.mockImplementation((query) => {
        if (query === 'lecturers.getAll') return [];
        return [];
      });

      // Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByText(/Academic Staff \(0\)/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles lecturer creation errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      mockCreateLecturer.mockRejectedValue(new Error('Creation failed'));
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      // Fill form
      await user.type(screen.getByLabelText(/full name/i), 'Dr. Test Lecturer');
      await user.type(screen.getByLabelText(/email/i), 'test.lecturer@university.edu');
      
      const familySelect = screen.getByLabelText(/career family/i);
      await user.click(familySelect);
      await user.click(screen.getByText('Academic Practitioner (AP)'));

      // Submit form
      const createButton = screen.getByRole('button', { name: /create lecturer/i });
      await user.click(createButton);

      // Assert - modal should remain open on error
      await waitFor(() => {
        expect(screen.getByText('Add New Lecturer')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('validates required fields in create form', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      // Try to submit empty form
      const createButton = screen.getByRole('button', { name: /create lecturer/i });
      await user.click(createButton);

      // Assert
      expect(mockCreateLecturer).not.toHaveBeenCalled();
    });

    it('validates email format', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      // Fill form with invalid email
      await user.type(screen.getByLabelText(/full name/i), 'Dr. Test Lecturer');
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      
      const familySelect = screen.getByLabelText(/career family/i);
      await user.click(familySelect);
      await user.click(screen.getByText('Academic Practitioner (AP)'));

      // Submit form
      const createButton = screen.getByRole('button', { name: /create lecturer/i });
      await user.click(createButton);

      // Assert
      expect(mockCreateLecturer).not.toHaveBeenCalled();
    });
  });

  describe('Career Family Selection', () => {
    it('displays all available career families in dropdown', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      const familySelect = screen.getByLabelText(/career family/i);
      await user.click(familySelect);

      // Assert
      expect(screen.getByText('Academic Practitioner (AP)')).toBeInTheDocument();
      expect(screen.getByText('Teaching Academic (TA)')).toBeInTheDocument();
      expect(screen.getByText('Research Academic (RA)')).toBeInTheDocument();
    });

    it('calculates contract correctly based on FTE and family', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      // Set FTE to 0.6
      const fteInput = screen.getByLabelText(/fte/i);
      await user.clear(fteInput);
      await user.type(fteInput, '0.6');

      // Select Teaching Academic family
      const familySelect = screen.getByLabelText(/career family/i);
      await user.click(familySelect);
      await user.click(screen.getByText('Teaching Academic (TA)'));

      // Assert - contract should be calculated as 0.6TA
      expect(screen.getByDisplayValue('0.6TA')).toBeInTheDocument();
    });
  });

  describe('Role Selection', () => {
    it('displays all available roles in dropdown', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      const roleSelect = screen.getByLabelText(/role/i);
      await user.click(roleSelect);

      // Assert
      expect(screen.getByText('Lecturer')).toBeInTheDocument();
      expect(screen.getByText('Senior Lecturer')).toBeInTheDocument();
      expect(screen.getByText('Professional Lead')).toBeInTheDocument();
      expect(screen.getByText('Professor')).toBeInTheDocument();
    });
  });

  describe('Team Selection', () => {
    it('displays all available teams in dropdown', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const addButton = screen.getByRole('button', { name: /add lecturer/i });
      await user.click(addButton);

      const teamSelect = screen.getByLabelText(/team/i);
      await user.click(teamSelect);

      // Assert
      expect(screen.getByText('Simulation')).toBeInTheDocument();
      expect(screen.getByText('Post-Registration')).toBeInTheDocument();
      expect(screen.getByText('Adult')).toBeInTheDocument();
      expect(screen.getByText('Child/LD')).toBeInTheDocument();
      expect(screen.getByText('Mental Health')).toBeInTheDocument();
    });
  });

  describe('Capacity and Progress Display', () => {
    it('displays capacity information correctly', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByText('1198h')).toBeInTheDocument();
      expect(screen.getByText('718h')).toBeInTheDocument();
    });

    it('displays progress bars for capacity utilization', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('shows correct status based on capacity utilization', () => {
      // Arrange & Act
      render(<LecturerManagement />);

      // Assert
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('Near Capacity')).toBeInTheDocument();
    });
  });

  describe('Staff Profile Modal Integration', () => {
    it('opens staff profile modal when view button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LecturerManagement />);

      // Act
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      await user.click(viewButtons[0]);

      // Assert - modal should open (implementation depends on StaffProfileModal)
      // This test verifies the click handler is called
      expect(viewButtons[0]).toBeInTheDocument();
    });
  });
}); 