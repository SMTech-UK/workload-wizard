import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Select Component - Comprehensive UI Testing', () => {
  const user = userEvent.setup();

  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  describe('Basic Rendering and Functionality', () => {
    it('should render select trigger button', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should open select dropdown when clicked', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });
    });

    it('should select an option when clicked', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Option 1'));

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.queryByText('Select an option')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      // Click outside
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');
      expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should update ARIA attributes when opened', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        const combobox = screen.getByRole('combobox');
        expect(combobox).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should handle keyboard navigation', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      const combobox = screen.getByRole('combobox');
      combobox.focus();

      // Open with Enter key
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });
    });

    it('should announce selection to screen readers', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Option 1'));

      await waitFor(() => {
        const combobox = screen.getByRole('combobox');
        expect(combobox).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to different screen sizes', () => {
      // Mock tablet screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass('flex', 'h-10');
    });

    it('should handle mobile viewport correctly', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      // Should have mobile-friendly touch target
      expect(trigger).toHaveClass('h-10');
    });
  });

  describe('Content Structure', () => {
    it('should render all options correctly', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        mockOptions.forEach((option) => {
          expect(screen.getByText(option.label)).toBeInTheDocument();
        });
      });
    });

    it('should handle empty options gracefully', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {/* No options */}
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should handle disabled options', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2" disabled>
              Option 2 (Disabled)
            </SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2 (Disabled)')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });

      // Disabled option should not be clickable
      const disabledOption = screen.getByText('Option 2 (Disabled)');
      expect(disabledOption.closest('[role="option"]')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('User Interactions', () => {
    it('should handle controlled component behavior', async () => {
      const onValueChange = jest.fn();

      render(
        <Select onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Option 1'));

      expect(onValueChange).toHaveBeenCalledWith('option1');
    });

    it('should handle default value', () => {
      render(
        <Select defaultValue="option2">
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.queryByText('Select an option')).not.toBeInTheDocument();
    });

    it('should handle multiple rapid selections', async () => {
      const onValueChange = jest.fn();

      render(
        <Select onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole('combobox');

      // Rapid clicks
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Option 1'));
      await user.click(trigger);
      await user.click(screen.getByText('Option 2'));

      expect(onValueChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long option text', async () => {
      const longOption = 'A'.repeat(100);

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="long">{longOption}</SelectItem>
            <SelectItem value="short">Short</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText(longOption)).toBeInTheDocument();
        expect(screen.getByText('Short')).toBeInTheDocument();
      });
    });

    it('should handle special characters in options', async () => {
      const specialOption = 'Option with special chars: <>&"\'<>';

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="special">{specialOption}</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText(specialOption)).toBeInTheDocument();
      });
    });

    it('should handle many options efficiently', async () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {manyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Option 0')).toBeInTheDocument();
        expect(screen.getByText('Option 99')).toBeInTheDocument();
      });
    });

    it('should handle empty value gracefully', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Empty Option</SelectItem>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for basic select', () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for select with default value', () => {
      const { container } = render(
        <Select defaultValue="option2">
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for opened select', async () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Performance Testing', () => {
    it('should handle rapid open/close operations', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {mockOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole('combobox');

      // Rapid clicks
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });

    it('should handle large option lists efficiently', async () => {
      const largeOptions = Array.from({ length: 1000 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {largeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      const startTime = performance.now();
      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Option 0')).toBeInTheDocument();
        expect(screen.getByText('Option 999')).toBeInTheDocument();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });
  });
}); 