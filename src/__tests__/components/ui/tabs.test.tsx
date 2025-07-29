import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      expect(screen.getByRole('tabpanel', { name: 'Tab 2' })).toBeInTheDocument();
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
      expect(screen.getByText('Content 1')).toBeVisible();
      expect(screen.queryByText('Content 2')).not.toBeVisible();
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
      expect(screen.getByText('Content 2')).toBeVisible();
      expect(screen.queryByText('Content 1')).not.toBeVisible();
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
      expect(screen.getAllByRole('tabpanel')).toHaveLength(2);
    });

    it('should support ARIA attributes', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1" aria-label="Test tabs">
          <TabsList>
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

    it('should support aria-selected attribute', () => {
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
      const inactiveTab = screen.getByRole('tab', { name: 'Tab 2' });

      expect(activeTab).toHaveAttribute('aria-selected', 'true');
      expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should support keyboard navigation', () => {
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
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('tabIndex');
      });
    });

    it('should support focus-visible styling', () => {
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
      const tabTrigger = screen.getByRole('tab');
      const tabContent = screen.getByRole('tabpanel');

      expect(tabTrigger).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2');
      expect(tabContent).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2');
    });
  });

  describe('User Interaction Testing', () => {
    it('should switch tabs when clicked', async () => {
      // Arrange
      const user = userEvent.setup();
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

      // Act
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      // Assert
      expect(tab2).toHaveAttribute('data-state', 'active');
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('data-state', 'inactive');
      expect(screen.getByText('Content 2')).toBeVisible();
      expect(screen.queryByText('Content 1')).not.toBeVisible();
    });

    it('should call onValueChange when tab is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleValueChange = jest.fn();
      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      // Assert
      expect(handleValueChange).toHaveBeenCalledWith('tab2');
    });

    it('should handle keyboard navigation', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      // Act & Assert
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });

      // Focus first tab
      tab1.focus();
      expect(tab1).toHaveFocus();

      // Navigate to next tab
      await user.keyboard('{ArrowRight}');
      expect(tab2).toHaveFocus();

      // Navigate to next tab
      await user.keyboard('{ArrowRight}');
      expect(tab3).toHaveFocus();

      // Navigate back to first tab
      await user.keyboard('{ArrowRight}');
      expect(tab1).toHaveFocus();

      // Navigate backwards
      await user.keyboard('{ArrowLeft}');
      expect(tab3).toHaveFocus();
    });

    it('should handle disabled tabs', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleValueChange = jest.fn();
      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act
      const disabledTab = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(disabledTab);

      // Assert
      expect(disabledTab).toBeDisabled();
      expect(disabledTab).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
      expect(handleValueChange).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain proper styling on mobile screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

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
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('inline-flex', 'h-9', 'items-center', 'justify-center', 'rounded-lg', 'bg-muted', 'p-1');
    });

    it('should maintain proper styling on tablet screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

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
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('inline-flex', 'h-9', 'items-center', 'justify-center', 'rounded-lg', 'bg-muted', 'p-1');
    });

    it('should maintain proper styling on desktop screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

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
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('inline-flex', 'h-9', 'items-center', 'justify-center', 'rounded-lg', 'bg-muted', 'p-1');
    });

    it('should handle custom responsive classes', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="md:h-12 lg:h-14">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('md:h-12', 'lg:h-14');
    });
  });

  describe('State Management', () => {
    it('should handle active state styling', () => {
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
      expect(activeTab).toHaveClass('data-[state=active]:bg-background', 'data-[state=active]:text-foreground', 'data-[state=active]:shadow');
    });

    it('should handle inactive state styling', () => {
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
      const inactiveTab = screen.getByRole('tab', { name: 'Tab 2' });
      expect(inactiveTab).toHaveAttribute('data-state', 'inactive');
    });

    it('should handle disabled state styling', () => {
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
      expect(disabledTab).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
      expect(disabledTab).toBeDisabled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle tabs without content', () => {
      // Arrange
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      // Act & Assert
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(2);
      expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
    });

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
      expect(screen.getAllByRole('tabpanel')).toHaveLength(2);
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
      expect(screen.getAllByRole('tabpanel')).toHaveLength(4);
    });

    it('should handle very long tab names', () => {
      // Arrange
      const longTabName = 'A'.repeat(100);
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">{longTabName}</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      const longTab = screen.getByRole('tab', { name: longTabName });
      expect(longTab).toBeInTheDocument();
      expect(longTab).toHaveTextContent(longTabName);
    });

    it('should handle special characters in tab names', () => {
      // Arrange
      const specialTabName = 'Tab with special chars: <>&"\'<>';
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">{specialTabName}</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      const specialTab = screen.getByRole('tab', { name: specialTabName });
      expect(specialTab).toBeInTheDocument();
      expect(specialTab).toHaveTextContent(specialTabName);
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for default tabs', () => {
      // Arrange
      const { container } = render(
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
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for tabs with custom styling', () => {
      // Arrange
      const { container } = render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList className="custom-tabs-list">
            <TabsTrigger value="tab1" className="custom-tab-trigger">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" className="custom-tab-trigger">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-tab-content">Content 1</TabsContent>
          <TabsContent value="tab2" className="custom-tab-content">Content 2</TabsContent>
        </Tabs>
      );

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for disabled tabs', () => {
      // Arrange
      const { container } = render(
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
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for multiple tab groups', () => {
      // Arrange
      const { container } = render(
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
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Performance Testing', () => {
    it('should handle rapid tab switching efficiently', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleValueChange = jest.fn();
      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      const startTime = performance.now();

      // Act
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });

      await user.click(tab2);
      await user.click(tab3);
      await user.click(tab1);

      const endTime = performance.now();

      // Assert
      expect(handleValueChange).toHaveBeenCalledTimes(3);
      expect(endTime - startTime).toBeLessThan(500); // Should switch within 500ms
    });

    it('should handle multiple tab renders efficiently', () => {
      // Arrange
      const tabs = Array.from({ length: 20 }, (_, i) => `tab-${i + 1}`);

      const startTime = performance.now();

      // Act
      render(
        <Tabs defaultValue="tab-1">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab}>
              Content for {tab}
            </TabsContent>
          ))}
        </Tabs>
      );

      const endTime = performance.now();

      // Assert
      expect(screen.getAllByRole('tab')).toHaveLength(20);
      expect(screen.getAllByRole('tabpanel')).toHaveLength(20);
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });

    it('should handle className changes efficiently', () => {
      // Arrange
      const { rerender } = render(
        <Tabs defaultValue="tab1" className="initial-class">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      // Act & Assert
      expect(screen.getByRole('tablist')).toBeInTheDocument();

      // Change className
      rerender(
        <Tabs defaultValue="tab1" className="updated-class">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });
}); 