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
  const env = c.env;
  
  // 创建mock服务用于本地开发
  const databaseService = new DatabaseService(env?.DB);
  const ragService = new RAGService(env?.VECTORIZE_INDEX);
  const chatService = new ChatService(env || {}, ragService);
  const weatherService = new WeatherService(env || {});
  
  return {
    env: env || {},
    chatService,
    weatherService,
    ragService,
    databaseService,
  };
}
