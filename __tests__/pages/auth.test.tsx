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

// Mock auth hook
jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: null,
    initialize: jest.fn(),
  }),
}))

// Mock supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: null,
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
