import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Custom query to find elements by data-slot attribute
const getByDataSlot = (container: HTMLElement, slotName: string) => {
  return container.querySelector(`[data-slot="${slotName}"]`);
};

const getAllByDataSlot = (container: HTMLElement, slotName: string) => {
  return container.querySelectorAll(`[data-slot="${slotName}"]`);
};

describe('Avatar Component - Comprehensive UI Testing', () => {
  describe('Basic Rendering and Functionality', () => {
    it('should render avatar with default styling', () => {
      // Arrange
      const { container } = render(<Avatar />);

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('relative', 'flex', 'size-8', 'shrink-0', 'overflow-hidden', 'rounded-full');
    });

    it('should render avatar with custom className', () => {
      // Arrange
      const { container } = render(<Avatar className="custom-avatar" />);

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      expect(avatar).toHaveClass('custom-avatar');
      expect(avatar).toHaveClass('relative', 'flex', 'size-8', 'shrink-0', 'overflow-hidden', 'rounded-full');
    });

    it('should render avatar with image', () => {
      // Arrange
      const { container } = render(
        <Avatar>
          <AvatarImage src="/test-image.jpg" alt="Test Avatar" />
        </Avatar>
      );

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      const image = getByDataSlot(container, 'avatar-image');
      expect(avatar).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test Avatar');
    });

    it('should render avatar with fallback', () => {
      // Arrange
      const { container } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      const fallback = getByDataSlot(container, 'avatar-fallback');
      expect(avatar).toBeInTheDocument();
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveTextContent('JD');
    });

    it('should render complete avatar with image and fallback', () => {
      // Arrange
      const { container } = render(
        <Avatar>
          <AvatarImage src="/test-image.jpg" alt="Test Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      const image = getByDataSlot(container, 'avatar-image');
      const fallback = getByDataSlot(container, 'avatar-fallback');
      
      expect(avatar).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(fallback).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(fallback).toHaveTextContent('JD');
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper semantic structure', () => {
      // Arrange
      const { container } = render(<Avatar />);

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      expect(avatar?.tagName).toBe('DIV');
      expect(avatar).toHaveAttribute('data-slot', 'avatar');
    });

    it('should support ARIA attributes', () => {
      // Arrange
      const { container } = render(<Avatar aria-label="User avatar" />);

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      expect(avatar).toHaveAttribute('aria-label', 'User avatar');
    });

    it('should handle image accessibility properly', () => {
      // Arrange
      const { container } = render(
        <Avatar>
          <AvatarImage src="/test-image.jpg" alt="John Doe's profile picture" />
        </Avatar>
      );

      // Act & Assert
      const image = getByDataSlot(container, 'avatar-image');
      expect(image).toHaveAttribute('alt', 'John Doe\'s profile picture');
      expect(image).toHaveAttribute('src', '/test-image.jpg');
    });

    it('should support role attribute', () => {
      // Arrange
      const { container } = render(<Avatar role="img" aria-label="User avatar" />);

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      expect(avatar).toHaveAttribute('role', 'img');
      expect(avatar).toHaveAttribute('aria-label', 'User avatar');
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain proper sizing on mobile screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(<Avatar />);

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      expect(avatar).toHaveClass('size-8');
      expect(avatar).toHaveClass('rounded-full');
    });

    it('should maintain proper sizing on tablet screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(<Avatar />);

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      expect(avatar).toHaveClass('size-8');
      expect(avatar).toHaveClass('rounded-full');
    });

    it('should maintain proper sizing on desktop screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(<Avatar />);

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      expect(avatar).toHaveClass('size-8');
      expect(avatar).toHaveClass('rounded-full');
    });

    it('should handle custom sizing classes', () => {
      // Arrange
      const { container } = render(<Avatar className="size-12" />);

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      expect(avatar).toHaveClass('size-12');
      expect(avatar).toHaveClass('rounded-full');
    });
  });

  describe('Content Structure', () => {
    it('should handle image with various formats', () => {
      // Arrange
      const imageFormats = ['jpg', 'png', 'webp', 'svg'];
      
      imageFormats.forEach(format => {
        const { container } = render(
          <Avatar>
            <AvatarImage src={`/test-image.${format}`} alt={`Test ${format}`} />
          </Avatar>
        );

        // Act & Assert
        const image = getByDataSlot(container, 'avatar-image');
        expect(image).toHaveAttribute('src', `/test-image.${format}`);
        expect(image).toHaveAttribute('alt', `Test ${format}`);
      });
    });

    it('should handle fallback with initials', () => {
      // Arrange
      const initials = ['JD', 'AB', 'XYZ', '123'];
      
      initials.forEach(initial => {
        const { container } = render(
          <Avatar>
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        );

        // Act & Assert
        const fallback = getByDataSlot(container, 'avatar-fallback');
        expect(fallback).toHaveTextContent(initial);
      });
    });

    it('should handle fallback with emoji', () => {
      // Arrange
      const { container } = render(
        <Avatar>
          <AvatarFallback>👤</AvatarFallback>
        </Avatar>
      );

      // Act & Assert
      const fallback = getByDataSlot(container, 'avatar-fallback');
      expect(fallback).toHaveTextContent('👤');
    });

    it('should handle empty fallback', () => {
      // Arrange
      const { container } = render(
        <Avatar>
          <AvatarFallback></AvatarFallback>
        </Avatar>
      );

      // Act & Assert
      const fallback = getByDataSlot(container, 'avatar-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveClass('bg-muted', 'flex', 'size-full', 'items-center', 'justify-center', 'rounded-full');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long fallback text', () => {
      // Arrange
      const longText = 'A'.repeat(100);
      const { container } = render(
        <Avatar>
          <AvatarFallback>{longText}</AvatarFallback>
        </Avatar>
      );

      // Act & Assert
      const fallback = getByDataSlot(container, 'avatar-fallback');
      expect(fallback).toHaveTextContent(longText);
      expect(fallback).toHaveClass('bg-muted', 'flex', 'size-full', 'items-center', 'justify-center', 'rounded-full');
    });

    it('should handle special characters in fallback', () => {
      // Arrange
      const specialChars = 'User with special chars: <>&"\'<>';
      const { container } = render(
        <Avatar>
          <AvatarFallback>{specialChars}</AvatarFallback>
        </Avatar>
      );

      // Act & Assert
      const fallback = getByDataSlot(container, 'avatar-fallback');
      expect(fallback).toHaveTextContent(specialChars);
    });

    it('should handle multiple avatars', () => {
      // Arrange
      const { container } = render(
        <div>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
        </div>
      );

      // Act & Assert
      const avatars = getAllByDataSlot(container, 'avatar');
      const fallbacks = getAllByDataSlot(container, 'avatar-fallback');
      expect(avatars).toHaveLength(3);
      expect(fallbacks).toHaveLength(3);
      expect(fallbacks[0]).toHaveTextContent('JD');
      expect(fallbacks[1]).toHaveTextContent('AB');
      expect(fallbacks[2]).toHaveTextContent('CD');
    });

    it('should handle broken image gracefully', () => {
      // Arrange
      const { container } = render(
        <Avatar>
          <AvatarImage src="/broken-image.jpg" alt="Broken image" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Act & Assert
      const image = getByDataSlot(container, 'avatar-image');
      const fallback = getByDataSlot(container, 'avatar-fallback');
      expect(image).toHaveAttribute('src', '/broken-image.jpg');
      expect(fallback).toHaveTextContent('JD');
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for default avatar', () => {
      // Arrange
      const { container } = render(<Avatar />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for avatar with image', () => {
      // Arrange
      const { container } = render(
        <Avatar>
          <AvatarImage src="/test-image.jpg" alt="Test Avatar" />
        </Avatar>
      );

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for avatar with fallback', () => {
      // Arrange
      const { container } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for complete avatar', () => {
      // Arrange
      const { container } = render(
        <Avatar>
          <AvatarImage src="/test-image.jpg" alt="Test Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for multiple avatars', () => {
      // Arrange
      const { container } = render(
        <div>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>
      );

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Performance Testing', () => {
    it('should handle rapid re-renders efficiently', () => {
      // Arrange
      const { rerender } = render(<Avatar>Initial Avatar</Avatar>);

      // Act & Assert
      expect(screen.getByText('Initial Avatar')).toBeInTheDocument();

      // Rerender with different content
      rerender(<Avatar>Updated Avatar</Avatar>);

      expect(screen.getByText('Updated Avatar')).toBeInTheDocument();
      expect(screen.queryByText('Initial Avatar')).not.toBeInTheDocument();
    });

    it('should handle className changes efficiently', () => {
      // Arrange
      const { rerender, container } = render(<Avatar className="size-8">Small</Avatar>);

      // Act & Assert
      const avatar = getByDataSlot(container, 'avatar');
      expect(avatar).toHaveClass('size-8');

      // Change className
      rerender(<Avatar className="size-12">Large</Avatar>);

      const updatedAvatar = getByDataSlot(container, 'avatar');
      expect(updatedAvatar).toHaveClass('size-12');
      expect(updatedAvatar).not.toHaveClass('size-8');
    });

    it('should handle multiple avatar renders efficiently', () => {
      // Arrange
      const avatars = Array.from({ length: 100 }, (_, i) => `Avatar ${i + 1}`);

      const startTime = performance.now();

      // Act
      render(
        <div>
          {avatars.map((text, index) => (
            <Avatar key={index}>
              <AvatarFallback>{text}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      );

      const endTime = performance.now();

      // Assert
      expect(screen.getByText('Avatar 1')).toBeInTheDocument();
      expect(screen.getByText('Avatar 100')).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });
  });
}); 