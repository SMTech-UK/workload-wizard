import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge Component - Comprehensive UI Testing', () => {
  describe('Basic Rendering and Functionality', () => {
    it('should render badge with text content', () => {
      render(<Badge>Test Badge</Badge>);

      expect(screen.getByText('Test Badge')).toBeInTheDocument();
      expect(screen.getByText('Test Badge')).toHaveClass('inline-flex', 'items-center', 'rounded-md', 'border');
    });

    it('should render empty badge', () => {
      const { container } = render(<Badge />);

      const badge = container.querySelector('.inline-flex');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-md', 'border');
    });

    it('should render badge with numbers', () => {
      render(<Badge>42</Badge>);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render badge with special characters', () => {
      render(<Badge>New!</Badge>);

      expect(screen.getByText('New!')).toBeInTheDocument();
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper semantic structure', () => {
      render(<Badge>Accessible Badge</Badge>);

      const badge = screen.getByText('Accessible Badge');
      expect(badge.tagName).toBe('DIV');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-md', 'border');
    });

    it('should support focus states', () => {
      render(<Badge tabIndex={0}>Focusable Badge</Badge>);

      const badge = screen.getByText('Focusable Badge');
      expect(badge).toHaveAttribute('tabIndex', '0');
      expect(badge).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2');
    });

    it('should handle ARIA attributes', () => {
      render(<Badge aria-label="Status badge">Active</Badge>);

      const badge = screen.getByLabelText('Status badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Active');
    });
  });

  describe('Variant Testing', () => {
    it('should render default variant correctly', () => {
      render(<Badge variant="default">Default Badge</Badge>);

      const badge = screen.getByText('Default Badge');
      expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground', 'shadow');
      expect(badge).toHaveClass('hover:bg-primary/80');
    });

    it('should render secondary variant correctly', () => {
      render(<Badge variant="secondary">Secondary Badge</Badge>);

      const badge = screen.getByText('Secondary Badge');
      expect(badge).toHaveClass('border-transparent', 'bg-secondary', 'text-secondary-foreground');
      expect(badge).toHaveClass('hover:bg-secondary/80');
    });

    it('should render destructive variant correctly', () => {
      render(<Badge variant="destructive">Destructive Badge</Badge>);

      const badge = screen.getByText('Destructive Badge');
      expect(badge).toHaveClass('border-transparent', 'bg-destructive', 'text-destructive-foreground', 'shadow');
      expect(badge).toHaveClass('hover:bg-destructive/80');
    });

    it('should render outline variant correctly', () => {
      render(<Badge variant="outline">Outline Badge</Badge>);

      const badge = screen.getByText('Outline Badge');
      expect(badge).toHaveClass('text-foreground');
    });

    it('should use default variant when no variant is specified', () => {
      render(<Badge>No Variant Badge</Badge>);

      const badge = screen.getByText('No Variant Badge');
      expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground', 'shadow');
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain proper sizing on different screen sizes', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Badge>Mobile Badge</Badge>);

      const badge = screen.getByText('Mobile Badge');
      expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-xs');
    });

    it('should maintain proper sizing on tablet screens', () => {
      // Mock tablet screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<Badge>Tablet Badge</Badge>);

      const badge = screen.getByText('Tablet Badge');
      expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-xs');
    });

    it('should maintain proper sizing on desktop screens', () => {
      // Mock desktop screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<Badge>Desktop Badge</Badge>);

      const badge = screen.getByText('Desktop Badge');
      expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-xs');
    });
  });

  describe('Content Structure', () => {
    it('should handle long content gracefully', () => {
      const longContent = 'A'.repeat(100);

      render(<Badge>{longContent}</Badge>);

      const badge = screen.getByText(longContent);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('inline-flex', 'items-center');
    });

    it('should handle special characters in content', () => {
      const specialContent = 'Badge with special chars: <>&"\'<>';

      render(<Badge>{specialContent}</Badge>);

      expect(screen.getByText(specialContent)).toBeInTheDocument();
    });

    it('should handle HTML content safely', () => {
      const htmlContent = '<strong>Bold</strong> and <em>italic</em>';

      render(<Badge>{htmlContent}</Badge>);

      expect(screen.getByText(htmlContent)).toBeInTheDocument();
    });

    it('should handle mixed content types', () => {
      render(<Badge>Text with 123 numbers and !@# symbols</Badge>);

      expect(screen.getByText('Text with 123 numbers and !@# symbols')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long content', () => {
      const veryLongContent = 'A'.repeat(500);

      render(<Badge>{veryLongContent}</Badge>);

      const badge = screen.getByText(veryLongContent);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('inline-flex', 'items-center');
    });

    it('should handle empty strings', () => {
      const { container } = render(<Badge></Badge>);

      const badge = container.querySelector('.inline-flex');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-md', 'border');
    });

    it('should handle multiple badges', () => {
      render(
        <div>
          <Badge>First Badge</Badge>
          <Badge>Second Badge</Badge>
          <Badge>Third Badge</Badge>
        </div>
      );

      expect(screen.getByText('First Badge')).toBeInTheDocument();
      expect(screen.getByText('Second Badge')).toBeInTheDocument();
      expect(screen.getByText('Third Badge')).toBeInTheDocument();
    });

    it('should handle badges with custom className', () => {
      render(<Badge className="custom-class">Custom Badge</Badge>);

      const badge = screen.getByText('Custom Badge');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-md', 'border');
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for default badge', () => {
      const { container } = render(<Badge>Default Badge</Badge>);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for secondary badge', () => {
      const { container } = render(<Badge variant="secondary">Secondary Badge</Badge>);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for destructive badge', () => {
      const { container } = render(<Badge variant="destructive">Destructive Badge</Badge>);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for outline badge', () => {
      const { container } = render(<Badge variant="outline">Outline Badge</Badge>);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for empty badge', () => {
      const { container } = render(<Badge />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Performance Testing', () => {
    it('should handle rapid re-renders efficiently', () => {
      const { rerender } = render(<Badge>Initial Badge</Badge>);

      expect(screen.getByText('Initial Badge')).toBeInTheDocument();

      // Rerender with different content
      rerender(<Badge>Updated Badge</Badge>);

      expect(screen.getByText('Updated Badge')).toBeInTheDocument();
      expect(screen.queryByText('Initial Badge')).not.toBeInTheDocument();
    });

    it('should handle variant changes efficiently', () => {
      const { rerender } = render(<Badge variant="default">Default Variant</Badge>);

      const badge = screen.getByText('Default Variant');
      expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground');

      // Change to secondary variant
      rerender(<Badge variant="secondary">Secondary Variant</Badge>);

      expect(badge).toHaveClass('border-transparent', 'bg-secondary', 'text-secondary-foreground');
      expect(badge).not.toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should handle multiple badge renders efficiently', () => {
      const badges = Array.from({ length: 100 }, (_, i) => `Badge ${i + 1}`);

      const startTime = performance.now();

      render(
        <div>
          {badges.map((text, index) => (
            <Badge key={index}>{text}</Badge>
          ))}
        </div>
      );

      const endTime = performance.now();

      expect(screen.getByText('Badge 1')).toBeInTheDocument();
      expect(screen.getByText('Badge 100')).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });
  });
}); 