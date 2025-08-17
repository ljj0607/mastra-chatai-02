#!/bin/bash

set -e

echo "🎆 初始化 Mastra ChatAI 开发环境..."

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js (https://nodejs.org/)"
    exit 1
fi

# 检查是否安装了 Wrangler
if ! command -v wrangler &> /dev/null; then
    echo "📦 安装 Wrangler CLI..."
    npm install -g wrangler
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "📄 创建环境变量文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件并填入你的 API Keys"
fi

# 创建 D1 数据库
echo "💾 创建 D1 数据库..."
wrangler d1 create chatai-db

echo "🌐 创建 Vectorize 索引..."
wrangler vectorize create chatai-vectors --dimensions=768 --metric=cosine

echo "🔄 生成数据库迁移..."
npm run db:generate

echo "✅ 开发环境设置完成！"
echo "🚀 现在你可以运行: npm run dev"