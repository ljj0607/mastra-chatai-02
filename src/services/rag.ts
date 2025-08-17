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
      throw error;
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
      return [];
    }
  }
  
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // 使用Cloudflare Workers AI生成嵌入向量
      const response = await fetch('https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/run/@cf/baai/bge-base-en-v1.5', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_CF_TOKEN',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      
      const result = await response.json();
      return result.result.data[0];
    } catch (error) {
      console.error('Error generating embedding:', error);
      // 返回随机向量作为fallback
      return Array.from({ length: 768 }, () => Math.random() - 0.5);
    }
  }
}