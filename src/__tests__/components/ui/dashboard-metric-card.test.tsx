import { render, screen } from '@testing-library/react';
import { DashboardMetricCard } from '@/components/ui/dashboard-metric-card';

describe('DashboardMetricCard Component', () => {
  describe('Rendering', () => {
    it('should render metric card with all required props', () => {
      // Arrange
      const title = 'Total Users';
      const value = '1,234';
      const subtitle = 'Active users this month';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
        />
      );
      
      // Assert
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
    });

    it('should render metric card with icon', () => {
      // Arrange
      const title = 'Revenue';
      const value = '$50,000';
      const subtitle = 'Monthly revenue';
      const icon = '💰';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
          icon={icon}
        />
      );
      
      // Assert
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
      expect(screen.getByText(icon)).toBeInTheDocument();
    });

    it('should render metric card with custom value className', () => {
      // Arrange
      const title = 'Growth';
      const value = '+12.5%';
      const subtitle = 'Year over year';
      const valueClassName = 'text-green-600';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
          valueClassName={valueClassName}
        />
      );
      
      // Assert
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
    });

    it('should render metric card with children', () => {
      // Arrange
      const title = 'Progress Card';
      const value = '75%';
      const subtitle = 'Completion rate';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
        >
          <div data-testid="custom-content">Custom content</div>
        </DashboardMetricCard>
      );
      
      // Assert
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should render all content sections correctly', () => {
      // Arrange
      const title = 'Complete Metric';
      const value = '999';
      const subtitle = 'Full subtitle';
      const icon = '📊';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
          icon={icon}
        />
      );
      
      // Assert
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
      expect(screen.getByText(icon)).toBeInTheDocument();
    });

    it('should render without optional props', () => {
      // Arrange
      const title = 'Minimal Card';
      const value = '42';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
        />
      );
      
      // Assert
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have proper base styling classes', () => {
      // Arrange
      const title = 'Test Card';
      const value = '100';
      const subtitle = 'Test subtitle';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
        />
      );
      
      // Assert
      // Use the data-testid to get the main card container
      const cardContainer = screen.getByTestId('dashboard-metric-card');
      expect(cardContainer).toHaveClass('rounded-lg', 'border', 'p-6', 'bg-white', 'dark:bg-zinc-900', 'shadow-sm');
    });

    it('should apply custom value className correctly', () => {
      // Arrange
      const title = 'Test Card';
      const value = '100';
      const subtitle = 'Test subtitle';
      const customValueClass = 'text-red-500';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
          valueClassName={customValueClass}
        />
      );
      
      // Assert
      const valueElement = screen.getByText(value);
      expect(valueElement).toHaveClass(customValueClass);
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      // Arrange
      const title = 'Accessible Card';
      const value = '300';
      const subtitle = 'Accessible subtitle';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
        />
      );
      
      // Assert
      const card = screen.getByText(title).closest('div');
      expect(card).toBeInTheDocument();
    });

    it('should render text content properly for screen readers', () => {
      // Arrange
      const title = 'Screen Reader Card';
      const value = '400';
      const subtitle = 'Screen reader subtitle';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
        />
      );
      
      // Assert
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      // Arrange
      const title = '';
      const value = '';
      const subtitle = '';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
        />
      );
      
      // Assert
      // Check that the component renders without crashing by looking for the card structure
      const cardContainer = screen.getByTestId('dashboard-metric-card');
      expect(cardContainer).toBeInTheDocument();
    });

    it('should handle very long text content', () => {
      // Arrange
      const title = 'This is a very long title that might overflow the card boundaries and need to be handled properly';
      const value = '999,999,999,999';
      const subtitle = 'This is a very long subtitle that contains a lot of text and might need to be truncated or wrapped properly to fit within the card layout';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
        />
      );
      
      // Assert
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
    });

    it('should handle special characters in content', () => {
      // Arrange
      const title = 'Special & Characters < > " \'';
      const value = '€1,234.56';
      const subtitle = 'Subtitle with emojis 🎉 and symbols ©®™';
      
      // Act
      render(
        <DashboardMetricCard
          title={title}
          value={value}
          subtitle={subtitle}
        />
      );
      
      // Assert
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should work with multiple cards in a grid', () => {
      // Arrange & Act
      render(
        <div className="grid grid-cols-2 gap-4">
          <DashboardMetricCard
            title="Card 1"
            value="100"
            subtitle="First card"
          />
          <DashboardMetricCard
            title="Card 2"
            value="200"
            subtitle="Second card"
          />
        </div>
      );
      
      // Assert
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    });

    it('should handle different data types for value', () => {
      // Arrange
      const testCases = [
        { value: '100', expected: '100' },
        { value: 100, expected: '100' },
        { value: '$1,234.56', expected: '$1,234.56' },
        { value: '+15%', expected: '+15%' },
      ];
      
      testCases.forEach(({ value, expected }) => {
        // Act
        const { unmount } = render(
          <DashboardMetricCard
            title="Test Card"
            value={value}
            subtitle="Test subtitle"
          />
        );
        
        // Assert
        expect(screen.getByText(expected)).toBeInTheDocument();
        
        // Clean up
        unmount();
      });
    });
  });
}); 