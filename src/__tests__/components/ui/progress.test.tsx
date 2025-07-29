import { render, screen } from '@testing-library/react';
import { Progress } from '@/components/ui/progress';

describe('Progress Component', () => {
  describe('Rendering', () => {
    it('should render progress bar with default value', () => {
      // Arrange
      const value = 50;
      
      // Act
      const { container } = render(<Progress value={value} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveAttribute('aria-valuenow', value.toString());
      expect(progress).toHaveAttribute('aria-valuemin', '0');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
      expect(container).toMatchSnapshot();
    });

    it('should render progress bar with custom value', () => {
      // Arrange
      const value = 75;
      
      // Act
      const { container } = render(<Progress value={value} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', value.toString());
      expect(container).toMatchSnapshot();
    });

    it('should render progress bar with zero value', () => {
      // Arrange
      const value = 0;
      
      // Act
      const { container } = render(<Progress value={value} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', value.toString());
      expect(container).toMatchSnapshot();
    });

    it('should render progress bar with maximum value', () => {
      // Arrange
      const value = 100;
      
      // Act
      const { container } = render(<Progress value={value} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', value.toString());
      expect(container).toMatchSnapshot();
    });

    it('should render progress bar with custom className', () => {
      // Arrange
      const value = 50;
      const customClass = 'custom-progress';
      
      // Act
      const { container } = render(<Progress value={value} className={customClass} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass(customClass);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Arrange
      const value = 60;
      
      // Act
      const { container } = render(<Progress value={value} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', value.toString());
      expect(progress).toHaveAttribute('aria-valuemin', '0');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
      expect(container).toMatchSnapshot();
    });

    it('should have proper role attribute', () => {
      // Arrange
      const value = 30;
      
      // Act
      const { container } = render(<Progress value={value} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative values gracefully', () => {
      // Arrange
      const value = -10;
      
      // Act
      const { container } = render(<Progress value={value} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', value.toString());
      expect(container).toMatchSnapshot();
    });

    it('should handle values over 100 gracefully', () => {
      // Arrange
      const value = 150;
      
      // Act
      const { container } = render(<Progress value={value} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', value.toString());
      expect(container).toMatchSnapshot();
    });

    it('should handle undefined value gracefully', () => {
      // Arrange
      const value = undefined;
      
      // Act
      const { container } = render(<Progress value={value} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });

  describe('Styling', () => {
    it('should have proper base styling classes', () => {
      // Arrange
      const value = 50;
      
      // Act
      const { container } = render(<Progress value={value} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass('relative', 'h-2', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary');
      expect(container).toMatchSnapshot();
    });
  });

  describe('Component Structure', () => {
    it('should render progress indicator with correct styling', () => {
      // Arrange
      const value = 50;
      
      // Act
      const { container } = render(<Progress value={value} />);
      
      // Assert
      const progress = screen.getByRole('progressbar');
      const indicator = progress.querySelector('[data-radix-progress-indicator]');
      expect(indicator).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });

  describe('Snapshot Testing', () => {
    it('should maintain consistent UI structure across different values', () => {
      // Arrange & Act
      const { container: container1 } = render(<Progress value={25} />);
      const { container: container2 } = render(<Progress value={50} />);
      const { container: container3 } = render(<Progress value={75} />);
      
      // Assert
      expect(container1).toMatchSnapshot('progress-25-percent');
      expect(container2).toMatchSnapshot('progress-50-percent');
      expect(container3).toMatchSnapshot('progress-75-percent');
    });

    it('should maintain consistent UI structure with custom styling', () => {
      // Arrange & Act
      const { container } = render(
        <Progress 
          value={60} 
          className="h-4 bg-blue-100 border-2 border-blue-300" 
        />
      );
      
      // Assert
      expect(container).toMatchSnapshot('progress-custom-styling');
    });
  });
}); 