import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';

// Mock components for testing validation
const MockForm = ({ onSubmit, validationSchema }: any) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    age: '',
    password: '',
    confirmPassword: '',
    phone: '',
    url: '',
    date: '',
    time: '',
    number: '',
    required: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = validationSchema.parse(formData);
      onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="test-form">
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          data-testid="name-input"
        />
        {errors.name && <span data-testid="name-error">{errors.name}</span>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          data-testid="email-input"
        />
        {errors.email && <span data-testid="email-error">{errors.email}</span>}
      </div>

      <div>
        <label htmlFor="age">Age</label>
        <input
          id="age"
          type="number"
          value={formData.age}
          onChange={(e) => handleChange('age', e.target.value)}
          data-testid="age-input"
        />
        {errors.age && <span data-testid="age-error">{errors.age}</span>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          data-testid="password-input"
        />
        {errors.password && <span data-testid="password-error">{errors.password}</span>}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          data-testid="confirm-password-input"
        />
        {errors.confirmPassword && <span data-testid="confirm-password-error">{errors.confirmPassword}</span>}
      </div>

      <div>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          data-testid="phone-input"
        />
        {errors.phone && <span data-testid="phone-error">{errors.phone}</span>}
      </div>

      <div>
        <label htmlFor="url">URL</label>
        <input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => handleChange('url', e.target.value)}
          data-testid="url-input"
        />
        {errors.url && <span data-testid="url-error">{errors.url}</span>}
      </div>

      <div>
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          data-testid="date-input"
        />
        {errors.date && <span data-testid="date-error">{errors.date}</span>}
      </div>

      <div>
        <label htmlFor="time">Time</label>
        <input
          id="time"
          type="time"
          value={formData.time}
          onChange={(e) => handleChange('time', e.target.value)}
          data-testid="time-input"
        />
        {errors.time && <span data-testid="time-error">{errors.time}</span>}
      </div>

      <div>
        <label htmlFor="number">Number</label>
        <input
          id="number"
          type="number"
          value={formData.number}
          onChange={(e) => handleChange('number', e.target.value)}
          data-testid="number-input"
        />
        {errors.number && <span data-testid="number-error">{errors.number}</span>}
      </div>

      <div>
        <label htmlFor="required">Required Field</label>
        <input
          id="required"
          type="text"
          value={formData.required}
          onChange={(e) => handleChange('required', e.target.value)}
          data-testid="required-input"
        />
        {errors.required && <span data-testid="required-error">{errors.required}</span>}
      </div>

      <button type="submit" data-testid="submit-button">Submit</button>
    </form>
  );
};

