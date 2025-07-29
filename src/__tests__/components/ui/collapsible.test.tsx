import { render, screen, fireEvent } from '@testing-library/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

describe('Collapsible Component', () => {
  describe('CollapsibleTrigger', () => {
    it('should render trigger with children', () => {
      // Arrange & Act
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      expect(screen.getByText('Toggle content')).toBeInTheDocument();
    });

    it('should render trigger with custom className', () => {
      // Arrange
      const customClass = 'custom-trigger';
      
      // Act
      render(
        <Collapsible>
          <CollapsibleTrigger className={customClass}>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      const trigger = screen.getByText('Toggle content');
      expect(trigger).toHaveClass(customClass);
    });

    it('should render trigger with disabled state', () => {
      // Arrange & Act
      render(
        <Collapsible>
          <CollapsibleTrigger disabled>Disabled trigger</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      const trigger = screen.getByText('Disabled trigger');
      expect(trigger).toBeDisabled();
    });

    it('should render trigger as button by default', () => {
      // Arrange & Act
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      const trigger = screen.getByRole('button', { name: 'Toggle content' });
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('CollapsibleContent', () => {
    it('should render content when open', () => {
      // Arrange & Act
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      expect(screen.getByText('Collapsible content')).toBeInTheDocument();
    });

    it('should not render content when closed', () => {
      // Arrange & Act
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      expect(screen.queryByText('Collapsible content')).not.toBeInTheDocument();
    });

    it('should render content with custom className', () => {
      // Arrange
      const customClass = 'custom-content';
      
      // Act
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent className={customClass}>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      const content = screen.getByText('Collapsible content');
      expect(content).toHaveClass(customClass);
    });

    it('should render complex content structure', () => {
      // Arrange & Act
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>
            <div>
              <h3>Title</h3>
              <p>Paragraph content</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  describe('Collapsible Integration', () => {
    it('should toggle content when trigger is clicked', () => {
      // Arrange
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert - Initially closed
      expect(screen.queryByText('Collapsible content')).not.toBeInTheDocument();
      
      // Act - Click to open
      const trigger = screen.getByRole('button', { name: 'Toggle content' });
      fireEvent.click(trigger);
      
      // Assert - Now open
      expect(screen.getByText('Collapsible content')).toBeInTheDocument();
      
      // Act - Click to close
      fireEvent.click(trigger);
      
      // Assert - Now closed
      expect(screen.queryByText('Collapsible content')).not.toBeInTheDocument();
    });

    it('should start open when defaultOpen is true', () => {
      // Arrange & Act
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      expect(screen.getByText('Collapsible content')).toBeInTheDocument();
    });

    it('should handle controlled open state', () => {
      // Arrange & Act
      render(
        <Collapsible open={true}>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Controlled content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      expect(screen.getByText('Controlled content')).toBeInTheDocument();
    });

    it('should handle controlled closed state', () => {
      // Arrange & Act
      render(
        <Collapsible open={false}>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Controlled content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      expect(screen.queryByText('Controlled content')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when closed', () => {
      // Arrange & Act
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      const trigger = screen.getByRole('button', { name: 'Toggle content' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have proper ARIA attributes when open', () => {
      // Arrange & Act
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      const trigger = screen.getByRole('button', { name: 'Toggle content' });
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should update ARIA attributes when toggled', () => {
      // Arrange
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert - Initially closed
      const trigger = screen.getByRole('button', { name: 'Toggle content' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      // Act - Click to open
      fireEvent.click(trigger);
      
      // Assert - Now open
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper role attributes', () => {
      // Arrange & Act
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      const trigger = screen.getByRole('button', { name: 'Toggle content' });
      const content = screen.getByText('Collapsible content');
      
      expect(trigger).toHaveAttribute('role', 'button');
      expect(content).toHaveAttribute('data-state', 'open');
    });
  });

  describe('Styling', () => {
    it('should have proper base styling classes', () => {
      // Arrange & Act
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      const content = screen.getByText('Collapsible content');
      expect(content).toHaveClass('overflow-hidden', 'data-[state=closed]:animate-collapsible-up', 'data-[state=open]:animate-collapsible-down');
    });

    it('should have proper trigger styling', () => {
      // Arrange & Act
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      const trigger = screen.getByRole('button', { name: 'Toggle content' });
      expect(trigger).toHaveClass('flex', 'h-10', 'w-full', 'items-center', 'justify-between', 'py-2', 'text-left', 'text-sm', 'font-medium', 'transition-all', 'hover:underline', '[&[data-state=open]>svg]:rotate-180');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      // Arrange & Act
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
          <CollapsibleContent></CollapsibleContent>
        </Collapsible>
      );
      
      // Assert
      expect(screen.getByRole('button', { name: 'Toggle content' })).toBeInTheDocument();
    });

    it('should handle multiple collapsibles', () => {
      // Arrange & Act
      render(
        <div>
          <Collapsible>
            <CollapsibleTrigger>Toggle 1</CollapsibleTrigger>
            <CollapsibleContent>Content 1</CollapsibleContent>
          </Collapsible>
          <Collapsible>
            <CollapsibleTrigger>Toggle 2</CollapsibleTrigger>
            <CollapsibleContent>Content 2</CollapsibleContent>
          </Collapsible>
        </div>
      );
      
      // Assert
      expect(screen.getByRole('button', { name: 'Toggle 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Toggle 2' })).toBeInTheDocument();
    });
  });
}); 