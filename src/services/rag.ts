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
  private vectorIndex?: VectorizeIndex;
  private isLocal: boolean;
  private mockKnowledge: KnowledgeItem[] = [];
  
  constructor(vectorIndex?: VectorizeIndex) {
    this.vectorIndex = vectorIndex;
    this.isLocal = !vectorIndex;
    
    if (this.isLocal) {
      console.log('RAG服务: 使用模拟知识库（本地开发模式）');
      this.initializeMockKnowledge();
    }
  }
  
  private initializeMockKnowledge() {
    this.mockKnowledge = [
      {
        id: 'knowledge_1',
        title: '人工智能基础',
        content: '人工智能（AI）是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。AI包括机器学习、自然语言处理、计算机视觉等多个子领域。',
        source: 'AI教程',
        tags: ['AI', '技术', '基础'],
        createdAt: new Date(),
        similarity: 0.95
      },
      {
        id: 'knowledge_2', 
        title: '机器学习概念',
        content: '机器学习是人工智能的一个子集，专注于构建可以从数据中学习和改进的算法。常见的机器学习类型包括监督学习、无监督学习和强化学习。',
        source: 'ML指南',
        tags: ['机器学习', 'AI', '算法'],
        createdAt: new Date(),
        similarity: 0.88
      },
      {
        id: 'knowledge_3',
        title: 'ChatGPT介绍',
        content: 'ChatGPT是OpenAI开发的大型语言模型，基于GPT架构。它能够进行自然语言对话、文本生成、代码编写等多种任务，是生成式AI的重要应用。',
        source: 'OpenAI文档',
        tags: ['ChatGPT', 'OpenAI', '语言模型'],
        createdAt: new Date(),
        similarity: 0.82
      },
      {
        id: 'knowledge_4',
        title: '深度学习原理',
        content: '深度学习是机器学习的一个分支，使用多层神经网络来模拟人脑的工作方式。它在图像识别、语音识别、自然语言处理等领域取得了突破性进展。',
        source: '深度学习教程',
        tags: ['深度学习', '神经网络', 'AI'],
        createdAt: new Date(),
        similarity: 0.79
      },
      {
        id: 'knowledge_5',
        title: 'RAG技术',
        content: 'RAG（Retrieval-Augmented Generation）是一种结合检索和生成的技术，通过从外部知识库检索相关信息来增强大语言模型的回答质量和准确性。',
        source: 'RAG论文',
        tags: ['RAG', '检索增强', '生成'],
        createdAt: new Date(),
        similarity: 0.85
      }
    ];
  }
  
  async addKnowledge(item: KnowledgeItem): Promise<void> {
    if (this.isLocal) {
      // 本地模式：添加到模拟知识库
      this.mockKnowledge.push({ ...item });
      console.log(`添加知识到模拟库: ${item.title}`);
      return;
    }
    
    try {
      // 生成文本嵌入向量
      const embedding = await this.generateEmbedding(item.content);
      
      // 存储到向量数据库
      await this.vectorIndex!.insert([
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
      // 向量数据库失败时添加到模拟库
      this.mockKnowledge.push({ ...item });
    }
  }
  
  async searchKnowledge(query: string, limit: number = 5): Promise<KnowledgeItem[]> {
    if (this.isLocal) {
      // 本地模式：使用模拟搜索
      return this.searchMockKnowledge(query, limit);
    }
    
    try {
      // 生成查询嵌入向量
      const queryEmbedding = await this.generateEmbedding(query);
      
      // 向量搜索
      const results = await this.vectorIndex!.query(queryEmbedding, {
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
      // 向量搜索失败时使用模拟搜索
      return this.searchMockKnowledge(query, limit);
    }
  }
  
  private searchMockKnowledge(query: string, limit: number): KnowledgeItem[] {
    const queryLower = query.toLowerCase();
    
    // 计算相关度分数
    const scoredResults = this.mockKnowledge.map(item => {
      let score = 0;
      
      // 标题匹配权重更高
      if (item.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      
      // 内容匹配
      if (item.content.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      
      // 标签匹配
      if (item.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
        score += 3;
      }
      
      // 关键词匹配
      const keywords = queryLower.split(/\s+/);
      keywords.forEach(keyword => {
        if (item.title.toLowerCase().includes(keyword)) score += 2;
        if (item.content.toLowerCase().includes(keyword)) score += 1;
      });
      
      return {
        ...item,
        similarity: Math.min(1, score / 10) // 归一化到0-1
      };
    });
    
    // 按分数排序并返回前N个结果
    return scoredResults
      .filter(item => item.similarity > 0)
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, limit);
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
}
