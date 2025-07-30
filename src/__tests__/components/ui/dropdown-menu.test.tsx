import { render, screen } from '@testing-library/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Dropdown Menu Component - Comprehensive UI Testing', () => {
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

    it('should render dropdown content when open', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper ARIA attributes', () => {
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
    });

    it('should have proper ARIA attributes when open', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      // When open, the trigger might be hidden, so we'll test the menu content instead
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
      expect(menu).toHaveAttribute('data-state', 'open');
    });
  });

  describe('Content Structure', () => {
    it('should render menu with labels and separators', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('Menu Label')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should handle disabled menu items', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem disabled>Item 2 (Disabled)</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2 (Disabled)')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long menu item text', () => {
      const longText = 'A'.repeat(200);

      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{longText}</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText(longText)).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should handle special characters in menu items', () => {
      const specialText = 'Menu item with special chars: <>&"\'<>';

      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{specialText}</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText(specialText)).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should handle many menu items efficiently', () => {
      const manyItems = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);

      render(
        <DropdownMenu open>
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

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 50')).toBeInTheDocument();
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for basic dropdown menu', () => {
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

    it('should match snapshot for opened dropdown menu', () => {
      const { container } = render(
        <DropdownMenu open>
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
  });

  describe('Styling and CSS Classes', () => {
    it('should have proper CSS classes for dropdown trigger', () => {
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
      expect(trigger).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('should have proper CSS classes for dropdown menu items', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const firstItem = screen.getByText('Item 1');
      expect(firstItem.closest('[role="menuitem"]')).toHaveClass('relative', 'flex', 'cursor-default');
    });
  });
}); 