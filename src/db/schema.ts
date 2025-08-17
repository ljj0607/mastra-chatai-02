import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  messageCount: integer('message_count').default(0)
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(), // TEXT, WEATHER, KNOWLEDGE
  role: text('role').notNull(), // USER, ASSISTANT
  timestamp: text('timestamp').notNull(),
  metadata: text('metadata') // JSON string
});

export const knowledgeItems = sqliteTable('knowledge_items', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  source: text('source'),
  tags: text('tags'), // comma-separated
  createdAt: text('created_at').notNull()
});