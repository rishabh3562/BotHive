/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, variants, initial, animate, whileInView, viewport, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, variants, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, variants, ...props }: any) => <p {...props}>{children}</p>,
    dl: ({ children, variants, ...props }: any) => <dl {...props}>{children}</dl>,
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('Home', () => {
  it('renders the hero section with main heading', () => {
    render(<Home />)
    
    // Check if the main heading is rendered
    const heading = screen.getByText('The Future of AI is Here')
    expect(heading).toBeInTheDocument()
  })

  it('renders the call-to-action buttons', () => {
    render(<Home />)
    
    // Check if the main CTA buttons are rendered
    const getStartedButton = screen.getByText('Get Started')
    // Use getAllByText since there are multiple "Browse Agents" buttons
    const browseAgentsButtons = screen.getAllByText('Browse Agents')
    
    expect(getStartedButton).toBeInTheDocument()
    expect(browseAgentsButtons.length).toBeGreaterThan(0)
  })

  it('renders the features section', () => {
    render(<Home />)
    
    // Check if feature cards are rendered
    const buildersCard = screen.getByText('For Builders')
    const recruitersCard = screen.getByText('For Recruiters')
    // Use more specific selector for AI Agents card title
    const agentsCard = screen.getByRole('heading', { name: 'AI Agents' })
    
    expect(buildersCard).toBeInTheDocument()
    expect(recruitersCard).toBeInTheDocument()
    expect(agentsCard).toBeInTheDocument()
  })

  it('renders statistics section', () => {
    render(<Home />)
    
    // Check if statistics are displayed
    const activeUsers = screen.getByText('10,000+')
    const aiAgents = screen.getByText('500+')
    const rating = screen.getByText('4.9/5')
    
    expect(activeUsers).toBeInTheDocument()
    expect(aiAgents).toBeInTheDocument()
    expect(rating).toBeInTheDocument()
  })

  it('renders testimonials section', () => {
    render(<Home />)
    
    // Check if testimonials section is rendered
    const testimonialsHeading = screen.getByText('Loved by builders and recruiters alike')
    expect(testimonialsHeading).toBeInTheDocument()
  })
})