#!/bin/bash

# 数据库初始化脚本
# 基于 .github/actions/server-test-env/action.yml 的 "Run init-db script" 步骤

set -e  # 如果任何命令失败，脚本将退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始初始化数据库...${NC}"

# 设置数据库连接字符串
export DATABASE_URL="postgresql://learnify_canary:<h(5;0~}2f\`OA][D@localhost:5433/canary"
export NODE_ENV="test"

echo -e "${YELLOW}数据库连接信息:${NC}"
echo "主机: localhost:5433"
echo "数据库: canary"
echo "用户: learnify_canary"
echo ""

# 检查 yarn 是否可用
if ! command -v yarn &> /dev/null; then
    echo -e "${RED}错误: yarn 命令未找到。请确保已安装 yarn。${NC}"
    exit 1
fi

# 检查是否在正确的项目目录
if [ ! -f "package.json" ] || [ ! -d "packages/backend/server" ]; then
    echo -e "${RED}错误: 请在项目根目录执行此脚本。${NC}"
    exit 1
fi

echo -e "${YELLOW}步骤 1: 生成 Prisma 客户端...${NC}"
yarn affine @affine/server prisma generate

echo -e "${YELLOW}步骤 2: 部署数据库迁移...${NC}"
yarn affine @affine/server prisma migrate deploy

echo -e "${YELLOW}步骤 3: 运行数据迁移...${NC}"
yarn affine @affine/server data-migration run

echo -e "${GREEN}数据库初始化完成！${NC}"
echo ""
echo -e "${GREEN}您现在可以使用以下连接字符串连接到数据库:${NC}"
echo -e "${YELLOW}postgresql://learnify_canary:<password>@localhost:5433/canary${NC}" 