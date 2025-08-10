# PDF文件上传与存储工作流程文档

## 概述

本文档详细说明了在Learnify AI Chat功能中，PDF文件从上传到被AI访问的完整技术流程。该功能允许用户上传PDF文件，系统会自动进行向量化处理，使AI能够通过语义搜索理解和分析文件内容。

## 系统架构

### 核心组件

1. **前端组件**
   - `ai-chat-panel`: AI聊天主面板
   - `ai-chat-composer`: 聊天输入组件
   - `ChatPanelAddPopover`: 文件上传弹窗

2. **后端服务**
   - `CopilotContextService`: 上下文管理服务
   - `CopilotEmbeddingJob`: 嵌入处理任务
   - `CopilotStorage`: 文件存储服务
   - `ProductionEmbeddingClient`: 嵌入客户端

3. **AI提供商**
   - Gemini: 用于文本嵌入（`gemini-embedding-001`）
   - OpenAI: 用于结果重排序
   - Anthropic: 用于对话生成（`claude-sonnet-4-20250514`）

## 详细工作流程

### 1. 文件上传阶段

#### 1.1 用户界面操作

```javascript
// add-popover.ts
private readonly _addFileChip = async () => {
  const files = await openFilesWith();
  // 文件大小限制：50MB
  if (file.size > 50 * 1024 * 1024) {
    toast(`${file.name} is too large`);
    return;
  }
  await this.addChip({
    file,
    state: 'processing',
  });
}
```

#### 1.2 前端API调用

```javascript
// ai-chat-composer.ts
const contextFile = await AIProvider.context.addContextFile(chip.file, {
  contextId, // 上下文ID
});
```

#### 1.3 GraphQL请求

```graphql
mutation addContextFile($content: Upload!, $options: AddContextFileInput!) {
  addContextFile(content: $content, options: $options) {
    id
    status
    error
  }
}
```

### 2. 文件存储阶段

#### 2.1 存储位置

文件存储在服务器文件系统中，路径结构：

```
~/.affine/storage/copilot/
└── b1609751-a5ad-45b4-b2ef-93c7c6967533/  # 用户ID
    └── 38b88aa8-3407-456c-9c7c-608c57c287ec/  # 工作空间ID
        └── JHpoasOwgmAq3d-uKVuVwlehCEkpVLwb5z_GxbALZCo  # Blob ID
```

#### 2.2 数据库记录

在PostgreSQL数据库中创建记录：

- `ai_context_file`: 存储文件元数据
- `ai_context_file_chunk`: 存储文件片段和向量

### 3. 嵌入处理阶段

#### 3.1 异步任务触发

```typescript
// context/resolver.ts
JobQueue.add('copilot.embedding.files', {
  contextId,
  fileId,
  blobId,
});
```

#### 3.2 文本提取与分块

- PDF文件被解析为文本内容
- 文本被分割成多个片段（chunks）
- 每个片段大约包含500-1000个字符

#### 3.3 向量生成

```typescript
// embedding/client.ts
const embeddings = await provider.embedding(
  { inputTypes: [ModelInputType.Text] },
  input,
  { dimensions: 768 } // Gemini嵌入维度
);
```

#### 3.4 嵌入状态更新

```typescript
// 状态流转
'processing' → 'finished' (成功)
'processing' → 'failed' (失败)
```

### 4. AI访问阶段

#### 4.1 语义搜索调用

当AI需要访问文件内容时，使用语义搜索工具：

```typescript
// tools/doc-semantic-search.ts
const searchDocs = async (query: string) => {
  // 并行执行两种搜索
  const [chunks, contextChunks] = await Promise.all([
    context.matchWorkspaceAll(workspace, query, 10), // 工作空间文档
    docContext?.matchFiles(query, 10) ?? [], // 上下文文件
  ]);
  return [...fileChunks, ...docChunks];
};
```

#### 4.2 向量匹配过程

1. **查询向量化**：将用户查询转换为768维向量
2. **余弦相似度计算**：与存储的文档向量进行比较
3. **阈值过滤**：默认阈值0.5，作用域阈值0.85
4. **结果聚合**：合并文件和文档搜索结果

