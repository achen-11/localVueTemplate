# 前端开发规范 (Kooboo Local Vue)

> 基于 Kooboo 平台的 Local Vue 前端开发规范。

---

## 概述

本项目使用 **Local Vue** 模式开发 Kooboo 前端应用：
- 独立 Vue 3 + Vite 应用
- 通过 Kooboo API 与后端交互
- 打包后部署到 Kooboo 静态目录

### 技术栈

| 技术 | 说明 |
|------|------|
| Vue 3 | 前端框架 |
| Vite | 构建工具 |
| Pinia | 状态管理 |
| axios | HTTP 请求 |
| TailwindCSS | 样式框架 |

### 项目结构

```
Gym-reservation/           # Kooboo 项目根目录
├── Frontend/              # Vue 前端源码
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── components/   # 公共组件
│   │   ├── api/          # API 封装
│   │   ├── stores/       # Pinia 状态
│   │   └── router/      # Vue Router
│   ├── vite.config.ts
│   └── package.json
├── src/                   # Kooboo 静态资源
│   ├── page/             # 打包后的 HTML
│   ├── css/              # 打包后的样式
│   └── js/               # 打包后的脚本
├── build.bash             # 构建脚本
└── kooboo.d.ts           # Kooboo 类型定义
```

---

## 规范索引

| 规范文件 | 说明 | 状态 |
|----------|------|------|
| [设计指南](./design-guide.md) | 运动活力风格设计规范 | 必读 |
| [目录结构](./directory-structure.md) | 项目目录组织规范 | 待完善 |
| [组件规范](./component-guidelines.md) | Vue 组件开发规范 | 待完善 |
| [Hook 规范](./hook-guidelines.md) | 自定义 Hook 规范 | 待完善 |
| [状态管理](./state-management.md) | Pinia 状态管理 | 待完善 |
| [类型安全](./type-safety.md) | TypeScript 使用规范 | 待完善 |
| [代码质量](./quality-guidelines.md) | 交付检查清单 | 待完善 |

---

## 重要约束

| 约束 | 说明 |
|------|------|
| Vue Router | 必须使用 **hash 模式**（`createWebHashHistory()`） |
| 构建命令 | 使用 `npm run build` 或 `build.bash` |
| 产物位置 | 构建产物自动复制到 `src/page`、`src/css`、`src/js` |
| 首页声明 | `src/page/index.html` 首行必须有 `<!-- @k-url / -->` |

---

## 快速入门

### 1. 创建新页面

在 `Frontend/src/views/` 下创建 Vue 组件：

```vue
<template>
  <div class="home">
    <h1>{{ title }}</h1>
    <button @click="fetchData">获取数据</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const title = ref('首页')
const userStore = useUserStore()

const fetchData = async () => {
  await userStore.fetchUserInfo()
}
</script>
```

### 2. 定义 API 路由

在 `api/` 目录下创建 API 文件（Kooboo 后端）：

```typescript
// api/user.ts
// @k-url /api/user/{action}

import { User } from 'code/Models/index'

k.api.get('info', () => {
    const userId = k.request.queryString.userId
    const user = User.findById(userId)
    return { success: true, data: user }
})
```

### 3. 构建部署

```bash
# 构建前端
npm run build

# 或使用构建脚本
./build.bash
```

构建产物会自动复制到：
- `src/page/` - HTML 页面
- `src/css/` - 样式文件
- `src/js/` - JavaScript 文件

---

## 前端与 Kooboo 对接

### API 调用方式

前端通过 axios 调用 Kooboo API：

```typescript
// Frontend/src/api/user.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export const userApi = {
  getInfo: (userId: string) => api.get(`/user/info?userId=${userId}`),
  login: (data: { userName: string; password: string }) =>
    api.post('/user/login', data)
}
```

### 前端项目规范

更多前端开发规范请参考：
- [组件规范](./component-guidelines.md)
- [Hook 规范](./hook-guidelines.md)
- [状态管理](./state-management.md)

---

## 规范来源

- Kooboo Local Vue 技能：`.claude/plugins/kooboo-ai-plugins/skills/kooboo-local-vue/`
- Kooboo 参考文档：`.claude/plugins/kooboo-ai-plugins/references/`

---

**语言**：本文档使用中文编写。
