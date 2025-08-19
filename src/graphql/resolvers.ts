import { AppContext } from '../context';
import { nanoid } from 'nanoid';
import { GraphQLScalarType, Kind } from 'graphql';

// DateTime标量类型解析器
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date and time as ISO string',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return value;
    }
    throw new Error('Value must be a Date or ISO string');
  },
  parseValue(value: any) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('Value must be a string');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error('Value must be a string');
  },
});

export const resolvers = {
  DateTime: DateTimeScalar,
  
  Query: {
    messages: async (_: any, { conversationId }: { conversationId: string }, context: AppContext) => {
      try {
        return await context.databaseService.getMessages(conversationId);
      } catch (error) {
        console.error('Error getting messages:', error);
        return [];
      }
    },
    
    conversations: async (_: any, __: any, context: AppContext) => {
      try {
        return await context.databaseService.getConversations();
      } catch (error) {
        console.error('Error getting conversations:', error);
        return [];
      }
    },
    
    weather: async (_: any, { city }: { city: string }, context: AppContext) => {
      try {
        return await context.weatherService.getWeather(city);
      } catch (error) {
        console.error('Weather API error:', error);
        throw new Error(`获取天气信息失败: ${error.message}`);
      }
    },
    
    searchKnowledge: async (_: any, { query }: { query: string }, context: AppContext) => {
      try {
        return await context.ragService.searchKnowledge(query);
      } catch (error) {
        console.error('Knowledge search error:', error);
        return [];
      }
    },
  },
  
  Mutation: {
    sendMessage: async (_: any, { input }: any, context: AppContext) => {
      try {
        const userMessageId = nanoid();
        const botMessageId = nanoid();
        const timestamp = new Date();
        
        // 保存用户消息
        const userMessage = {
          id: userMessageId,
          conversationId: input.conversationId,
          content: input.content,
          type: input.type || 'TEXT',
          role: 'USER',
          timestamp,
          metadata: null,
        };
        
        await context.databaseService.saveMessage(userMessage);
        
        // 生成AI回复
        const response = await context.chatService.generateResponse(
          input.content,
          input.conversationId
        );
        
        const botMessage = {
          id: botMessageId,
          conversationId: input.conversationId,
          content: response.content,
          type: response.type,
          role: 'ASSISTANT',
          timestamp: new Date(),
          metadata: response.metadata,
        };
        
        await context.databaseService.saveMessage(botMessage);
        
        return {
          userMessage,
          botMessage,
        };
      } catch (error) {
        console.error('Send message error:', error);
        throw new Error('发送消息失败');
      }
    },
    
    createConversation: async (_: any, { title }: { title?: string }, context: AppContext) => {
      try {
        const id = nanoid();
        const now = new Date();
        
        const conversation = {
          id,
          title: title || `对话 ${new Date().toLocaleString()}`,
          createdAt: now,
          updatedAt: now,
          messageCount: 0,
        };
        
        await context.databaseService.saveConversation(conversation);
        return conversation;
      } catch (error) {
        console.error('Create conversation error:', error);
        throw new Error('创建对话失败');
      }
    },
    
    deleteConversation: async (_: any, { id }: { id: string }, context: AppContext) => {
      try {
        return await context.databaseService.deleteConversation(id);
      } catch (error) {
        console.error('Delete conversation error:', error);
        return false;
      }
    },
    
    addKnowledge: async (_: any, { input }: any, context: AppContext) => {
      try {
        const id = nanoid();
        const knowledgeItem = {
          id,
          title: input.title,
          content: input.content,
          source: input.source,
          tags: input.tags || [],
          createdAt: new Date(),
        };
        
        await context.ragService.addKnowledge(knowledgeItem);
        return knowledgeItem;
      } catch (error) {
        console.error('Add knowledge error:', error);
        throw new Error('添加知识失败');
      }
    },
  },
};
