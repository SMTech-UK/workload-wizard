import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with default styling', () => {
      render(<Card>Card content</Card>);
      
      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      // The card content is inside the Card component, so we need to check the parent
      expect(card.closest('div')).toHaveClass('rounded-xl', 'border', 'bg-card', 'text-card-foreground', 'shadow');
    });

    it('should apply custom className', () => {
      render(<Card className="custom-card">Custom card</Card>);
      
      const card = screen.getByText('Custom card').closest('div');
      expect(card).toHaveClass('custom-card');
    });
  });

  describe('CardHeader', () => {
    it('should render card header with proper styling', () => {
      render(<CardHeader>Header content</CardHeader>);
      
      const header = screen.getByText('Header content');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header">Custom header</CardHeader>);
      
      const header = screen.getByText('Custom header');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('should render card title with proper styling', () => {
      render(<CardTitle>Card Title</CardTitle>);
      
      const title = screen.getByText('Card Title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('font-semibold', 'leading-none', 'tracking-tight');
    });

    it('should render as div by default', () => {
      render(<CardTitle>Card Title</CardTitle>);
      
      const title = screen.getByText('Card Title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('DIV');
    });

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title">Custom title</CardTitle>);
      
      const title = screen.getByText('Custom title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('CardDescription', () => {
    it('should render card description with proper styling', () => {
      render(<CardDescription>Card description</CardDescription>);
      
      const description = screen.getByText('Card description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should apply custom className', () => {
      render(<CardDescription className="custom-description">Custom description</CardDescription>);
      
      const description = screen.getByText('Custom description');
      expect(description).toHaveClass('custom-description');
    });
  });

  describe('CardContent', () => {
    it('should render card content with proper styling', () => {
      render(<CardContent>Content here</CardContent>);
      
      const content = screen.getByText('Content here');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('should apply custom className', () => {
      render(<CardContent className="custom-content">Custom content</CardContent>);
      
      const content = screen.getByText('Custom content');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('CardFooter', () => {
    it('should render card footer with proper styling', () => {
      render(<CardFooter>Footer content</CardFooter>);
      
      const footer = screen.getByText('Footer content');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer">Custom footer</CardFooter>);
      
      const footer = screen.getByText('Custom footer');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('Card Integration', () => {
    it('should render a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('This is a test card')).toBeInTheDocument();
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('should maintain proper semantic structure', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      const card = container.firstChild;
      expect(card).toBeInTheDocument();
      
      // Check for proper structure
      const title = screen.getByText('Test Card');
      expect(title).toBeInTheDocument();
    });

    it('should handle nested content properly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Nested Card</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h4>Nested Heading</h4>
              <p>Nested paragraph</p>
            </div>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Nested Card')).toBeInTheDocument();
      expect(screen.getByText('Nested Heading')).toBeInTheDocument();
      expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
    });
  });
}); 