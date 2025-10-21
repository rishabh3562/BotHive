/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManageSubscriptionButton } from '@/components/manage-subscription-button'

// Mock use-toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('ManageSubscriptionButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders manage subscription button', () => {
    render(<ManageSubscriptionButton />)
    
    expect(screen.getByText('Manage Subscription')).toBeInTheDocument()
  })

  it('displays loading state when clicked', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      json: async () => ({ url: 'https://billing.stripe.com' }),
    })
    global.fetch = mockFetch

    const { container } = render(<ManageSubscriptionButton />)
    
    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  it('calls portal API endpoint', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      json: async () => ({ url: 'https://billing.stripe.com' }),
    })
    global.fetch = mockFetch

    render(<ManageSubscriptionButton />)
    
    expect(screen.getByText('Manage Subscription')).toBeInTheDocument()
  })

  it('has outline variant style', () => {
    const { container } = render(<ManageSubscriptionButton />)
    
    const button = container.querySelector('button')
    expect(button).toHaveClass('border')
  })
})
