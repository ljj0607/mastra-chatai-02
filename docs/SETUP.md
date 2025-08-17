# 部署和配置指南

## 先决条件

1. **Node.js 18+** - [https://nodejs.org/](https://nodejs.org/)
2. **Cloudflare 账户** - [https://cloudflare.com/](https://cloudflare.com/)
3. **API Keys**:
   - OpenAI API Key
   - Anthropic API Key  
   - OpenWeatherMap API Key

## 1. 克隆和安装

```bash
# 克隆项目
git clone https://github.com/ljj0607/mastra-chatai-02.git
cd mastra-chatai-02

# 安装依赖
npm install

# 安装 Wrangler CLI
npm install -g wrangler
```

## 2. Cloudflare 配置

### 2.1 登录 Cloudflare

```bash
wrangler auth login
```

### 2.2 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create chatai-db

# 记录返回的 database_id
# 更新 wrangler.toml 中的 database_id
```

更新 `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "chatai-db"
database_id = "your-actual-database-id"  # 更换为实际 ID
```

### 2.3 创建 Vectorize 索引

```bash
# 创建向量索引
wrangler vectorize create chatai-vectors --dimensions=768 --metric=cosine

# 记录返回的索引信息
```

### 2.4 设置环境变量

```bash
# 设置 API Keys
wrangler secret put OPENAI_API_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put WEATHER_API_KEY

# 可选：设置 Cloudflare AI 相关
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put CLOUDFLARE_API_TOKEN
```

## 3. 数据库迁移

```bash
# 生成迁移文件
npm run db:generate

# 本地测试迁移
wrangler d1 migrations apply --local chatai-db

# 生产环境迁移
wrangler d1 migrations apply chatai-db
```

## 4. 本地开发

```bash
# 启动开发服务器
npm run dev

# 服务将在 http://localhost:8787 启动
# GraphQL Playground: http://localhost:8787/graphql
```

## 5. 测试

```bash
# 运行测试
npm test

# 测试 API 端点
curl http://localhost:8787/health
```

## 6. 部署到生产环境

```bash
# 执行部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 或手动部署
npm run deploy
```

## 7. 验证部署

```bash
# 检查健康状态
curl https://your-worker.your-subdomain.workers.dev/health

# 测试 GraphQL
curl -X POST https://your-worker.your-subdomain.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}'
```

## 环境变量说明

| 变量名 | 描述 | 是否必需 |
|--------|------|----------|
| `OPENAI_API_KEY` | OpenAI API 密钥 | 是 |
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 | 是 |
| `WEATHER_API_KEY` | OpenWeatherMap API 密钥 | 是 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID | 可选 |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 令牌 | 可选 |

## 获取 API Keys

### OpenAI API Key
1. 访问 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. 登录你的 OpenAI 账户
3. 创建新的 API Key
4. 复制并保存密钥

### Anthropic API Key
1. 访问 [https://console.anthropic.com/](https://console.anthropic.com/)
2. 登录你的 Anthropic 账户
3. 在 API Keys 部分创建新密钥
4. 复制并保存密钥

### OpenWeatherMap API Key
1. 访问 [https://openweathermap.org/api](https://openweathermap.org/api)
2. 注册免费账户
3. 在 API Keys 部分生成密钥
4. 复制并保存密钥

## 故障排除

### 常见问题

1. **Wrangler 认证失败**
   ```bash
   wrangler auth logout
   wrangler auth login
   ```

2. **数据库连接错误**
   - 检查 `wrangler.toml` 中的 `database_id`
   - 确认数据库已正确创建
   ```bash
   wrangler d1 list
   ```

3. **向量索引错误**
   ```bash
   wrangler vectorize list
   ```

4. **环境变量未设置**
   ```bash
   wrangler secret list
   ```

5. **部署失败**
   - 检查 TypeScript 编译错误
   - 确认所有依赖已正确安装
   ```bash
   npm run build
   ```

### 调试技巧

1. **查看实时日志**
   ```bash
   wrangler tail
   ```

2. **本地数据库调试**
   ```bash
   npm run db:studio
   ```

3. **检查 Worker 状态**
   ```bash
   wrangler status
   ```

## 生产环境优化

### 1. 性能优化
- 启用 Cloudflare 缓存
- 配置 HTTP 缓存头
- 使用 Cloudflare Analytics

### 2. 安全配置
- 配置 CORS 策略
- 添加 API 限流
- 设置访问控制

### 3. 监控和日志
- 启用 Cloudflare Logpush
- 配置错误监控
- 设置性能警报

## CI/CD 配置

### GitHub Actions

在 GitHub 仓库设置中添加以下 Secrets：

```
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
WEATHER_API_KEY=your_weather_key
```

### 自动部署

推送到 `main` 分支会自动触发部署：

```bash
git add .
git commit -m "Update: your changes"
git push origin main
```

## 扩展和定制

### 添加新的 AI 模型

1. 在 `src/services/chat.ts` 中添加新的模型支持
2. 更新环境变量配置
3. 添加相应的测试

### 自定义 GraphQL Schema

1. 修改 `src/graphql/schema.ts`
2. 更新 `src/graphql/resolvers.ts`
3. 运行测试确保兼容性

### 数据库架构更改

1. 修改 `src/db/schema.ts`
2. 生成新的迁移文件：`npm run db:generate`
3. 应用迁移：`wrangler d1 migrations apply chatai-db`

## 支持和帮助

- 📚 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- 🗃️ [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- 🔍 [Cloudflare Vectorize 文档](https://developers.cloudflare.com/vectorize/)
- 💬 [项目 Issues](https://github.com/ljj0607/mastra-chatai-02/issues)

如果遇到问题，请在 GitHub Issues 中提交详细的错误信息和复现步骤。