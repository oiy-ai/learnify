#!/bin/bash
set -e

echo "🚀 开始部署 Learnify Beta 环境到 Cloudflare Containers..."

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "❌ .env 文件不存在，请先创建并填写 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID"
    exit 1
fi

# 加载环境变量
source .env

echo "📦 拉取最新的 beta 镜像..."
docker pull ghcr.io/a1exsun/learnify-graphql:beta

echo "🏷️  为镜像添加 Cloudflare 仓库标签..."
docker rmi learnify-graphql:beta
docker tag ghcr.io/a1exsun/learnify-graphql:beta learnify-graphql:beta

echo "⬆️  推送镜像到 Cloudflare 仓库..."
npx wrangler containers push learnify-graphql:beta

echo "🚀 部署到 Cloudflare Containers..."
npm run deploy

echo "✅ Beta 环境部署完成！"
echo "🌐 访问地址: https://learnify-beta.xsun.workers.dev" 