import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '@/components/ui/switch';

// Custom query to find elements by data-slot attribute
const getByDataSlot = (container: HTMLElement, slotName: string) => {
  return container.querySelector(`[data-slot="${slotName}"]`);
};

const getAllByDataSlot = (container: HTMLElement, slotName: string) => {
  return container.querySelectorAll(`[data-slot="${slotName}"]`);
};

describe('Switch Component - Comprehensive UI Testing', () => {
  describe('Basic Rendering and Functionality', () => {
    it('should render switch with default styling', () => {
      // Arrange
      const { container } = render(<Switch />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toHaveClass(
        'peer', 'inline-flex', 'h-[1.15rem]', 'w-8', 'shrink-0', 'items-center', 'rounded-full', 'border', 'border-transparent', 'shadow-xs'
      );
    });

    it('should render switch with custom className', () => {
      // Arrange
      const { container } = render(<Switch className="custom-switch" />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('custom-switch');
      expect(switchElement).toHaveClass('peer', 'inline-flex', 'h-[1.15rem]', 'w-8', 'shrink-0', 'items-center', 'rounded-full');
    });

    it('should render switch thumb', () => {
      // Arrange
      const { container } = render(<Switch />);

      // Act & Assert
      const thumb = getByDataSlot(container, 'switch-thumb');
      expect(thumb).toBeInTheDocument();
      expect(thumb).toHaveClass(
        'bg-background', 'pointer-events-none', 'block', 'size-4', 'rounded-full', 'ring-0', 'transition-transform'
      );
    });

    it('should render switch with default unchecked state', () => {
      // Arrange
      const { container } = render(<Switch />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch') as HTMLButtonElement;
      expect(switchElement).not.toBeChecked();
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('should render switch with checked state', () => {
      // Arrange
      const { container } = render(<Switch defaultChecked />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch') as HTMLButtonElement;
      expect(switchElement).toBeChecked();
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper semantic structure', () => {
      // Arrange
      const { container } = render(<Switch />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement?.tagName).toBe('BUTTON');
      expect(switchElement).toHaveAttribute('data-slot', 'switch');
      expect(switchElement).toHaveAttribute('type', 'button');
    });

    it('should support ARIA attributes', () => {
      // Arrange
      const { container } = render(<Switch aria-label="Toggle notifications" />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('aria-label', 'Toggle notifications');
    });

    it('should support aria-checked attribute', () => {
      // Arrange
      const { container } = render(<Switch defaultChecked />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('should support role attribute', () => {
      // Arrange
      const { container } = render(<Switch role="switch" />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('role', 'switch');
    });

    it('should be keyboard accessible', () => {
      // Arrange
      const { container } = render(<Switch />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('tabIndex', '0');
    });

    it('should support focus-visible styling', () => {
      // Arrange
      const { container } = render(<Switch />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50', 'focus-visible:ring-[3px]');
    });
  });

  describe('User Interaction Testing', () => {
    it('should toggle state when clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Switch />);

      // Act
      const switchElement = getByDataSlot(container, 'switch') as HTMLButtonElement;
      await user.click(switchElement);

      // Assert
      expect(switchElement).toBeChecked();
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('should toggle state when space key is pressed', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Switch />);

      // Act
      const switchElement = getByDataSlot(container, 'switch') as HTMLButtonElement;
      switchElement.focus();
      await user.keyboard(' ');

      // Assert
      expect(switchElement).toBeChecked();
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('should toggle state when enter key is pressed', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Switch />);

      // Act
      const switchElement = getByDataSlot(container, 'switch') as HTMLButtonElement;
      switchElement.focus();
      await user.keyboard('{Enter}');

      // Assert
      expect(switchElement).toBeChecked();
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('should call onChange handler when toggled', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const { container } = render(<Switch onCheckedChange={handleChange} />);

      // Act
      const switchElement = getByDataSlot(container, 'switch') as HTMLButtonElement;
      await user.click(switchElement);

      // Assert
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('should not toggle when disabled', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const { container } = render(<Switch disabled onCheckedChange={handleChange} />);

      // Act
      const switchElement = getByDataSlot(container, 'switch') as HTMLButtonElement;
      await user.click(switchElement);

      // Assert
      expect(switchElement).toBeDisabled();
      expect(switchElement).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle controlled component properly', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const { container, rerender } = render(<Switch checked={false} onCheckedChange={handleChange} />);

      // Act
      const switchElement = getByDataSlot(container, 'switch') as HTMLButtonElement;
      await user.click(switchElement);

      // Assert
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(switchElement).not.toBeChecked(); // Should remain false as it's controlled

      // Update to checked state
      rerender(<Switch checked={true} onCheckedChange={handleChange} />);
      expect(switchElement).toBeChecked();
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

      const { container } = render(<Switch />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('h-[1.15rem]', 'w-8');
      expect(switchElement).toHaveClass('rounded-full');
    });

    it('should maintain proper sizing on tablet screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(<Switch />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('h-[1.15rem]', 'w-8');
      expect(switchElement).toHaveClass('rounded-full');
    });

    it('should maintain proper sizing on desktop screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(<Switch />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('h-[1.15rem]', 'w-8');
      expect(switchElement).toHaveClass('rounded-full');
    });

    it('should handle custom sizing classes', () => {
      // Arrange
      const { container } = render(<Switch className="h-6 w-12" />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('h-6', 'w-12');
      expect(switchElement).toHaveClass('rounded-full');
    });
  });

  describe('State Management', () => {
    it('should handle checked state styling', () => {
      // Arrange
      const { container } = render(<Switch defaultChecked />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('data-[state=checked]:bg-primary');
    });

    it('should handle unchecked state styling', () => {
      // Arrange
      const { container } = render(<Switch />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('data-[state=unchecked]:bg-input');
    });

    it('should handle disabled state styling', () => {
      // Arrange
      const { container } = render(<Switch disabled />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
      expect(switchElement).toBeDisabled();
    });

    it('should handle thumb positioning for checked state', () => {
      // Arrange
      const { container } = render(<Switch defaultChecked />);

      // Act & Assert
      const thumb = getByDataSlot(container, 'switch-thumb');
      expect(thumb).toHaveClass('data-[state=checked]:translate-x-[calc(100%-2px)]');
    });

    it('should handle thumb positioning for unchecked state', () => {
      // Arrange
      const { container } = render(<Switch />);

      // Act & Assert
      const thumb = getByDataSlot(container, 'switch-thumb');
      expect(thumb).toHaveClass('data-[state=unchecked]:translate-x-0');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle rapid clicking', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const { container } = render(<Switch onCheckedChange={handleChange} />);

      // Act
      const switchElement = getByDataSlot(container, 'switch') as HTMLButtonElement;
      await user.click(switchElement);
      await user.click(switchElement);
      await user.click(switchElement);

      // Assert
      expect(handleChange).toHaveBeenCalledTimes(3);
      expect(handleChange).toHaveBeenNthCalledWith(1, true);
      expect(handleChange).toHaveBeenNthCalledWith(2, false);
      expect(handleChange).toHaveBeenNthCalledWith(3, true);
    });

    it('should handle multiple switches', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(
        <div>
          <Switch data-testid="switch1" />
          <Switch data-testid="switch2" />
          <Switch data-testid="switch3" />
        </div>
      );

      // Act
      const switches = getAllByDataSlot(container, 'switch');
      await user.click(switches[0] as HTMLButtonElement);
      await user.click(switches[2] as HTMLButtonElement);

      // Assert
      expect(switches).toHaveLength(3);
      expect(switches[0]).toBeChecked();
      expect(switches[1]).not.toBeChecked();
      expect(switches[2]).toBeChecked();
    });

    it('should handle switch with form context', () => {
      // Arrange
      const { container } = render(
        <form>
          <Switch name="notifications" value="enabled" />
        </form>
      );

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('name', 'notifications');
      expect(switchElement).toHaveAttribute('value', 'enabled');
    });

    it('should handle switch with required attribute', () => {
      // Arrange
      const { container } = render(<Switch required />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('required');
    });

    it('should handle switch with aria-describedby', () => {
      // Arrange
      const { container } = render(<Switch aria-describedby="switch-description" />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveAttribute('aria-describedby', 'switch-description');
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for default switch', () => {
      // Arrange
      const { container } = render(<Switch />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for checked switch', () => {
      // Arrange
      const { container } = render(<Switch defaultChecked />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for disabled switch', () => {
      // Arrange
      const { container } = render(<Switch disabled />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for multiple switches', () => {
      // Arrange
      const { container } = render(
        <div>
          <Switch />
          <Switch defaultChecked />
          <Switch disabled />
        </div>
      );

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for switch with custom styling', () => {
      // Arrange
      const { container } = render(<Switch className="h-6 w-12" />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Performance Testing', () => {
    it('should handle rapid re-renders efficiently', () => {
      // Arrange
      const { rerender } = render(<Switch />);

      // Act & Assert
      expect(screen.getByRole('button')).toBeInTheDocument();

      // Rerender with different props
      rerender(<Switch defaultChecked />);

      expect(screen.getByRole('button')).toBeChecked();
    });

    it('should handle className changes efficiently', () => {
      // Arrange
      const { rerender, container } = render(<Switch className="h-[1.15rem] w-8" />);

      // Act & Assert
      const switchElement = getByDataSlot(container, 'switch');
      expect(switchElement).toHaveClass('h-[1.15rem]', 'w-8');

      // Change className
      rerender(<Switch className="h-6 w-12" />);

      const updatedSwitch = getByDataSlot(container, 'switch');
      expect(updatedSwitch).toHaveClass('h-6', 'w-12');
      expect(updatedSwitch).not.toHaveClass('h-[1.15rem]', 'w-8');
    });

    it('should handle multiple switch renders efficiently', () => {
      // Arrange
      const switches = Array.from({ length: 100 }, (_, i) => `switch-${i + 1}`);

      const startTime = performance.now();

      // Act
      render(
        <div>
          {switches.map((id, index) => (
            <Switch key={index} data-testid={id} />
          ))}
        </div>
      );

      const endTime = performance.now();

      // Assert
      expect(screen.getByTestId('switch-1')).toBeInTheDocument();
      expect(screen.getByTestId('switch-100')).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });

    it('should handle state transitions efficiently', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Switch />);

      const startTime = performance.now();

      // Act
      const switchElement = getByDataSlot(container, 'switch') as HTMLButtonElement;
      await user.click(switchElement);
      await user.click(switchElement);
      await user.click(switchElement);

      const endTime = performance.now();

      // Assert
      expect(switchElement).toBeChecked();
      expect(endTime - startTime).toBeLessThan(500); // Should transition within 500ms
    });
  });
}); 