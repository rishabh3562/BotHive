/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import AboutPage from '@/app/about/page'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, variants, initial, animate, whileInView, viewport, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, variants, initial, animate, whileInView, viewport, ...props }: any) => <section {...props}>{children}</section>,
  },
}))

describe('AboutPage', () => {
  it('renders the page title', () => {
    render(<AboutPage />)
    expect(screen.getByText('About BotHive')).toBeInTheDocument()
  })

  it('renders the mission statement', () => {
    render(<AboutPage />)
    expect(screen.getByText(/building the future of AI-powered solutions/i)).toBeInTheDocument()
  })

  it('renders all statistics', () => {
    render(<AboutPage />)
    
    expect(screen.getByText('10,000+')).toBeInTheDocument()
    expect(screen.getByText('Active Users')).toBeInTheDocument()
    
    expect(screen.getByText('500+')).toBeInTheDocument()
    expect(screen.getByText('AI Agents')).toBeInTheDocument()
    
    expect(screen.getByText('4.9/5')).toBeInTheDocument()
    expect(screen.getByText('Average Rating')).toBeInTheDocument()
    
    expect(screen.getByText('50+')).toBeInTheDocument()
    expect(screen.getByText('Countries')).toBeInTheDocument()
  })

  it('renders all company values', () => {
    render(<AboutPage />)
    
    expect(screen.getByText('Trust & Security')).toBeInTheDocument()
    expect(screen.getByText(/prioritize the security/i)).toBeInTheDocument()
    
    expect(screen.getByText('Innovation')).toBeInTheDocument()
    expect(screen.getByText(/pushing the boundaries/i)).toBeInTheDocument()
    
    expect(screen.getByText('Community')).toBeInTheDocument()
    expect(screen.getByText(/vibrant ecosystem/i)).toBeInTheDocument()
  })

  it('renders the values section header', () => {
    render(<AboutPage />)
    expect(screen.getByText('Our Values')).toBeInTheDocument()
    expect(screen.getByText('The principles that guide everything we do')).toBeInTheDocument()
  })

  it('renders the mission section', () => {
    render(<AboutPage />)
    expect(screen.getByText('Our Mission')).toBeInTheDocument()
    expect(screen.getByText(/democratize access to AI technology/i)).toBeInTheDocument()
  })
})
