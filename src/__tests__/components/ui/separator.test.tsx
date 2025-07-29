import { render, screen } from '@testing-library/react';
import { Separator } from '@/components/ui/separator';

describe('Separator Component', () => {
  describe('Rendering', () => {
    it('should render separator with default orientation', () => {
      // Arrange & Act
      render(<Separator />);
      
      // Assert
      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
    });

    it('should render separator with custom className', () => {
      // Arrange
      const customClass = 'custom-separator';
      
      // Act
      render(<Separator className={customClass} />);
      
      // Assert
      const separator = screen.getByRole('separator');
      expect(separator).toHaveClass(customClass);
    });

    it('should render separator with horizontal orientation', () => {
      // Arrange & Act
      render(<Separator orientation="horizontal" />);
      
      // Assert
      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
    });

    it('should render separator with vertical orientation', () => {
      // Arrange & Act
      render(<Separator orientation="vertical" />);
      
      // Assert
      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
    });

    it('should render separator with decorative prop', () => {
      // Arrange & Act
      render(<Separator decorative />);
      
      // Assert
      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Arrange & Act
      render(<Separator />);
      
      // Assert
      const separator = screen.getByRole('separator');
      expect(separator).toHaveAttribute('role', 'separator');
    });

    it('should have proper ARIA attributes for decorative separator', () => {
      // Arrange & Act
      render(<Separator decorative />);
      
      // Assert
      const separator = screen.getByRole('separator');
      expect(separator).toHaveAttribute('role', 'separator');
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Styling', () => {
    it('should have proper base styling classes for horizontal orientation', () => {
      // Arrange & Act
      render(<Separator orientation="horizontal" />);
      
      // Assert
      const separator = screen.getByRole('separator');
      expect(separator).toHaveClass('shrink-0', 'bg-border');
    });

    it('should have proper styling classes for vertical orientation', () => {
      // Arrange & Act
      render(<Separator orientation="vertical" />);
      
      // Assert
      const separator = screen.getByRole('separator');
      expect(separator).toHaveClass('shrink-0', 'bg-border');
    });

    it('should apply custom styling correctly', () => {
      // Arrange
      const customClass = 'border-red-500 h-px';
      
      // Act
      render(<Separator className={customClass} />);
      
      // Assert
      const separator = screen.getByRole('separator');
      expect(separator).toHaveClass('border-red-500', 'h-px');
    });
  });

  describe('Integration', () => {
    it('should work in a list context', () => {
      // Arrange & Act
      render(
        <div>
          <div>Item 1</div>
          <Separator />
          <div>Item 2</div>
          <Separator />
          <div>Item 3</div>
        </div>
      );
      
      // Assert
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
      expect(screen.getAllByRole('separator')).toHaveLength(2);
    });

    it('should work in a navigation context', () => {
      // Arrange & Act
      render(
        <nav>
          <a href="/home">Home</a>
          <Separator orientation="vertical" />
          <a href="/about">About</a>
          <Separator orientation="vertical" />
          <a href="/contact">Contact</a>
        </nav>
      );
      
      // Assert
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getAllByRole('separator')).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple separators', () => {
      // Arrange & Act
      render(
        <div>
          <Separator />
          <Separator />
          <Separator />
        </div>
      );
      
      // Assert
      expect(screen.getAllByRole('separator')).toHaveLength(3);
    });

    it('should handle separators with different orientations', () => {
      // Arrange & Act
      render(
        <div>
          <Separator orientation="horizontal" />
          <Separator orientation="vertical" />
        </div>
      );
      
      // Assert
      expect(screen.getAllByRole('separator')).toHaveLength(2);
    });
  });
}); 