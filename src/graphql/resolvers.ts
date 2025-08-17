import { AppContext } from '../context';
import { nanoid } from 'nanoid';

export const resolvers = {
  Query: {
    messages: async (_: any, { conversationId }: { conversationId: string }, context: AppContext) => {
      return await context.databaseService.getMessages(conversationId);
    },
    
    conversations: async (_: any, __: any, context: AppContext) => {
      return await context.databaseService.getConversations();
    },
    
    weather: async (_: any, { city }: { city: string }, context: AppContext) => {
      try {
        return await context.weatherService.getWeather(city);
      } catch (error) {
        throw new Error(`获取天气信息失败: ${error.message}`);
      }
    },
    
    searchKnowledge: async (_: any, { query }: { query: string }, context: AppContext) => {
      return await context.ragService.searchKnowledge(query);
    },
  },
  
  Mutation: {
    sendMessage: async (_: any, { input }: any, context: AppContext) => {
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
    },
    
    createConversation: async (_: any, { title }: { title?: string }, context: AppContext) => {
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
    },
    
    deleteConversation: async (_: any, { id }: { id: string }, context: AppContext) => {
      return await context.databaseService.deleteConversation(id);
    },
    
    addKnowledge: async (_: any, { input }: any, context: AppContext) => {
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
    },
  },
};