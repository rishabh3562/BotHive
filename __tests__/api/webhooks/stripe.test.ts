import { POST } from '@/app/api/webhooks/stripe/route';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/lib/stripe');
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/logger');
jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn().mockReturnValue('test-signature')
  }))
}));

const mockStripe = stripe as jest.Mocked<typeof stripe>;
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  upsert: jest.fn()
};

describe('Stripe Webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReturnValue(mockSupabaseClient as any);
    
    // Mock environment variables
    process.env.STRIPE_WEBHOOK_SECRET = 'test-secret';
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true
    });
  });

  const createMockRequest = (body: string) => {
    return {
      text: async () => body,
      json: async () => JSON.parse(body)
    } as Request;
  };

  const mockSubscriptionEvent = {
    id: 'evt_test',
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_test',
        customer: 'cus_test',
        status: 'active',
        metadata: { tier: 'pro' },
        current_period_end: 1640995200, // 2022-01-01
        cancel_at_period_end: false,
        trial_end: null
      }
    }
  };

  describe('Signature Verification', () => {
    it('should return 400 for invalid signature', async () => {
      (mockStripe as any).webhooks = {
        constructEvent: jest.fn().mockImplementation(() => {
          throw new Error('Invalid signature');
        })
      };

      const request = createMockRequest(JSON.stringify(mockSubscriptionEvent));
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Invalid signature');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Stripe webhook signature verification failed',
        expect.objectContaining({
          error: 'Invalid signature',
          hasSignature: true
        })
      );
    });

    it('should handle missing signature', async () => {
      const { headers } = require('next/headers');
      (headers as jest.Mock).mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null)
      });
      
      const request = {
        text: async () => JSON.stringify(mockSubscriptionEvent),
        json: async () => mockSubscriptionEvent
      } as Request;

      (mockStripe as any).webhooks = {
        constructEvent: jest.fn().mockImplementation(() => {
          throw new Error('No signature provided');
        })
      };

      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Stripe webhook signature verification failed',
        expect.objectContaining({
          hasSignature: false
        })
      );
    });
  });

  describe('User Lookup Failures', () => {
    beforeEach(() => {
      (mockStripe as any).webhooks = {
        constructEvent: jest.fn().mockReturnValue(mockSubscriptionEvent)
      };
    });

    it('should return 404 when user not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'No rows returned', code: 'PGRST116' }
      });

      const request = createMockRequest(JSON.stringify(mockSubscriptionEvent));
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('User not found for subscription');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to find user for customer ID',
        expect.objectContaining({
          stripeCustomerId: 'cus_test',
          error: 'No rows returned'
        })
      );
    });

    it('should return 404 when database error occurs during user lookup', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed', code: 'CONNECTION_ERROR' }
      });

      const request = createMockRequest(JSON.stringify(mockSubscriptionEvent));
      const response = await POST(request);

      expect(response.status).toBe(404);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to find user for customer ID',
        expect.objectContaining({
          stripeCustomerId: 'cus_test',
          error: 'Connection failed'
        })
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'No user found for Stripe customer',
        expect.objectContaining({
          stripeCustomerId: 'cus_test',
          subscriptionId: 'sub_test',
          eventType: 'customer.subscription.created'
        })
      );
    });
  });

  describe('Data Validation Failures', () => {
    beforeEach(() => {
      (mockStripe as any).webhooks = {
        constructEvent: jest.fn().mockReturnValue(mockSubscriptionEvent)
      };
      
      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user_test' },
        error: null
      });
    });

    it('should return 422 for missing required fields', async () => {
      const invalidEvent = {
        ...mockSubscriptionEvent,
        data: {
          object: {
            ...mockSubscriptionEvent.data.object,
            id: null // Missing subscription ID
          }
        }
      };

      (mockStripe as any).webhooks.constructEvent = jest.fn().mockReturnValue(invalidEvent);

      const request = createMockRequest(JSON.stringify(invalidEvent));
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.message).toBe('Webhook handler failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Webhook handler failed',
        expect.objectContaining({
          error: expect.stringContaining('Validation failed')
        })
      );
    });
  });

  describe('Database Upsert Failures', () => {
    beforeEach(() => {
      (mockStripe as any).webhooks = {
        constructEvent: jest.fn().mockReturnValue(mockSubscriptionEvent)
      };
      
      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user_test' },
        error: null
      });
    });

    it('should retry on database errors and eventually fail', async () => {
      const dbError = {
        message: 'Connection timeout',
        code: 'CONNECTION_TIMEOUT',
        details: 'Database connection timed out',
        hint: 'Try again later'
      };

      mockSupabaseClient.upsert.mockResolvedValue({
        data: null,
        error: dbError
      });

      const request = createMockRequest(JSON.stringify(mockSubscriptionEvent));
      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(mockSupabaseClient.upsert).toHaveBeenCalledTimes(3); // MAX_RETRIES
      expect(mockLogger.warn).toHaveBeenCalledTimes(3); // One for each retry
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to upsert subscription',
        expect.objectContaining({
          error: 'Connection timeout',
          code: 'CONNECTION_TIMEOUT',
          details: 'Database connection timed out',
          hint: 'Try again later',
          subscriptionId: 'sub_test',
          userId: 'user_test',
          customerId: 'cus_test',
          eventType: 'customer.subscription.created'
        })
      );
    });

    it('should succeed after retry', async () => {
      let callCount = 0;
      mockSupabaseClient.upsert.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            data: null,
            error: { message: 'Temporary error', code: 'TEMP_ERROR' }
          });
        }
        return Promise.resolve({ data: [{}], error: null });
      });

      const request = createMockRequest(JSON.stringify(mockSubscriptionEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSupabaseClient.upsert).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully processed subscription',
        expect.objectContaining({
          subscriptionId: 'sub_test',
          userId: 'user_test',
          status: 'active',
          eventType: 'customer.subscription.created'
        })
      );
    });
  });

  describe('Successful Processing', () => {
    beforeEach(() => {
      (mockStripe as any).webhooks = {
        constructEvent: jest.fn().mockReturnValue(mockSubscriptionEvent)
      };
      
      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user_test' },
        error: null
      });
      
      mockSupabaseClient.upsert.mockResolvedValue({
        data: [{}],
        error: null
      });
    });

    it('should successfully process subscription created event', async () => {
      const request = createMockRequest(JSON.stringify(mockSubscriptionEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSupabaseClient.upsert).toHaveBeenCalledWith(
        {
          stripe_subscription_id: 'sub_test',
          user_id: 'user_test',
          status: 'active',
          tier: 'pro',
          current_period_end: new Date(1640995200 * 1000),
          cancel_at_period_end: false,
          stripe_customer_id: 'cus_test',
          trial_end: null
        },
        expect.objectContaining({ onConflict: 'stripe_subscription_id' })
      );
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully processed subscription',
        expect.objectContaining({
          subscriptionId: 'sub_test',
          userId: 'user_test',
          status: 'active',
          eventType: 'customer.subscription.created'
        })
      );
    });

    it('should handle subscription with trial_end', async () => {
      const eventWithTrial = {
        ...mockSubscriptionEvent,
        data: {
          object: {
            ...mockSubscriptionEvent.data.object,
            trial_end: 1640995200 // 2022-01-01
          }
        }
      };

      (mockStripe as any).webhooks.constructEvent = jest.fn().mockReturnValue(eventWithTrial);

      const request = createMockRequest(JSON.stringify(eventWithTrial));
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSupabaseClient.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          trial_end: new Date(1640995200 * 1000)
        }),
        expect.objectContaining({ onConflict: 'stripe_subscription_id' })
      );
    });
  });

  describe('Irrelevant Events', () => {
    it('should ignore irrelevant events', async () => {
      const irrelevantEvent = {
        id: 'evt_test',
        type: 'payment_intent.succeeded',
        data: { object: {} }
      };

      (mockStripe as any).webhooks = {
        constructEvent: jest.fn().mockReturnValue(irrelevantEvent)
      };

      const request = createMockRequest(JSON.stringify(irrelevantEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSupabaseClient.upsert).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Tests', () => {
    it('should return 503 when Stripe is not configured', async () => {
      jest.resetModules();
      jest.doMock('@/lib/stripe', () => ({ stripe: null }));
      const { POST: PostHandler } = await import('@/app/api/webhooks/stripe/route');

      const request = createMockRequest(JSON.stringify(mockSubscriptionEvent));
      const response = await PostHandler(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.message).toBe('Stripe not configured');
    });

    it('should return 503 when Supabase is not configured', async () => {
      (mockStripe as any).webhooks = {
        constructEvent: jest.fn().mockReturnValue(mockSubscriptionEvent)
      };
      
      (mockCreateClient as jest.Mock).mockReturnValueOnce(null);

      const request = createMockRequest(JSON.stringify(mockSubscriptionEvent));
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.message).toBe('Supabase not configured');
      expect(mockLogger.error).toHaveBeenCalledWith('Supabase not configured');
    });
  });
});
