export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  source?: string;
  tags: string[];
  createdAt: Date;
  similarity?: number;
}

export class RAGService {
  private vectorIndex: VectorizeIndex;
  
  constructor(vectorIndex: VectorizeIndex) {
    this.vectorIndex = vectorIndex;
  }
  
  async addKnowledge(item: KnowledgeItem): Promise<void> {
    try {
      // 生成文本嵌入向量
      const embedding = await this.generateEmbedding(item.content);
      
      // 存储到向量数据库
      await this.vectorIndex.insert([
        {
          id: item.id,
          values: embedding,
          metadata: {
            title: item.title,
            content: item.content,
            source: item.source,
            tags: item.tags.join(','),
            createdAt: item.createdAt.toISOString()
          }
        }
      ]);
    } catch (error) {
      console.error('Error adding knowledge:', error);
      // 在开发环境中不抛出错误，避免阻塞应用
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }
  
  async searchKnowledge(query: string, limit: number = 5): Promise<KnowledgeItem[]> {
    try {
      // 生成查询嵌入向量
      const queryEmbedding = await this.generateEmbedding(query);
      
      // 向量搜索
      const results = await this.vectorIndex.query(queryEmbedding, {
        topK: limit,
        includeMetadata: true
      });
      
      return results.matches.map(match => ({
        id: match.id,
        title: match.metadata.title,
        content: match.metadata.content,
        source: match.metadata.source,
        tags: match.metadata.tags ? match.metadata.tags.split(',') : [],
        createdAt: new Date(match.metadata.createdAt),
        similarity: match.score
      }));
    } catch (error) {
      console.error('Error searching knowledge:', error);
      // 返回模拟搜索结果
      return this.getMockKnowledgeResults(query);
    }
  }
  
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // 在实际生产环境中，这里应该调用真实的嵌入API
      // 比如 OpenAI 的 text-embedding-ada-002 模型
      // 或者 Cloudflare Workers AI
      
      // 目前返回模拟向量
      return Array.from({ length: 768 }, () => Math.random() - 0.5);
    } catch (error) {
      console.error('Error generating embedding:', error);
      // 返回随机向量作为fallback
      return Array.from({ length: 768 }, () => Math.random() - 0.5);
    }
  }
  
  private getMockKnowledgeResults(query: string): KnowledgeItem[] {
    // 模拟知识库搜索结果
    const mockResults = [
      {
        id: 'knowledge_1',
        title: '人工智能基础',
        content: '人工智能是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。',
        source: 'AI教程',
        tags: ['AI', '技术', '基础'],
        createdAt: new Date(),
        similarity: 0.85
      },
      {
        id: 'knowledge_2', 
        title: '机器学习概念',
        content: '机器学习是人工智能的一个子集，专注于构建可以从数据中学习和改进的算法。',
        source: 'ML指南',
        tags: ['机器学习', 'AI', '算法'],
        createdAt: new Date(),
        similarity: 0.75
      },
      {
        id: 'knowledge_3',
        title: 'ChatGPT介绍',
        content: 'ChatGPT是OpenAI开发的大型语言模型，能够进行自然语言对话和文本生成。',
        source: 'OpenAI文档',
        tags: ['ChatGPT', 'OpenAI', '语言模型'],
        createdAt: new Date(),
        similarity: 0.70
      }
    ];
    
    // 简单的关键词匹配来过滤相关结果
    const relevantResults = mockResults.filter(item => 
      item.content.toLowerCase().includes(query.toLowerCase()) ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    return relevantResults.length > 0 ? relevantResults : mockResults.slice(0, 2);
  }
}
