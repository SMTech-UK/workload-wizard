import { render, screen, fireEvent } from '@testing-library/react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

describe('Sheet Component', () => {
  describe('SheetTrigger', () => {
    it('should render trigger with children', () => {
      // Arrange & Act
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Open Sheet')).toBeInTheDocument();
    });

    it('should render trigger with custom className', () => {
      // Arrange
      const customClass = 'custom-trigger';
      
      // Act
      render(
        <Sheet>
          <SheetTrigger className={customClass}>Open Sheet</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      const trigger = screen.getByText('Open Sheet');
      expect(trigger).toHaveClass(customClass);
    });

    it('should handle click events', () => {
      // Arrange
      const handleClick = jest.fn();
      
      // Act
      render(
        <Sheet>
          <SheetTrigger onClick={handleClick}>Open Sheet</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      const trigger = screen.getByText('Open Sheet');
      fireEvent.click(trigger);
      
      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('SheetContent', () => {
    it('should render content with children', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Sheet content')).toBeInTheDocument();
    });

    it('should render content with custom className', () => {
      // Arrange
      const customClass = 'custom-content';
      
      // Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent className={customClass}>Sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      const content = screen.getByText('Sheet content');
      expect(content).toHaveClass(customClass);
    });

    it('should render content with custom side', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent side="top">Top sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Top sheet content')).toBeInTheDocument();
    });

    it('should render content with custom side', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent side="left">Left sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Left sheet content')).toBeInTheDocument();
    });
  });

  describe('SheetHeader', () => {
    it('should render header with children', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <h2>Sheet Header</h2>
            </SheetHeader>
            Sheet content
          </SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Sheet Header')).toBeInTheDocument();
    });

    it('should render header with custom className', () => {
      // Arrange
      const customClass = 'custom-header';
      
      // Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader className={customClass}>
              <h2>Sheet Header</h2>
            </SheetHeader>
            Sheet content
          </SheetContent>
        </Sheet>
      );
      
      // Assert
      const header = screen.getByText('Sheet Header').closest('div');
      expect(header).toHaveClass(customClass);
    });
  });

  describe('SheetTitle', () => {
    it('should render title with children', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
            </SheetHeader>
            Sheet content
          </SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    });

    it('should render title with custom className', () => {
      // Arrange
      const customClass = 'custom-title';
      
      // Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className={customClass}>Sheet Title</SheetTitle>
            </SheetHeader>
            Sheet content
          </SheetContent>
        </Sheet>
      );
      
      // Assert
      const title = screen.getByText('Sheet Title');
      expect(title).toHaveClass(customClass);
    });
  });

  describe('SheetDescription', () => {
    it('should render description with children', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
              <SheetDescription>Sheet description</SheetDescription>
            </SheetHeader>
            Sheet content
          </SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Sheet description')).toBeInTheDocument();
    });

    it('should render description with custom className', () => {
      // Arrange
      const customClass = 'custom-description';
      
      // Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
              <SheetDescription className={customClass}>Sheet description</SheetDescription>
            </SheetHeader>
            Sheet content
          </SheetContent>
        </Sheet>
      );
      
      // Assert
      const description = screen.getByText('Sheet description');
      expect(description).toHaveClass(customClass);
    });
  });

  describe('SheetFooter', () => {
    it('should render footer with children', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            Sheet content
            <SheetFooter>
              <button>Save</button>
              <button>Cancel</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render footer with custom className', () => {
      // Arrange
      const customClass = 'custom-footer';
      
      // Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            Sheet content
            <SheetFooter className={customClass}>
              <button>Save</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );
      
      // Assert
      const footer = screen.getByText('Save').closest('div');
      expect(footer).toHaveClass(customClass);
    });
  });

  describe('Sheet Integration', () => {
    it('should open sheet when trigger is clicked', () => {
      // Arrange
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert - Initially closed
      expect(screen.queryByText('Sheet content')).not.toBeInTheDocument();
      
      // Act - Click to open
      const trigger = screen.getByText('Open Sheet');
      fireEvent.click(trigger);
      
      // Assert - Now open
      expect(screen.getByText('Sheet content')).toBeInTheDocument();
    });

    it('should start open when defaultOpen is true', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Sheet content')).toBeInTheDocument();
    });

    it('should handle controlled open state', () => {
      // Arrange & Act
      render(
        <Sheet open={true}>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>Controlled sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Controlled sheet content')).toBeInTheDocument();
    });

    it('should handle controlled closed state', () => {
      // Arrange & Act
      render(
        <Sheet open={false}>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>Controlled sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.queryByText('Controlled sheet content')).not.toBeInTheDocument();
    });
  });

  describe('Complete Sheet Structure', () => {
    it('should render complete sheet with all components', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Complete Sheet</SheetTitle>
              <SheetDescription>This is a complete sheet example</SheetDescription>
            </SheetHeader>
            <div>Main content goes here</div>
            <SheetFooter>
              <button>Save</button>
              <button>Cancel</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Complete Sheet')).toBeInTheDocument();
      expect(screen.getByText('This is a complete sheet example')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      const trigger = screen.getByText('Open Sheet');
      const content = screen.getByText('Sheet content');
      
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(content).toHaveAttribute('role', 'dialog');
    });

    it('should handle keyboard navigation', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      const trigger = screen.getByText('Open Sheet');
      expect(trigger).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Styling', () => {
    it('should have proper base styling classes', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );
      
      // Assert
      const content = screen.getByText('Sheet content');
      expect(content).toHaveClass('fixed', 'inset-y-0', 'right-0', 'z-50', 'h-full', 'w-3/4', 'border-l', 'bg-background', 'p-6', 'shadow-lg', 'transition', 'ease-in-out', 'data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:slide-out-to-right', 'data-[state=open]:slide-in-from-right', 'sm:max-w-sm');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent></SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Open Sheet')).toBeInTheDocument();
    });

    it('should handle complex nested content', () => {
      // Arrange & Act
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Complex Sheet</SheetTitle>
            </SheetHeader>
            <div>
              <h3>Section 1</h3>
              <p>Content for section 1</p>
              <h3>Section 2</h3>
              <p>Content for section 2</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
            <SheetFooter>
              <button>Action 1</button>
              <button>Action 2</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );
      
      // Assert
      expect(screen.getByText('Complex Sheet')).toBeInTheDocument();
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });
  });
}); 