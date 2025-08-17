import { buildSchema } from 'graphql';
import { resolvers } from './resolvers';
import { makeExecutableSchema } from '@graphql-tools/schema';

const typeDefs = `
  scalar DateTime
  
  type Query {
    messages(conversationId: String!): [Message!]!
    conversations: [Conversation!]!
    weather(city: String!): Weather
    searchKnowledge(query: String!): [KnowledgeItem!]!
  }
  
  type Mutation {
    sendMessage(input: SendMessageInput!): SendMessageResponse!
    createConversation(title: String): Conversation!
    deleteConversation(id: String!): Boolean!
    addKnowledge(input: AddKnowledgeInput!): KnowledgeItem!
  }
  
  type Subscription {
    messageAdded(conversationId: String!): Message!
  }
  
  input SendMessageInput {
    conversationId: String!
    content: String!
    type: MessageType = TEXT
  }
  
  input AddKnowledgeInput {
    title: String!
    content: String!
    source: String
    tags: [String!]
  }
  
  type SendMessageResponse {
    userMessage: Message!
    botMessage: Message!
  }
  
  type Message {
    id: String!
    conversationId: String!
    content: String!
    type: MessageType!
    role: MessageRole!
    timestamp: DateTime!
    metadata: MessageMetadata
  }
  
  type MessageMetadata {
    weather: Weather
    sources: [String!]
    confidence: Float
  }
  
  type Conversation {
    id: String!
    title: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    messageCount: Int!
  }
  
  type Weather {
    city: String!
    temperature: Float!
    description: String!
    humidity: Int!
    windSpeed: Float!
    icon: String!
  }
  
  type KnowledgeItem {
    id: String!
    title: String!
    content: String!
    source: String
    tags: [String!]!
    createdAt: DateTime!
    similarity: Float
  }
  
  enum MessageType {
    TEXT
    WEATHER
    KNOWLEDGE
  }
  
  enum MessageRole {
    USER
    ASSISTANT
  }
`;

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});