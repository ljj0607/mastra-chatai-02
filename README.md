# Mastra ChatAI - 后端服务

基于 Mastra、LLM、RAG 技术的智能聊天工具后端服务，运行在 Cloudflare Workers 上。

## 功能特性

- 🤖 **多模型支持**: 集成 OpenAI GPT 和 Anthropic Claude
- 🌤️ **天气查询**: 实时天气信息获取
- 🧠 **RAG 知识库**: 向量化知识检索
- 📊 **GraphQL API**: 现代化 API 接口
- 💾 **数据持久化**: Cloudflare D1 数据库
- ⚡ **边缘计算**: Cloudflare Workers 部署

## 技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono + GraphQL Yoga
- **数据库**: Cloudflare D1 (SQLite)
- **向量数据库**: Cloudflare Vectorize
- **ORM**: Drizzle ORM
- **AI模型**: OpenAI GPT、Anthropic Claude
- **语言**: TypeScript

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone https://github.com/ljj0607/mastra-chatai-02.git
cd mastra-chatai-02

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件，填入必要的 API Key：

```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
WEATHER_API_KEY=your_weather_api_key_here
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

### 3. 数据库设置

```bash
# 创建 D1 数据库
wrangler d1 create chatai-db

# 更新 wrangler.toml 中的 database_id

# 生成数据库迁移文件
npm run db:generate

# 执行数据库迁移
npm run db:migrate
```

### 4. 创建向量索引

```bash
# 创建 Vectorize 索引
wrangler vectorize create chatai-vectors --dimensions=768 --metric=cosine
```

### 5. 本地开发

```bash
# 启动开发服务器
npm run dev
```

服务将在 `http://localhost:8787` 启动

### 6. 部署到生产环境

```bash
# 部署到 Cloudflare Workers
npm run deploy
```

## API 接口

### GraphQL 端点

```
POST /graphql
```

#### 查询示例

```graphql
# 获取对话列表
query GetConversations {
  conversations {
    id
    title
    createdAt
    messageCount
  }
}

# 发送消息
mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    userMessage {
      id
      content
      timestamp
    }
    botMessage {
      id
      content
      type
      metadata
    }
  }
}

# 查询天气
query GetWeather($city: String!) {
  weather(city: $city) {
    city
    temperature
    description
    humidity
    windSpeed
  }
}
```

### REST API 端点

```bash
# 健康检查
GET /health

# 天气查询
GET /api/weather/:city
```

## 测试

### 单元测试

```bash
npm test
```

### API 测试

使用 GraphQL Playground 或 Postman 测试 API：

1. **发送普通消息**:
```json
{
  "query": "mutation { sendMessage(input: { conversationId: \"test-conv\", content: \"你好\" }) { botMessage { content } } }"
}
```

2. **查询天气**:
```json
{
  "query": "query { weather(city: \"北京\") { temperature description } }"
}
```

3. **创建对话**:
```json
{
  "query": "mutation { createConversation(title: \"测试对话\") { id title } }"
}
```

## 开发步骤详解

### 1. 项目初始化
- 创建 Cloudflare Workers 项目
- 配置 TypeScript 和依赖项
- 设置 Drizzle ORM

### 2. 数据库设计
- 对话表 (conversations)
- 消息表 (messages) 
- 知识库表 (knowledge_items)

### 3. 服务层实现
- ChatService: AI 对话处理
- WeatherService: 天气信息获取
- RAGService: 向量检索服务
- DatabaseService: 数据库操作

### 4. API 层实现
- GraphQL Schema 定义
- Resolvers 实现
- REST API 端点

### 5. 部署配置
- Cloudflare Workers 配置
- 环境变量设置
- 生产环境优化

## 故障排除

### 常见问题

1. **API Key 错误**
   - 检查环境变量是否正确设置
   - 确认 API Key 有效性

2. **数据库连接失败**
   - 检查 D1 数据库 ID 配置
   - 确认数据库迁移是否成功

3. **向量搜索失败**
   - 检查 Vectorize 索引配置
   - 确认索引维度设置正确

### 日志查看

```bash
# 查看 Workers 日志
wrangler tail

# 查看数据库内容
npm run db:studio
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

MIT License