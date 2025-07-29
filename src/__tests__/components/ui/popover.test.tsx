import { render, screen, fireEvent } from '@testing-library/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

describe('Popover Component', () => {
  describe('PopoverTrigger', () => {
    it('should render trigger with children', () => {
      // Arrange & Act
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );
      
      // Assert
      expect(screen.getByText('Open Popover')).toBeInTheDocument();
    });

    it('should render trigger with custom className', () => {
      // Arrange
      const customClass = 'custom-trigger';
      
      // Act
      render(
        <Popover>
          <PopoverTrigger className={customClass}>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );
      
      // Assert
      const trigger = screen.getByText('Open Popover');
      expect(trigger).toHaveClass(customClass);
    });

    it('should handle click events', () => {
      // Arrange
      const handleClick = jest.fn();
      
      // Act
      render(
        <Popover>
          <PopoverTrigger onClick={handleClick}>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );
      
      const trigger = screen.getByText('Open Popover');
      fireEvent.click(trigger);
      
      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('PopoverContent', () => {
    it('should render content with children', () => {
      // Arrange & Act
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );
      
      // Assert
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    it('should render content with custom className', () => {
      // Arrange
      const customClass = 'custom-content';
      
      // Act
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent className={customClass}>Popover content</PopoverContent>
        </Popover>
      );
      
      // Assert
      const content = screen.getByText('Popover content');
      expect(content).toHaveClass(customClass);
    });

    it('should render content with custom side', () => {
      // Arrange & Act
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent side="top">Top popover content</PopoverContent>
        </Popover>
      );
      
      // Assert
      expect(screen.getByText('Top popover content')).toBeInTheDocument();
    });

    it('should render content with custom align', () => {
      // Arrange & Act
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent align="start">Aligned popover content</PopoverContent>
        </Popover>
      );
      
      // Assert
      expect(screen.getByText('Aligned popover content')).toBeInTheDocument();
    });
  });

  describe('Popover Integration', () => {
    it('should open popover when trigger is clicked', () => {
      // Arrange
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );
      
      // Assert - Initially closed
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      
      // Act - Click to open
      const trigger = screen.getByText('Open Popover');
      fireEvent.click(trigger);
      
      // Assert - Now open
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    it('should start open when defaultOpen is true', () => {
      // Arrange & Act
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );
      
      // Assert
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    it('should handle controlled open state', () => {
      // Arrange & Act
      render(
        <Popover open={true}>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Controlled popover content</PopoverContent>
        </Popover>
      );
      
      // Assert
      expect(screen.getByText('Controlled popover content')).toBeInTheDocument();
    });

    it('should handle controlled closed state', () => {
      // Arrange & Act
      render(
        <Popover open={false}>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Controlled popover content</PopoverContent>
        </Popover>
      );
      
      // Assert
      expect(screen.queryByText('Controlled popover content')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Arrange & Act
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );
      
      // Assert
      const trigger = screen.getByText('Open Popover');
      const content = screen.getByText('Popover content');
      
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(content).toHaveAttribute('role', 'dialog');
    });
  });

  describe('Styling', () => {
    it('should have proper base styling classes', () => {
      // Arrange & Act
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );
      
      // Assert
      const content = screen.getByText('Popover content');
      expect(content).toHaveClass('z-50', 'w-72', 'rounded-md', 'border', 'bg-popover', 'p-4', 'text-popover-foreground', 'shadow-md', 'outline-none', 'data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95', 'data-[state=open]:zoom-in-95', 'data-[side=bottom]:slide-in-from-top-2', 'data-[side=left]:slide-in-from-right-2', 'data-[side=right]:slide-in-from-left-2', 'data-[side=top]:slide-in-from-bottom-2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      // Arrange & Act
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent></PopoverContent>
        </Popover>
      );
      
      // Assert
      expect(screen.getByText('Open Popover')).toBeInTheDocument();
    });

    it('should handle complex content structure', () => {
      // Arrange & Act
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>
            <div>
              <h3>Popover Title</h3>
              <p>Popover description</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      );
      
      // Assert
      expect(screen.getByText('Popover Title')).toBeInTheDocument();
      expect(screen.getByText('Popover description')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });
}); 