---
name: kooboo-local-vue
description: 在 Kooboo 项目中使用 Local Vue（独立 Vue 3 + Vite 应用）开发时使用。触发条件：当前工作区为 Kooboo 项目（存在 kooboo.d.ts 或 Kooboo/、_site/ 等），或用户显式调用。
---

# Kooboo Local Vue

本 Skill 用于在 Kooboo 项目内以 **Local Vue**（独立 Vue 3 + Vite 应用）方式开发前端。数据与权限通过 Kooboo 提供的 API 交互。

---

## 适用场景

- 复杂单页应用、需要高级交互
- 大型团队、代码与 Kooboo 服务端分离
- 需要 CI/CD、独立构建与部署（可部署到任意静态服务器或 CDN）

---

## 推荐步骤（W）

1. **确认模式**：确认为 Local Vue（非 SSR、非 Script Vue）。若不确定，见 `references/frontend-modes.md` 选型。
2. **项目结构**：使用 `Kooboo-Template/localVueTemplate` 或类似结构；目录约定见 `references/structure.md`，路由约定见 `references/routing.md`。
3. **与 Kooboo 对接**：在 Kooboo 端用 `k.api.get/post` 定义接口（见 **Kooboo API** skill 或 `references/api-core.md`）；Vue 端通过 fetch/axios 调用，如 `/api/xxx/action`。
4. **实现页面与状态**：Vue 组件、Pinia store、路由按常规 Vue 3 开发；需要服务端 API 时查阅 **Kooboo API** skill。**使用 Vue Router 时必须使用 hash 模式**，否则会被 Kooboo 的路由接管。
5. **构建与部署**：`npm run build` 后，将产物放入 Kooboo 静态目录或单独部署；交付前做自检（见下）。

---

## 重要约束

- **Vue Router 必须使用 hash 模式**：在 Kooboo 中部署或与 Kooboo 同域访问时，若使用 history 模式，会被 Kooboo 的路由接管，前端路由失效。创建 router 时使用 `createWebHashHistory()`（或等价配置）。

---

## 与 Kooboo 的两种对接方式

- **方式一：k.api 端点**  
  Kooboo：`k.api.get('products', () => k.DB.sqlite.products.all())`  
  Vue：`fetch('/api/products/products').then(r => r.json())`

- **方式二：k.net 服务端代理**  
  Kooboo：`k.api.get('fetch-products', () => k.net.url.getJson('https://...'))`  
  Vue：调用 `/api/xxx/fetch-products`。

详细示例与项目结构见 `references/frontend-modes.md` 中「Local Vue」一节。

---

## 代码示例

- 通用 API 写法（k.api、DB 等）见 **Kooboo API** skill 及 `references/examples.md`。
- Local Vue 侧：Vue 3 + Composition API、调用 Kooboo API 的封装示例见 `references/frontend-modes.md` 中 Local Vue 小节。

---

## 交付前自检（V）

请对照以下两份清单：

1. **通用**：`kooboo-ai-plugins/references/checklist-common.md`
2. **Local Vue 特有**：`kooboo-ai-plugins/references/checklist-local-vue.md`

---

## 模板与示例项目

- Local Vue 模板：`Kooboo-Template/localVueTemplate/`
- 示例：`erp/front-end/`、`task-banner/frontend/` 等
