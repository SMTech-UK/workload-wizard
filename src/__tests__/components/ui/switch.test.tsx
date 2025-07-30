import { render, screen } from '@testing-library/react';
import { Switch } from '@/components/ui/switch';

// Helper function to get elements by data-slot
const getByDataSlot = (container: HTMLElement, slot: string) => {
  return container.querySelector(`[data-slot="${slot}"]`);
};

describe('Switch Component - Comprehensive UI Testing', () => {
  describe('Basic Rendering and Functionality', () => {
    it('should render switch with default state', () => {
      const { container } = render(<Switch />);
      
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toHaveAttribute('role', 'switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('should render switch with checked state', () => {
      const { container } = render(<Switch defaultChecked />);
      
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('should render switch thumb', () => {
      const { container } = render(<Switch />);
      
      const thumb = getByDataSlot(container, 'switch-thumb');
      expect(thumb).toBeInTheDocument();
      expect(thumb).toHaveClass('bg-background', 'pointer-events-none', 'block', 'size-4', 'rounded-full');
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = render(<Switch />);
      
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('role', 'switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('should have proper ARIA attributes when checked', () => {
      const { container } = render(<Switch defaultChecked />);
      
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('role', 'switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('should support disabled state', () => {
      const { container } = render(<Switch disabled />);
      
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('disabled');
      expect(switchElement).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should support focus-visible styling', () => {
      const { container } = render(<Switch />);
      
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50');
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should have proper CSS classes for switch', () => {
      const { container } = render(<Switch />);
      
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('peer', 'inline-flex', 'h-[1.15rem]', 'w-8', 'shrink-0', 'items-center', 'rounded-full');
    });

    it('should have proper CSS classes for thumb', () => {
      const { container } = render(<Switch />);
      
      const thumb = getByDataSlot(container, 'switch-thumb');
      expect(thumb).toHaveClass('bg-background', 'pointer-events-none', 'block', 'size-4', 'rounded-full');
    });

    it('should have proper checked state styling', () => {
      const { container } = render(<Switch defaultChecked />);
      
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('data-[state=checked]:bg-primary');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle controlled component', () => {
      const { container } = render(<Switch checked />);
      
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('should handle custom className', () => {
      const { container } = render(<Switch className="custom-class" />);
      
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('custom-class');
    });

    it('should handle aria-describedby attribute', () => {
      const { container } = render(<Switch aria-describedby="description" />);
      
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for unchecked switch', () => {
      const { container } = render(<Switch />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for checked switch', () => {
      const { container } = render(<Switch defaultChecked />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for disabled switch', () => {
      const { container } = render(<Switch disabled />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
}); 