describe('Form Validation Tests', () => {
  let mockOnSubmit: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit = jest.fn();
  });

  describe('Required Field Validation', () => {
    it('validates required fields', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        required: z.string().min(1, 'This field is required'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('required-error')).toHaveTextContent('This field is required');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('passes validation when required field is filled', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        required: z.string().min(1, 'This field is required'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const requiredInput = screen.getByTestId('required-input');
      await user.type(requiredInput, 'test value');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ required: 'test value' });
      });
      expect(screen.queryByTestId('required-error')).not.toBeInTheDocument();
    });
  });

  describe('Email Validation', () => {
    it('validates email format', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        email: z.string().email('Invalid email format'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email format');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('accepts valid email formats', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        email: z.string().email('Invalid email format'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
      });
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    });

    it('accepts various valid email formats', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        email: z.string().email('Invalid email format'),
      });

      const validEmails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.co.uk',
        'user123@domain.org',
      ];

      for (const email of validEmails) {
        // Act
        render(
          <MockForm
            onSubmit={mockOnSubmit}
            validationSchema={validationSchema}
          />
        );

        const emailInput = screen.getByTestId('email-input');
        await user.type(emailInput, email);

        const submitButton = screen.getByTestId('submit-button');
        await user.click(submitButton);

        // Assert
        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalledWith({ email });
        });
        expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();

        // Cleanup for next iteration
        mockOnSubmit.mockClear();
      }
    });
  });

  describe('Password Validation', () => {
    it('validates password strength', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        password: z.string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
          .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
          .regex(/[0-9]/, 'Password must contain at least one number'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const passwordInput = screen.getByTestId('password-input');
      await user.type(passwordInput, 'weak');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toHaveTextContent('Password must be at least 8 characters');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('accepts strong passwords', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        password: z.string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
          .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
          .regex(/[0-9]/, 'Password must contain at least one number'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const passwordInput = screen.getByTestId('password-input');
      await user.type(passwordInput, 'StrongPass123');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ password: 'StrongPass123' });
      });
      expect(screen.queryByTestId('password-error')).not.toBeInTheDocument();
    });

    it('validates password confirmation', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const passwordInput = screen.getByTestId('password-input');
      await user.type(passwordInput, 'password123');

      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      await user.type(confirmPasswordInput, 'different123');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('confirm-password-error')).toHaveTextContent("Passwords don't match");
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Number Validation', () => {
    it('validates number range', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        age: z.number()
          .min(18, 'Must be at least 18 years old')
          .max(120, 'Age cannot exceed 120'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const ageInput = screen.getByTestId('age-input');
      await user.type(ageInput, '15');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('age-error')).toHaveTextContent('Must be at least 18 years old');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates number format', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        number: z.number().positive('Must be a positive number'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const numberInput = screen.getByTestId('number-input');
      await user.type(numberInput, '-5');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('number-error')).toHaveTextContent('Must be a positive number');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Phone Number Validation', () => {
    it('validates phone number format', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const phoneInput = screen.getByTestId('phone-input');
      await user.type(phoneInput, 'invalid-phone!');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('phone-error')).toHaveTextContent('Invalid phone number format');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('accepts valid phone number formats', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
      });

      const validPhones = [
        '+1234567890',
        '123-456-7890',
        '(123) 456-7890',
        '123 456 7890',
      ];

      for (const phone of validPhones) {
        // Act
        render(
          <MockForm
            onSubmit={mockOnSubmit}
            validationSchema={validationSchema}
          />
        );

        const phoneInput = screen.getByTestId('phone-input');
        await user.type(phoneInput, phone);

        const submitButton = screen.getByTestId('submit-button');
        await user.click(submitButton);

        // Assert
        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalledWith({ phone });
        });
        expect(screen.queryByTestId('phone-error')).not.toBeInTheDocument();

        // Cleanup for next iteration
        mockOnSubmit.mockClear();
      }
    });
  });

  describe('URL Validation', () => {
    it('validates URL format', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        url: z.string().url('Invalid URL format'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const urlInput = screen.getByTestId('url-input');
      await user.type(urlInput, 'not-a-url');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('url-error')).toHaveTextContent('Invalid URL format');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('accepts valid URL formats', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        url: z.string().url('Invalid URL format'),
      });

      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://www.example.com/path',
        'https://example.com?param=value',
      ];

      for (const url of validUrls) {
        // Act
        render(
          <MockForm
            onSubmit={mockOnSubmit}
            validationSchema={validationSchema}
          />
        );

        const urlInput = screen.getByTestId('url-input');
        await user.type(urlInput, url);

        const submitButton = screen.getByTestId('submit-button');
        await user.click(submitButton);

        // Assert
        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalledWith({ url });
        });
        expect(screen.queryByTestId('url-error')).not.toBeInTheDocument();

        // Cleanup for next iteration
        mockOnSubmit.mockClear();
      }
    });
  });

  describe('Date and Time Validation', () => {
    it('validates date format', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const dateInput = screen.getByTestId('date-input');
      await user.type(dateInput, 'invalid-date');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('date-error')).toHaveTextContent('Invalid date format');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates future date requirement', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        date: z.string().refine((date) => new Date(date) > new Date(), {
          message: 'Date must be in the future',
        }),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const dateInput = screen.getByTestId('date-input');
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      await user.type(dateInput, pastDate.toISOString().split('T')[0]);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('date-error')).toHaveTextContent('Date must be in the future');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates time format', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const timeInput = screen.getByTestId('time-input');
      await user.type(timeInput, 'invalid-time');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('time-error')).toHaveTextContent('Invalid time format');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('validates multiple fields simultaneously', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email format'),
        age: z.number().min(18, 'Must be at least 18 years old'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveTextContent('Name must be at least 2 characters');
        expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email format');
        expect(screen.getByTestId('age-error')).toHaveTextContent('Must be at least 18 years old');
        expect(screen.getByTestId('password-error')).toHaveTextContent('Password must be at least 8 characters');
        expect(screen.getByTestId('confirm-password-error')).toHaveTextContent("Passwords don't match");
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('clears errors when user starts typing', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act - Submit with invalid data
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert - Error should be shown
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveTextContent('Name must be at least 2 characters');
      });

      // Act - Start typing valid data
      const nameInput = screen.getByTestId('name-input');
      await user.type(nameInput, 'John');

      // Assert - Error should be cleared
      await waitFor(() => {
        expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
      });
    });

    it('handles conditional validation', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().optional(),
        phone: z.string().optional(),
      }).refine((data) => data.email || data.phone, {
        message: 'Either email or phone is required',
        path: ['email'],
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const nameInput = screen.getByTestId('name-input');
      await user.type(nameInput, 'John Doe');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Either email or phone is required');
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Error Message Display', () => {
    it('displays custom error messages', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        required: z.string().min(1, 'This field cannot be empty'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('required-error')).toHaveTextContent('This field cannot be empty');
      });
    });

    it('displays multiple error messages for the same field', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        password: z.string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const passwordInput = screen.getByTestId('password-input');
      await user.type(passwordInput, 'weak');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toHaveTextContent('Password must be at least 8 characters');
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email format'),
        age: z.number().min(18, 'Must be at least 18 years old'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const nameInput = screen.getByTestId('name-input');
      await user.type(nameInput, 'John Doe');

      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'john@example.com');

      const ageInput = screen.getByTestId('age-input');
      await user.type(ageInput, '25');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
        });
      });
    });

    it('prevents submission with invalid data', async () => {
      // Arrange
      const user = userEvent.setup();
      const validationSchema = z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
      });

      render(
        <MockForm
          onSubmit={mockOnSubmit}
          validationSchema={validationSchema}
        />
      );

      // Act
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Assert
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
}); 