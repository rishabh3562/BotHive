# Contributing to BotHive

Thank you for your interest in contributing to BotHive! This guide will help you get started.

## ⚠️ Important Notices

### AI-Generated Content
**Many issues in this repository were generated using AI.** Please read [SAFETY.md](SAFETY.md) before starting work on any issue. Always verify the issue description against the actual codebase, as AI-generated content may contain inaccuracies or be outdated.

### Contributor License Agreement (CLA)
**By contributing to BotHive, you automatically agree to our [Contributor License Agreement (CLA)](CLA.md).**

This means:
- ✓ **You retain full copyright** to your contributions
- ✓ You grant BotHive permission to use your contributions in both **open source and commercial versions**
- ✓ You certify your contribution is your original work or properly licensed
- ✓ The project can grow sustainably while protecting all contributors

**No separate signature required** - your pull request, issue, or comment constitutes acceptance of the CLA terms. Please review [CLA.md](CLA.md) to understand what you're agreeing to.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Testing](#testing)
- [Issue Labels](#issue-labels)
- [Getting Help](#getting-help)

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Git
- Supabase account OR MongoDB instance
- Stripe account (for payment features)

### Local Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/BotHive.git
   cd BotHive
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials. Required variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `JWT_SECRET` - Generate with `openssl rand -base64 32`
   - `JWT_REFRESH_SECRET` - Generate with `openssl rand -base64 32`
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

### Branching Strategy

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Make your changes and commit regularly

3. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

4. Open a Pull Request against `main`

### Branch Naming

Use descriptive branch names with prefixes:
- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

Examples:
- `feat/oauth-login`
- `fix/subscription-webhook`
- `docs/api-documentation`

## Code Style

### TypeScript

- Use TypeScript for all new files
- Avoid `any` types - use proper type definitions
- Use `unknown` in catch blocks instead of `any`
- Define explicit return types for functions
- Use interfaces for object shapes

**Good:**
```typescript
interface User {
  id: string;
  email: string;
  role: 'builder' | 'recruiter';
}

function getUser(id: string): Promise<User | null> {
  // implementation
}

try {
  // code
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  logger.error(message);
}
```

**Bad:**
```typescript
function getUser(id: any): any {
  // implementation
}

catch (error: any) {
  console.log(error.message);
}
```

### Formatting

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects and arrays
- Use semicolons

Run the linter before committing:
```bash
npm run lint
```

### File Organization

- Keep components small and focused (< 200 lines)
- Co-locate related files (components, styles, tests)
- Use index files to simplify imports
- Extract reusable logic to `lib/` directory

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation only changes
- `style` - Code style/formatting (no logic change)
- `refactor` - Code restructuring
- `perf` - Performance improvements
- `test` - Adding/updating tests
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Maintenance tasks
- `security` - Security fixes

### Scopes

Use specific scope names:
- `auth` - Authentication
- `api` - API routes
- `database` - Database operations
- `ui` - User interface components
- `config` - Configuration
- `deps` - Dependencies

### Examples

```bash
feat(auth): add OAuth2 login flow
fix(api): handle null pointer in user service
docs(readme): add installation instructions
refactor(database): extract query builder
test(auth): add login unit tests
security(env): remove hardcoded secrets
```

### Rules

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Keep description under 72 characters
- Reference issues in footer: `Closes #123`

## Pull Requests

### Before Submitting

- [ ] Run linting: `npm run lint`
- [ ] Run tests: `npm test` (if tests exist)
- [ ] Build succeeds: `npm run build`
- [ ] Self-review your code
- [ ] Update documentation if needed
- [ ] Add tests for new features

### PR Description

Use the PR template to:
1. Summarize changes (2-3 sentences)
2. List specific changes with file references
3. Describe testing performed
4. Check all relevant boxes
5. Link related issues

### Review Process

1. Automated checks must pass (linting, tests, build)
2. At least one maintainer approval required
3. Address review feedback
4. Squash commits if requested
5. Maintainer will merge when ready

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for all new features
- Write tests for bug fixes
- Test both success and failure cases
- Use descriptive test names

Example:
```typescript
describe('User Authentication', () => {
  describe('signIn', () => {
    it('should return user and token for valid credentials', async () => {
      // test implementation
    });

    it('should throw error for invalid password', async () => {
      // test implementation
    });

    it('should throw error for non-existent user', async () => {
      // test implementation
    });
  });
});
```

## Issue Labels

### Core

- **good first issue** - Good for newcomers (< 2 hours)
- **help wanted** - Extra attention needed (> 2 hours)

### Type

- **bug** - Something is not working
- **enhancement** - New feature or request
- **documentation** - Documentation improvements
- **security** - Security vulnerability or improvement

### Category

- **accessibility** - Accessibility improvements
- **performance** - Performance improvements
- **test** - Testing related
- **refactor** - Code restructuring

### Status

- **blocked** - Blocked by another issue
- **duplicate** - Already exists
- **wontfix** - Will not be worked on

### Priority

- **priority:high** - High priority
- **priority:medium** - Medium priority
- **priority:low** - Low priority

## Getting Help

### Questions

- **GitHub Discussions**: Ask questions and discuss ideas
- **Issues**: Report bugs or request features
- **Discord/Slack**: (Add link if available)

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

## Code of Conduct

Be respectful, inclusive, and professional. We're all here to learn and build something great together.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (when available)

Thank you for contributing to BotHive!
