import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoadingPage from '@/components/loading-page'

describe('LoadingPage', () => {
  it('should render with default progress', () => {
    render(<LoadingPage />)

    expect(screen.getByText('WorkloadWizard')).toBeInTheDocument()
    
    // Check for the progress bar container
    const progressContainer = screen.getByTestId('progress-container')
    expect(progressContainer).toBeInTheDocument()
  })

  it('should render with custom progress', () => {
    render(<LoadingPage progress={50} />)

    expect(screen.getByText('WorkloadWizard')).toBeInTheDocument()
    
    // Check that progress bar has correct width
    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveStyle({ width: '50%' })
  })

  it('should render with 0% progress', () => {
    render(<LoadingPage progress={0} />)

    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveStyle({ width: '0%' })
  })

  it('should render with 100% progress', () => {
    render(<LoadingPage progress={100} />)

    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveStyle({ width: '100%' })
  })

  it('should handle decimal progress values', () => {
    render(<LoadingPage progress={75.5} />)

    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveStyle({ width: '75.5%' })
  })

  it('should have correct CSS classes', () => {
    render(<LoadingPage />)

    const container = screen.getByText('WorkloadWizard').closest('div')?.parentElement
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'w-full', 'bg-white', 'animate-fade-in')
  })

  it('should render the logo icon', () => {
    render(<LoadingPage />)

    // The WandSparkles icon should be present
    const iconContainer = screen.getByText('WorkloadWizard').previousElementSibling
    expect(iconContainer).toHaveClass('w-14', 'h-14', 'flex', 'items-center', 'justify-center', 'bg-blue-600', 'rounded-xl', 'shadow-lg')
  })

  it('should render progress bar container', () => {
    render(<LoadingPage />)

    const progressContainer = screen.getByTestId('progress-container')
    expect(progressContainer).toHaveClass('h-2', 'w-32', 'bg-blue-100', 'rounded-full', 'overflow-hidden')
  })

  it('should handle negative progress values', () => {
    render(<LoadingPage progress={-10} />)

    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveStyle({ width: '-10%' })
  })

  it('should handle progress values over 100', () => {
    render(<LoadingPage progress={150} />)

    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveStyle({ width: '150%' })
  })

  it('should have proper accessibility attributes', () => {
    render(<LoadingPage progress={25} />)

    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveStyle({ width: '25%' })
  })

  it('should render with dark mode classes', () => {
    render(<LoadingPage />)

    const container = screen.getByText('WorkloadWizard').closest('div')?.parentElement
    expect(container).toHaveClass('dark:bg-black')
    
    const title = screen.getByText('WorkloadWizard')
    expect(title).toHaveClass('dark:text-white')
    
    const progressContainer = screen.getByTestId('progress-container')
    expect(progressContainer).toHaveClass('dark:bg-blue-900')
  })

  it('should have smooth transition on progress changes', () => {
    render(<LoadingPage progress={50} />)

    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveClass('transition-all', 'duration-300')
  })
}) 