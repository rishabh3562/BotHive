/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import PricingPage from '@/app/pricing/page'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, variants, initial, animate, whileInView, viewport, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('PricingPage', () => {
  it('renders the page title', () => {
    render(<PricingPage />)
    expect(screen.getByText('Simple, transparent pricing')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<PricingPage />)
    expect(screen.getByText(/Choose the perfect plan for your needs/i)).toBeInTheDocument()
  })

  it('renders all pricing plans', () => {
    render(<PricingPage />)
    
    // Basic plan
    expect(screen.getByText('Basic')).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Perfect for exploring AI agents')).toBeInTheDocument()
    
    // Pro plan
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('$49')).toBeInTheDocument()
    expect(screen.getByText('For growing businesses')).toBeInTheDocument()
    
    // Enterprise plan
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
    expect(screen.getByText('For large organizations')).toBeInTheDocument()
  })

  it('renders the popular badge for Pro plan', () => {
    render(<PricingPage />)
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('renders all Basic plan features', () => {
    render(<PricingPage />)
    
    expect(screen.getByText('Access to marketplace')).toBeInTheDocument()
    expect(screen.getByText('Basic analytics')).toBeInTheDocument()
    expect(screen.getByText('Community support')).toBeInTheDocument()
    expect(screen.getByText('2 active projects')).toBeInTheDocument()
    expect(screen.getByText('Standard response time')).toBeInTheDocument()
  })

  it('renders all Pro plan features', () => {
    render(<PricingPage />)
    
    expect(screen.getByText('Everything in Basic')).toBeInTheDocument()
    expect(screen.getByText('Advanced analytics')).toBeInTheDocument()
    expect(screen.getByText('Priority support')).toBeInTheDocument()
    expect(screen.getByText('Unlimited projects')).toBeInTheDocument()
    expect(screen.getByText('API access')).toBeInTheDocument()
    expect(screen.getByText('Custom integrations')).toBeInTheDocument()
  })

  it('renders all Enterprise plan features', () => {
    render(<PricingPage />)
    
    expect(screen.getByText('Everything in Pro')).toBeInTheDocument()
    expect(screen.getByText('Dedicated support')).toBeInTheDocument()
    expect(screen.getByText('Custom AI models')).toBeInTheDocument()
    expect(screen.getByText('SLA guarantees')).toBeInTheDocument()
    expect(screen.getByText('Advanced security')).toBeInTheDocument()
    expect(screen.getByText('Team management')).toBeInTheDocument()
  })

  it('renders CTA buttons for all plans', () => {
    render(<PricingPage />)
    
    expect(screen.getByText('Get Started')).toBeInTheDocument()
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument()
    const contactSalesButtons = screen.getAllByText('Contact Sales')
    expect(contactSalesButtons.length).toBeGreaterThan(0)
  })

  it('renders the custom pricing section', () => {
    render(<PricingPage />)
    
    expect(screen.getByText('Need something different?')).toBeInTheDocument()
    expect(screen.getByText(/Contact us for custom pricing options/i)).toBeInTheDocument()
  })
})
