# Learnify Cloudflare 部署指南

本目录包含 Learnify 项目在 Cloudflare Containers 上的部署配置和脚本。

## 📋 前置要求

在开始部署之前，请确保：

1. **安装必要工具**

   - Docker
   - Node.js 和 npm
   - Wrangler CLI (`npm install -g wrangler`)

2. **配置环境变量**
   在项目根目录创建 `.env` 文件，包含以下变量：
   ```bash
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
   CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
   ```

## 🚀 部署流程

### Beta 环境部署

使用提供的脚本自动部署到 Beta 环境：

```bash
# 确保在项目根目录
cd /path/to/learnify

# 运行部署脚本
./.cloudflare/deploy-beta.sh
```

### 部署步骤说明

脚本会自动执行以下步骤：

1. **环境检查** - 验证 `.env` 文件是否存在
2. **镜像拉取** - 从 GitHub Container Registry 拉取最新的 beta 镜像
3. **镜像标记** - 为镜像添加 Cloudflare 仓库标签
4. **镜像推送** - 将镜像推送到 Cloudflare 容器仓库
5. **服务部署** - 部署到 Cloudflare Containers

## 🌐 访问地址

部署完成后，可以通过以下地址访问：

- **Beta 环境**: https://learnify-beta.xsun.workers.dev

## 📁 文件结构

```
.cloudflare/
├── README.md          # 本文件
├── deploy-beta.sh     # Beta 环境部署脚本
└── ...               # 其他配置文件
```

## 🔧 故障排除

### 常见问题

1. **`.env` 文件不存在**

   - 确保在项目根目录创建 `.env` 文件
   - 填写正确的 Cloudflare API Token 和 Account ID

2. **Docker 权限问题**

   - 确保 Docker 服务正在运行
   - 检查 Docker 权限设置

3. **Wrangler 认证问题**
   - 运行 `wrangler login` 进行身份验证
   - 检查 API Token 权限

## 📞 支持

如果遇到部署问题，请检查：

1. Cloudflare API Token 权限
2. Docker 镜像是否存在
3. 网络连接状态
4. Wrangler CLI 配置
