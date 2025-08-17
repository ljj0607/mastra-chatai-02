# Mastra ChatAI - 后端服务

基于 Mastra、LLM、RAG 技术的智能聊天工具后端服务，运行在 Cloudflare Workers 上。

> 🚀 **快速开始**: 查看 [QUICKSTART.md](./QUICKSTART.md) 一键启动项目！

## 解决你遇到的问题

如果你看到 `vector-db: Not found` 错误，这是因为依赖问题已修复。请按以下步骤操作：

```bash
# 1. 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 2. 启动项目（无需真实API Key）
npm run dev
```

应用会使用模拟数据正常运行！🎉

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

### 最简启动（推荐）

```bash
# 克隆并启动
git clone https://github.com/ljj0607/mastra-chatai-02.git
cd mastra-chatai-02
npm install
npm run dev
```

访问 http://localhost:8787 即可体验！

### 完整配置

如需使用真实AI服务，请参考 [完整部署指南](./docs/SETUP.md)

## API 接口快速测试

### 健康检查
```bash
curl http://localhost:8787/health
```

### 天气查询
```bash
curl http://localhost:8787/api/weather/北京
```

### GraphQL查询
```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}'
```

## 核心功能演示

### 1. AI对话
- 普通聊天对话
- 上下文理解
- 多轮对话记忆

### 2. 天气查询
- 自然语言查询：`北京的天气怎么样？`
- 支持全球主要城市
- 实时数据更新

### 3. 知识问答
- 基于RAG的智能问答
- 向量相似度搜索
- 上下文增强生成

## 项目结构

```
src/
├── services/          # 业务逻辑层
│   ├── chat.ts       # AI对话服务
│   ├── weather.ts    # 天气服务
│   ├── rag.ts        # RAG检索服务
│   └── database.ts   # 数据库服务
├── graphql/          # GraphQL层
│   ├── schema.ts     # Schema定义
│   └── resolvers.ts  # 解析器
├── db/               # 数据库
│   └── schema.ts     # 数据库Schema
└── index.ts          # 入口文件
```

## 环境变量（可选）

```env
# 不配置也能运行，会使用模拟数据
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key  
WEATHER_API_KEY=your_weather_key
```

## 故障排除

### 常见问题

**Q: `vector-db: Not found` 错误？**
```bash
# 解决方案：重新安装依赖
rm -rf node_modules
npm install
```

**Q: 启动失败？**
```bash
# 检查Node.js版本（需要18+）
node --version

# 检查包管理器
npm --version
```

**Q: API调用失败？**
- 本地开发无需真实API Key
- 检查端口是否被占用
- 查看控制台错误信息

### 获取帮助

- 📚 [详细文档](./docs/)
- 🐛 [问题反馈](https://github.com/ljj0607/mastra-chatai-02/issues)
- 💬 [讨论区](https://github.com/ljj0607/mastra-chatai-02/discussions)

## 开发步骤

1. **环境准备** ✅ Node.js 18+
2. **克隆代码** ✅ `git clone`
3. **安装依赖** ✅ `npm install`
4. **启动开发** ✅ `npm run dev`
5. **功能测试** ✅ API调用
6. **配置部署** 📋 [部署指南](./docs/SETUP.md)

## 贡献指南

欢迎提交PR和Issue！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！
