# Stripe Webhook Improvements

## Overview

This document outlines the improvements made to the Stripe webhook handler in `app/api/webhooks/stripe/route.ts` to address database error handling, data validation, and reliability issues.

## Issues Addressed

### 1. Database Error Handling ✅
- **Problem**: Subscription upsert operations did not check for database errors
- **Solution**: Added comprehensive error checking with detailed logging
- **Implementation**: 
  ```typescript
  const { error: dbError } = await supabase.from('subscriptions').upsert(data);
  if (dbError) {
    logger.error('Failed to upsert subscription', {
      error: dbError.message,
      code: dbError.code,
      details: dbError.details,
      // ... additional context
    });
    throw dbError;
  }
  ```

### 2. Missing User ID Field ✅
- **Problem**: User ID was not being looked up from Stripe customer ID
- **Solution**: Added `getUserByStripeCustomerId()` function
- **Implementation**: Looks up user from `profiles` table using `stripe_customer_id`

### 3. Data Validation ✅
- **Problem**: No validation of required fields before database insert
- **Solution**: Added `validateSubscriptionData()` function
- **Validates**: `stripe_subscription_id`, `user_id`, `status`, `stripe_customer_id`, `current_period_end`

### 4. Retry Logic ✅
- **Problem**: No retry mechanism for transient database failures
- **Solution**: Implemented exponential backoff retry with `withRetry()` function
- **Configuration**: 3 retries with 1s, 2s, 4s delays

### 5. Proper Logging ✅
- **Problem**: Using `console.log` instead of structured logging
- **Solution**: Created dedicated logger utility with structured logging
- **Features**: Timestamped logs, contextual information, environment-aware debug logs

## New Features

### Logger Utility (`lib/logger.ts`)
```typescript
interface LogContext {
  [key: string]: any;
}

class ConsoleLogger implements Logger {
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
  debug(message: string, context?: LogContext): void
}
```

### Enhanced Error Handling
- **400**: Invalid Stripe signature
- **404**: User not found for Stripe customer
- **422**: Data validation failures
- **500**: Database errors and other server issues

### Retry Mechanism
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T>
```

## Test Coverage

### Unit Tests (`__tests__/api/webhooks/stripe.test.ts`)
Comprehensive test suite covering:

1. **Signature Verification**
   - Invalid signature handling
   - Missing signature handling

2. **User Lookup Failures**
   - User not found scenarios
   - Database errors during lookup

3. **Data Validation**
   - Missing required fields
   - Invalid data formats

4. **Database Operations**
   - Retry logic on failures
   - Success after retry
   - Permanent failure handling

5. **Event Processing**
   - Successful subscription events
   - Trial period handling
   - Irrelevant event filtering

### Integration Tests (`scripts/test-webhook-scenarios.ts`)
Real-world scenario testing:
- Invalid signature handling
- Non-existent customer handling
- Missing field validation
- Error response verification

## Usage

### Running Tests
```bash
# Unit tests
npm test

# Test coverage
npm run test:coverage

# Integration tests (requires environment setup)
npx ts-node scripts/test-webhook-scenarios.ts
```

### Environment Variables Required
```env
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SECRET_KEY=sk_test_... # For integration tests
WEBHOOK_URL=http://localhost:3000/api/webhooks/stripe # For integration tests
```

## Database Schema Requirements

The webhook expects the following database tables:

### `profiles` table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE,
  -- other fields...
);
```

### `subscriptions` table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL,
  tier TEXT,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Error Monitoring

All errors are logged with structured context including:
- Error message and code
- Subscription and customer IDs
- Event type and timestamp
- Stack traces (in development)
- Database error details (code, hint, details)

## Performance Considerations

1. **Retry Logic**: Exponential backoff prevents overwhelming the database
2. **Early Returns**: User lookup failures return immediately (404) instead of continuing
3. **Structured Logging**: Efficient JSON-based logging for production monitoring
4. **Validation**: Fast fail on missing required fields

## Security

1. **Signature Verification**: All webhooks verified against Stripe signature
2. **Error Information**: Sensitive error details only exposed in development
3. **Input Validation**: All subscription data validated before database operations
4. **SQL Injection Prevention**: Using Supabase ORM prevents direct SQL injection

## Monitoring and Alerting

The improved logging enables monitoring for:
- Database connection issues
- User lookup failures
- Subscription processing failures
- Retry attempt patterns
- Performance metrics

Set up alerts for:
- High error rates (>5% of webhooks failing)
- Database timeout patterns
- Missing user scenarios (potential data sync issues)
- Retry exhaustion (indicates persistent issues)

## Future Improvements

1. **Dead Letter Queue**: For permanently failed webhooks
2. **Metrics Collection**: Prometheus/StatsD integration
3. **Circuit Breaker**: Prevent cascade failures during outages
4. **Webhook Replay**: Manual retry mechanism for failed events
5. **Rate Limiting**: Protect against webhook flooding
