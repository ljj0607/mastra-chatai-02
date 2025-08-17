# 快速开始指南

## 🚀 一键启动

```bash
# 1. 克隆项目
git clone https://github.com/ljj0607/mastra-chatai-02.git
cd mastra-chatai-02

# 2. 安装依赖
npm install

# 3. 创建环境配置
cp .env.example .env

# 4. 本地开发（无需配置真实API Key）
npm run dev
```

访问 http://localhost:8787 即可看到运行中的应用！

## 📝 环境变量配置

编辑 `.env` 文件：

```env
# 这些是可选的，应用会使用模拟数据
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
WEATHER_API_KEY=your_weather_api_key_here
```

**注意：** 即使不配置真实的API Key，应用也能正常运行，会使用模拟数据。

## 🔧 可用命令

```bash
# 开发
npm run dev          # 启动开发服务器

# 构建
npm run build        # TypeScript编译

# 测试
npm test            # 运行测试

# 数据库（需要Cloudflare配置）
npm run db:generate  # 生成数据库迁移
npm run db:migrate   # 应用数据库迁移
npm run db:studio    # 数据库管理界面

# 部署（需要Cloudflare配置）
npm run deploy       # 部署到Cloudflare Workers
```

## 🛠️ 核心功能演示

### 1. 普通对话
```
用户: 你好
助手: 你好！我是你的AI助手，有什么可以帮助您的吗？
```

### 2. 天气查询
```
用户: 北京的天气怎么样？
助手: 北京当前天气：晴天，温度25°C，湿度60%，风速3m/s
```

### 3. 知识问答
```
用户: 什么是人工智能？
助手: 人工智能是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统...
```

## 📚 API 端点

### GraphQL
- **端点**: `POST /graphql`
- **Playground**: http://localhost:8787/graphql

### REST API
- **健康检查**: `GET /health`
- **天气查询**: `GET /api/weather/:city`

## 🔗 相关链接

- [完整文档](./README.md)
- [API文档](./docs/API.md)
- [部署指南](./docs/SETUP.md)
- [功能特性](./docs/FEATURES.md)

## ❓ 常见问题

**Q: 启动时报错 "vector-db not found"？**
A: 已修复，重新 `npm install` 即可。

**Q: 没有API Key能用吗？**  
A: 可以！应用会使用模拟数据，所有功能都能正常演示。

**Q: 如何连接真实的AI服务？**
A: 在 `.env` 文件中配置真实的API Key即可。

**Q: 部署到生产环境？**
A: 参考 [部署指南](./docs/SETUP.md) 配置Cloudflare Workers。

## 🎯 下一步

1. **体验功能**: 先在本地运行，测试各种功能
2. **配置API**: 获取真实API Key替换模拟数据  
3. **部署上线**: 按照部署指南发布到生产环境
4. **自定义开发**: 基于现有代码添加新功能

---

🎉 **开始你的AI聊天应用之旅吧！**
