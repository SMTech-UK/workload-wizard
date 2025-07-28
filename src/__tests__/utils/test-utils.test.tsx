import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Simple test to ensure test utilities work
describe('Test Utils', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div data-testid="test">Hello World</div>
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('test')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
}) 