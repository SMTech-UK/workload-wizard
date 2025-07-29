import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/ui/textarea';

// Custom query to find elements by data-slot attribute
const getByDataSlot = (container: HTMLElement, slotName: string) => {
  return container.querySelector(`[data-slot="${slotName}"]`);
};

describe('Textarea Component - Comprehensive UI Testing', () => {
  describe('Basic Rendering and Functionality', () => {
    it('should render textarea with default styling', () => {
      // Arrange
      const { container } = render(<Textarea />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass(
        'border-input', 'flex', 'min-h-16', 'w-full', 'rounded-md', 'border', 'bg-transparent', 'px-3', 'py-2', 'text-base'
      );
    });

    it('should render textarea with custom className', () => {
      // Arrange
      const { container } = render(<Textarea className="custom-textarea" />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toHaveClass('custom-textarea');
      expect(textarea).toHaveClass('border-input', 'flex', 'min-h-16', 'w-full', 'rounded-md', 'border');
    });

    it('should render textarea with placeholder', () => {
      // Arrange
      const { container } = render(<Textarea placeholder="Enter your message" />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('placeholder', 'Enter your message');
      expect(textarea).toHaveClass('placeholder:text-muted-foreground');
    });

    it('should render textarea with value', () => {
      // Arrange
      const { container } = render(<Textarea defaultValue="Initial text" />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveValue('Initial text');
    });

    it('should render textarea with rows and cols', () => {
      // Arrange
      const { container } = render(<Textarea rows={5} cols={50} />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('rows', '5');
      expect(textarea).toHaveAttribute('cols', '50');
    });

    it('should render textarea with maxLength', () => {
      // Arrange
      const { container } = render(<Textarea maxLength={100} />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('maxLength', '100');
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper semantic structure', () => {
      // Arrange
      const { container } = render(<Textarea />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea?.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('data-slot', 'textarea');
    });

    it('should support ARIA attributes', () => {
      // Arrange
      const { container } = render(<Textarea aria-label="Message input" />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toHaveAttribute('aria-label', 'Message input');
    });

    it('should support aria-describedby attribute', () => {
      // Arrange
      const { container } = render(<Textarea aria-describedby="textarea-help" />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toHaveAttribute('aria-describedby', 'textarea-help');
    });

    it('should support aria-invalid attribute', () => {
      // Arrange
      const { container } = render(<Textarea aria-invalid="true" />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive');
    });

    it('should support aria-required attribute', () => {
      // Arrange
      const { container } = render(<Textarea aria-required="true" />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('should support focus-visible styling', () => {
      // Arrange
      const { container } = render(<Textarea />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50', 'focus-visible:ring-[3px]');
    });

    it('should support disabled state', () => {
      // Arrange
      const { container } = render(<Textarea disabled />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('User Interaction Testing', () => {
    it('should handle text input', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Textarea />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Hello, world!');

      // Assert
      expect(textarea).toHaveValue('Hello, world!');
    });

    it('should handle onChange event', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const { container } = render(<Textarea onChange={handleChange} />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Test');

      // Assert
      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle onFocus event', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      const { container } = render(<Textarea onFocus={handleFocus} />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.click(textarea);

      // Assert
      expect(handleFocus).toHaveBeenCalled();
    });

    it('should handle onBlur event', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleBlur = jest.fn();
      const { container } = render(<Textarea onBlur={handleBlur} />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.click(textarea);
      await user.tab();

      // Assert
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should handle keyboard navigation', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Textarea />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');

      // Assert
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3');
    });

    it('should handle paste events', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Textarea />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.click(textarea);
      await user.paste('Pasted content');

      // Assert
      expect(textarea).toHaveValue('Pasted content');
    });

    it('should not allow input when disabled', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Textarea disabled />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'This should not work');

      // Assert
      expect(textarea).toHaveValue('');
      expect(textarea).toBeDisabled();
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

      const { container } = render(<Textarea />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toHaveClass('w-full', 'min-h-16', 'text-base');
    });

    it('should maintain proper styling on tablet screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(<Textarea />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toHaveClass('w-full', 'min-h-16', 'md:text-sm');
    });

    it('should maintain proper styling on desktop screens', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(<Textarea />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toHaveClass('w-full', 'min-h-16', 'md:text-sm');
    });

    it('should handle custom responsive classes', () => {
      // Arrange
      const { container } = render(<Textarea className="md:min-h-20 lg:min-h-24" />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toHaveClass('md:min-h-20', 'lg:min-h-24');
    });
  });

  describe('Content and Validation', () => {
    it('should handle empty textarea', () => {
      // Arrange
      const { container } = render(<Textarea />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveValue('');
    });

    it('should handle very long text', async () => {
      // Arrange
      const user = userEvent.setup();
      const longText = 'A'.repeat(1000);
      const { container } = render(<Textarea />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.type(textarea, longText);

      // Assert
      expect(textarea).toHaveValue(longText);
    });

    it('should handle multiline text', async () => {
      // Arrange
      const user = userEvent.setup();
      const multilineText = 'Line 1\nLine 2\nLine 3\nLine 4';
      const { container } = render(<Textarea />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.type(textarea, multilineText);

      // Assert
      expect(textarea).toHaveValue(multilineText);
    });

    it('should handle special characters', async () => {
      // Arrange
      const user = userEvent.setup();
      const specialChars = 'Special chars: <>&"\'<>{}[]()@#$%^&*()';
      const { container } = render(<Textarea />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.type(textarea, specialChars);

      // Assert
      expect(textarea).toHaveValue(specialChars);
    });

    it('should handle emoji characters', async () => {
      // Arrange
      const user = userEvent.setup();
      const emojiText = 'Hello 👋 World 🌍 with emojis 😊';
      const { container } = render(<Textarea />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.type(textarea, emojiText);

      // Assert
      expect(textarea).toHaveValue(emojiText);
    });

    it('should respect maxLength constraint', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Textarea maxLength={10} />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'This is too long');

      // Assert
      expect(textarea).toHaveValue('This is to');
      expect(textarea).toHaveAttribute('maxLength', '10');
    });

    it('should handle required validation', () => {
      // Arrange
      const { container } = render(<Textarea required />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toBeRequired();
    });

    it('should handle readOnly state', () => {
      // Arrange
      const { container } = render(<Textarea readOnly defaultValue="Read only text" />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('readOnly');
      expect(textarea).toHaveValue('Read only text');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle controlled component properly', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const { container, rerender } = render(<Textarea value="" onChange={handleChange} />);

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'New text');

      // Assert
      expect(handleChange).toHaveBeenCalled();
      expect(textarea).toHaveValue(''); // Should remain empty as it's controlled

      // Update value
      rerender(<Textarea value="Updated text" onChange={handleChange} />);
      expect(textarea).toHaveValue('Updated text');
    });

    it('should handle multiple textareas', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(
        <div>
          <Textarea data-testid="textarea1" />
          <Textarea data-testid="textarea2" />
          <Textarea data-testid="textarea3" />
        </div>
      );

      // Act
      const textareas = container.querySelectorAll('[data-slot="textarea"]');
      await user.type(textareas[0] as HTMLTextAreaElement, 'Text 1');
      await user.type(textareas[1] as HTMLTextAreaElement, 'Text 2');
      await user.type(textareas[2] as HTMLTextAreaElement, 'Text 3');

      // Assert
      expect(textareas).toHaveLength(3);
      expect(textareas[0]).toHaveValue('Text 1');
      expect(textareas[1]).toHaveValue('Text 2');
      expect(textareas[2]).toHaveValue('Text 3');
    });

    it('should handle textarea with form context', () => {
      // Arrange
      const { container } = render(
        <form>
          <Textarea name="message" id="message-textarea" />
        </form>
      );

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('name', 'message');
      expect(textarea).toHaveAttribute('id', 'message-textarea');
    });

    it('should handle textarea with auto-resize behavior', () => {
      // Arrange
      const { container } = render(<Textarea style={{ resize: 'vertical' }} />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveStyle({ resize: 'vertical' });
    });

    it('should handle textarea with spellcheck', () => {
      // Arrange
      const { container } = render(<Textarea spellCheck={false} />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('spellCheck', 'false');
    });
  });

  describe('Snapshot Testing for UI Consistency', () => {
    it('should match snapshot for default textarea', () => {
      // Arrange
      const { container } = render(<Textarea />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for textarea with placeholder', () => {
      // Arrange
      const { container } = render(<Textarea placeholder="Enter your message" />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for disabled textarea', () => {
      // Arrange
      const { container } = render(<Textarea disabled />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for invalid textarea', () => {
      // Arrange
      const { container } = render(<Textarea aria-invalid="true" />);

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for multiple textareas', () => {
      // Arrange
      const { container } = render(
        <div>
          <Textarea placeholder="Textarea 1" />
          <Textarea placeholder="Textarea 2" />
          <Textarea placeholder="Textarea 3" />
        </div>
      );

      // Act & Assert
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Performance Testing', () => {
    it('should handle rapid typing efficiently', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(<Textarea />);

      const startTime = performance.now();

      // Act
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'A'.repeat(100));

      const endTime = performance.now();

      // Assert
      expect(textarea).toHaveValue('A'.repeat(100));
      expect(endTime - startTime).toBeLessThan(1000); // Should type within 1 second
    });

    it('should handle multiple textarea renders efficiently', () => {
      // Arrange
      const textareas = Array.from({ length: 100 }, (_, i) => `textarea-${i + 1}`);

      const startTime = performance.now();

      // Act
      render(
        <div>
          {textareas.map((id, index) => (
            <Textarea key={index} data-testid={id} placeholder={`Placeholder ${index + 1}`} />
          ))}
        </div>
      );

      const endTime = performance.now();

      // Assert
      expect(screen.getByTestId('textarea-1')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-100')).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });

    it('should handle className changes efficiently', () => {
      // Arrange
      const { rerender, container } = render(<Textarea className="initial-class" />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea');
      expect(textarea).toHaveClass('initial-class');

      // Change className
      rerender(<Textarea className="updated-class" />);

      const updatedTextarea = getByDataSlot(container, 'textarea');
      expect(updatedTextarea).toHaveClass('updated-class');
      expect(updatedTextarea).not.toHaveClass('initial-class');
    });

    it('should handle value changes efficiently', () => {
      // Arrange
      const { rerender, container } = render(<Textarea value="Initial value" />);

      // Act & Assert
      const textarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveValue('Initial value');

      // Change value
      rerender(<Textarea value="Updated value" />);

      const updatedTextarea = getByDataSlot(container, 'textarea') as HTMLTextAreaElement;
      expect(updatedTextarea).toHaveValue('Updated value');
    });
  });
}); 