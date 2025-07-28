import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

// Custom query to find elements by data-slot attribute
const getByDataSlot = (container: HTMLElement, slotName: string) => {
  return container.querySelector(`[data-slot="${slotName}"]`);
};

const getAllByDataSlot = (container: HTMLElement, slotName: string) => {
  return container.querySelectorAll(`[data-slot="${slotName}"]`);
};

describe('Skeleton Component - Comprehensive UI Testing', () => {
  describe('Basic Rendering and Functionality', () => {
    it('should render skeleton with default styling', () => {
      const { container } = render(<Skeleton />);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });

    it('should render skeleton with custom className', () => {
      const { container } = render(<Skeleton className="custom-skeleton" />);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('custom-skeleton');
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });

    it('should render skeleton with children', () => {
      const { container } = render(<Skeleton>Loading content</Skeleton>);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveTextContent('Loading content');
    });

    it('should render skeleton with custom dimensions', () => {
      const { container } = render(<Skeleton className="w-32 h-8" />);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('w-32', 'h-8');
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper data attribute', () => {
      const { container } = render(<Skeleton />);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
    });

    it('should support ARIA attributes', () => {
      render(<Skeleton aria-label="Loading indicator" />);

      const skeleton = screen.getByLabelText('Loading indicator');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
    });

    it('should support role attribute', () => {
      render(<Skeleton role="status" aria-label="Loading" />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
    });

    it('should have proper semantic structure', () => {
      const { container } = render(<Skeleton />);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton?.tagName).toBe('DIV');
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain styling on mobile screens', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(<Skeleton className="w-full h-4" />);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toHaveClass('w-full', 'h-4');
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });

    it('should maintain styling on tablet screens', () => {
      // Mock tablet screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(<Skeleton className="w-64 h-6" />);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toHaveClass('w-64', 'h-6');
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });

    it('should maintain styling on desktop screens', () => {
      // Mock desktop screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(<Skeleton className="w-96 h-8" />);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toHaveClass('w-96', 'h-8');
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });
  });

  describe('Content Structure', () => {
    it('should handle text content', () => {
      const { container } = render(<Skeleton>Loading text content</Skeleton>);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toHaveTextContent('Loading text content');
    });

    it('should handle HTML content', () => {
      const { container } = render(<Skeleton><span>Loading span</span></Skeleton>);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toContainHTML('<span>Loading span</span>');
    });

    it('should handle complex nested content', () => {
      const { container } = render(
        <Skeleton>
          <div>
            <h3>Loading Title</h3>
            <p>Loading description</p>
          </div>
        </Skeleton>
      );

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toHaveTextContent('Loading Title');
      expect(skeleton).toHaveTextContent('Loading description');
    });

    it('should handle empty content', () => {
      const { container } = render(<Skeleton></Skeleton>);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long content', () => {
      const longContent = 'A'.repeat(500);

      const { container } = render(<Skeleton>{longContent}</Skeleton>);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toHaveTextContent(longContent);
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });

    it('should handle special characters in content', () => {
      const specialContent = 'Loading with special chars: <>&"\'<>';

      const { container } = render(<Skeleton>{specialContent}</Skeleton>);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toHaveTextContent(specialContent);
    });

    it('should handle multiple skeletons', () => {
      const { container } = render(
        <div>
          <Skeleton>First skeleton</Skeleton>
          <Skeleton>Second skeleton</Skeleton>
          <Skeleton>Third skeleton</Skeleton>
        </div>
      );

      const skeletons = getAllByDataSlot(container, 'skeleton');
      expect(skeletons).toHaveLength(3);
      expect(skeletons[0]).toHaveTextContent('First skeleton');
      expect(skeletons[1]).toHaveTextContent('Second skeleton');
      expect(skeletons[2]).toHaveTextContent('Third skeleton');
    });

    it('should handle skeletons with different sizes', () => {
      const { container } = render(
        <div>
          <Skeleton className="w-16 h-4">Small</Skeleton>
          <Skeleton className="w-32 h-6">Medium</Skeleton>
          <Skeleton className="w-64 h-8">Large</Skeleton>
        </div>
      );

      const skeletons = getAllByDataSlot(container, 'skeleton');
      expect(skeletons[0]).toHaveClass('w-16', 'h-4');
      expect(skeletons[1]).toHaveClass('w-32', 'h-6');
      expect(skeletons[2]).toHaveClass('w-64', 'h-8');
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for default skeleton', () => {
      const { container } = render(<Skeleton />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for skeleton with content', () => {
      const { container } = render(<Skeleton>Loading content</Skeleton>);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for skeleton with custom styling', () => {
      const { container } = render(<Skeleton className="w-32 h-8 bg-gray-200" />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for multiple skeletons', () => {
      const { container } = render(
        <div>
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-64 h-8" />
        </div>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Performance Testing', () => {
    it('should handle rapid re-renders efficiently', () => {
      const { rerender } = render(<Skeleton>Initial skeleton</Skeleton>);

      expect(screen.getByText('Initial skeleton')).toBeInTheDocument();

      // Rerender with different content
      rerender(<Skeleton>Updated skeleton</Skeleton>);

      expect(screen.getByText('Updated skeleton')).toBeInTheDocument();
      expect(screen.queryByText('Initial skeleton')).not.toBeInTheDocument();
    });

    it('should handle className changes efficiently', () => {
      const { rerender, container } = render(<Skeleton className="w-16 h-4">Small</Skeleton>);

      const skeleton = getByDataSlot(container, 'skeleton');
      expect(skeleton).toHaveClass('w-16', 'h-4');

      // Change className
      rerender(<Skeleton className="w-32 h-6">Medium</Skeleton>);

      const updatedSkeleton = getByDataSlot(container, 'skeleton');
      expect(updatedSkeleton).toHaveClass('w-32', 'h-6');
      expect(updatedSkeleton).not.toHaveClass('w-16', 'h-4');
    });

    it('should handle multiple skeleton renders efficiently', () => {
      const skeletons = Array.from({ length: 100 }, (_, i) => `Skeleton ${i + 1}`);

      const startTime = performance.now();

      render(
        <div>
          {skeletons.map((text, index) => (
            <Skeleton key={index} className="w-16 h-4">
              {text}
            </Skeleton>
          ))}
        </div>
      );

      const endTime = performance.now();

      expect(screen.getByText('Skeleton 1')).toBeInTheDocument();
      expect(screen.getByText('Skeleton 100')).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });
  });
}); 