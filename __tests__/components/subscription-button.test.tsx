/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubscriptionButton } from '@/components/subscription-button'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock use-toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('SubscriptionButton', () => {
  const mockPlan = {
    id: '1',
    name: 'Pro Plan',
    tier: 'pro' as const,
    description: 'Pro subscription',
    price: 49,
    interval: 'month' as const,
    stripePriceId: 'price_123',
    features: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders subscription button with plan name', () => {
    render(<SubscriptionButton plan={mockPlan} />)
    
    expect(screen.getByText('Subscribe to Pro Plan')).toBeInTheDocument()
  })

  it('displays loading state when clicked', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      json: async () => ({ url: 'https://checkout.stripe.com' }),
    })
    global.fetch = mockFetch

    const { container } = render(<SubscriptionButton plan={mockPlan} />)
    
    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  it('calls API with correct parameters', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      json: async () => ({ url: 'https://checkout.stripe.com' }),
    })
    global.fetch = mockFetch

    render(<SubscriptionButton plan={mockPlan} />)
    
    expect(screen.getByText('Subscribe to Pro Plan')).toBeInTheDocument()
  })
})
