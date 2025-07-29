import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

describe('Tooltip Component', () => {
  describe('TooltipProvider', () => {
    it('should render provider with default props', () => {
      // Arrange & Act
      render(
        <TooltipProvider>
          <div>Test content</div>
        </TooltipProvider>
      );
      
      // Assert
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render provider with custom delay duration', () => {
      // Arrange
      const delayDuration = 1000;
      
      // Act
      render(
        <TooltipProvider delayDuration={delayDuration}>
          <div>Test content</div>
        </TooltipProvider>
      );
      
      // Assert
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render provider with custom skip delay duration', () => {
      // Arrange
      const skipDelayDuration = 500;
      
      // Act
      render(
        <TooltipProvider skipDelayDuration={skipDelayDuration}>
          <div>Test content</div>
        </TooltipProvider>
      );
      
      // Assert
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('TooltipTrigger', () => {
    it('should render trigger with children', () => {
      // Arrange & Act
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('should render trigger with custom className', () => {
      // Arrange
      const customClass = 'custom-trigger';
      
      // Act
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className={customClass}>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      const trigger = screen.getByText('Hover me');
      expect(trigger).toHaveClass(customClass);
    });

    it('should render trigger with disabled state', () => {
      // Arrange & Act
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger disabled>Disabled trigger</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      const trigger = screen.getByText('Disabled trigger');
      expect(trigger).toBeDisabled();
    });
  });

  describe('TooltipContent', () => {
    it('should render content with text', () => {
      // Arrange & Act
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    it('should render content with custom className', () => {
      // Arrange
      const customClass = 'custom-content';
      
      // Act
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent className={customClass}>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      const content = screen.getByText('Tooltip content');
      expect(content).toHaveClass(customClass);
    });

    it('should render content with custom side', () => {
      // Arrange & Act
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent side="top">Top tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      expect(screen.getByText('Top tooltip')).toBeInTheDocument();
    });

    it('should render content with custom align', () => {
      // Arrange & Act
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent align="start">Aligned tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      expect(screen.getByText('Aligned tooltip')).toBeInTheDocument();
    });
  });

  describe('Complete Tooltip Integration', () => {
    it('should show tooltip on hover', async () => {
      // Arrange
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Hover tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Act
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      // Assert
      await waitFor(() => {
        expect(screen.getByText('Hover tooltip')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      // Arrange
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Hover tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Act
      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('Hover tooltip')).toBeInTheDocument();
      });
      
      fireEvent.mouseLeave(trigger);
      
      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Hover tooltip')).not.toBeInTheDocument();
      });
    });

    it('should show tooltip by default when defaultOpen is true', () => {
      // Arrange & Act
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Default open tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      expect(screen.getByText('Default open tooltip')).toBeInTheDocument();
    });

    it('should handle controlled open state', () => {
      // Arrange & Act
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Controlled tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      expect(screen.getByText('Controlled tooltip')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Arrange & Act
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Accessible tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      const trigger = screen.getByText('Hover me');
      const content = screen.getByText('Accessible tooltip');
      
      expect(trigger).toHaveAttribute('aria-describedby');
      expect(content).toHaveAttribute('role', 'tooltip');
    });

    it('should handle keyboard navigation', () => {
      // Arrange & Act
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Keyboard tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      const trigger = screen.getByText('Hover me');
      expect(trigger).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Styling', () => {
    it('should have proper base styling classes', () => {
      // Arrange & Act
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Styled tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      // Assert
      const content = screen.getByText('Styled tooltip');
      expect(content).toHaveClass('z-50', 'overflow-hidden', 'rounded-md', 'border', 'bg-popover', 'px-3', 'py-1.5', 'text-sm', 'text-popover-foreground', 'shadow-md', 'animate-in', 'fade-in-0', 'zoom-in-95');
    });
  });
}); 