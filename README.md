# Mastra ChatAI - 后端服务

基于 OpenAI GPT、RAG 技术的智能聊天工具后端服务，运行在 Cloudflare Workers 上。

> 🚀 **快速开始**: 查看 [QUICKSTART.md](./QUICKSTART.md) 一键启动项目！

## 🎉 已简化架构 - 只需OpenAI API Key！

**移除了付费的Anthropic依赖**，现在只需要：
- ✅ **OpenAI API Key** (必需) - 用于所有AI功能
- ✅ **天气API Key** (可选) - 用于天气查询
- ✅ **无需Anthropic** - 节省成本！

## 快速解决依赖问题

如果你刚才遇到了依赖错误，现在已经修复：

```bash
# 1. 重新安装依赖（已移除问题包）
rm -rf node_modules package-lock.json
npm install

# 2. 启动项目
npm run dev
```

## 功能特性

- 🤖 **OpenAI GPT集成**: 使用GPT-3.5/GPT-4进行智能对话
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
- **AI模型**: OpenAI GPT (移除了Anthropic)
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

### 配置真实API Keys

编辑 `.env` 文件：

```bash
cp .env.example .env
# 编辑 .env 文件
```

```env
# 只需要这一个就能使用所有AI功能！
OPENAI_API_KEY=sk-你的openai密钥

# 可选：天气功能
WEATHER_API_KEY=你的天气api密钥
```

## API Keys 获取指南

### 1. OpenAI API Key（必需）

**获取步骤：**
1. 访问 [OpenAI Platform](https://platform.openai.com)
2. 注册/登录账户
3. 点击 "View API keys"
4. 创建新密钥
5. 复制 sk- 开头的密钥

**费用：**
- 新用户通常有 $5 免费额度
- GPT-3.5-turbo: ~$0.002/1K tokens（很便宜！）

### 2. 天气API Key（可选）

**获取步骤：**
1. 访问 [OpenWeatherMap](https://openweathermap.org/api)
2. 注册免费账户
3. 获取API key

**费用：**
- 完全免费！每天1000次调用

## API 接口测试

### 浏览器测试
访问 http://localhost:8787 点击测试按钮

### 命令行测试

```bash
# 健康检查
curl http://localhost:8787/health

# 天气查询
curl http://localhost:8787/api/weather/北京

# GraphQL查询
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}'
```

## 功能演示

### 1. AI对话
```
用户: 你好！
助手: [OpenAI GPT智能回复]
```

### 2. 天气查询
```
用户: 北京的天气怎么样？
助手: 北京当前天气：晴天，温度25°C，湿度60%，风速3m/s
```

### 3. 知识问答
```
用户: 什么是人工智能？
助手: [基于RAG检索 + OpenAI GPT生成的详细回答]
```

## 项目结构

```
src/
├── services/          # 业务逻辑层
│   ├── chat.ts       # AI对话服务（只使用OpenAI）
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

## 部署到生产环境

```bash
# 1. 配置Cloudflare
wrangler auth login

# 2. 创建D1数据库
wrangler d1 create chatai-db

# 3. 设置生产环境密钥
wrangler secret put OPENAI_API_KEY
wrangler secret put WEATHER_API_KEY

# 4. 部署
npm run deploy
```

## 故障排除

### 常见问题

**Q: 依赖安装失败？**
```bash
# 删除重装
rm -rf node_modules package-lock.json
npm install
```

**Q: OpenAI API调用失败？**
- 检查API Key是否正确
- 确认账户有余额
- 查看控制台错误信息

**Q: 没有API Key能用吗？**
- 可以！应用会使用模拟数据
- 所有功能都能正常演示

### 获取帮助

- 📚 [详细文档](./docs/)
- 🐛 [问题反馈](https://github.com/ljj0607/mastra-chatai-02/issues)
- 💬 [讨论区](https://github.com/ljj0607/mastra-chatai-02/discussions)

## 成本对比

**简化前：**
- OpenAI API: $5/月起
- Anthropic API: $20/月起
- **总计**: $25/月起

**简化后：**
- OpenAI API: $5/月起
- 天气API: 免费
- **总计**: $5/月起 🎉

## 开发路线图

- [x] 移除Anthropic依赖
- [x] 简化配置流程
- [x] 完善错误处理
- [ ] 支持更多AI模型
- [ ] 添加流式响应
- [ ] 支持文件上传

## 贡献指南

欢迎提交PR和Issue！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

MIT License

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！

💡 **提示**: 现在只需要一个OpenAI API Key就能体验完整功能了！
