import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

describe('Alert Component - Comprehensive UI Testing', () => {
  describe('Basic Rendering and Functionality', () => {
    it('should render alert with basic content', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>This is an alert description.</AlertDescription>
        </Alert>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('This is an alert description.')).toBeInTheDocument();
    });

    it('should render alert without title', () => {
      render(
        <Alert>
          <AlertDescription>This is an alert without a title.</AlertDescription>
        </Alert>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('This is an alert without a title.')).toBeInTheDocument();
    });

    it('should render alert without description', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title Only</AlertTitle>
        </Alert>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Alert Title Only')).toBeInTheDocument();
    });

    it('should render empty alert', () => {
      render(<Alert />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper ARIA role', () => {
      render(
        <Alert>
          <AlertDescription>Test alert</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('should have proper heading structure', () => {
      render(
        <Alert>
          <AlertTitle>Important Alert</AlertTitle>
          <AlertDescription>This is important information.</AlertDescription>
        </Alert>
      );

      const title = screen.getByText('Important Alert');
      expect(title.tagName).toBe('H5');
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight');
    });

    it('should have proper semantic structure', () => {
      render(
        <Alert>
          <AlertTitle>Test Title</AlertTitle>
          <AlertDescription>Test description</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      const title = screen.getByText('Test Title');
      const description = screen.getByText('Test description');

      expect(alert).toContainElement(title);
      expect(alert).toContainElement(description);
      expect(description.tagName).toBe('DIV');
    });
  });

  describe('Variant Testing', () => {
    it('should render default variant correctly', () => {
      render(
        <Alert variant="default">
          <AlertDescription>Default alert</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-background', 'text-foreground');
      expect(alert).toHaveClass('relative', 'w-full', 'rounded-lg', 'border', 'p-4');
    });

    it('should render destructive variant correctly', () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>Destructive alert</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
      expect(alert).toHaveClass('relative', 'w-full', 'rounded-lg', 'border', 'p-4');
    });

    it('should use default variant when no variant is specified', () => {
      render(
        <Alert>
          <AlertDescription>No variant specified</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-background', 'text-foreground');
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to different screen sizes', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <Alert>
          <AlertTitle>Responsive Alert</AlertTitle>
          <AlertDescription>This alert should be responsive.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('w-full');
      expect(alert).toHaveClass('p-4');
    });

    it('should maintain proper spacing on different screen sizes', () => {
      // Mock tablet screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <Alert>
          <AlertTitle>Tablet Alert</AlertTitle>
          <AlertDescription>This alert should work on tablets.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('p-4');
      expect(alert).toHaveClass('rounded-lg');
    });
  });

  describe('Content Structure', () => {
    it('should handle long content gracefully', () => {
      const longContent = 'A'.repeat(500);

      render(
        <Alert>
          <AlertTitle>Long Content Alert</AlertTitle>
          <AlertDescription>{longContent}</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('should handle special characters in content', () => {
      const specialContent = 'Content with special chars: <>&"\'<>';

      render(
        <Alert>
          <AlertTitle>Special Characters</AlertTitle>
          <AlertDescription>{specialContent}</AlertDescription>
        </Alert>
      );

      expect(screen.getByText(specialContent)).toBeInTheDocument();
    });

    it('should handle HTML content safely', () => {
      const htmlContent = '<strong>Bold text</strong> and <em>italic text</em>';

      render(
        <Alert>
          <AlertDescription>{htmlContent}</AlertDescription>
        </Alert>
      );

      expect(screen.getByText(htmlContent)).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(200);

      render(
        <Alert>
          <AlertTitle>{longTitle}</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle empty strings', () => {
      render(
        <Alert>
          <AlertTitle></AlertTitle>
          <AlertDescription></AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should handle multiple alerts', () => {
      render(
        <div>
          <Alert>
            <AlertDescription>First alert</AlertDescription>
          </Alert>
          <Alert>
            <AlertDescription>Second alert</AlertDescription>
          </Alert>
        </div>
      );

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
      expect(screen.getByText('First alert')).toBeInTheDocument();
      expect(screen.getByText('Second alert')).toBeInTheDocument();
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for default alert', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Test Alert</AlertTitle>
          <AlertDescription>This is a test alert.</AlertDescription>
        </Alert>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for destructive alert', () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertTitle>Error Alert</AlertTitle>
          <AlertDescription>This is an error alert.</AlertDescription>
        </Alert>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for alert without title', () => {
      const { container } = render(
        <Alert>
          <AlertDescription>Alert without title</AlertDescription>
        </Alert>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Performance Testing', () => {
    it('should handle rapid re-renders efficiently', () => {
      const { rerender } = render(
        <Alert>
          <AlertDescription>Initial alert</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Initial alert')).toBeInTheDocument();

      // Rerender with different content
      rerender(
        <Alert>
          <AlertDescription>Updated alert</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Updated alert')).toBeInTheDocument();
      expect(screen.queryByText('Initial alert')).not.toBeInTheDocument();
    });

    it('should handle variant changes efficiently', () => {
      const { rerender } = render(
        <Alert variant="default">
          <AlertDescription>Default variant</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-background', 'text-foreground');

      // Change to destructive variant
      rerender(
        <Alert variant="destructive">
          <AlertDescription>Destructive variant</AlertDescription>
        </Alert>
      );

      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
      expect(alert).not.toHaveClass('bg-background', 'text-foreground');
    });
  });
}); 