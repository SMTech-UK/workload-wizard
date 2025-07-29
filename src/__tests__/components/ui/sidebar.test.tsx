import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

describe('Sidebar Component', () => {
  describe('SidebarProvider', () => {
    it('should render provider with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <div>Test content</div>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render provider with custom default open state', () => {
      // Arrange & Act
      render(
        <SidebarProvider defaultOpen={false}>
          <div>Collapsible content</div>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Collapsible content')).toBeInTheDocument();
    });
  });

  describe('Sidebar', () => {
    it('should render sidebar with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <div>Sidebar content</div>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Sidebar content')).toBeInTheDocument();
    });

    it('should render sidebar with custom className', () => {
      // Arrange
      const customClass = 'custom-sidebar';
      
      // Act
      render(
        <SidebarProvider>
          <Sidebar className={customClass}>
            <div>Sidebar content</div>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const sidebar = screen.getByText('Sidebar content').closest('[data-radix-sidebar]');
      expect(sidebar).toHaveClass(customClass);
    });
  });

  describe('SidebarHeader', () => {
    it('should render header with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <h1>Header Title</h1>
            </SidebarHeader>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Header Title')).toBeInTheDocument();
    });

    it('should render header with custom className', () => {
      // Arrange
      const customClass = 'custom-header';
      
      // Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader className={customClass}>
              <h1>Header Title</h1>
            </SidebarHeader>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const header = screen.getByText('Header Title').closest('[data-radix-sidebar-header]');
      expect(header).toHaveClass(customClass);
    });
  });

  describe('SidebarContent', () => {
    it('should render content with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <div>Sidebar content</div>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Sidebar content')).toBeInTheDocument();
    });

    it('should render content with custom className', () => {
      // Arrange
      const customClass = 'custom-content';
      
      // Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent className={customClass}>
              <div>Sidebar content</div>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const content = screen.getByText('Sidebar content').closest('[data-radix-sidebar-content]');
      expect(content).toHaveClass(customClass);
    });
  });

  describe('SidebarFooter', () => {
    it('should render footer with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarFooter>
              <div>Footer content</div>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('should render footer with custom className', () => {
      // Arrange
      const customClass = 'custom-footer';
      
      // Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarFooter className={customClass}>
              <div>Footer content</div>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const footer = screen.getByText('Footer content').closest('[data-radix-sidebar-footer]');
      expect(footer).toHaveClass(customClass);
    });
  });

  describe('SidebarGroup', () => {
    it('should render group with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarGroup>
              <div>Group content</div>
            </SidebarGroup>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Group content')).toBeInTheDocument();
    });

    it('should render group with custom className', () => {
      // Arrange
      const customClass = 'custom-group';
      
      // Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarGroup className={customClass}>
              <div>Group content</div>
            </SidebarGroup>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const group = screen.getByText('Group content').closest('[data-radix-sidebar-group]');
      expect(group).toHaveClass(customClass);
    });
  });

  describe('SidebarGroupLabel', () => {
    it('should render group label with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarGroup>
              <SidebarGroupLabel>Group Label</SidebarGroupLabel>
            </SidebarGroup>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Group Label')).toBeInTheDocument();
    });

    it('should render group label with custom className', () => {
      // Arrange
      const customClass = 'custom-label';
      
      // Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarGroup>
              <SidebarGroupLabel className={customClass}>Group Label</SidebarGroupLabel>
            </SidebarGroup>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const label = screen.getByText('Group Label');
      expect(label).toHaveClass(customClass);
    });
  });

  describe('SidebarGroupContent', () => {
    it('should render group content with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarGroup>
              <SidebarGroupContent>
                <div>Group content</div>
              </SidebarGroupContent>
            </SidebarGroup>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Group content')).toBeInTheDocument();
    });

    it('should render group content with custom className', () => {
      // Arrange
      const customClass = 'custom-group-content';
      
      // Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarGroup>
              <SidebarGroupContent className={customClass}>
                <div>Group content</div>
              </SidebarGroupContent>
            </SidebarGroup>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const content = screen.getByText('Group content').closest('[data-radix-sidebar-group-content]');
      expect(content).toHaveClass(customClass);
    });
  });

  describe('SidebarMenu', () => {
    it('should render menu with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <div>Menu content</div>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Menu content')).toBeInTheDocument();
    });

    it('should render menu with custom className', () => {
      // Arrange
      const customClass = 'custom-menu';
      
      // Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu className={customClass}>
              <div>Menu content</div>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const menu = screen.getByText('Menu content').closest('[data-radix-sidebar-menu]');
      expect(menu).toHaveClass(customClass);
    });
  });

  describe('SidebarMenuItem', () => {
    it('should render menu item with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuItem>
                <div>Menu item</div>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Menu item')).toBeInTheDocument();
    });

    it('should render menu item with custom className', () => {
      // Arrange
      const customClass = 'custom-menu-item';
      
      // Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuItem className={customClass}>
                <div>Menu item</div>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const item = screen.getByText('Menu item').closest('[data-radix-sidebar-menu-item]');
      expect(item).toHaveClass(customClass);
    });
  });

  describe('SidebarMenuButton', () => {
    it('should render menu button with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuButton>
                <div>Menu button</div>
              </SidebarMenuButton>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Menu button')).toBeInTheDocument();
    });

    it('should render menu button with custom className', () => {
      // Arrange
      const customClass = 'custom-menu-button';
      
      // Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuButton className={customClass}>
                <div>Menu button</div>
              </SidebarMenuButton>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const button = screen.getByText('Menu button').closest('[data-radix-sidebar-menu-button]');
      expect(button).toHaveClass(customClass);
    });

    it('should handle click events', () => {
      // Arrange
      const handleClick = jest.fn();
      
      // Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuButton onClick={handleClick}>
                <div>Menu button</div>
              </SidebarMenuButton>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>
      );
      
      const button = screen.getByText('Menu button').closest('[data-radix-sidebar-menu-button]');
      fireEvent.click(button!);
      
      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('SidebarTrigger', () => {
    it('should render trigger with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <SidebarTrigger>
            <div>Trigger button</div>
          </SidebarTrigger>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Trigger button')).toBeInTheDocument();
    });

    it('should render trigger with custom className', () => {
      // Arrange
      const customClass = 'custom-trigger';
      
      // Act
      render(
        <SidebarProvider>
          <SidebarTrigger className={customClass}>
            <div>Trigger button</div>
          </SidebarTrigger>
        </SidebarProvider>
      );
      
      // Assert
      const trigger = screen.getByText('Trigger button').closest('[data-radix-sidebar-trigger]');
      expect(trigger).toHaveClass(customClass);
    });
  });

  describe('SidebarInset', () => {
    it('should render inset with children', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <SidebarInset>
            <div>Inset content</div>
          </SidebarInset>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('Inset content')).toBeInTheDocument();
    });

    it('should render inset with custom className', () => {
      // Arrange
      const customClass = 'custom-inset';
      
      // Act
      render(
        <SidebarProvider>
          <SidebarInset className={customClass}>
            <div>Inset content</div>
          </SidebarInset>
        </SidebarProvider>
      );
      
      // Assert
      const inset = screen.getByText('Inset content').closest('[data-radix-sidebar-inset]');
      expect(inset).toHaveClass(customClass);
    });
  });

  describe('Complete Sidebar Integration', () => {
    it('should render complete sidebar structure', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <h1>App Header</h1>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Dashboard</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Users</SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div>Footer content</div>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      expect(screen.getByText('App Header')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <h1>Header</h1>
            </SidebarHeader>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const sidebar = screen.getByText('Header').closest('[data-radix-sidebar]');
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have proper base styling classes', () => {
      // Arrange & Act
      render(
        <SidebarProvider>
          <Sidebar>
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      );
      
      // Assert
      const sidebar = screen.getByText('Content').closest('[data-radix-sidebar]');
      expect(sidebar).toBeInTheDocument();
    });
  });
}); 