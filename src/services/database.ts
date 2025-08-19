import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema';

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: 'TEXT' | 'WEATHER' | 'KNOWLEDGE';
  role: 'USER' | 'ASSISTANT';
  timestamp: Date;
  metadata?: any;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export class DatabaseService {
  private db;
  private isLocal: boolean;
  private mockData: {
    messages: Map<string, Message[]>;
    conversations: Map<string, Conversation>;
  };
  
  constructor(d1?: D1Database) {
    this.isLocal = !d1;
    
    if (d1) {
      this.db = drizzle(d1, { schema });
    }
    
    // 本地开发时使用内存存储
    this.mockData = {
      messages: new Map(),
      conversations: new Map()
    };
    
    if (this.isLocal) {
      console.log('数据库服务: 使用内存存储（本地开发模式）');
    }
  }
  
  async saveMessage(message: Message): Promise<void> {
    if (this.isLocal) {
      // 本地模式：使用内存存储
      const conversationMessages = this.mockData.messages.get(message.conversationId) || [];
      conversationMessages.push({ ...message });
      this.mockData.messages.set(message.conversationId, conversationMessages);
      console.log(`保存消息到内存: ${message.content.substring(0, 20)}...`);
      return;
    }
    
    try {
      await this.db.insert(schema.messages).values({
        id: message.id,
        conversationId: message.conversationId,
        content: message.content,
        type: message.type,
        role: message.role,
        timestamp: message.timestamp.toISOString(),
        metadata: message.metadata ? JSON.stringify(message.metadata) : null
      });
    } catch (error) {
      console.error('Error saving message:', error);
      // 数据库失败时也使用内存存储
      const conversationMessages = this.mockData.messages.get(message.conversationId) || [];
      conversationMessages.push({ ...message });
      this.mockData.messages.set(message.conversationId, conversationMessages);
    }
  }
  
  async getMessages(conversationId: string): Promise<Message[]> {
    if (this.isLocal) {
      // 本地模式：从内存获取
      const messages = this.mockData.messages.get(conversationId) || [];
      return messages.slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    
    try {
      const results = await this.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.conversationId, conversationId))
        .orderBy(desc(schema.messages.timestamp))
        .limit(50);
      
      return results.map(row => ({
        id: row.id,
        conversationId: row.conversationId,
        content: row.content,
        type: row.type as 'TEXT' | 'WEATHER' | 'KNOWLEDGE',
        role: row.role as 'USER' | 'ASSISTANT',
        timestamp: new Date(row.timestamp),
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      })).reverse();
    } catch (error) {
      console.error('Error getting messages:', error);
      // 数据库失败时使用内存数据
      const messages = this.mockData.messages.get(conversationId) || [];
      return messages.slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
  }
  
  async saveConversation(conversation: Conversation): Promise<void> {
    if (this.isLocal) {
      // 本地模式：保存到内存
      this.mockData.conversations.set(conversation.id, { ...conversation });
      console.log(`保存对话到内存: ${conversation.title}`);
      return;
    }
    
    try {
      await this.db.insert(schema.conversations).values({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        messageCount: conversation.messageCount
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
      // 数据库失败时使用内存存储
      this.mockData.conversations.set(conversation.id, { ...conversation });
    }
  }
  
  async getConversations(): Promise<Conversation[]> {
    if (this.isLocal) {
      // 本地模式：从内存获取
      const conversations = Array.from(this.mockData.conversations.values());
      return conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
    
    try {
      const results = await this.db
        .select()
        .from(schema.conversations)
        .orderBy(desc(schema.conversations.updatedAt))
        .limit(20);
      
      return results.map(row => ({
        id: row.id,
        title: row.title,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        messageCount: row.messageCount
      }));
    } catch (error) {
      console.error('Error getting conversations:', error);
      // 数据库失败时使用内存数据
      const conversations = Array.from(this.mockData.conversations.values());
      return conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
  }
  
  async deleteConversation(id: string): Promise<boolean> {
    if (this.isLocal) {
      // 本地模式：从内存删除
      const deleted = this.mockData.conversations.delete(id);
      this.mockData.messages.delete(id);
      console.log(`从内存删除对话: ${id}`);
      return deleted;
    }
    
    try {
      // 删除相关消息
      await this.db.delete(schema.messages).where(eq(schema.messages.conversationId, id));
      // 删除对话
      await this.db.delete(schema.conversations).where(eq(schema.conversations.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      // 数据库失败时从内存删除
      const deleted = this.mockData.conversations.delete(id);
      this.mockData.messages.delete(id);
      return deleted;
    }
  }
}
