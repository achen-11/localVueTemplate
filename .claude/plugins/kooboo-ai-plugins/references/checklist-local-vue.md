# Local Vue 模式交付检查清单

与 **checklist-common.md** 一起使用。仅列出 Local Vue 特有项。

---

## 1. 与 Kooboo 的对接

| 检查项 | 说明 | 状态 |
|--------|------|------|
| API 基路径 | 前端请求 Kooboo API 的 baseURL 与后端 `@k-url` 一致 | [ ] |
| 跨域与代理 | 开发时 Vite proxy 或 CORS 配置正确，生产部署路径正确 | [ ] |
| 接口约定 | 使用 `k.api.get/post` 定义的端点，前端按约定调用 | [ ] |

---

## 2. 构建与部署

| 检查项 | 说明 | 状态 |
|--------|------|------|
| 构建产物 | `npm run build` 产出可放入 Kooboo 静态目录或单独部署 | [ ] |
| 环境变量 | 接口地址等通过环境变量区分开发/生产，不写死 | [ ] |
| 路由模式 | Vue Router 必须用 **hash 模式**（`createWebHashHistory()`），否则会被 Kooboo 路由接管 | [ ] |

---

## 3. 代码与依赖

| 检查项 | 说明 | 状态 |
|--------|------|------|
| TypeScript | 推荐使用，类型与 Kooboo API 返回一致 | [ ] |
| 依赖版本 | Vue 3、Vite、Pinia 等与 Kooboo 侧无冲突 | [ ] |
