import { render, screen } from '@testing-library/react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

describe('ScrollArea Component', () => {
  describe('ScrollArea', () => {
    it('should render scroll area with children', () => {
      // Arrange & Act
      render(
        <ScrollArea>
          <div>Scrollable content</div>
        </ScrollArea>
      );
      
      // Assert
      expect(screen.getByText('Scrollable content')).toBeInTheDocument();
    });

    it('should render scroll area with custom className', () => {
      // Arrange
      const customClass = 'custom-scroll-area';
      
      // Act
      render(
        <ScrollArea className={customClass}>
          <div>Scrollable content</div>
        </ScrollArea>
      );
      
      // Assert
      const scrollArea = screen.getByText('Scrollable content').closest('[data-radix-scroll-area-viewport]');
      expect(scrollArea?.parentElement).toHaveClass(customClass);
    });

    it('should render scroll area with custom className', () => {
      // Arrange
      const customClass = 'custom-scroll-area-2';
      
      // Act
      render(
        <ScrollArea className={customClass}>
          <div>Custom scrollable content</div>
        </ScrollArea>
      );
      
      // Assert
      const scrollArea = screen.getByText('Custom scrollable content').closest('[data-radix-scroll-area-viewport]');
      expect(scrollArea?.parentElement).toHaveClass(customClass);
    });

    it('should render scroll area with scroll hide delay', () => {
      // Arrange & Act
      render(
        <ScrollArea scrollHideDelay={1000}>
          <div>Scrollable content with delay</div>
        </ScrollArea>
      );
      
      // Assert
      expect(screen.getByText('Scrollable content with delay')).toBeInTheDocument();
    });
  });

  describe('ScrollBar', () => {
    it('should render scroll bar with custom className', () => {
      // Arrange
      const customClass = 'custom-scroll-bar';
      
      // Act
      render(
        <ScrollArea>
          <div>Scrollable content</div>
          <ScrollBar className={customClass} />
        </ScrollArea>
      );
      
      // Assert
      const scrollBar = screen.getByRole('scrollbar');
      expect(scrollBar).toHaveClass(customClass);
    });

    it('should render scroll bar with custom orientation', () => {
      // Arrange & Act
      render(
        <ScrollArea>
          <div>Scrollable content</div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      );
      
      // Assert
      const scrollBar = screen.getByRole('scrollbar');
      expect(scrollBar).toBeInTheDocument();
    });
  });

  describe('ScrollArea Integration', () => {
    it('should render scroll area with scroll bar', () => {
      // Arrange & Act
      render(
        <ScrollArea>
          <div>Scrollable content</div>
          <ScrollBar />
        </ScrollArea>
      );
      
      // Assert
      expect(screen.getByText('Scrollable content')).toBeInTheDocument();
      expect(screen.getByRole('scrollbar')).toBeInTheDocument();
    });

    it('should handle long content that requires scrolling', () => {
      // Arrange
      const longContent = Array.from({ length: 50 }, (_, i) => `Content item ${i + 1}`).join('\n');
      
      // Act
      render(
        <ScrollArea className="h-32">
          <div>{longContent}</div>
        </ScrollArea>
      );
      
      // Assert
      expect(screen.getByText('Content item 1')).toBeInTheDocument();
      expect(screen.getByText('Content item 50')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Arrange & Act
      render(
        <ScrollArea>
          <div>Scrollable content</div>
        </ScrollArea>
      );
      
      // Assert
      const scrollArea = screen.getByText('Scrollable content').closest('[data-radix-scroll-area-viewport]');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should have proper scrollbar role', () => {
      // Arrange & Act
      render(
        <ScrollArea>
          <div>Scrollable content</div>
          <ScrollBar />
        </ScrollArea>
      );
      
      // Assert
      const scrollBar = screen.getByRole('scrollbar');
      expect(scrollBar).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have proper base styling classes', () => {
      // Arrange & Act
      render(
        <ScrollArea>
          <div>Scrollable content</div>
        </ScrollArea>
      );
      
      // Assert
      const scrollArea = screen.getByText('Scrollable content').closest('[data-radix-scroll-area-viewport]');
      expect(scrollArea?.parentElement).toHaveClass('relative', 'overflow-hidden');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      // Arrange & Act
      render(
        <ScrollArea>
          <div></div>
        </ScrollArea>
      );
      
      // Assert
      const scrollArea = screen.getByRole('generic');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      // Arrange
      const veryLongContent = Array.from({ length: 1000 }, (_, i) => `Very long content item ${i + 1}`).join('\n');
      
      // Act
      render(
        <ScrollArea className="h-16">
          <div>{veryLongContent}</div>
        </ScrollArea>
      );
      
      // Assert
      expect(screen.getByText('Very long content item 1')).toBeInTheDocument();
      expect(screen.getByText('Very long content item 1000')).toBeInTheDocument();
    });
  });
}); 