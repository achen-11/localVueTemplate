# Kooboo 后端开发规范

> 本规范基于 kooboo-ai-plugins 提供的 Kooboo 开发知识库，用于指导 AI 代理开发 Kooboo 项目后端。

---

## 概述

Kooboo 是一个 CMS + 应用开发平台，支持多种前端模式：
- **Local Vue**：独立 Vue 3 + Vite 应用（推荐）
- **SSR**：服务端渲染
- **Script Vue**：内嵌脚本式 Vue

本规范聚焦于 Kooboo 后端开发的核心知识，包括 API、数据库、路由等。

---

## 规范索引

| 规范文件 | 说明 |
|----------|------|
| [开发步骤](./steps.md) | Models → Services → API 开发流程 |
| [目录结构](./code-structure.md) | Kooboo 项目目录组织 |
| [核心 API](./api-core.md) | k.request, k.response, k.session 等 |
| [数据库操作](./database.md) | k.DB.sqlite, k_sqlite ORM |
| [路由系统](./routing.md) | @k-url 路由声明语法 |
| [安全规范](./security.md) | 权限、加密、输入验证 |
| [交付检查](./quality-guidelines.md) | 代码交付检查清单 |

---

## 快速入门

### 1. 创建 API 端点

在 `api/` 目录下创建 TypeScript 文件：

```typescript
// api/user.ts
// @k-url /api/user/{action}

import { User } from 'code/Models/User'

// GET /api/user/info
k.api.get('info', (userId: string) => {
    const user = User.findById(userId)
    return { success: true, data: user }
})

// POST /api/user/create
k.api.post('create', (body) => {
    const { userName, password } = body
    const id = User.create({ userName, password })
    return { success: true, id }
})
```

### 2. 创建页面路由

在 `page/` 目录下创建 HTML 文件：

```html
<!-- page/index.html -->
<!-- @k-url / -->

<script env="server">
    k.state.set('title', '首页')
</script>

<h1>{{ k.state.get('title') }}</h1>
```

### 3. 数据库操作

```typescript
// code/Models/User.ts
import { ksql, DataTypes } from 'module/k_sqlite'

const User = ksql.define('users', {
    userName: { type: DataTypes.String, required: true },
    email: { type: DataTypes.String, unique: true },
    password: { type: DataTypes.String, required: true }
}, { timestamps: true })

export { User }
```

---

## 重要约束

| 约束 | 说明 |
|------|------|
| 同步操作 | k_sqlite 是**同步**执行，不需要 await |
| 主键命名 | Kooboo 主键是 `_id`，不是 `id` |
| Model 引用 | 必须指定文件名，禁止 `code/Models` |
| API 路由 | 必须添加 `@k-url` 声明 |
| Vue Router | Local Vue 模式必须使用 hash 模式 |

---

### 4.k-script使用
1. 如果不确定一个 k-script 方法如何使用, 可以先通过 kooboo.d.ts 文件查看对应的类型定义

## 规范来源

本规范内容基于 `kooboo-ai-plugins` 项目：

- 技能定义：`.claude/plugins/kooboo-ai-plugins/skills/kooboo-local-vue/`
- 参考文档：`.claude/plugins/kooboo-ai-plugins/references/`

---

**语言**：本文档使用中文编写。
