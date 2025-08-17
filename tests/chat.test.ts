import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ChatService } from '../src/services/chat'
import { RAGService } from '../src/services/rag'

// Mock environment
const mockEnv = {
  OPENAI_API_KEY: 'test-openai-key',
  ANTHROPIC_API_KEY: 'test-anthropic-key',
  WEATHER_API_KEY: 'test-weather-key',
  DB: {} as D1Database,
  VECTORIZE_INDEX: {} as VectorizeIndex
}

describe('ChatService', () => {
  let chatService: ChatService
  let ragService: RAGService

  beforeAll(() => {
    ragService = new RAGService(mockEnv.VECTORIZE_INDEX)
    chatService = new ChatService(mockEnv, ragService)
  })

  it('should analyze weather intent correctly', async () => {
    const weatherMessages = [
      '今天天气怎么样',
      '北京的温度是多少',
      '上海会下雨吗',
      'What is the weather like in Tokyo?'
    ]

    for (const message of weatherMessages) {
      const intent = await (chatService as any).analyzeIntent(message)
      expect(intent.type).toBe('weather')
    }
  })

  it('should extract city name from weather query', async () => {
    const testCases = [
      { message: '北京的天气', expectedCity: '北京' },
      { message: '上海今天下雨吗', expectedCity: '上海' },
      { message: '深圳市温度是多少', expectedCity: '深圳市' },
      { message: '今天天气怎么样', expectedCity: '北京' } // 默认城市
    ]

    for (const { message, expectedCity } of testCases) {
      const intent = await (chatService as any).analyzeIntent(message)
      expect(intent.city).toBe(expectedCity)
    }
  })

  it('should handle general chat messages', async () => {
    const generalMessages = [
      '你好',
      '你叫什么名字',
      '你能做什么',
      'Hello, how are you?'
    ]

    for (const message of generalMessages) {
      const intent = await (chatService as any).analyzeIntent(message)
      expect(intent.type).toBe('general')
    }
  })
})

describe('WeatherService', () => {
  it('should return mock weather data when API fails', async () => {
    const { WeatherService } = await import('../src/services/weather')
    const weatherService = new WeatherService(mockEnv)
    
    const weather = await weatherService.getWeather('北京')
    
    expect(weather).toHaveProperty('city', '北京')
    expect(weather).toHaveProperty('temperature')
    expect(weather).toHaveProperty('description')
    expect(weather).toHaveProperty('humidity')
    expect(weather).toHaveProperty('windSpeed')
    expect(weather).toHaveProperty('icon')
    
    expect(typeof weather.temperature).toBe('number')
    expect(weather.temperature).toBeGreaterThanOrEqual(5)
    expect(weather.temperature).toBeLessThanOrEqual(35)
  })
})

describe('RAGService', () => {
  let ragService: RAGService

  beforeAll(() => {
    ragService = new RAGService(mockEnv.VECTORIZE_INDEX)
  })

  it('should generate fallback embedding when API fails', async () => {
    const embedding = await (ragService as any).generateEmbedding('测试文本')
    
    expect(Array.isArray(embedding)).toBe(true)
    expect(embedding.length).toBe(768)
    expect(embedding.every(val => typeof val === 'number')).toBe(true)
  })

  it('should handle empty search results', async () => {
    const results = await ragService.searchKnowledge('不存在的查询')
    expect(Array.isArray(results)).toBe(true)
  })
})