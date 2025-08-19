import { Env } from '../index';
import { RAGService } from './rag';
import { WeatherService } from './weather';
import OpenAI from 'openai';

export interface ChatResponse {
  content: string;
  type: 'TEXT' | 'WEATHER' | 'KNOWLEDGE';
  metadata?: any;
}

export class ChatService {
  private openai: OpenAI | null = null;
  private ragService: RAGService;
  private weatherService: WeatherService;

  constructor(env: Env, ragService: RAGService) {
    // 只有在有API Key时才初始化OpenAI
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
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
    const knowledgeKeywords = ['什么是', '介绍', '解释', '告诉我', '帮我了解'];
    
    const isWeatherQuery = weatherKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const isKnowledgeQuery = knowledgeKeywords.some(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isWeatherQuery) {
      // 提取城市名称
      const cityMatch = message.match(/([\u4e00-\u9fa5]+(?:市|县|区)?)(?:的)?(?:天气|温度)/);
      const city = cityMatch ? cityMatch[1] : '北京';
      return { type: 'weather', city };
    }
    
    if (isKnowledgeQuery) {
      return { type: 'knowledge' };
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
      
      // 使用OpenAI来处理知识问答
      if (this.openai) {
        const context = knowledgeItems.map(item => item.content).join('\n\n');
        const prompt = `基于以下知识回答问题：\n\n${context}\n\n问题：${query}`;
        
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的知识助手。请基于提供的上下文准确回答用户的问题。如果上下文中没有相关信息，请诚实地说明。请用中文回答。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        });
        
        return {
          content: response.choices[0].message.content || '抱歉，我无法基于现有知识回答这个问题。',
          type: 'KNOWLEDGE',
          metadata: {
            sources: knowledgeItems.map(item => item.source).filter(Boolean),
            confidence: knowledgeItems[0]?.similarity || 0
          }
        };
      } else {
        // 如果没有OpenAI API Key，返回模拟知识回答
        return {
          content: this.generateMockKnowledgeResponse(query, knowledgeItems),
          type: 'KNOWLEDGE',
          metadata: {
            sources: knowledgeItems.map(item => item.source).filter(Boolean),
            confidence: knowledgeItems[0]?.similarity || 0
          }
        };
      }
    } catch (error) {
      return await this.handleGeneralChat(query, '');
    }
  }

  private async handleGeneralChat(message: string, conversationId: string): Promise<ChatResponse> {
    if (this.openai) {
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
        console.error('OpenAI API error:', error);
        return this.generateMockResponse(message);
      }
    } else {
      // 如果没有OpenAI API Key，返回模拟回答
      return this.generateMockResponse(message);
    }
  }

  private generateMockResponse(message: string): ChatResponse {
    // 模拟智能回复
    const greetings = ['你好', 'hello', 'hi', '嗨'];
    const thanks = ['谢谢', 'thank', '感谢'];
    
    if (greetings.some(g => message.toLowerCase().includes(g))) {
      return {
        content: '你好！我是你的AI助手，有什么可以帮助您的吗？虽然我现在使用的是模拟数据，但仍然可以回答一些基本问题。',
        type: 'TEXT'
      };
    }
    
    if (thanks.some(t => message.toLowerCase().includes(t))) {
      return {
        content: '不客气！如果您有其他问题，随时可以问我。',
        type: 'TEXT'
      };
    }
    
    return {
      content: `我收到了您的消息："${message}"。目前我使用的是模拟回复，如果您配置了OpenAI API Key，我就能提供真正的AI对话了！`,
      type: 'TEXT'
    };
  }

  private generateMockKnowledgeResponse(query: string, knowledgeItems: any[]): string {
    if (knowledgeItems.length > 0) {
      return `根据我的知识库，关于"${query}"：\n\n${knowledgeItems[0].content}\n\n这是基于模拟数据的回答。配置OpenAI API Key后可以获得更智能的回答。`;
    }
    return `关于"${query}"的问题，我在知识库中没有找到相关信息。这是模拟回答，配置真实API Key后会有更准确的结果。`;
  }
}
