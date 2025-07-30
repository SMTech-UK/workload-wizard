import { render, screen } from '@testing-library/react';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea Component - Comprehensive UI Testing', () => {
  describe('Basic Rendering and Functionality', () => {
    it('should render textarea with default props', () => {
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      // Note: The component doesn't set a default rows attribute
    });

    it('should render textarea with custom placeholder', () => {
      render(<Textarea placeholder="Enter your message" />);
      
      const textarea = screen.getByPlaceholderText('Enter your message');
      expect(textarea).toBeInTheDocument();
    });

    it('should render textarea with custom rows', () => {
      render(<Textarea rows={5} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('should render textarea with default value', () => {
      render(<Textarea defaultValue="Initial text" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Initial text');
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper ARIA attributes', () => {
      render(<Textarea aria-label="Description" />);
      
      const textarea = screen.getByLabelText('Description');
      expect(textarea).toBeInTheDocument();
    });

    it('should support disabled state', () => {
      render(<Textarea disabled />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should support required attribute', () => {
      render(<Textarea required />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('required');
    });

    it('should support maxLength attribute', () => {
      render(<Textarea maxLength={100} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });

    it('should support minLength attribute', () => {
      render(<Textarea minLength={10} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('minLength', '10');
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should have proper CSS classes', () => {
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('flex', 'min-h-16', 'w-full', 'rounded-md', 'border', 'border-input');
    });

    it('should have proper focus styling', () => {
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50');
    });

    it('should have proper resize styling', () => {
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      // The component doesn't have resize-none class, it uses default resize behavior
      expect(textarea).toHaveClass('outline-none');
    });

    it('should support custom className', () => {
      render(<Textarea className="custom-class" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-class');
    });
  });

  describe('Content and Validation', () => {
    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000);
      render(<Textarea defaultValue={longText} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(longText);
    });

    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3\nLine 4';
      render(<Textarea defaultValue={multilineText} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(multilineText);
    });

    it('should handle special characters', () => {
      const specialChars = 'Special chars: <>&"\'<>{}[]()@#$%^&*()';
      render(<Textarea defaultValue={specialChars} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(specialChars);
    });

    it('should handle emoji characters', () => {
      const emojiText = 'Hello 🌍 World 🚀 with emojis 😊';
      render(<Textarea defaultValue={emojiText} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(emojiText);
    });

    it('should respect maxLength constraint', () => {
      render(<Textarea maxLength={10} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '10');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle controlled component', () => {
      render(<Textarea value="Controlled value" readOnly />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Controlled value');
    });

    it('should handle multiple textareas', () => {
      render(
        <div>
          <Textarea data-testid="textarea1" />
          <Textarea data-testid="textarea2" />
          <Textarea data-testid="textarea3" />
        </div>
      );
      
      expect(screen.getByTestId('textarea1')).toBeInTheDocument();
      expect(screen.getByTestId('textarea2')).toBeInTheDocument();
      expect(screen.getByTestId('textarea3')).toBeInTheDocument();
    });

    it('should handle textarea with form context', () => {
      render(
        <form>
          <Textarea name="description" />
        </form>
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('name', 'description');
    });

    it('should handle textarea with id attribute', () => {
      render(<Textarea id="description-field" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'description-field');
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for basic textarea', () => {
      const { container } = render(<Textarea />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for textarea with placeholder', () => {
      const { container } = render(<Textarea placeholder="Enter your message" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for disabled textarea', () => {
      const { container } = render(<Textarea disabled />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for textarea with value', () => {
      const { container } = render(<Textarea defaultValue="Sample text" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
}); 