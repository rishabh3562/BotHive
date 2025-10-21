# Security Policy

## Our Commitment

The security of BotHive is a top priority. We appreciate the security research community's efforts in responsibly disclosing vulnerabilities and will make every effort to acknowledge and address reported issues promptly.

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 0.1.0 | :x:                |

**Note**: As BotHive is in active development (pre-1.0), we currently only support the latest `main` branch. Once we reach stable releases, we'll maintain security updates for specific versions.

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

### How to Report

1. **Email**: Send details to the project owner via GitHub (@rishabh3562)
   - Go to https://github.com/rishabh3562
   - Use the contact options available

2. **GitHub Security Advisories**:
   - Navigate to https://github.com/rishabh3562/BotHive/security/advisories
   - Click "Report a vulnerability"

### What to Include

Please include as much of the following information as possible:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass, etc.)
- **Affected component(s)** (file paths, API endpoints, features)
- **Step-by-step instructions** to reproduce the issue
- **Proof of concept** or exploit code (if applicable)
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up questions

### What to Expect

- **Initial Response**: Within 48 hours acknowledging receipt
- **Status Update**: Within 7 days with initial assessment
- **Resolution Timeline**: Varies by severity
  - **Critical**: 24-72 hours
  - **High**: 7 days
  - **Medium**: 30 days
  - **Low**: 90 days

### Our Commitment to You

- We will acknowledge your responsible disclosure
- We will keep you informed of our progress
- We will credit you in the security advisory (unless you prefer to remain anonymous)
- We will not take legal action against researchers who follow this policy

## Security Best Practices for Contributors

### Authentication & Authorization

- **Never commit secrets** to the repository
  - Use `.env.local` for local secrets (already in `.gitignore`)
  - Use environment variables for sensitive configuration
  - Review [.env.example](/.env.example) for required variables

- **Password Security**
  - Passwords are hashed with bcryptjs (12 rounds)
  - Never log or expose passwords in responses
  - Implement password strength requirements

- **JWT Tokens**
  - Generate strong secrets: `openssl rand -base64 32`
  - Access tokens expire in 7 days
  - Refresh tokens expire in 30 days
  - Tokens stored in HTTP-only cookies in production

### Input Validation

- **Always validate user input** using Zod schemas
- **Sanitize data** before database operations
- **Validate file uploads**:
  - Check file types and extensions
  - Limit file sizes
  - Scan for malware before storage

### API Security

- **Authentication**: Use `authenticate()` middleware on protected routes
- **Authorization**: Use role-based middleware (`requireBuilder`, `requireAdmin`, etc.)
- **Rate Limiting**: Consider implementing rate limiting for public endpoints
- **CORS**: Configure appropriate CORS headers for production

### Database Security

- **Use parameterized queries** (already handled by Mongoose/Supabase)
- **Never expose database credentials** in client-side code
- **Exclude sensitive fields** from responses (e.g., `.select("-password")`)
- **Enable Row Level Security (RLS)** on Supabase tables

### Payment Security

- **Stripe Integration**:
  - Always verify webhook signatures
  - Never trust client-side price data
  - Use server-side checkout sessions
  - Validate customer IDs before operations

### Dependencies

- **Regularly update dependencies** to patch known vulnerabilities
- **Run security audits**: `npm audit`
- **Review dependency licenses** for compliance

## Known Security Considerations

### Current Implementation Status

✅ **Implemented**:
- JWT-based authentication with access/refresh tokens
- Password hashing with bcryptjs
- HTTP-only cookies for token storage
- Stripe webhook signature verification
- Role-based access control (RBAC)
- Middleware authentication layer
- Database abstraction for multi-provider support

⚠️ **Needs Enhancement**:
- Input validation (Zod installed but limited usage)
- Rate limiting (Redis available but not enabled)
- File upload security (size limits, type validation, scanning)
- CSRF protection for state-changing operations
- Security event logging and monitoring
- API request/response validation

🔄 **Planned**:
- Comprehensive input validation with Zod
- Rate limiting with Upstash Redis
- Enhanced file upload security
- Security audit logging
- Dependency vulnerability scanning in CI/CD

## Sensitive Areas

The following areas require extra security scrutiny:

### 1. Authentication (`/app/api/auth/*`)
- `signin/route.ts` - User login, credential validation
- `signup/route.ts` - User registration, role assignment
- `refresh/route.ts` - Token refresh mechanism
- `lib/middleware/auth.ts` - Authentication middleware

### 2. Payment Processing (`/app/api/*`)
- `create-checkout-session/route.ts` - Stripe checkout creation
- `create-portal-session/route.ts` - Billing portal access
- `webhooks/stripe/route.ts` - Payment webhook handling

### 3. Agent Management (`/app/api/agents/*`)
- File uploads and validation
- Agent metadata and pricing
- Version control

### 4. Profile Management (`/app/api/database/profiles/*`)
- User profile CRUD operations
- Sensitive data exposure

### 5. Database Layer (`/lib/database/*`)
- MongoDB/Supabase connection handling
- JWT generation and validation
- User data operations

## Environment Variables Security

### Critical Secrets (Never Commit)

```bash
# Authentication
JWT_SECRET              # Generate: openssl rand -base64 32
JWT_REFRESH_SECRET      # Generate: openssl rand -base64 32

# Database
MONGODB_URI             # MongoDB connection string (if using MongoDB)

# Payments
STRIPE_SECRET_KEY       # Stripe secret key
STRIPE_WEBHOOK_SECRET   # Stripe webhook signing secret
```

### Public Variables (Safe to Expose)

```bash
# These are safe in client-side code
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Public anon key (RLS required)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

## Security Checklist for PRs

Before submitting a pull request that touches security-sensitive code:

- [ ] No secrets or credentials committed
- [ ] Input validation implemented with Zod
- [ ] Authentication/authorization middleware applied
- [ ] Error messages don't leak sensitive information
- [ ] Database queries use parameterized inputs
- [ ] File uploads validated (type, size, content)
- [ ] Rate limiting considered for new endpoints
- [ ] Security tests added for new features
- [ ] Dependencies updated and audited

## Disclosure Policy

### Coordinated Disclosure

We follow a coordinated disclosure process:

1. **Report received** - We acknowledge receipt within 48 hours
2. **Validation** - We confirm and assess severity (7 days)
3. **Fix development** - We develop and test a fix
4. **Release** - We deploy the fix to production
5. **Public disclosure** - We publish a security advisory (with your credit)

### Timeline

- **Critical vulnerabilities**: Fix deployed within 72 hours, disclosed after 7 days
- **High vulnerabilities**: Fix deployed within 7 days, disclosed after 14 days
- **Medium/Low vulnerabilities**: Fix deployed within 30 days, disclosed after 30 days

## Recognition

We maintain a **Security Researchers Hall of Fame** for responsible disclosures:

### 2025
_No vulnerabilities reported yet_

---

## Questions?

If you have questions about this security policy or need clarification, please:
- Open a **public discussion** for general security questions
- Use **private reporting** for potential vulnerabilities
- Review our [Contributing Guidelines](CONTRIBUTING.md) for development practices

Thank you for helping keep BotHive and its users safe!

---

**Last Updated**: October 2025
**Project Owner**: Rishabh Dubey ([@rishabh3562](https://github.com/rishabh3562))
