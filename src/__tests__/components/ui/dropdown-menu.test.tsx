import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Dropdown Menu Component - Comprehensive UI Testing', () => {
  const user = userEvent.setup();

  describe('Basic Rendering and Functionality', () => {
    it('should render dropdown trigger button', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument();
    });

    it('should open dropdown when trigger is clicked', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      // Click outside
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when escape key is pressed', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper ARIA attributes', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Open Menu' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should handle keyboard navigation', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Open Menu' });
      trigger.focus();

      // Open with Enter key
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.queryByText('Item 3')).not.toBeInTheDocument();
      });
    });

    it('should announce menu to screen readers', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText('Menu Label')).toBeInTheDocument();
        expect(screen.getByText('Item 1')).toBeInTheDocument();
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Open Menu' });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass('inline-flex', 'items-center');
    });

    it('should handle mobile viewport correctly', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Open Menu' });
      expect(trigger).toBeInTheDocument();
      // Should have mobile-friendly touch target
      expect(trigger).toHaveClass('h-10');
    });
  });

  describe('Content Structure', () => {
    it('should render menu with labels and separators', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText('Actions')).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Preferences')).toBeInTheDocument();
      });
    });

    it('should handle disabled menu items', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Enabled Item</DropdownMenuItem>
            <DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText('Enabled Item')).toBeInTheDocument();
        expect(screen.getByText('Disabled Item')).toBeInTheDocument();
      });

      const disabledItem = screen.getByText('Disabled Item');
      expect(disabledItem.closest('[role="menuitem"]')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should handle empty menu gracefully', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* No items */}
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle menu item clicks', async () => {
      const onItemClick = jest.fn();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onItemClick}>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Item 1'));

      expect(onItemClick).toHaveBeenCalled();
    });

    it('should close menu after item selection', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Item 1'));

      await waitFor(() => {
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      });
    });

    it('should handle multiple dropdowns correctly', async () => {
      render(
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Menu 1</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Item 1</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Menu 2</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Item 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );

      await user.click(screen.getByRole('button', { name: 'Menu 1' }));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Menu 2' }));

      await waitFor(() => {
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long menu item text', async () => {
      const longText = 'A'.repeat(200);

      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{longText}</DropdownMenuItem>
            <DropdownMenuItem>Short Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText(longText)).toBeInTheDocument();
        expect(screen.getByText('Short Item')).toBeInTheDocument();
      });
    });

    it('should handle special characters in menu items', async () => {
      const specialText = 'Menu item with special chars: <>&"\'<>';

      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{specialText}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText(specialText)).toBeInTheDocument();
      });
    });

    it('should handle many menu items efficiently', async () => {
      const manyItems = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);

      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {manyItems.map((item, index) => (
              <DropdownMenuItem key={index}>{item}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 50')).toBeInTheDocument();
      });
    });

    it('should handle rapid open/close operations', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Open Menu' });

      // Rapid clicks
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for basic dropdown', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for dropdown with labels and separators', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for opened dropdown', async () => {
      const { container } = render(
        <DropdownMenu defaultOpen>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Performance Testing', () => {
    it('should handle large menu lists efficiently', async () => {
      const largeMenuItems = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {largeMenuItems.map((item, index) => (
              <DropdownMenuItem key={index}>{item}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const startTime = performance.now();
      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 100')).toBeInTheDocument();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });

    it('should handle rapid interactions efficiently', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Open Menu' });

      // Rapid open/close cycles
      for (let i = 0; i < 5; i++) {
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByText('Item 1')).toBeInTheDocument();
        });
        await user.keyboard('{Escape}');
        await waitFor(() => {
          expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
        });
      }
    });
  });
}); 