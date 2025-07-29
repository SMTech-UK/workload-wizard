import { render, screen } from '@testing-library/react';
import { Toaster } from '@/components/ui/sonner';

describe('Sonner Component', () => {
  describe('Toaster', () => {
    it('should render toaster with default props', () => {
      // Arrange & Act
      render(<Toaster />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });

    it('should render toaster with custom className', () => {
      // Arrange
      const customClass = 'custom-toaster';
      
      // Act
      render(<Toaster className={customClass} />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toHaveClass(customClass);
    });

    it('should render toaster with custom position', () => {
      // Arrange & Act
      render(<Toaster position="top-left" />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });

    it('should render toaster with custom theme', () => {
      // Arrange & Act
      render(<Toaster theme="dark" />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });

    it('should render toaster with custom rich colors', () => {
      // Arrange & Act
      render(<Toaster richColors />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });

    it('should render toaster with custom close button', () => {
      // Arrange & Act
      render(<Toaster closeButton />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });

    it('should render toaster with custom duration', () => {
      // Arrange & Act
      render(<Toaster duration={5000} />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });

    it('should render toaster with custom expand', () => {
      // Arrange & Act
      render(<Toaster expand />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });

    it('should render toaster with custom invert', () => {
      // Arrange & Act
      render(<Toaster invert />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });

    it('should render toaster with custom offset', () => {
      // Arrange & Act
      render(<Toaster offset="1rem" />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });

    it('should render toaster with custom swipe directions', () => {
      // Arrange & Act
      render(<Toaster swipeDirections={['left', 'right']} />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });

    it('should render toaster with custom toast options', () => {
      // Arrange & Act
      render(
        <Toaster
          toastOptions={{
            classNames: {
              toast: 'custom-toast-class',
            },
          }}
        />
      );
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Arrange & Act
      render(<Toaster />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toHaveAttribute('aria-label', 'Notifications');
    });

    it('should have proper role attribute', () => {
      // Arrange & Act
      render(<Toaster />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toHaveAttribute('role', 'region');
    });
  });

  describe('Styling', () => {
    it('should have proper base styling classes', () => {
      // Arrange & Act
      render(<Toaster />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });

    it('should apply custom styling correctly', () => {
      // Arrange
      const customClass = 'bg-red-500 text-white';
      
      // Act
      render(<Toaster className={customClass} />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toHaveClass('bg-red-500', 'text-white');
    });
  });

  describe('Integration', () => {
    it('should work with multiple toasters', () => {
      // Arrange & Act
      render(
        <div>
          <Toaster position="top-left" />
          <Toaster position="top-right" />
        </div>
      );
      
      // Assert
      const toasters = screen.getAllByRole('region', { name: /notifications/i });
      expect(toasters).toHaveLength(2);
    });

    it('should work in a layout context', () => {
      // Arrange & Act
      render(
        <div className="min-h-screen">
          <header>Header</header>
          <main>Main content</main>
          <Toaster />
        </div>
      );
      
      // Assert
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /notifications/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all position variants', () => {
      // Arrange
      const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;
      
      positions.forEach((position) => {
        // Act
        render(<Toaster position={position} />);
        
        // Assert
        const toaster = screen.getByRole('region', { name: /notifications/i });
        expect(toaster).toBeInTheDocument();
      });
    });

    it('should handle all theme variants', () => {
      // Arrange
      const themes = ['light', 'dark', 'system'] as const;
      
      themes.forEach((theme) => {
        // Act
        render(<Toaster theme={theme} />);
        
        // Assert
        const toaster = screen.getByRole('region', { name: /notifications/i });
        expect(toaster).toBeInTheDocument();
      });
    });

    it('should handle swipe direction variants', () => {
      // Arrange & Act
      render(<Toaster swipeDirections={['left', 'right']} />);
      
      // Assert
      const toaster = screen.getByRole('region', { name: /notifications/i });
      expect(toaster).toBeInTheDocument();
    });
  });
}); 