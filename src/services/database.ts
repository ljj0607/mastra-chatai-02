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
  
  constructor(d1: D1Database) {
    this.db = drizzle(d1, { schema });
  }
  
  async saveMessage(message: Message): Promise<void> {
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
      throw error;
    }
  }
  
  async getMessages(conversationId: string): Promise<Message[]> {
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
      return [];
    }
  }
  
  async saveConversation(conversation: Conversation): Promise<void> {
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
      throw error;
    }
  }
  
  async getConversations(): Promise<Conversation[]> {
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
      return [];
    }
  }
  
  async deleteConversation(id: string): Promise<boolean> {
    try {
      // 删除相关消息
      await this.db.delete(schema.messages).where(eq(schema.messages.conversationId, id));
      // 删除对话
      await this.db.delete(schema.conversations).where(eq(schema.conversations.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }
}