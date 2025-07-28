# Cloud Run 部署和 IAM 管理指南

## 概述

Cloud Run 部署流程已拆分为两个部分：

1. **自动部署**: 通过 GitHub Actions 自动构建和部署应用
2. **手动 IAM 管理**: 通过本地脚本手动管理公共访问权限

## 自动部署流程

### 触发条件

- 推送到 `canary` 分支 → 自动部署到 canary 环境
- 推送到 `dev` 分支 → 自动部署到 beta 环境

### 部署步骤

GitHub Actions 会自动执行以下步骤：

1. 构建 Docker 镜像
2. 推送镜像到 Artifact Registry
3. 部署到 Cloud Run（不设置公共访问权限）

### 环境配置

| Flavor | 区域                 | 存储桶                         | 服务名          |
| ------ | -------------------- | ------------------------------ | --------------- |
| canary | asia-east2           | learnify_canary_storage/config | learnify-canary |
| beta   | australia-southeast2 | learnify_beta_storage/config   | learnify-beta   |

## 手动 IAM 管理

使用 `scripts/manage-cloud-run-iam.sh` 脚本管理 Cloud Run 服务的公共访问权限。

### 前置条件

```bash
# 确保已安装并认证 gcloud CLI
gcloud auth login
gcloud config set project learnify-463605
```

### 使用方法

#### 设置公共访问权限

```bash
./scripts/manage-cloud-run-iam.sh beta set
./scripts/manage-cloud-run-iam.sh canary set
```

#### 移除公共访问权限

```bash
./scripts/manage-cloud-run-iam.sh beta remove
./scripts/manage-cloud-run-iam.sh canary remove
```

#### 检查当前 IAM 策略

```bash
./scripts/manage-cloud-run-iam.sh beta check
./scripts/manage-cloud-run-iam.sh canary check
```

### 脚本功能

- 验证服务存在性
- 安全确认操作
- 自动检测区域配置
- 显示服务 URL
- 错误处理和状态反馈

## 典型部署流程

1. **开发阶段**: 推送代码到 `dev` 分支

   ```bash
   git push origin dev
   ```

2. **等待自动部署**: GitHub Actions 完成构建和部署

3. **设置公共访问权限** (如需要):

   ```bash
   ./scripts/manage-cloud-run-iam.sh beta set
   ```

4. **测试部署**: 访问服务 URL 进行测试

5. **生产发布**: 推送到 `canary` 分支并重复流程
   ```bash
   git push origin canary
   ./scripts/manage-cloud-run-iam.sh canary set
   ```

## 故障排除

### 常见问题

1. **IAM 权限不足**
   - 确保你的 gcloud 账户有足够权限
   - 联系管理员添加必要的 IAM 角色

2. **服务不存在**
   - 检查 GitHub Actions 部署是否成功
   - 确认服务名和区域配置正确

3. **认证失败**
   ```bash
   gcloud auth login
   gcloud auth list
   ```

### 日志查看

```bash
# 查看 Cloud Run 服务日志
gcloud logs read --service=learnify-beta --region=australia-southeast2

# 查看 GitHub Actions 日志
# 在 GitHub 仓库的 Actions 标签页查看
```

## 安全注意事项

- IAM 策略修改需要谨慎操作
- 生产环境建议限制公共访问
- 定期审查和清理不必要的权限
- 使用最小权限原则

## 服务 URL

- **Beta**: https://learnify-beta-[hash]-[region].a.run.app
- **Canary**: https://learnify-canary-[hash]-[region].a.run.app

具体 URL 可通过脚本或 gcloud 命令获取：

```bash
gcloud run services describe learnify-beta --region=australia-southeast2 --format="value(status.url)"
```
