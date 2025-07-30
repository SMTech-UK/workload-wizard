import { render, screen } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

describe('Tabs Component - Comprehensive UI Testing', () => {
  describe('Basic Rendering and Functionality', () => {
    it('should render tabs with default styling', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
      expect(screen.getByRole('tabpanel', { name: 'Tab 1' })).toBeInTheDocument();
      // Note: Tab 2 content is hidden by default, so we don't test for its accessibility
    });

    it('should render tabs with custom className', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList className="custom-tabs-list">
            <TabsTrigger value="tab1" className="custom-tab-trigger">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-tab-content">Content 1</TabsContent>
        </Tabs>
      );

      // Act & Assert
      const tabsList = screen.getByRole('tablist');
      const tabTrigger = screen.getByRole('tab');
      const tabContent = screen.getByRole('tabpanel');

      expect(tabsList).toHaveClass('custom-tabs-list');
      expect(tabTrigger).toHaveClass('custom-tab-trigger');
      expect(tabContent).toHaveClass('custom-tab-content');
    });

    it('should render tabs with default active tab', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      const activeTab = screen.getByRole('tab', { name: 'Tab 1' });
      const activeContent = screen.getByRole('tabpanel', { name: 'Tab 1' });

      expect(activeTab).toHaveAttribute('data-state', 'active');
      expect(activeContent).toHaveAttribute('data-state', 'active');
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should render tabs with controlled value', () => {
      // Arrange
      render(
        <Tabs value="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      const activeTab = screen.getByRole('tab', { name: 'Tab 2' });
      const activeContent = screen.getByRole('tabpanel', { name: 'Tab 2' });

      expect(activeTab).toHaveAttribute('data-state', 'active');
      expect(activeContent).toHaveAttribute('data-state', 'active');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper semantic structure', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(2);
      // Only the active tabpanel is rendered in the DOM
      expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    });

    it('should support ARIA attributes', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test tabs">
            <TabsTrigger value="tab1" aria-label="First tab">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" aria-label="Second tab">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      const tabsList = screen.getByRole('tablist');
      const tab1 = screen.getByRole('tab', { name: 'First tab' });
      const tab2 = screen.getByRole('tab', { name: 'Second tab' });

      expect(tabsList).toHaveAttribute('aria-label', 'Test tabs');
      expect(tab1).toHaveAttribute('aria-label', 'First tab');
      expect(tab2).toHaveAttribute('aria-label', 'Second tab');
    });

    it('should support keyboard navigation attributes', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

      expect(tab1).toHaveAttribute('tabindex', '-1');
      expect(tab2).toHaveAttribute('tabindex', '-1');
      });
    });

  describe('Styling and Visual Testing', () => {
    it('should apply default styling classes', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      // Act & Assert
      const tabsList = screen.getByRole('tablist');
      const tabTrigger = screen.getByRole('tab');
      const tabContent = screen.getByRole('tabpanel');

      expect(tabsList).toHaveClass('inline-flex', 'h-9', 'items-center', 'justify-center', 'rounded-lg', 'bg-muted', 'p-1', 'text-muted-foreground');
      expect(tabTrigger).toHaveClass('inline-flex', 'items-center', 'justify-center', 'whitespace-nowrap', 'rounded-md', 'px-3', 'py-1', 'text-sm', 'font-medium');
      expect(tabContent).toHaveClass('mt-2', 'ring-offset-background', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2');
    });

    it('should handle disabled tabs', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      const disabledTab = screen.getByRole('tab', { name: 'Tab 2' });
      expect(disabledTab).toBeDisabled();
      expect(disabledTab).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle tabs without triggers', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
      // Only the active tabpanel is rendered
      expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    });

    it('should handle multiple tab groups', () => {
      // Arrange
      render(
        <div>
          <Tabs defaultValue="group1-tab1">
            <TabsList>
              <TabsTrigger value="group1-tab1">Group 1 Tab 1</TabsTrigger>
              <TabsTrigger value="group1-tab2">Group 1 Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="group1-tab1">Group 1 Content 1</TabsContent>
            <TabsContent value="group1-tab2">Group 1 Content 2</TabsContent>
          </Tabs>
          <Tabs defaultValue="group2-tab1">
            <TabsList>
              <TabsTrigger value="group2-tab1">Group 2 Tab 1</TabsTrigger>
              <TabsTrigger value="group2-tab2">Group 2 Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="group2-tab1">Group 2 Content 1</TabsContent>
            <TabsContent value="group2-tab2">Group 2 Content 2</TabsContent>
          </Tabs>
        </div>
      );

      // Act & Assert
      expect(screen.getAllByRole('tablist')).toHaveLength(2);
      expect(screen.getAllByRole('tab')).toHaveLength(4);
      // Only active tabpanels are rendered
      expect(screen.getAllByRole('tabpanel')).toHaveLength(2);
    });

    it('should handle very long tab names', () => {
      // Arrange
      const longTabName = 'This is a very long tab name that might cause layout issues and need to be handled properly';
      
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">{longTabName}</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      // Act & Assert
      expect(screen.getByRole('tab', { name: longTabName })).toBeInTheDocument();
      expect(screen.getByText(longTabName)).toBeInTheDocument();
    });
  });

  describe('Performance Testing', () => {
    it('should handle multiple tab renders efficiently', () => {
      // Arrange
      const startTime = performance.now();

      // Act
      render(
        <Tabs defaultValue="tab-1">
          <TabsList>
            {Array.from({ length: 20 }, (_, i) => (
              <TabsTrigger key={i} value={`tab-${i + 1}`}>
                Tab {i + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          {Array.from({ length: 20 }, (_, i) => (
            <TabsContent key={i} value={`tab-${i + 1}`}>
              Content for tab-{i + 1}
            </TabsContent>
          ))}
        </Tabs>
      );

      const endTime = performance.now();

      // Assert
      expect(screen.getAllByRole('tab')).toHaveLength(20);
      // Only the active tabpanel is rendered
      expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });
  });
}); 