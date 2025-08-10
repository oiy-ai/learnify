# 思维导图功能实现文档

## 概述

Learnify 的思维导图功能通过分层架构实现，支持从用户素材自动生成知识图谱，并预留了 AI 集成接口。该功能基于 BlockSuite 的 edgeless 模式构建。

## 核心实现架构

### 1. mindmap-creator.ts - 底层创建工具

位置：`/packages/frontend/core/src/utils/mindmap-creator.ts`

**主要功能：**

- 提供通用的 `createMindmap()` 函数，可在 BlockSuite edgeless 文档中创建思维导图
- 支持树形结构定义（MindmapNode 接口）
- 处理两种不同的 API 调用格式以确保兼容性
- 创建后自动触发布局计算（buildTree、requestLayout）

**核心接口：**

```typescript
interface MindmapNode {
  text: string;
  children?: MindmapNode[];
}

interface CreateMindmapOptions {
  tree: MindmapNode; // 思维导图树形结构
  style?: number; // 样式（1-4）
  layoutType?: number; // 布局类型：0=右侧，1=左侧，2=平衡
  xywh?: string; // 位置和尺寸 [x, y, width, height]
}
```

### 2. ai-mindmap-compose.ts - AI 集成层

位置：`/packages/frontend/core/src/utils/ai-mindmap-compose.ts`

**主要功能：**

- 封装了从 AI 响应创建思维导图的完整流程
- 自动创建 edgeless 文档
- 解析 AI 响应（支持 JSON 或纯文本）
- 设置文档标题和元数据
- 提供 AI prompt 模板

**核心函数：**

- `composeAIMindmap()` - 从 AI 响应创建思维导图文档
- `generateAndCreateMindmap()` - 调用 AI 并创建思维导图的完整流程

### 3. material-creation/index.tsx - UI 交互层

位置：`/packages/frontend/core/src/desktop/dialogs/material-creation/index.tsx`

**主要功能：**

- 提供素材创建对话框界面
- 根据用户上传的素材生成思维导图结构
- 智能分类素材（图片、PDF、链接）
- 生成包含学习目标、进度跟踪的完整知识图谱

**生成的思维导图结构包含：**

- 📚 核心概念 - 主要知识点和关键术语
- 📁 资料分类 - 按类型组织的素材
- 🎯 学习目标 - 短期和长期目标
- 📊 学习进度 - 进度跟踪

## 关键技术特性

### 1. 自动布局

- 创建后 100-200ms 延迟触发布局计算
- 调用 `buildTree()` 构建树形结构
- 执行 `requestLayout()` 或 `layout()` 进行布局

### 2. 错误容错

- 静默处理布局错误，确保不影响用户体验
- 支持两种 BlockSuite API 格式
- 创建失败时提供友好的回退方案

### 3. 集合管理

- 自动添加到 MIND_MAPS 集合便于统一管理
- 设置文档标题便于识别
- 支持导航到新创建的思维导图

### 4. AI 接口预留

- 已定义 AI prompt 格式
- 支持 JSON 和纯文本响应解析
- Mock 数据生成器可轻松替换为真实 AI 调用

## 数据流程

```
用户上传素材
    ↓
生成树形结构（Mock/AI）
    ↓
创建 edgeless 文档
    ↓
插入思维导图元素
    ↓
触发自动布局
    ↓
添加到集合
    ↓
导航到新文档
```

## 使用示例

### 基础使用

```typescript
const mindmapId = await createMindmap(blockSuiteDoc, {
  tree: {
    text: '主题',
    children: [
      { text: '分支1', children: [] },
      { text: '分支2', children: [] },
    ],
  },
  style: 1,
  layoutType: 0,
});
```

### AI 集成使用

```typescript
const docId = await composeAIMindmap(docsService, aiGeneratedMindmapStructure);
```

## 未来优化方向

1. **真实 AI 集成** - 接入 GPT/Claude API 自动分析素材内容
2. **实时协作** - 支持多人同时编辑思维导图
3. **导出功能** - 支持导出为图片、PDF、Markdown 等格式
4. **模板系统** - 提供预设的思维导图模板
5. **智能推荐** - 根据内容自动推荐相关节点

## 相关文件

- `/packages/frontend/core/src/utils/mindmap-creator.ts` - 核心创建工具
- `/packages/frontend/core/src/utils/ai-mindmap-compose.ts` - AI 集成
- `/packages/frontend/core/src/desktop/dialogs/material-creation/index.tsx` - UI 界面
- `/packages/frontend/core/src/constants/learnify-collections.ts` - 集合定义
