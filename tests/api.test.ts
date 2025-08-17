import { describe, it, expect } from 'vitest'

// Mock Cloudflare Workers environment
const mockEnv = {
  DB: {} as D1Database,
  VECTORIZE_INDEX: {} as VectorizeIndex,
  OPENAI_API_KEY: 'test-key',
  ANTHROPIC_API_KEY: 'test-key',
  WEATHER_API_KEY: 'test-key'
}

describe('API Endpoints', () => {
  it('should respond to health check', async () => {
    const app = await import('../src/index')
    
    const request = new Request('http://localhost/health', {
      method: 'GET'
    })
    
    const response = await app.default.fetch(request, mockEnv)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'ok')
    expect(data).toHaveProperty('timestamp')
  })

  it('should handle CORS preflight requests', async () => {
    const app = await import('../src/index')
    
    const request = new Request('http://localhost/graphql', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    })
    
    const response = await app.default.fetch(request, mockEnv)
    
    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
  })

  it('should handle weather API requests', async () => {
    const app = await import('../src/index')
    
    const request = new Request('http://localhost/api/weather/北京', {
      method: 'GET'
    })
    
    const response = await app.default.fetch(request, mockEnv)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('city')
    expect(data.data).toHaveProperty('temperature')
  })
})