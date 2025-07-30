import { render, screen } from '@testing-library/react';
import ModuleManagement from '@/components/features/module-management/module-management';

// Mock the entire convex module
jest.mock('convex/react', () => ({
  useQuery: jest.fn(() => []),
  useMutation: jest.fn(() => jest.fn()),
}));

// Mock other dependencies
jest.mock('@/lib/recentActivity', () => ({
  useLogRecentActivity: () => jest.fn(),
}));

jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      fullName: 'Test User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
    },
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ModuleManagement Component', () => {
  it('renders module management component', () => {
    render(<ModuleManagement />);
    
    expect(screen.getByText('Module Management')).toBeInTheDocument();
  });

  it('renders module list section', () => {
    render(<ModuleManagement />);
    
    expect(screen.getByText('Modules')).toBeInTheDocument();
  });

  it('renders add module button', () => {
    render(<ModuleManagement />);
    
    expect(screen.getByText('Add Module')).toBeInTheDocument();
  });
}); 