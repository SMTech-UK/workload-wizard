import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '@/components/ui/checkbox';

// Custom query to find elements by data-slot attribute
const getByDataSlot = (container: HTMLElement, slotName: string) => {
  return container.querySelector(`[data-slot="${slotName}"]`);
};

const getAllByDataSlot = (container: HTMLElement, slotName: string) => {
  return container.querySelectorAll(`[data-slot="${slotName}"]`);
};

describe('Checkbox Component - Comprehensive UI Testing', () => {
  describe('Basic Rendering and Functionality', () => {
    it('should render checkbox with default styling', () => {
      // Arrange
      const { container } = render(<Checkbox />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveClass(
        'peer', 'border-input', 'size-4', 'shrink-0', 'rounded-[4px]', 'border', 'shadow-xs'
      );
    });

    it('should render checkbox with custom className', () => {
      // Arrange
      const { container } = render(<Checkbox className="custom-checkbox" />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('custom-checkbox');
      expect(checkbox).toHaveClass('peer', 'border-input', 'size-4', 'shrink-0', 'rounded-[4px]', 'border');
    });

    it('should render checkbox indicator', () => {
      // Arrange
      const { container } = render(<Checkbox />);

      // Act & Assert
      const indicator = getByDataSlot(container, 'checkbox-indicator');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('flex', 'items-center', 'justify-center', 'text-current', 'transition-none');
    });

    it('should render checkbox with default unchecked state', () => {
      // Arrange
      const { container } = render(<Checkbox />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox') as HTMLButtonElement;
      expect(checkbox).not.toBeChecked();
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('should render checkbox with checked state', () => {
      // Arrange
      const { container } = render(<Checkbox defaultChecked />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox') as HTMLButtonElement;
      expect(checkbox).toBeChecked();
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should render checkbox with indeterminate state', () => {
      // Arrange
      const { container } = render(<Checkbox data-state="indeterminate" />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox') as HTMLButtonElement;
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper semantic structure', () => {
      // Arrange
      const { container } = render(<Checkbox />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox?.tagName).toBe('BUTTON');
      expect(checkbox).toHaveAttribute('data-slot', 'checkbox');
      expect(checkbox).toHaveAttribute('type', 'button');
    });

    it('should support ARIA attributes', () => {
      // Arrange
      const { container } = render(<Checkbox aria-label="Accept terms" />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Accept terms');
    });

    it('should support aria-checked attribute', () => {
      // Arrange
      const { container } = render(<Checkbox defaultChecked />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should support aria-invalid attribute', () => {
      // Arrange
      const { container } = render(<Checkbox aria-invalid="true" />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
      expect(checkbox).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive');
    });

    it('should support role attribute', () => {
      // Arrange
      const { container } = render(<Checkbox role="checkbox" />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('role', 'checkbox');
    });

    it('should be keyboard accessible', () => {
      // Arrange
      const { container } = render(<Checkbox />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('tabIndex', '0');
    });

    it('should support focus-visible styling', () => {
      // Arrange
      const { container } = render(<Checkbox />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50', 'focus-visible:ring-[3px]');
    });
  });

  describe('User Interaction Testing', () => {
    it('should toggle state when clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Checkbox />);

      // Act
      const checkbox = getByDataSlot(container, 'checkbox') as HTMLButtonElement;
      await user.click(checkbox);

      // Assert
      expect(checkbox).toBeChecked();
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should toggle state when space key is pressed', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Checkbox />);

      // Act
      const checkbox = getByDataSlot(container, 'checkbox') as HTMLButtonElement;
      checkbox.focus();
      await user.keyboard(' ');

      // Assert
      expect(checkbox).toBeChecked();
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should toggle state when enter key is pressed', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Checkbox />);

      // Act
      const checkbox = getByDataSlot(container, 'checkbox') as HTMLButtonElement;
      checkbox.focus();
      await user.keyboard('{Enter}');

      // Assert
      expect(checkbox).toBeChecked();
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should call onChange handler when toggled', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const { container } = render(<Checkbox onCheckedChange={handleChange} />);

      // Act
      const checkbox = getByDataSlot(container, 'checkbox') as HTMLButtonElement;
      await user.click(checkbox);

      // Assert
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('should not toggle when disabled', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const { container } = render(<Checkbox disabled onCheckedChange={handleChange} />);

      // Act
      const checkbox = getByDataSlot(container, 'checkbox') as HTMLButtonElement;
      await user.click(checkbox);

      // Assert
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle controlled component properly', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const { container, rerender } = render(<Checkbox checked={false} onCheckedChange={handleChange} />);

      // Act
      const checkbox = getByDataSlot(container, 'checkbox') as HTMLButtonElement;
      await user.click(checkbox);

      // Assert
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(checkbox).not.toBeChecked(); // Should remain false as it's controlled

      // Update to checked state
      rerender(<Checkbox checked={true} onCheckedChange={handleChange} />);
      expect(checkbox).toBeChecked();
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

      const { container } = render(<Checkbox />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('size-4');
      expect(checkbox).toHaveClass('rounded-[4px]');
    });

    it('should maintain proper sizing on tablet screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(<Checkbox />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('size-4');
      expect(checkbox).toHaveClass('rounded-[4px]');
    });

    it('should maintain proper sizing on desktop screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(<Checkbox />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('size-4');
      expect(checkbox).toHaveClass('rounded-[4px]');
    });

    it('should handle custom sizing classes', () => {
      // Arrange
      const { container } = render(<Checkbox className="size-6" />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('size-6');
      expect(checkbox).toHaveClass('rounded-[4px]');
    });
  });

  describe('State Management', () => {
    it('should handle checked state styling', () => {
      // Arrange
      const { container } = render(<Checkbox defaultChecked />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass(
        'data-[state=checked]:bg-primary',
        'data-[state=checked]:text-primary-foreground',
        'data-[state=checked]:border-primary'
      );
    });

    it('should handle indeterminate state styling', () => {
      // Arrange
      const { container } = render(<Checkbox data-state="indeterminate" />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });

    it('should handle disabled state styling', () => {
      // Arrange
      const { container } = render(<Checkbox disabled />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
      expect(checkbox).toBeDisabled();
    });

    it('should handle invalid state styling', () => {
      // Arrange
      const { container } = render(<Checkbox aria-invalid="true" />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle rapid clicking', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const { container } = render(<Checkbox onCheckedChange={handleChange} />);

      // Act
      const checkbox = getByDataSlot(container, 'checkbox') as HTMLButtonElement;
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      // Assert
      expect(handleChange).toHaveBeenCalledTimes(3);
      expect(handleChange).toHaveBeenNthCalledWith(1, true);
      expect(handleChange).toHaveBeenNthCalledWith(2, false);
      expect(handleChange).toHaveBeenNthCalledWith(3, true);
    });

    it('should handle multiple checkboxes', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(
        <div>
          <Checkbox data-testid="checkbox1" />
          <Checkbox data-testid="checkbox2" />
          <Checkbox data-testid="checkbox3" />
        </div>
      );

      // Act
      const checkboxes = getAllByDataSlot(container, 'checkbox');
      await user.click(checkboxes[0] as HTMLButtonElement);
      await user.click(checkboxes[2] as HTMLButtonElement);

      // Assert
      expect(checkboxes).toHaveLength(3);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
    });

    it('should handle checkbox with form context', () => {
      // Arrange
      const { container } = render(
        <form>
          <Checkbox name="terms" value="accepted" />
        </form>
      );

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('name', 'terms');
      expect(checkbox).toHaveAttribute('value', 'accepted');
    });

    it('should handle checkbox with required attribute', () => {
      // Arrange
      const { container } = render(<Checkbox required />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveAttribute('required');
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for default checkbox', () => {
      // Arrange
      const { container } = render(<Checkbox />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for checked checkbox', () => {
      // Arrange
      const { container } = render(<Checkbox defaultChecked />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for disabled checkbox', () => {
      // Arrange
      const { container } = render(<Checkbox disabled />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for invalid checkbox', () => {
      // Arrange
      const { container } = render(<Checkbox aria-invalid="true" />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for multiple checkboxes', () => {
      // Arrange
      const { container } = render(
        <div>
          <Checkbox />
          <Checkbox defaultChecked />
          <Checkbox disabled />
        </div>
      );

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Performance Testing', () => {
    it('should handle rapid re-renders efficiently', () => {
      // Arrange
      const { rerender } = render(<Checkbox />);

      // Act & Assert
      expect(screen.getByRole('button')).toBeInTheDocument();

      // Rerender with different props
      rerender(<Checkbox defaultChecked />);

      expect(screen.getByRole('button')).toBeChecked();
    });

    it('should handle className changes efficiently', () => {
      // Arrange
      const { rerender, container } = render(<Checkbox className="size-4" />);

      // Act & Assert
      const checkbox = getByDataSlot(container, 'checkbox');
      expect(checkbox).toHaveClass('size-4');

      // Change className
      rerender(<Checkbox className="size-6" />);

      const updatedCheckbox = getByDataSlot(container, 'checkbox');
      expect(updatedCheckbox).toHaveClass('size-6');
      expect(updatedCheckbox).not.toHaveClass('size-4');
    });

    it('should handle multiple checkbox renders efficiently', () => {
      // Arrange
      const checkboxes = Array.from({ length: 100 }, (_, i) => `checkbox-${i + 1}`);

      const startTime = performance.now();

      // Act
      render(
        <div>
          {checkboxes.map((id, index) => (
            <Checkbox key={index} data-testid={id} />
          ))}
        </div>
      );

      const endTime = performance.now();

      // Assert
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-100')).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });
  });
}); 