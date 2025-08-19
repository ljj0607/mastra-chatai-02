import { Context } from 'hono';
import { Env } from './index';
import { ChatService } from './services/chat';
import { WeatherService } from './services/weather';
import { RAGService } from './services/rag';
import { DatabaseService } from './services/database';

export interface AppContext {
  env: Env;
  chatService: ChatService;
  weatherService: WeatherService;
  ragService: RAGService;
  databaseService: DatabaseService;
}

export function createContext(c: Context<{ Bindings: Env }>): AppContext {
  const env = c.env || {};
  
  // 安全地创建服务，处理本地开发环境
  try {
    const databaseService = new DatabaseService(env.DB);
    const ragService = new RAGService(env.VECTORIZE_INDEX);
    const chatService = new ChatService(env, ragService);
    const weatherService = new WeatherService(env);
    
    return {
      env,
      chatService,
      weatherService,
      ragService,
      databaseService,
    };
  } catch (error) {
    console.warn('服务初始化警告:', error.message);
    console.log('使用模拟服务进行本地开发');
    
    // 创建带有默认值的mock环境
    const mockEnv = {
      OPENAI_API_KEY: env.OPENAI_API_KEY || '',
      WEATHER_API_KEY: env.WEATHER_API_KEY || '',
      DB: env.DB,
      VECTORIZE_INDEX: env.VECTORIZE_INDEX,
    };
    
    const databaseService = new DatabaseService(mockEnv.DB);
    const ragService = new RAGService(mockEnv.VECTORIZE_INDEX);
    const chatService = new ChatService(mockEnv, ragService);
    const weatherService = new WeatherService(mockEnv);
    
    return {
      env: mockEnv,
      chatService,
      weatherService,
      ragService,
      databaseService,
    };
  }
}
