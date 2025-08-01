#!/bin/bash
# This is a script used by the devcontainer to build the project

# 确保在正确的工作目录
cd /workspaces/learnify

# 修复 node_modules 目录权限（如果存在的话）
if [ -d "node_modules" ]; then
    echo "正在修复 node_modules 权限..."
    sudo chown -R vscode:vscode node_modules
fi

# 清理可能存在的 yarn 缓存，确保干净的安装
echo "正在清理 yarn 缓存..."
yarn cache clean

# 清理 node_modules 内容而不删除目录本身（因为它是 volume 挂载点）
echo "正在清理 node_modules 内容..."
if [ -d "node_modules" ] && [ "$(ls -A node_modules 2>/dev/null)" ]; then
    sudo rm -rf node_modules/* node_modules/.* 2>/dev/null || true
fi

# 重新安装依赖
echo "正在重新安装依赖..."
yarn install

# 确保新安装的 node_modules 权限正确
echo "正在设置 node_modules 权限..."
sudo chown -R vscode:vscode node_modules

# Build Server Dependencies
echo "正在构建服务器依赖..."
yarn affine @affine/server-native build
yarn affine @affine/reader build

echo "构建完成！"

# Note: Database migration is now manual - run 'yarn affine @affine/server prisma migrate reset -f' when needed
