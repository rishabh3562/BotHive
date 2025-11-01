/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import AuthPage from '@/app/auth/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock auth hook with a user that has no role
jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
      role: null, // User exists but has no role assigned yet
    },
    initialize: jest.fn(),
    isLoading: false,
  }),
}))

// Mock supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: null,
}))

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe('AuthPage', () => {
  it('renders role selection page', () => {
    render(<AuthPage />)
    
    expect(screen.getByText('Choose your role')).toBeInTheDocument()
    expect(screen.getByText('Select how you want to use the platform')).toBeInTheDocument()
  })

  it('displays both role options', () => {
    render(<AuthPage />)
    
    expect(screen.getByText('AI Builder')).toBeInTheDocument()
    expect(screen.getByText('Create and sell AI agents')).toBeInTheDocument()
    
    expect(screen.getByText('Recruiter')).toBeInTheDocument()
    expect(screen.getByText('Find and purchase AI agents')).toBeInTheDocument()
  })

  it('displays continue buttons for both roles', () => {
    render(<AuthPage />)
    
    expect(screen.getByText('Continue as Builder')).toBeInTheDocument()
    expect(screen.getByText('Continue as Recruiter')).toBeInTheDocument()
  })
})
