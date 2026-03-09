# 目录结构规范

> 本项目的前端代码组织结构。

---

## 概述

本项目采用 **Local Vue** 模式开发，前端代码在 `Frontend/` 目录下，打包后部署到 `src/` 目录。

---

## 项目结构

### 完整目录结构

```
Gym-reservation/                    # Kooboo 项目根目录
├── Frontend/                       # Vue 前端源码
│   ├── src/
│   │   ├── views/                 # 页面组件
│   │   │   ├── HomeView.vue
│   │   │   ├── AboutView.vue
│   │   │   └── ...
│   │   ├── components/            # 公共组件
│   │   │   ├── common/           # 通用组件
│   │   │   │   ├── Header.vue
│   │   │   │   ├── Footer.vue
│   │   │   │   └── Button.vue
│   │   │   └── business/         # 业务组件
│   │   │       └── ...
│   │   ├── api/                   # API 封装
│   │   │   ├── index.ts
│   │   │   └── user.ts
│   │   ├── stores/                # Pinia 状态管理
│   │   │   ├── index.ts
│   │   │   └── user.ts
│   │   ├── router/                # Vue Router
│   │   │   └── index.ts
│   │   ├── types/                 # TypeScript 类型
│   │   │   └── index.ts
│   │   ├── utils/                 # 工具函数
│   │   │   └── index.ts
│   │   ├── App.vue
│   │   └── main.ts
│   ├── public/                    # 静态资源（不被构建）
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── src/                           # Kooboo 静态资源（构建产物）
│   ├── page/                     # 打包后的 HTML
│   │   └── index.html
│   ├── css/                      # 打包后的样式
│   ├── js/                       # 打包后的脚本
│   ├── api/                      # Kooboo API
│   ├── code/                     # Kooboo 后端代码
│   │   ├── Models/
│   │   └── Services/
│   └── ...
├── build.bash                     # 构建脚本
└── kooboo.d.ts                   # Kooboo 类型定义
```

---

## 目录职责

### Frontend/src/

| 目录 | 说明 |
|------|------|
| `views/` | 页面组件，每个文件对应一个路由页面 |
| `components/common/` | 通用组件，可被多个页面复用 |
| `components/business/` | 业务组件，与特定业务相关 |
| `api/` | API 封装，统一管理接口请求 |
| `stores/` | Pinia 状态管理 |
| `router/` | Vue Router 配置 |
| `types/` | TypeScript 类型定义 |
| `utils/` | 工具函数 |

### src/ (Kooboo)

| 目录 | 说明 |
|------|------|
| `page/` | 打包后的 HTML 页面 |
| `css/` | 打包后的样式文件 |
| `js/` | 打包后的脚本文件 |
| `api/` | Kooboo API 端点定义 |
| `code/` | Kooboo 后端业务代码 |

---

## 命名约定

### 文件命名

| 类型 | 约定 | 示例 |
|------|------|------|
| 页面组件 | `XxxView.vue` | `HomeView.vue`, `UserProfileView.vue` |
| 公共组件 | `Xxx.vue` | `Header.vue`, `Button.vue` |
| API 文件 | `xxx.ts` | `user.ts`, `product.ts` |
| Store 文件 | `xxx.ts` | `user.ts`, `cart.ts` |
| 工具函数 | `xxx.ts` | `format.ts`, `validate.ts` |

### 目录命名

- 全部使用 **kebab-case**（小写字母 + 连字符）
- 示例：`views/`, `components/common/`, `api/`

---

## 模块组织

### 新增功能的组织方式

```
src/views/
└── new-feature/
    ├── NewFeatureView.vue       # 页面入口
    └── components/              # 该功能专属组件
        └── FeatureCard.vue
```

```
src/api/
└── new-feature.ts               # 该功能的 API 封装
```

```
src/stores/
└── new-feature.ts               # 该功能的状态管理
```

---

## 构建产物

构建完成后，运行 `npm run build` 或 `./build.bash`，产物会自动复制到：

- `src/page/` - HTML 页面
- `src/css/` - 样式文件
- `src/js/` - JavaScript 文件

> 注意：不要手动修改 `src/` 下的文件，这些文件会在下次构建时被覆盖。开发时请修改 `Frontend/` 下的源码。

---

## 示例

### 页面组件示例

```vue
<!-- Frontend/src/views/HomeView.vue -->
<template>
  <div class="home">
    <Header />
    <main>
      <h1>欢迎</h1>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
</script>
```

### API 封装示例

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
