import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StaffEditModal from '@/components/modals/staff-edit-modal';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  deepEqual: jest.fn(),
  generateContractAndHours: jest.fn(),
  calculateTeachingHours: jest.fn(),
}));

// Test data
const createMockStaffMember = (overrides: any = {}) => ({
  fullName: 'Dr. John Doe',
  team: 'Mental Health',
  specialism: 'Psychiatry',
  contract: '1AP',
  email: 'j.doe@university.edu',
  role: 'Lecturer',
  fte: 1,
  totalContract: 1498,
  family: 'Academic Practitioner',
  allocatedTeachingHours: 0,
  maxTeachingHours: 1198,
  teachingAvailability: 1198,
  ...overrides,
});

describe('StaffEditModal Component', () => {
  let mockOnSave: jest.Mock;
  let mockOnClose: jest.Mock;
  let defaultStaffMember: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    mockOnSave = jest.fn();
    mockOnClose = jest.fn();
    defaultStaffMember = createMockStaffMember();
  });

  describe('Component Rendering', () => {
    it('renders modal with correct title', () => {
      // Arrange & Act
      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Assert
      expect(screen.getByText('Edit Staff Member')).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      // Arrange & Act
      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Assert
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/team/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/specialism/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/career family/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fte/i)).toBeInTheDocument();
    });

    it('populates form with staff member data', () => {
      // Arrange & Act
      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Assert
      expect(screen.getByDisplayValue('Dr. John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('j.doe@university.edu')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Mental Health')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Psychiatry')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Academic Practitioner')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Lecturer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    it('displays contract information', () => {
      // Arrange & Act
      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Assert
      expect(screen.getByText('Contract Information')).toBeInTheDocument();
      expect(screen.getByText('1AP')).toBeInTheDocument();
      expect(screen.getByText('1498')).toBeInTheDocument();
    });

    it('displays teaching capacity information', () => {
      // Arrange & Act
      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Assert
      expect(screen.getByText('Teaching Capacity')).toBeInTheDocument();
      expect(screen.getByText('1198')).toBeInTheDocument();
      expect(screen.getByText('1198')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      // Arrange
      const user = userEvent.setup();
      const staffMemberWithEmptyFields = createMockStaffMember({
        fullName: '',
        email: '',
        team: '',
        specialism: '',
      });

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={staffMemberWithEmptyFields}
        />
      );

      // Act
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/team is required/i)).toBeInTheDocument();
        expect(screen.getByText(/specialism is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      // Arrange
      const user = userEvent.setup();
      const staffMemberWithInvalidEmail = createMockStaffMember({
        email: 'invalid-email',
      });

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={staffMemberWithInvalidEmail}
        />
      );

      // Act
      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('validates FTE range', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const fteInput = screen.getByLabelText(/fte/i);
      await user.clear(fteInput);
      await user.type(fteInput, '2.5'); // Invalid FTE > 1.0

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/fte must be between 0.1 and 1.0/i)).toBeInTheDocument();
      });
    });

    it('validates FTE minimum value', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const fteInput = screen.getByLabelText(/fte/i);
      await user.clear(fteInput);
      await user.type(fteInput, '0.05'); // Invalid FTE < 0.1

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/fte must be between 0.1 and 1.0/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    it('updates form fields when user types', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Dr. Jane Smith');

      // Assert
      expect(screen.getByDisplayValue('Dr. Jane Smith')).toBeInTheDocument();
    });

    it('updates FTE and recalculates contract', async () => {
      // Arrange
      const user = userEvent.setup();
      const { generateContractAndHours } = require('@/lib/utils');
      generateContractAndHours.mockReturnValue({
        contract: '0.5AP',
        totalContract: 749,
      });

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const fteInput = screen.getByLabelText(/fte/i);
      await user.clear(fteInput);
      await user.type(fteInput, '0.5');

      // Assert
      await waitFor(() => {
        expect(generateContractAndHours).toHaveBeenCalledWith('Academic Practitioner', 0.5);
      });
    });

    it('updates career family and recalculates contract', async () => {
      // Arrange
      const user = userEvent.setup();
      const { generateContractAndHours } = require('@/lib/utils');
      generateContractAndHours.mockReturnValue({
        contract: '1TA',
        totalContract: 1498,
      });

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const familySelect = screen.getByLabelText(/career family/i);
      await user.click(familySelect);
      const teachingAcademicOption = screen.getByText('Teaching Academic (TA)');
      await user.click(teachingAcademicOption);

      // Assert
      await waitFor(() => {
        expect(generateContractAndHours).toHaveBeenCalledWith('Teaching Academic', 1);
      });
    });

    it('updates team selection', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const teamSelect = screen.getByLabelText(/team/i);
      await user.click(teamSelect);
      const computerScienceOption = screen.getByText('Computer Science');
      await user.click(computerScienceOption);

      // Assert
      expect(screen.getByDisplayValue('Computer Science')).toBeInTheDocument();
    });

    it('updates role selection', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const roleSelect = screen.getByLabelText(/role/i);
      await user.click(roleSelect);
      const seniorLecturerOption = screen.getByText('Senior Lecturer');
      await user.click(seniorLecturerOption);

      // Assert
      expect(screen.getByDisplayValue('Senior Lecturer')).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('calls onSave with updated data when form is valid', async () => {
      // Arrange
      const user = userEvent.setup();
      const { deepEqual } = require('@/lib/utils');
      deepEqual.mockReturnValue(false); // Indicates data has changed

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Dr. Jane Smith');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: 'Dr. Jane Smith',
          })
        );
      });
    });

    it('shows success toast when save is successful', async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = require('sonner');
      const { deepEqual } = require('@/lib/utils');
      deepEqual.mockReturnValue(false);

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Staff member updated successfully');
      });
    });

    it('does not call onSave when form is invalid', async () => {
      // Arrange
      const user = userEvent.setup();
      const staffMemberWithEmptyName = createMockStaffMember({
        fullName: '',
      });

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={staffMemberWithEmptyName}
        />
      );

      // Act
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Assert
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('does not call onSave when data has not changed', async () => {
      // Arrange
      const user = userEvent.setup();
      const { deepEqual } = require('@/lib/utils');
      deepEqual.mockReturnValue(true); // Indicates data has not changed

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Assert
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onClose when cancel button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Assert
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('resets form data when cancel is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Dr. Jane Smith');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Assert
      expect(screen.getByDisplayValue('Dr. John Doe')).toBeInTheDocument();
    });
  });

  describe('Career Family Calculations', () => {
    it('calculates contract correctly for Academic Practitioner', async () => {
      // Arrange
      const user = userEvent.setup();
      const { generateContractAndHours } = require('@/lib/utils');
      generateContractAndHours.mockReturnValue({
        contract: '1AP',
        totalContract: 1498,
      });

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const familySelect = screen.getByLabelText(/career family/i);
      await user.click(familySelect);
      const academicPractitionerOption = screen.getByText('Academic Practitioner (AP)');
      await user.click(academicPractitionerOption);

      // Assert
      await waitFor(() => {
        expect(generateContractAndHours).toHaveBeenCalledWith('Academic Practitioner', 1);
      });
    });

    it('calculates contract correctly for Teaching Academic', async () => {
      // Arrange
      const user = userEvent.setup();
      const { generateContractAndHours } = require('@/lib/utils');
      generateContractAndHours.mockReturnValue({
        contract: '1TA',
        totalContract: 1498,
      });

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const familySelect = screen.getByLabelText(/career family/i);
      await user.click(familySelect);
      const teachingAcademicOption = screen.getByText('Teaching Academic (TA)');
      await user.click(teachingAcademicOption);

      // Assert
      await waitFor(() => {
        expect(generateContractAndHours).toHaveBeenCalledWith('Teaching Academic', 1);
      });
    });

    it('calculates contract correctly for Research Academic', async () => {
      // Arrange
      const user = userEvent.setup();
      const { generateContractAndHours } = require('@/lib/utils');
      generateContractAndHours.mockReturnValue({
        contract: '1RA',
        totalContract: 1498,
      });

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const familySelect = screen.getByLabelText(/career family/i);
      await user.click(familySelect);
      const researchAcademicOption = screen.getByText('Research Academic (RA)');
      await user.click(researchAcademicOption);

      // Assert
      await waitFor(() => {
        expect(generateContractAndHours).toHaveBeenCalledWith('Research Academic', 1);
      });
    });
  });

  describe('Teaching Capacity Display', () => {
    it('displays allocated teaching hours', () => {
      // Arrange & Act
      const staffMemberWithAllocation = createMockStaffMember({
        allocatedTeachingHours: 500,
      });

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={staffMemberWithAllocation}
        />
      );

      // Assert
      expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('displays max teaching hours', () => {
      // Arrange & Act
      const staffMemberWithMaxHours = createMockStaffMember({
        maxTeachingHours: 1000,
      });

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={staffMemberWithMaxHours}
        />
      );

      // Assert
      expect(screen.getByText('1000')).toBeInTheDocument();
    });

    it('displays teaching availability', () => {
      // Arrange & Act
      const staffMemberWithAvailability = createMockStaffMember({
        teachingAvailability: 800,
      });

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={staffMemberWithAvailability}
        />
      );

      // Assert
      expect(screen.getByText('800')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles save errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = require('sonner');
      const { deepEqual } = require('@/lib/utils');
      deepEqual.mockReturnValue(false);
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Act
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update staff member');
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper labels for form fields', () => {
      // Arrange & Act
      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Assert
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/team/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/specialism/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/career family/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fte/i)).toBeInTheDocument();
    });

    it('provides proper button labels', () => {
      // Arrange & Act
      render(
        <StaffEditModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          staffMember={defaultStaffMember}
        />
      );

      // Assert
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });
}); 