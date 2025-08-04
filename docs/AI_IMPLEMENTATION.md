# Learnify AI 功能实现分析

## 概述

Learnify 项目中的 AI 功能通过基于 AI SDK 的工具系统实现。系统能够根据用户输入智能决定使用 RAG（检索增强生成）或自主调用工具创建文档。

## 核心架构

### 1. 工具系统

项目在 `/packages/backend/server/src/plugins/copilot/tools/` 目录下定义了多种工具：

#### 主要工具列表

- **doc_edit** - 编辑已有文档内容
  - 位置：`/packages/backend/server/src/plugins/copilot/tools/doc-edit.ts`
  - 功能：对结构化 Markdown 文档进行块级编辑（替换、删除、插入）
- **doc_compose** - 创建新文档
  - 位置：`/packages/backend/server/src/plugins/copilot/tools/doc-compose.ts`
  - 功能：根据用户描述生成完整的 Markdown 文档

- **doc_read** - 读取文档内容
  - 功能：获取指定文档的 Markdown 内容

- **doc_semantic_search** - 语义搜索
  - 功能：基于向量相似度搜索相关文档

- **doc_keyword_search** - 关键词搜索
  - 功能：基于关键词匹配搜索文档

- **web_search_exa** - 网络搜索
  - 功能：搜索互联网内容

- **conversation_summary** - 对话总结
  - 功能：生成对话摘要

- **code_artifact** - 代码处理
  - 功能：处理代码片段和技术内容

### 2. AI 提供者系统

#### 提供者工厂模式

```typescript
// /packages/backend/server/src/plugins/copilot/providers/factory.ts
export class CopilotProviderFactory {
  // 根据模型ID获取对应的提供者
  async getProviderByModel(modelId: string): Promise<CopilotProvider | null>;

  // 注册和管理不同的AI提供者
  register(provider: CopilotProvider);
}
```

#### 支持的 AI 提供者

- Anthropic (Claude)
- OpenAI
- Google Gemini
- Perplexity
- Morph

### 3. 工具选择机制

工具选择在 `/packages/backend/server/src/plugins/copilot/providers/provider.ts` 中实现：

```typescript
protected async getTools(
  options: CopilotChatOptions,
  model: string
): Promise<ToolSet> {
  const tools: ToolSet = {};
  if (options?.tools?.length) {
    for (const tool of options.tools) {
      switch (tool) {
        case 'docEdit':
          tools.doc_edit = createDocEditTool(...);
          break;
        case 'docCompose':
          tools.doc_compose = createDocComposeTool(...);
          break;
        // ... 其他工具
      }
    }
  }
  return tools;
}
```

### 4. AI 决策流程

1. **用户输入处理**
   - 用户通过聊天界面发送消息
   - 系统根据会话上下文和 prompt 配置确定可用工具集

2. **工具自动调用**
   - 使用 AI SDK 的 `streamText` 或 `generateText` 方法
   - 配置 `maxSteps: 20` 允许多步骤推理
   - AI 模型根据上下文自动决定调用哪些工具

3. **多步骤执行**
   ```typescript
   // /packages/backend/server/src/plugins/copilot/providers/anthropic/anthropic.ts
   const { text, reasoning } = await generateText({
     model: modelInstance,
     system,
     messages: msgs,
     tools: await this.getTools(options, model.id),
     maxSteps: this.MAX_STEPS,
     experimental_continueSteps: true,
   });
   ```

### 5. RAG 实现

RAG 功能通过以下组件实现：

1. **文档索引**
   - 使用 embedding 服务对文档内容进行向量化
   - 存储在向量数据库中供检索使用

2. **检索流程**
   - AI 判断需要额外信息时自动调用 `doc_semantic_search` 或 `doc_keyword_search`
   - 检索相关文档片段作为上下文
   - 将检索结果融入回答生成过程

3. **上下文管理**
   - `/packages/backend/server/src/plugins/copilot/context/` 负责管理会话上下文
   - 支持文档引用和跨会话上下文保持

### 6. 文档创建流程

当用户请求创建文档时：

1. **触发条件**
   - AI 分析用户意图，判断需要创建新文档
   - 自动调用 `doc_compose` 工具

2. **文档生成**

   ```typescript
   // /packages/backend/server/src/plugins/copilot/tools/doc-compose.ts
   execute: async ({ title, userPrompt }) => {
     const content = await provider.text({ modelId: prompt.model }, [...prompt.finish({}), { role: 'user', content: userPrompt }]);
     return {
       title,
       markdown: content,
       wordCount: content.split(/\s+/).length,
     };
   };
   ```

3. **前端处理**
   - 接收生成的 Markdown 内容
   - 在编辑器中展示并允许进一步编辑

### 7. 会话管理

会话系统在 `/packages/backend/server/src/plugins/copilot/session.ts` 中实现：

- 支持会话创建、更新、分叉
- 管理消息历史和上下文
- 处理 token 限制和配额管理

## 总结

Learnify 的 AI 功能通过以下关键设计实现智能交互：

1. **灵活的工具系统** - 提供丰富的工具集供 AI 调用
2. **智能决策** - AI 模型自动判断何时使用 RAG 或创建新内容
3. **多步骤推理** - 支持复杂任务的分步执行
4. **上下文感知** - 维护会话上下文以提供连贯的交互体验

这种架构使得 AI 能够根据用户需求灵活地检索信息、编辑文档或创建新内容，提供了强大而直观的知识管理体验。
