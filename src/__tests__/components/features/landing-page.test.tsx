import { render, screen } from '@testing-library/react';
import LandingPage from '@/components/features/landing-page';

describe('LandingPage', () => {
  it('should render the landing page component', () => {
    render(<LandingPage />);
    
    // Check for main heading
    expect(screen.getByText(/WorkloadWizard/i)).toBeInTheDocument();
  });

  it('should render the main content sections', () => {
    render(<LandingPage />);
    
    // Check for key sections
    expect(screen.getByText(/Made Easy & Transparent/i)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<LandingPage />);
    
    // Check for main heading with proper heading level
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
  });

  it('should render main content', () => {
    render(<LandingPage />);
    
    // Check for main content
    expect(screen.getByText(/WorkloadWizard is a tool/i)).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    const { container } = render(<LandingPage />);
    
    // Check for main element
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
  });
}); 