#### 4.3 结果重排序（ReRank）

```typescript
// embedding/client.ts
const ranks = await provider.rerank(embeddings.map(e => prompt.finish({ query, doc: e.content })));
// 过滤置信度 > 0.5 的结果
const highConfidenceChunks = ranks.filter(r => r.score > 0.5).slice(0, topK); // 默认返回前10个
```

### 5. 内容返回阶段

#### 5.1 数据结构

返回给AI的数据格式：

```typescript
type FileChunkSimilarity = {
  fileId: string; // 文件唯一标识
  blobId: string; // 存储blob ID
  name: string; // 文件名："Week 1 - Studio Activity Sheet.pdf"
  mimeType: string; // MIME类型："application/pdf"
  chunk: number; // 片段编号：0, 1, 2...
  content: string; // 实际文本内容
  distance: number; // 相似度距离（越小越相似）
};
```

#### 5.2 AI处理

AI接收到文件片段后，可以：

- 理解文件内容
- 回答相关问题
- 生成摘要
- 执行其他分析任务

## 配置要求

### 1. 环境变量配置

在 `/packages/backend/server/config.json` 中配置：

```json
{
  "copilot": {
    "enabled": true,
    "providers.gemini": {
      "apiKey": "YOUR_GEMINI_API_KEY"
    },
    "providers.openai": {
      "apiKey": "YOUR_OPENAI_API_KEY"
    },
    "providers.anthropic": {
      "apiKey": "YOUR_ANTHROPIC_API_KEY"
    },
    "storage": {
      "provider": "fs",
      "bucket": "copilot",
      "config": {
        "path": "~/.affine/storage"
      }
    }
  }
}
```

### 2. 会话配置

确保会话重用机制正常工作：

```typescript
// chat-panel/index.ts
const sessionId = await AIProvider.session?.createSession({
  docId: this.doc.id,
  workspaceId: this.doc.workspace.id,
  promptName: 'Chat With AFFiNE AI',
  reuseLatestChat: true, // 重要：必须为true
});
```

## 常见问题与解决

### 问题1：AI找不到上传的文件

**原因**：每次创建新会话，文件绑定在旧会话中
**解决**：确保 `reuseLatestChat: true`

### 问题2：嵌入处理失败

**原因**：未配置Gemini API密钥
**解决**：在config.json中配置有效的API密钥

### 问题3：文件大小限制

**原因**：系统限制单个文件50MB
**解决**：压缩文件或分割成多个较小的文件

### 问题4：搜索结果不准确

**原因**：嵌入模型理解偏差
**解决**：使用更具体的搜索关键词

## 性能优化建议

1. **缓存策略**
   - 嵌入结果缓存15分钟
   - 避免重复计算相同查询

2. **并行处理**
   - 文件和文档搜索并行执行
   - 多个嵌入请求批量处理

3. **分块优化**
   - 合理设置chunk大小
   - 避免过小或过大的片段

## 监控与日志

关键日志点：

- 文件上传：`[AI_CHAT_INPUT] addFileChip`
- 嵌入开始：`Job started: [copilot.embedding.files]`
- 嵌入完成：`workspace.file.embed.finished`
- 搜索执行：`Using provider gemini for embedding`
- 重排序：`ReRank completed: N high-confidence results found`

## 未来改进方向

1. **支持更多文件格式**
   - Word文档（.docx）
   - Excel表格（.xlsx）
   - Markdown文件（.md）

2. **增强搜索能力**
   - 支持混合搜索（关键词+语义）
   - 自定义相似度阈值

3. **优化用户体验**
   - 实时显示嵌入进度
   - 文件预览功能
   - 批量文件上传

## 总结

PDF上传功能通过向量化技术实现了AI对文档内容的理解能力。整个流程包括文件上传、存储、嵌入处理、语义搜索和内容返回五个主要阶段。系统使用Gemini进行文本嵌入，OpenAI进行结果重排序，Anthropic生成对话响应，实现了高质量的文档理解和分析能力。

---

_文档版本：1.0_  
_更新日期：2025-08-10_  
_作者：Learnify开发团队_
