import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';

describe('Label Component', () => {
  describe('Rendering', () => {
    it('should render label with children', () => {
      // Arrange & Act
      render(<Label>Test Label</Label>);
      
      // Assert
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render label with custom className', () => {
      // Arrange
      const customClass = 'custom-label';
      
      // Act
      render(<Label className={customClass}>Custom Label</Label>);
      
      // Assert
      const label = screen.getByText('Custom Label');
      expect(label).toHaveClass(customClass);
    });

    it('should render label with htmlFor attribute', () => {
      // Arrange
      const htmlFor = 'test-input';
      
      // Act
      render(<Label htmlFor={htmlFor}>Input Label</Label>);
      
      // Assert
      const label = screen.getByText('Input Label');
      expect(label).toHaveAttribute('for', htmlFor);
    });

    it('should render label with asChild prop', () => {
      // Arrange & Act
      render(
        <Label asChild>
          <span>Child Label</span>
        </Label>
      );
      
      // Assert
      const label = screen.getByText('Child Label');
      expect(label.tagName).toBe('SPAN');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Arrange & Act
      render(<Label>Accessible Label</Label>);
      
      // Assert
      const label = screen.getByText('Accessible Label');
      expect(label).toHaveAttribute('role', 'label');
    });

    it('should associate with form controls', () => {
      // Arrange & Act
      render(
        <div>
          <Label htmlFor="test-input">Form Label</Label>
          <input id="test-input" />
        </div>
      );
      
      // Assert
      const label = screen.getByText('Form Label');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });
  });

  describe('Styling', () => {
    it('should have proper base styling classes', () => {
      // Arrange & Act
      render(<Label>Styled Label</Label>);
      
      // Assert
      const label = screen.getByText('Styled Label');
      expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none', 'peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
    });

    it('should apply custom styling correctly', () => {
      // Arrange
      const customClass = 'text-red-500 font-bold';
      
      // Act
      render(<Label className={customClass}>Custom Styled Label</Label>);
      
      // Assert
      const label = screen.getByText('Custom Styled Label');
      expect(label).toHaveClass('text-red-500', 'font-bold');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      // Arrange & Act
      render(<Label></Label>);
      
      // Assert
      const label = screen.getByRole('label');
      expect(label).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      // Arrange
      const longText = 'This is a very long label text that might overflow the container and need to be handled properly with appropriate styling and layout considerations';
      
      // Act
      render(<Label>{longText}</Label>);
      
      // Assert
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      // Arrange
      const specialText = 'Label with special chars: & < > " \' € © ® ™';
      
      // Act
      render(<Label>{specialText}</Label>);
      
      // Assert
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with form controls', () => {
      // Arrange & Act
      render(
        <div>
          <Label htmlFor="email">Email Address</Label>
          <input id="email" type="email" placeholder="Enter your email" />
        </div>
      );
      
      // Assert
      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    it('should work with multiple form controls', () => {
      // Arrange & Act
      render(
        <div>
          <Label htmlFor="name">Full Name</Label>
          <input id="name" type="text" />
          <Label htmlFor="age">Age</Label>
          <input id="age" type="number" />
        </div>
      );
      
      // Assert
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
    });
  });
}); 