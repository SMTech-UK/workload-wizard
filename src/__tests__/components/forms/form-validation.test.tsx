import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
  describe('Required Field Validation', () => {
    it('validates required fields', () => {
      // Arrange
      const validationSchema = z.object({
        required: z.string().min(1, 'This field is required'),
      });
      const onSubmit = jest.fn();

      render(<MockForm onSubmit={onSubmit} validationSchema={validationSchema} />);

      // Act
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Assert
      expect(screen.getByTestId('required-error')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('passes validation when required field is filled', () => {
      // Arrange
      const validationSchema = z.object({
        required: z.string().min(1, 'This field is required'),
      });
      const onSubmit = jest.fn();

      render(<MockForm onSubmit={onSubmit} validationSchema={validationSchema} />);

      // Act
      const requiredInput = screen.getByTestId('required-input');
      fireEvent.change(requiredInput, { target: { value: 'test value' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Assert
      expect(screen.queryByTestId('required-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledWith({ required: 'test value' });
    });
  });

  describe('Email Validation', () => {
    it('accepts valid email formats', () => {
      // Arrange
      const validationSchema = z.object({
        name: z.string().optional(),
        email: z.string().email('Invalid email format'),
        age: z.string().optional(),
        password: z.string().optional(),
        confirmPassword: z.string().optional(),
        phone: z.string().optional(),
        url: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        number: z.string().optional(),
        required: z.string().optional(),
      });
      const onSubmit = jest.fn();

      render(<MockForm onSubmit={onSubmit} validationSchema={validationSchema} />);

      // Act
      const emailInput = screen.getByTestId('email-input');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Assert
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('Number Validation', () => {
    it('validates number range', () => {
      // Arrange
      const validationSchema = z.object({
        age: z.coerce.number().min(18, 'Must be at least 18').max(100, 'Must be at most 100'),
      });
      const onSubmit = jest.fn();

      render(<MockForm onSubmit={onSubmit} validationSchema={validationSchema} />);

      // Act
      const ageInput = screen.getByTestId('age-input');
      fireEvent.change(ageInput, { target: { value: '15' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Assert
      expect(screen.getByTestId('age-error')).toBeInTheDocument();
      expect(screen.getByText('Must be at least 18')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('validates number format', () => {
      // Arrange
      const validationSchema = z.object({
        number: z.coerce.number().positive('Must be a positive number'),
      });
      const onSubmit = jest.fn();

      render(<MockForm onSubmit={onSubmit} validationSchema={validationSchema} />);

      // Act
      const numberInput = screen.getByTestId('number-input');
      fireEvent.change(numberInput, { target: { value: '-5' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Assert
      expect(screen.getByTestId('number-error')).toBeInTheDocument();
      expect(screen.getByText('Must be a positive number')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Password Validation', () => {
    it('validates password strength', () => {
      // Arrange
      const validationSchema = z.object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
      });
      const onSubmit = jest.fn();

      render(<MockForm onSubmit={onSubmit} validationSchema={validationSchema} />);

      // Act
      const passwordInput = screen.getByTestId('password-input');
      fireEvent.change(passwordInput, { target: { value: 'weak' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Assert
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('validates password confirmation', () => {
      // Arrange
      const validationSchema = z.object({
        password: z.string(),
        confirmPassword: z.string(),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
      const onSubmit = jest.fn();

      render(<MockForm onSubmit={onSubmit} validationSchema={validationSchema} />);

      // Act
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Assert
      expect(screen.getByTestId('confirm-password-error')).toBeInTheDocument();
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Error Message Display', () => {
    it('displays custom error messages', () => {
      // Arrange
      const validationSchema = z.object({
        name: z.string().min(1, 'Please enter your name'),
      });
      const onSubmit = jest.fn();

      render(<MockForm onSubmit={onSubmit} validationSchema={validationSchema} />);

      // Act
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Assert
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      expect(screen.getByText('Please enter your name')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', () => {
      // Arrange
      const validationSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
      });
      const onSubmit = jest.fn();

      render(<MockForm onSubmit={onSubmit} validationSchema={validationSchema} />);

      // Act
      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Assert
      expect(onSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
      });
      expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    });

    it('prevents submission with invalid data', () => {
      // Arrange
      const validationSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
      });
      const onSubmit = jest.fn();

      render(<MockForm onSubmit={onSubmit} validationSchema={validationSchema} />);

      // Act
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Assert
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });
  });
}); 