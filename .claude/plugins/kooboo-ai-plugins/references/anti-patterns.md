# Kooboo 常见错误与正确写法

交付前请对照本页，避免以下 5 类错误。

---

## 1. Model 引用路径

| 项目 | 说明 |
|------|------|
| **错误** | `import { User } from 'code/Models'`（缺少具体文件名，禁止使用）。 |
| **正确** | 有聚合时用聚合文件路径，如 `import { User } from 'code/Models/index'`（以实际聚合文件名为准）；无聚合时直接引用具体模型文件，如 `import { User } from 'code/Models/User'`。 |
| **参考** | `structure.md`、`api-core.md` — Model 引用 |

---

## 2. Services 目录

| 项目 | 说明 |
|------|------|
| **错误** | 在 `code/` 根目录创建业务服务文件，如 `code/auth.ts`，或 `import { xx } from 'code/auth'`。 |
| **正确** | 业务逻辑放在 `code/Services/xxx.ts`，如 `code/Services/auth.ts`；引用时 `import { xx } from 'code/Services/auth'`。 |
| **参考** | `structure.md` — code/ 业务代码 |

---

## 3. API 按模块合并

| 项目 | 说明 |
|------|------|
| **错误** | 按 action 拆成多个 api 文件，如 `api/order-list.ts`、`api/order-create.ts`。 |
| **正确** | 同一模块的多个接口放在一个 api 文件中，如 `api/order.ts`，使用 `// @k-url /api/order/{action}`，文件内用多个 `k.api.get('list', ...)`、`k.api.post('create', ...)` 等。 |
| **参考** | `routing.md`、`api-core.md` — API 按模块合并 |

---

## 4. 单资源 id 用 query 参数

| 项目 | 说明 |
|------|------|
| **错误** | 使用路径参数，如 `// @k-url /api/order/{id}`，`k.api.get('get', (id: string) => ...)`。 |
| **正确** | 使用 query 参数，如 `// @k-url /api/order?id={id}`，在 handler 内通过 query 获取 id（如 `k.request.queryString.id`）。 |
| **参考** | `routing.md`、`api-core.md` — 单资源 id 用 query |
