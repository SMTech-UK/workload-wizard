import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Dialog Component - Comprehensive UI Testing', () => {
  const user = userEvent.setup();

  describe('Basic Rendering and Functionality', () => {
    it('should render dialog trigger button', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>This is a test dialog</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByRole('button', { name: 'Open Dialog' })).toBeInTheDocument();
    });

    it('should open dialog when trigger is clicked', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>This is a test dialog</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Test Dialog')).toBeInTheDocument();
        expect(screen.getByText('This is a test dialog')).toBeInTheDocument();
      });
    });

    it('should close dialog when escape key is pressed', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close dialog when clicking outside', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click outside the dialog
      const overlay = screen.getByRole('dialog').parentElement;
      if (overlay) {
        await user.click(overlay);
      }

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper ARIA attributes', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>This is a test dialog</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby');
        expect(dialog).toHaveAttribute('aria-describedby');
      });
    });

    it('should have proper focus management', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button>Cancel</Button>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Focus should be trapped within the dialog
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveFocus();
    });

    it('should announce dialog to screen readers', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>This is a test dialog</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        const title = screen.getByText('Test Dialog');
        const description = screen.getByText('This is a test dialog');
        
        expect(dialog).toHaveAttribute('aria-labelledby', title.id);
        expect(dialog).toHaveAttribute('aria-describedby', description.id);
      });
    });

    it('should handle keyboard navigation properly', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button>Cancel</Button>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Tab navigation should work within dialog
      await user.tab();
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to different screen sizes', async () => {
      // Mock different screen sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // Tablet size
      });

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        // Dialog should be responsive and adapt to screen size
        expect(dialog).toHaveClass('sm:max-w-lg');
      });
    });

    it('should handle mobile viewport correctly', async () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobile size
      });

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        // Should have mobile-specific classes
        expect(dialog.parentElement).toHaveClass('fixed', 'inset-0');
      });
    });
  });

  describe('Content Structure', () => {
    it('should render dialog with header, content, and footer', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>This is a test dialog</DialogDescription>
            </DialogHeader>
            <div>Dialog content goes here</div>
            <DialogFooter>
              <Button>Cancel</Button>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByText('Test Dialog')).toBeInTheDocument();
        expect(screen.getByText('This is a test dialog')).toBeInTheDocument();
        expect(screen.getByText('Dialog content goes here')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
      });
    });

    it('should handle dialog without description', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByText('Test Dialog')).toBeInTheDocument();
        expect(screen.queryByText('This is a test dialog')).not.toBeInTheDocument();
      });
    });

    it('should handle dialog without footer', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
            <div>Dialog content goes here</div>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByText('Test Dialog')).toBeInTheDocument();
        expect(screen.getByText('Dialog content goes here')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle multiple dialogs correctly', async () => {
      render(
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog 1</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog 1</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog 2</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog 2</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog 1' }));

      await waitFor(() => {
        expect(screen.getByText('Dialog 1')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Open Dialog 2' }));

      await waitFor(() => {
        expect(screen.getByText('Dialog 2')).toBeInTheDocument();
        // First dialog should be closed when second opens
        expect(screen.queryByText('Dialog 1')).not.toBeInTheDocument();
      });
    });

    it('should handle form submission in dialog', async () => {
      const handleSubmit = jest.fn();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Form Dialog</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Enter name" />
              <DialogFooter>
                <Button type="button">Cancel</Button>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Enter name'), 'John Doe');
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long content gracefully', async () => {
      const longContent = 'A'.repeat(1000);

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Long Content Dialog</DialogTitle>
            </DialogHeader>
            <div>{longContent}</div>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByText('Long Content Dialog')).toBeInTheDocument();
        expect(screen.getByText(longContent)).toBeInTheDocument();
      });
    });

    it('should handle special characters in content', async () => {
      const specialContent = 'Test with special chars: <>&"\'';

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Special Characters</DialogTitle>
            </DialogHeader>
            <div>{specialContent}</div>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByText('Special Characters')).toBeInTheDocument();
        expect(screen.getByText(specialContent)).toBeInTheDocument();
      });
    });

    it('should handle empty content gracefully', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Empty Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByText('Empty Dialog')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Snapshot Testing', () => {
    it('should maintain consistent UI structure for dialog components', () => {
      // Arrange & Act
      const { container: triggerContainer } = render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>Dialog content</DialogContent>
        </Dialog>
      );
      
      const { container: headerContainer } = render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      
      const { container: footerContainer } = render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter>
              <button>Save</button>
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      
      // Assert
      expect(triggerContainer).toMatchSnapshot('dialog-trigger-structure');
      expect(headerContainer).toMatchSnapshot('dialog-header-structure');
      expect(footerContainer).toMatchSnapshot('dialog-footer-structure');
    });

    it('should maintain consistent UI structure with complete dialog', () => {
      // Arrange & Act
      const { container } = render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Dialog</DialogTitle>
              <DialogDescription>This is a complete dialog example</DialogDescription>
            </DialogHeader>
            <div>Main dialog content goes here</div>
            <DialogFooter>
              <button>Save</button>
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      
      // Assert
      expect(container).toMatchSnapshot('dialog-complete-structure');
    });

    it('should maintain consistent UI structure with custom styling', () => {
      // Arrange & Act
      const { container } = render(
        <Dialog defaultOpen>
          <DialogContent className="bg-gradient-to-br from-purple-100 to-blue-100 border-purple-300">
            <DialogHeader>
              <DialogTitle className="text-purple-800">Styled Dialog</DialogTitle>
              <DialogDescription className="text-purple-600">Custom styled dialog</DialogDescription>
            </DialogHeader>
            <div className="text-purple-700">Styled content</div>
          </DialogContent>
        </Dialog>
      );
      
      // Assert
      expect(container).toMatchSnapshot('dialog-custom-styling');
    });
  });

  describe('Performance Testing', () => {
    it('should handle rapid open/close operations', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      // Rapid clicks
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should handle multiple dialogs efficiently', async () => {
      const { rerender } = render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Rerender with different content
      rerender(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog 2</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog 2</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Dialog 2')).toBeInTheDocument();
      });
    });
  });
}); 