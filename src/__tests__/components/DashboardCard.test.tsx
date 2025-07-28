import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DashboardCard } from '@/components/DashboardCard'

describe('DashboardCard', () => {
  const defaultProps = {
    title: 'Test Card',
    value: '100',
    order: 1,
  }

  it('should render with basic props', () => {
    render(<DashboardCard {...defaultProps} />)

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('should render with subtitle', () => {
    render(<DashboardCard {...defaultProps} subtitle="Additional info" />)

    expect(screen.getByText('Additional info')).toBeInTheDocument()
  })

  it('should render with icon', () => {
    const icon = <span data-testid="test-icon">📊</span>
    render(<DashboardCard {...defaultProps} icon={icon} />)

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('should apply highlight styling when highlight is true', () => {
    render(<DashboardCard {...defaultProps} value="50" highlight={true} />)

    const valueElement = screen.getByText('50')
    expect(valueElement).toHaveClass('text-red-600')
  })

  it('should not apply highlight styling when highlight is false', () => {
    render(<DashboardCard {...defaultProps} value="50" highlight={false} />)

    const valueElement = screen.getByText('50')
    expect(valueElement).not.toHaveClass('text-red-600')
  })

  it('should not apply highlight styling when highlight is undefined', () => {
    render(<DashboardCard {...defaultProps} value="50" />)

    const valueElement = screen.getByText('50')
    expect(valueElement).not.toHaveClass('text-red-600')
  })

  it('should handle numeric values', () => {
    render(<DashboardCard {...defaultProps} value={42} />)

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should handle string values', () => {
    render(<DashboardCard {...defaultProps} value="Hello World" />)

    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should render with all props', () => {
    const icon = <span data-testid="test-icon">📈</span>
    render(
      <DashboardCard
        {...defaultProps}
        title="Complete Card"
        value="75%"
        subtitle="Performance metric"
        icon={icon}
        highlight={true}
      />
    )

    expect(screen.getByText('Complete Card')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('Performance metric')).toBeInTheDocument()
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    
    const valueElement = screen.getByText('75%')
    expect(valueElement).toHaveClass('text-red-600')
  })

  it('should have correct CSS classes', () => {
    render(<DashboardCard {...defaultProps} />)

    const cardElement = screen.getByText('Test Card').closest('div')?.parentElement
    expect(cardElement).toHaveClass('rounded-lg', 'border', 'p-6', 'bg-white', 'shadow-sm')
  })

  it('should handle empty subtitle gracefully', () => {
    render(<DashboardCard {...defaultProps} subtitle="" />)

    // Should not render subtitle when empty
    expect(screen.queryByText('Additional info')).not.toBeInTheDocument()
  })

  it('should handle null icon gracefully', () => {
    render(<DashboardCard {...defaultProps} icon={null} />)

    // Should render without errors
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })
}) 