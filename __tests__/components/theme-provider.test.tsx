/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}))

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('wraps children with theme provider', () => {
    render(
      <ThemeProvider>
        <div>Theme Test</div>
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
  })

  it('passes props to NextThemesProvider', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div>Dark Theme</div>
      </ThemeProvider>
    )
    
    expect(screen.getByText('Dark Theme')).toBeInTheDocument()
  })
})
