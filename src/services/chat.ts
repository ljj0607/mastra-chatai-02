import { Env } from '../index';
import { RAGService } from './rag';
import { WeatherService } from './weather';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface ChatResponse {
  content: string;
  type: 'TEXT' | 'WEATHER' | 'KNOWLEDGE';
  metadata?: any;
}

export class ChatService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private ragService: RAGService;
  private weatherService: WeatherService;

  constructor(env: Env, ragService: RAGService) {
    this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    this.ragService = ragService;
    this.weatherService = new WeatherService(env);
  }

  async generateResponse(userMessage: string, conversationId: string): Promise<ChatResponse> {
    // 分析用户意图
    const intent = await this.analyzeIntent(userMessage);
    
    switch (intent.type) {
      case 'weather':
        return await this.handleWeatherQuery(intent.city);
      case 'knowledge':
        return await this.handleKnowledgeQuery(userMessage);
      default:
        return await this.handleGeneralChat(userMessage, conversationId);
    }
  }

  private async analyzeIntent(message: string): Promise<{ type: string; city?: string }> {
    const weatherKeywords = ['天气', '温度', '下雨', '晴天', '阴天', 'weather', 'temperature'];
    const isWeatherQuery = weatherKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isWeatherQuery) {
      const cityMatch = message.match(/([\u4e00-\u9fa5]+(?:市|县|区)?)(?:的)?(?:天气|温度)/);
      const city = cityMatch ? cityMatch[1] : '北京';
      return { type: 'weather', city };
    }
    
    return { type: 'general' };
  }

  private async handleWeatherQuery(city: string): Promise<ChatResponse> {
    try {
      const weather = await this.weatherService.getWeather(city);
      const content = `${city}当前天气：${weather.description}，温度${weather.temperature}°C，湿度${weather.humidity}%，风速${weather.windSpeed}m/s`;
      
      return {
        content,
        type: 'WEATHER',
        metadata: { weather }
      };
    } catch (error) {
      return {
        content: `抱歉，无法获取${city}的天气信息。`,
        type: 'TEXT'
      };
    }
  }

  private async handleKnowledgeQuery(query: string): Promise<ChatResponse> {
    try {
      const knowledgeItems = await this.ragService.searchKnowledge(query);
      
      if (knowledgeItems.length === 0) {
        return await this.handleGeneralChat(query, '');
      }
      
      const context = knowledgeItems.map(item => item.content).join('\n\n');
      const prompt = `基于以下知识回答问题：\n\n${context}\n\n问题：${query}`;
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });
      
      return {
        content: response.content[0].text,
        type: 'KNOWLEDGE',
        metadata: {
          sources: knowledgeItems.map(item => item.source).filter(Boolean),
          confidence: knowledgeItems[0]?.similarity || 0
        }
      };
    } catch (error) {
      return await this.handleGeneralChat(query, '');
    }
  }

  private async handleGeneralChat(message: string, conversationId: string): Promise<ChatResponse> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个友好的AI助手，能够帮助用户解答问题。请用中文回答。'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });
      
      return {
        content: response.choices[0].message.content || '抱歉，我无法理解您的问题。',
        type: 'TEXT'
      };
    } catch (error) {
      return {
        content: '抱歉，服务暂时不可用，请稍后再试。',
        type: 'TEXT'
      };
    }
  }
}