// Load environment files in order: primary `.env` then optional `.env.local`.
// This allows developers to store real credentials in `.env` while still
// allowing local overrides in `.env.local` used during development.
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
// SECURITY: Using server-only Supabase credentials (no NEXT_PUBLIC_ prefix)
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'test-service-role-key'

// Legacy: Keep for backwards compatibility during migration
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'test-anon-key'

// Mock Web APIs for Node.js environment
global.Headers = class Headers extends Map {
  get(name) {
    return super.get(name.toLowerCase());
  }
  
  set(name, value) {
    return super.set(name.toLowerCase(), value);
  }
  
  has(name) {
    return super.has(name.toLowerCase());
  }
  
  append(name, value) {
    const existing = this.get(name);
    if (existing) {
      this.set(name, `${existing}, ${value}`);
    } else {
      this.set(name, value);
    }
  }
  
  delete(name) {
    return super.delete(name.toLowerCase());
  }
};

global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Headers(options.headers || {});
    this.body = options.body;
    this.cache = options.cache || 'default';
    this.credentials = options.credentials || 'same-origin';
    this.mode = options.mode || 'cors';
    this.redirect = options.redirect || 'follow';
    this.referrer = options.referrer || '';
    this.referrerPolicy = options.referrerPolicy || '';
    this.integrity = options.integrity || '';
    this.keepalive = options.keepalive || false;
    this.signal = options.signal || null;
  }
  
  async text() {
    return String(this.body || '');
  }
  
  async json() {
    return JSON.parse(this.body || '{}');
  }
  
  async arrayBuffer() {
    return new ArrayBuffer(0);
  }
  
  async blob() {
    return new Blob([this.body || '']);
  }
  
  async formData() {
    return new FormData();
  }
  
  clone() {
    return new Request(this.url, {
      method: this.method,
      headers: new Headers(this.headers),
      body: this.body,
      cache: this.cache,
      credentials: this.credentials,
      mode: this.mode,
      redirect: this.redirect,
      referrer: this.referrer,
      referrerPolicy: this.referrerPolicy,
      integrity: this.integrity,
      keepalive: this.keepalive,
      signal: this.signal
    });
  }
};

global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || (this.status === 200 ? 'OK' : '');
    this.ok = this.status >= 200 && this.status < 300;
    this.headers = new Headers(options.headers || {});
    this.redirected = options.redirected || false;
    this.type = options.type || 'basic';
    this.url = options.url || '';
  }
  
  async json() {
    return JSON.parse(this.body);
  }
  
  async text() {
    return String(this.body);
  }
  
  async arrayBuffer() {
    return new ArrayBuffer(0);
  }
  
  async blob() {
    return new Blob([this.body || '']);
  }
  
  async formData() {
    return new FormData();
  }
  
  clone() {
    return new Response(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      redirected: this.redirected,
      type: this.type,
      url: this.url
    });
  }
};

