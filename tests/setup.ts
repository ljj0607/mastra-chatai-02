import { vi } from 'vitest'

// Mock Cloudflare Workers globals
global.Request = globalThis.Request || class MockRequest {
  constructor(public url: string, public init?: RequestInit) {}
  
  json() {
    return Promise.resolve({})
  }
  
  text() {
    return Promise.resolve('')
  }
}

global.Response = globalThis.Response || class MockResponse {
  constructor(public body?: BodyInit, public init?: ResponseInit) {}
  
  static json(data: any, init?: ResponseInit) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      }
    })
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body as string || '{}'))
  }
}

// Mock fetch
global.fetch = vi.fn()

// Mock console to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
}