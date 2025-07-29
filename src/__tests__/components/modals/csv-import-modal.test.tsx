import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CSVImportModal from '@/components/modals/csv-import-modal';

// Mock Convex hooks
jest.mock('convex/react', () => ({
  useMutation: jest.fn(),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock API
jest.mock('../../../convex/_generated/api', () => ({
  api: {
    modules: {
      bulkImport: 'modules.bulkImport',
    },
    module_iterations: {
      bulkImport: 'module_iterations.bulkImport',
    },
    lecturers: {
      bulkImport: 'lecturers.bulkImport',
    },
  },
}));

// Test data
const createMockCSVFile = (content: string, filename: string = 'test.csv'): File => {
  const blob = new Blob([content], { type: 'text/csv' });
  return new File([blob], filename, { type: 'text/csv' });
};

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
  ...overrides,
});

describe('CSVImportModal Component', () => {
  let mockImportModules: jest.Mock;
  let mockImportModuleIterations: jest.Mock;
  let mockImportLecturers: jest.Mock;
  let mockOnClose: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mutation mocks
    mockImportModules = jest.fn().mockResolvedValue({ success: true });
    mockImportModuleIterations = jest.fn().mockResolvedValue({ success: true });
    mockImportLecturers = jest.fn().mockResolvedValue({ success: true });

    const { useMutation } = require('convex/react');
    useMutation.mockImplementation((mutation) => {
      switch (mutation) {
        case 'modules.bulkImport':
          return mockImportModules;
        case 'module_iterations.bulkImport':
          return mockImportModuleIterations;
        case 'lecturers.bulkImport':
          return mockImportLecturers;
        default:
          return jest.fn();
      }
    });

    mockOnClose = jest.fn();
  });

  describe('Component Rendering', () => {
    it('renders modal with correct title for modules import', () => {
      // Arrange & Act
      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Assert
      expect(screen.getByText('Import Modules')).toBeInTheDocument();
    });

    it('renders modal with correct title for module iterations import', () => {
      // Arrange & Act
      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="module-iterations"
        />
      );

      // Assert
      expect(screen.getByText('Import Module Iterations')).toBeInTheDocument();
    });

    it('renders modal with correct title for lecturers import', () => {
      // Arrange & Act
      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="lecturers"
        />
      );

      // Assert
      expect(screen.getByText('Import Lecturers')).toBeInTheDocument();
    });

    it('renders file upload section', () => {
      // Arrange & Act
      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Assert
      expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
      expect(screen.getByText('Drag and drop a CSV file here, or click to browse')).toBeInTheDocument();
    });

    it('renders sample download section', () => {
      // Arrange & Act
      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Assert
      expect(screen.getByText('Download Sample CSV')).toBeInTheDocument();
    });

    it('renders required fields section', () => {
      // Arrange & Act
      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Assert
      expect(screen.getByText('Required Fields')).toBeInTheDocument();
    });
  });

  describe('File Upload Functionality', () => {
    it('accepts valid CSV file', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'code,title,credits\nCS101,Test Module,20';
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
      });
    });

    it('rejects non-CSV files', async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = require('sonner');
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      // Assert
      expect(toast.error).toHaveBeenCalledWith('Please select a valid CSV file');
    });

    it('parses CSV data correctly', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'code,title,credits\nCS101,Test Module,20\nCS102,Another Module,30';
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('CS101')).toBeInTheDocument();
        expect(screen.getByText('Test Module')).toBeInTheDocument();
        expect(screen.getByText('CS102')).toBeInTheDocument();
        expect(screen.getByText('Another Module')).toBeInTheDocument();
      });
    });
  });

  describe('Data Validation', () => {
    it('validates required fields for modules', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'code,title\nCS101,Test Module'; // Missing required fields
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/validation errors/i)).toBeInTheDocument();
      });
    });

    it('validates required fields for module iterations', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'moduleCode,title\nCS101,Test Module'; // Missing required fields
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="module-iterations"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/validation errors/i)).toBeInTheDocument();
      });
    });

    it('validates required fields for lecturers', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'fullName,email\nDr. John Doe,john@example.com'; // Missing required fields
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="lecturers"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/validation errors/i)).toBeInTheDocument();
      });
    });

    it('validates numeric fields', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'code,title,credits,level\nCS101,Test Module,invalid,4'; // Invalid credits
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/validation errors/i)).toBeInTheDocument();
      });
    });

    it('validates email format for lecturers', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'fullName,email,team,specialism,contract,role,fte\nDr. John Doe,invalid-email,Mental Health,Psychiatry,1AP,Lecturer,1';
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="lecturers"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/validation errors/i)).toBeInTheDocument();
      });
    });
  });

  describe('Field Mapping', () => {
    it('creates default mapping for CSV headers', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'module_code,module_title,credit_hours\nCS101,Test Module,20';
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Field Mapping')).toBeInTheDocument();
      });
    });

    it('allows custom field mapping', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'custom_code,custom_title,custom_credits\nCS101,Test Module,20';
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Field Mapping')).toBeInTheDocument();
        expect(screen.getByText('custom_code')).toBeInTheDocument();
      });
    });
  });

  describe('Import Process', () => {
    it('imports modules successfully', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'code,title,credits,level,moduleLeader,defaultTeachingHours,defaultMarkingHours\nCS101,Test Module,20,4,Dr. Smith,40,10';
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
      });

      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);

      // Assert
      await waitFor(() => {
        expect(mockImportModules).toHaveBeenCalled();
      });
    });

    it('imports module iterations successfully', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'moduleCode,title,semester,cohortId,teachingStartDate,teachingHours,markingHours\nCS101,Test Module,1,2024-25,2024-09-23,40,10';
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="module-iterations"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
      });

      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);

      // Assert
      await waitFor(() => {
        expect(mockImportModuleIterations).toHaveBeenCalled();
      });
    });

    it('imports lecturers successfully', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'fullName,team,specialism,contract,email,capacity,maxTeachingHours,role\nDr. John Doe,Mental Health,Psychiatry,1AP,john@example.com,1198,1198,Lecturer';
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="lecturers"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
      });

      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);

      // Assert
      await waitFor(() => {
        expect(mockImportLecturers).toHaveBeenCalled();
      });
    });

    it('shows progress during import', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'code,title,credits,level,moduleLeader,defaultTeachingHours,defaultMarkingHours\nCS101,Test Module,20,4,Dr. Smith,40,10';
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
      });

      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/importing/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sample Download', () => {
    it('downloads sample CSV for modules', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockDownload = jest.fn();
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const downloadButton = screen.getByRole('button', { name: /download sample/i });
      await user.click(downloadButton);

      // Assert
      expect(downloadButton).toBeInTheDocument();
    });

    it('downloads sample CSV for module iterations', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="module-iterations"
        />
      );

      // Act
      const downloadButton = screen.getByRole('button', { name: /download sample/i });
      await user.click(downloadButton);

      // Assert
      expect(downloadButton).toBeInTheDocument();
    });

    it('downloads sample CSV for lecturers', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="lecturers"
        />
      );

      // Act
      const downloadButton = screen.getByRole('button', { name: /download sample/i });
      await user.click(downloadButton);

      // Assert
      expect(downloadButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles import errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      mockImportModules.mockRejectedValue(new Error('Import failed'));
      const csvContent = 'code,title,credits,level,moduleLeader,defaultTeachingHours,defaultMarkingHours\nCS101,Test Module,20,4,Dr. Smith,40,10';
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
      });

      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('handles file parsing errors', async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = require('sonner');
      const file = new File(['invalid,csv,content\nwith,malformed'], 'test.csv', { type: 'text/csv' });

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      // Assert
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('Modal Interactions', () => {
    it('closes modal when close button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Assert
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('resets form when reset button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const csvContent = 'code,title,credits,level,moduleLeader,defaultTeachingHours,defaultMarkingHours\nCS101,Test Module,20,4,Dr. Smith,40,10';
      const file = createMockCSVFile(csvContent);

      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Act
      const fileInput = screen.getByLabelText(/upload csv file/i);
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
      });

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Assert
      expect(screen.getByText('Drag and drop a CSV file here, or click to browse')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels for file input', () => {
      // Arrange & Act
      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Assert
      expect(screen.getByLabelText(/upload csv file/i)).toBeInTheDocument();
    });

    it('provides proper button labels', () => {
      // Arrange & Act
      render(
        <CSVImportModal
          isOpen={true}
          onClose={mockOnClose}
          importType="modules"
        />
      );

      // Assert
      expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download sample/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
  });
}); 