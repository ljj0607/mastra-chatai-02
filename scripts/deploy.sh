#!/bin/bash

set -e

echo "🚀 开始部署 Mastra ChatAI 后端服务..."

# 检查环境
if [ ! -f "wrangler.toml" ]; then
    echo "❌ 未找到 wrangler.toml 文件"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 构建项目
echo "🔨 构建项目..."
npm run build

# 运行测试
echo "🧪 运行测试..."
npm test

# 生成数据库迁移
echo "💾 生成数据库迁移..."
npm run db:generate

# 部署到 Cloudflare Workers
echo "☁️ 部署到 Cloudflare Workers..."
wrangler deploy

# 执行数据库迁移
echo "🔄 执行数据库迁移..."
wrangler d1 migrations apply --local chatai-db
wrangler d1 migrations apply chatai-db

echo "✅ 部署完成！"
echo "🌐 你的应用已部署在: https://$(wrangler whoami | grep 'subdomain' | awk '{print $2}').workers.dev"