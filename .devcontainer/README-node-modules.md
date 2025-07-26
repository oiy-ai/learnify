# Node Modules Volume 配置说明

## 更改内容

为了解除容器内外 node_modules 文件夹的关联，我们进行了以下配置更改：

### 1. Docker Compose 配置 (`docker-compose.yml`)

- 添加了独立的 `node_modules_data` volume
- 将该 volume 挂载到容器内的 `/workspaces/learnify/node_modules` 路径
- 这样容器内的 node_modules 将完全独立于宿主机

### 2. 构建脚本更新 (`build.sh`)

- 每次重建时会清理 yarn 缓存
- 删除现有的 node_modules 并重新安装
- 确保每次都是干净的依赖安装

## 好处

1. **隔离性**: 容器内的 node_modules 不会影响宿主机的文件系统
2. **性能**: 避免了文件系统权限和性能问题
3. **一致性**: 每次重建都会获得完全干净的依赖环境
4. **持久性**: node_modules 数据存储在 Docker volume 中，重建容器时会保持（除非主动清理）

## 使用方法

### 重建容器

```bash
# 重建 devcontainer
# VS Code: Command Palette -> "Dev Containers: Rebuild Container"
# 或者在终端中：
docker-compose -f .devcontainer/docker-compose.yml down
docker-compose -f .devcontainer/docker-compose.yml up -d
```

### 完全清理 node_modules

如果你想要完全清理 node_modules volume：

```bash
docker-compose -f .devcontainer/docker-compose.yml down
docker volume rm learnify_node_modules_data
docker-compose -f .devcontainer/docker-compose.yml up -d
```

## 注意事项

- 宿主机的 node_modules 文件夹现在与容器内完全分离
- 如果你需要在宿主机上运行 Node.js 命令，需要在宿主机上单独安装依赖
- 容器内的依赖安装和更新不会影响宿主机文件系统
