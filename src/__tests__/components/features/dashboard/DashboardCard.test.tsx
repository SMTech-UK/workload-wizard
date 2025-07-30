import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardCard, DashboardCardData } from '@/components/features/dashboard/DashboardCard';
import { Bell, Users, BookOpen, AlertTriangle } from 'lucide-react';

// Test data following AAA pattern (Arrange)
const createMockCardData = (overrides: Partial<DashboardCardData> = {}): DashboardCardData => ({
  title: 'Total Students',
  value: 1250,
  subtitle: 'Enrolled this semester',
  icon: <Users className="w-5 h-5 text-blue-600" data-testid="users-icon" />,
  highlight: false,
  order: 1,
  ...overrides
});

describe('DashboardCard Component', () => {
  describe('Basic Rendering', () => {
    it('renders all required elements with complete data', () => {
      // Arrange
      const cardData = createMockCardData();
      
      // Act
      render(<DashboardCard {...cardData} />);
      
      // Assert
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('1250')).toBeInTheDocument();
      expect(screen.getByText('Enrolled this semester')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });

    it('renders minimal data without optional elements', () => {
      // Arrange
      const minimalData = createMockCardData({
        subtitle: undefined,
        icon: undefined
      });
      
      // Act
      render(<DashboardCard {...minimalData} />);
      
      // Assert
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('1250')).toBeInTheDocument();
      expect(screen.queryByText('Enrolled this semester')).not.toBeInTheDocument();
      expect(screen.queryByTestId('users-icon')).not.toBeInTheDocument();
    });
  });

  describe('Highlight Styling', () => {
    it('applies red text color when highlight is true', () => {
      // Arrange
      const highlightData = createMockCardData({ highlight: true });
      
      // Act
      render(<DashboardCard {...highlightData} />);
      
      // Assert
      const valueElement = screen.getByText('1250');
      expect(valueElement).toHaveClass('text-red-600');
    });

    it('does not apply red text color when highlight is false', () => {
      // Arrange
      const normalData = createMockCardData({ highlight: false });
      
      // Act
      render(<DashboardCard {...normalData} />);
      
      // Assert
      const valueElement = screen.getByText('1250');
      expect(valueElement).not.toHaveClass('text-red-600');
    });

    it('handles undefined highlight prop gracefully', () => {
      // Arrange
      const undefinedHighlightData = createMockCardData({ highlight: undefined });
      
      // Act
      render(<DashboardCard {...undefinedHighlightData} />);
      
      // Assert
      const valueElement = screen.getByText('1250');
      expect(valueElement).not.toHaveClass('text-red-600');
    });
  });

  describe('Value Types', () => {
    it('renders numeric values correctly', () => {
      // Arrange
      const numericData = createMockCardData({ value: 42 });
      
      // Act
      render(<DashboardCard {...numericData} />);
      
      // Assert
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders string values correctly', () => {
      // Arrange
      const stringData = createMockCardData({ value: 'Active' });
      
      // Act
      render(<DashboardCard {...stringData} />);
      
      // Assert
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders zero values correctly', () => {
      // Arrange
      const zeroData = createMockCardData({ value: 0 });
      
      // Act
      render(<DashboardCard {...zeroData} />);
      
      // Assert
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders empty string values', () => {
      // Arrange
      const emptyData = createMockCardData({ value: '' });
      
      // Act
      render(<DashboardCard {...emptyData} />);
      
      // Assert
      const valueElement = screen.getByText('Total Students').closest('div')?.parentElement?.querySelector('.text-3xl');
      expect(valueElement).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('renders complex icon components with custom styling', () => {
      // Arrange
      const complexIconData = createMockCardData({
        icon: <BookOpen className="w-6 h-6 text-green-600" data-testid="book-icon" />
      });
      
      // Act
      render(<DashboardCard {...complexIconData} />);
      
      // Assert
      expect(screen.getByTestId('book-icon')).toBeInTheDocument();
      expect(screen.getByTestId('book-icon')).toHaveClass('w-6', 'h-6', 'text-green-600');
    });

    it('renders alert icons for warning states', () => {
      // Arrange
      const alertIconData = createMockCardData({
        icon: <AlertTriangle className="w-5 h-5 text-orange-600" data-testid="alert-icon" />
      });
      
      // Act
      render(<DashboardCard {...alertIconData} />);
      
      // Assert
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
      expect(screen.getByTestId('alert-icon')).toHaveClass('text-orange-600');
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct base card styling classes', () => {
      // Arrange
      const cardData = createMockCardData();
      
      // Act
      render(<DashboardCard {...cardData} />);
      
      // Assert
      const cardElement = screen.getByText('Total Students').closest('div')?.parentElement;
      expect(cardElement).toHaveClass('rounded-lg', 'border', 'p-6', 'bg-white', 'shadow-sm');
    });

    it('renders title with correct typography classes', () => {
      // Arrange
      const cardData = createMockCardData();
      
      // Act
      render(<DashboardCard {...cardData} />);
      
      // Assert
      const titleElement = screen.getByText('Total Students');
      expect(titleElement).toHaveClass('font-medium', 'text-gray-900');
    });

    it('renders value with correct typography classes', () => {
      // Arrange
      const cardData = createMockCardData();
      
      // Act
      render(<DashboardCard {...cardData} />);
      
      // Assert
      const valueElement = screen.getByText('1250');
      expect(valueElement).toHaveClass('text-3xl', 'font-bold');
    });

    it('renders subtitle with correct styling when present', () => {
      // Arrange
      const cardData = createMockCardData();
      
      // Act
      render(<DashboardCard {...cardData} />);
      
      // Assert
      const subtitleElement = screen.getByText('Enrolled this semester');
      expect(subtitleElement).toHaveClass('text-xs', 'text-gray-600', 'mt-1');
    });
  });

  describe('Layout Structure', () => {
    it('maintains proper DOM structure with all elements', () => {
      // Arrange
      const cardData = createMockCardData();
      
      // Act
      render(<DashboardCard {...cardData} />);
      
      // Assert
      const cardElement = screen.getByText('Total Students').closest('div')?.parentElement;
      const headerElement = cardElement?.querySelector('.flex.items-center.justify-between');
      const valueElement = cardElement?.querySelector('.text-3xl');
      const subtitleElement = cardElement?.querySelector('.text-xs');
      
      expect(headerElement).toBeInTheDocument();
      expect(valueElement).toBeInTheDocument();
      expect(subtitleElement).toBeInTheDocument();
    });

    it('positions icon correctly in header layout', () => {
      // Arrange
      const cardData = createMockCardData();
      
      // Act
      render(<DashboardCard {...cardData} />);
      
      // Assert
      const headerElement = screen.getByText('Total Students').closest('.flex.items-center.justify-between');
      const iconElement = headerElement?.querySelector('[data-testid="users-icon"]');
      
      expect(headerElement).toBeInTheDocument();
      expect(iconElement).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles very long titles gracefully', () => {
      // Arrange
      const longTitleData = createMockCardData({
        title: 'This is a very long title that might cause layout issues in the dashboard card component'
      });
      
      // Act
      render(<DashboardCard {...longTitleData} />);
      
      // Assert
      expect(screen.getByText('This is a very long title that might cause layout issues in the dashboard card component')).toBeInTheDocument();
    });

    it('handles very large numeric values', () => {
      // Arrange
      const largeValueData = createMockCardData({ value: 999999999 });
      
      // Act
      render(<DashboardCard {...largeValueData} />);
      
      // Assert
      expect(screen.getByText('999999999')).toBeInTheDocument();
    });

    it('handles special characters in values', () => {
      // Arrange
      const specialCharData = createMockCardData({ value: '£1,234.56' });
      
      // Act
      render(<DashboardCard {...specialCharData} />);
      
      // Assert
      expect(screen.getByText('£1,234.56')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      // Arrange
      const cardData = createMockCardData();
      
      // Act
      render(<DashboardCard {...cardData} />);
      
      // Assert
      const cardElement = screen.getByText('Total Students').closest('div')?.parentElement;
      expect(cardElement).toBeInTheDocument();
    });

    it('maintains proper text hierarchy', () => {
      // Arrange
      const cardData = createMockCardData();
      
      // Act
      render(<DashboardCard {...cardData} />);
      
      // Assert
      const titleElement = screen.getByText('Total Students');
      const valueElement = screen.getByText('1250');
      const subtitleElement = screen.getByText('Enrolled this semester');
      
      expect(titleElement).toBeInTheDocument();
      expect(valueElement).toBeInTheDocument();
      expect(subtitleElement).toBeInTheDocument();
    });
  });
}); 