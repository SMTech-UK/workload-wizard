import { render, screen } from '@testing-library/react';
import { Checkbox } from '@/components/ui/checkbox';

// Helper function to get elements by data-slot
const getByDataSlot = (container: HTMLElement, slot: string) => {
  return container.querySelector(`[data-slot="${slot}"]`);
};

describe('Checkbox Component - Comprehensive UI Testing', () => {
  describe('Basic Rendering and Functionality', () => {
    it('should render checkbox with default state', () => {
      const { container } = render(<Checkbox />);
      
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('role', 'checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should render checkbox with checked state', () => {
      const { container } = render(<Checkbox defaultChecked />);
      
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should render checkbox indicator', () => {
      const { container } = render(<Checkbox defaultChecked />);
      
      const indicator = getByDataSlot(container, 'checkbox-indicator');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('flex', 'items-center', 'justify-center', 'text-current');
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = render(<Checkbox />);
      
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('role', 'checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should have proper ARIA attributes when checked', () => {
      const { container } = render(<Checkbox defaultChecked />);
      
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('role', 'checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should support disabled state', () => {
      const { container } = render(<Checkbox disabled />);
      
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('disabled');
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should support focus-visible styling', () => {
      const { container } = render(<Checkbox />);
      
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50');
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should have proper CSS classes for checkbox', () => {
      const { container } = render(<Checkbox />);
      
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('peer', 'border-input', 'size-4', 'shrink-0', 'rounded-[4px]', 'border');
    });

    it('should have proper CSS classes for indicator', () => {
      const { container } = render(<Checkbox defaultChecked />);
      
      const indicator = getByDataSlot(container, 'checkbox-indicator');
      expect(indicator).toHaveClass('flex', 'items-center', 'justify-center', 'text-current');
    });

    it('should have proper checked state styling', () => {
      const { container } = render(<Checkbox defaultChecked />);
      
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('data-[state=checked]:bg-primary', 'data-[state=checked]:text-primary-foreground');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle controlled component', () => {
      const { container } = render(<Checkbox checked />);
      
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should handle indeterminate state', () => {
      const { container } = render(<Checkbox data-state="indeterminate" />);
      
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });

    it('should handle custom className', () => {
      const { container } = render(<Checkbox className="custom-class" />);
      
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('custom-class');
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for unchecked checkbox', () => {
      const { container } = render(<Checkbox />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for checked checkbox', () => {
      const { container } = render(<Checkbox defaultChecked />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for disabled checkbox', () => {
      const { container } = render(<Checkbox disabled />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
}); 