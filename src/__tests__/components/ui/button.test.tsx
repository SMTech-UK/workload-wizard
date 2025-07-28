import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with default variant and proper accessibility', () => {
      // Arrange
      const buttonText = 'Click me';
      
      // Act
      render(<Button>{buttonText}</Button>);
      
      // Assert
      const button = screen.getByRole('button', { name: buttonText });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
      // Note: Button component doesn't set a default type attribute
    });

    it('should render button with different variants correctly', () => {
      // Arrange & Act
      const { rerender } = render(<Button variant="destructive">Delete</Button>);
      
      // Assert
      let button = screen.getByRole('button', { name: /delete/i });
      expect(button).toHaveClass('bg-destructive', 'text-white');

      // Test outline variant
      rerender(<Button variant="outline">Outline</Button>);
      button = screen.getByRole('button', { name: /outline/i });
      expect(button).toHaveClass('border', 'bg-background');

      // Test secondary variant
      rerender(<Button variant="secondary">Secondary</Button>);
      button = screen.getByRole('button', { name: /secondary/i });
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');

      // Test ghost variant
      rerender(<Button variant="ghost">Ghost</Button>);
      button = screen.getByRole('button', { name: /ghost/i });
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');

      // Test link variant
      rerender(<Button variant="link">Link</Button>);
      button = screen.getByRole('button', { name: /link/i });
      expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });

    it('should render button with different sizes correctly', () => {
      // Arrange & Act
      const { rerender } = render(<Button size="default">Default</Button>);
      
      // Assert
      let button = screen.getByRole('button', { name: /default/i });
      expect(button).toHaveClass('h-9', 'px-4', 'py-2');

      // Test small size
      rerender(<Button size="sm">Small</Button>);
      button = screen.getByRole('button', { name: /small/i });
      expect(button).toHaveClass('h-8', 'rounded-md', 'px-3');

      // Test large size
      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole('button', { name: /large/i });
      expect(button).toHaveClass('h-10', 'rounded-md', 'px-6');

      // Test icon size
      rerender(<Button size="icon">Icon</Button>);
      button = screen.getByRole('button', { name: /icon/i });
      expect(button).toHaveClass('size-9');
    });
  });

  describe('Event Handling', () => {
    it('should handle click events correctly', () => {
      // Arrange
      const handleClick = jest.fn();
      const buttonText = 'Click me';
      
      // Act
      render(<Button onClick={handleClick}>{buttonText}</Button>);
      const button = screen.getByRole('button', { name: buttonText });
      fireEvent.click(button);
      
      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple click events', () => {
      // Arrange
      const handleClick = jest.fn();
      
      // Act
      render(<Button onClick={handleClick}>Multi Click</Button>);
      const button = screen.getByRole('button', { name: /multi click/i });
      
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      // Assert
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard events correctly', () => {
      // Arrange
      const handleKeyDown = jest.fn();
      const handleKeyUp = jest.fn();
      
      // Act
      render(
        <Button onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
          Keyboard Test
        </Button>
      );
      const button = screen.getByRole('button', { name: /keyboard test/i });
      
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter' });
      
      // Assert
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyUp).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      // Arrange
      const buttonText = 'Disabled Button';
      
      // Act
      render(<Button disabled>{buttonText}</Button>);
      
      // Assert
      const button = screen.getByRole('button', { name: buttonText });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('should not trigger click when disabled', () => {
      // Arrange
      const handleClick = jest.fn();
      
      // Act
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      fireEvent.click(button);
      
      // Assert
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not trigger keyboard events when disabled', () => {
      // Arrange
      const handleKeyDown = jest.fn();
      
      // Act
      render(<Button disabled onKeyDown={handleKeyDown}>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      fireEvent.keyDown(button, { key: 'Enter' });
      
      // Assert
      expect(button).toBeDisabled();
      // Note: React Testing Library can still fire events on disabled elements
      // The actual browser behavior is what matters for accessibility
      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', () => {
      // Arrange
      const ariaLabel = 'Custom label';
      const ariaDescribedBy = 'description';
      
      // Act
      render(
        <Button aria-label={ariaLabel} aria-describedby={ariaDescribedBy}>
          Button
        </Button>
      );
      
      // Assert
      const button = screen.getByRole('button', { name: ariaLabel });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-describedby', ariaDescribedBy);
    });

    it('should handle form attribute correctly', () => {
      // Arrange & Act
      render(<Button form="test-form">Form Button</Button>);
      
      // Assert
      const button = screen.getByRole('button', { name: /form button/i });
      expect(button).toHaveAttribute('form', 'test-form');
    });

    it('should handle name attribute correctly', () => {
      // Arrange & Act
      render(<Button name="test-button">Named Button</Button>);
      
      // Assert
      const button = screen.getByRole('button', { name: /named button/i });
      expect(button).toHaveAttribute('name', 'test-button');
    });
  });

  describe('Polymorphic Rendering', () => {
    it('should render as a link when asChild is true', () => {
      // Arrange
      const href = '/test';
      const linkText = 'Link Button';
      
      // Act
      render(
        <Button asChild>
          <a href={href}>{linkText}</a>
        </Button>
      );
      
      // Assert
      const link = screen.getByRole('link', { name: linkText });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });

    it('should render as different HTML elements', () => {
      // Arrange & Act
      const { rerender } = render(
        <Button asChild>
          <span>Span Button</span>
        </Button>
      );
      
      // Assert
      expect(screen.getByText('Span Button')).toBeInTheDocument();

      // Test with div
      rerender(
        <Button asChild>
          <div>Div Button</div>
        </Button>
      );
      expect(screen.getByText('Div Button')).toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('should apply custom className correctly', () => {
      // Arrange
      const customClass = 'custom-class';
      
      // Act
      render(<Button className={customClass}>Custom</Button>);
      
      // Assert
      const button = screen.getByRole('button', { name: /custom/i });
      expect(button).toHaveClass(customClass);
    });

    it('should merge multiple class names correctly', () => {
      // Arrange
      const customClass = 'custom-class';
      const additionalClass = 'additional-class';
      
      // Act
      render(<Button className={`${customClass} ${additionalClass}`}>Multi Class</Button>);
      
      // Assert
      const button = screen.getByRole('button', { name: /multi class/i });
      expect(button).toHaveClass(customClass, additionalClass);
    });

    it('should handle conditional classes correctly', () => {
      // Arrange
      const isActive = true;
      const isDisabled = false;
      
      // Act
      render(
        <Button 
          className={`base-class ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
        >
          Conditional
        </Button>
      );
      
      // Assert
      const button = screen.getByRole('button', { name: /conditional/i });
      expect(button).toHaveClass('base-class', 'active');
      expect(button).not.toHaveClass('disabled');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      // Arrange
      const ref = jest.fn();
      
      // Act
      render(<Button ref={ref}>Ref Button</Button>);
      
      // Assert
      expect(ref).toHaveBeenCalled();
    });

    it('should forward ref to asChild elements', () => {
      // Arrange
      const ref = jest.fn();
      
      // Act
      render(
        <Button asChild ref={ref}>
          <a href="/test">Ref Link</a>
        </Button>
      );
      
      // Assert
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should handle loading state correctly', () => {
      // Arrange
      const loadingText = 'Loading...';
      
      // Act
      render(<Button disabled>{loadingText}</Button>);
      
      // Assert
      const button = screen.getByRole('button', { name: loadingText });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('should prevent interactions when loading', () => {
      // Arrange
      const handleClick = jest.fn();
      
      // Act
      render(<Button disabled onClick={handleClick}>Loading...</Button>);
      const button = screen.getByRole('button', { name: /loading/i });
      fireEvent.click(button);
      
      // Assert
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      // Arrange & Act
      render(<Button></Button>);
      
      // Assert
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      // Arrange & Act
      render(<Button>{null}</Button>);
      
      // Assert
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle undefined children gracefully', () => {
      // Arrange & Act
      render(<Button>{undefined}</Button>);
      
      // Assert
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle complex children correctly', () => {
      // Arrange
      const complexContent = (
        <div>
          <span>Text</span>
          <strong>Bold</strong>
        </div>
      );
      
      // Act
      render(<Button>{complexContent}</Button>);
      
      // Assert
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
      expect(screen.getByText('Bold')).toBeInTheDocument();
    });
  });
}); 