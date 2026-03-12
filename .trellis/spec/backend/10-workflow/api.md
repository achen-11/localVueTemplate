# API 阶段

---

## 目标

实现稳定、可预测的 API 接口，包括路由声明、参数获取、响应结构与安全约束。

## 输入

- 已通过检查的 Service 能力

## 关键动作

- 在 `api/*.ts` 正确声明 `@k-url`。
- 按 HTTP 方法定义接口（GET/POST/PUT/DELETE）。
- 正确解析参数（`queryString`、`k.request.body`）。
- 调用 Service 而非在 API 写复杂业务逻辑。

## 退出标准

- API 规则通过（无 Blocker）。
- 路由、参数、响应与安全约束满足规范。

## 关联清单

- `../20-checklists/api-checklist.md`

## 参考知识文档

- `../api-core.md`：`k.request`、`k.response`、`k.state` 等核心 API 用法。
- `../routing.md`：`@k-url` 声明与路由组织规则。
- `../security.md`：JWT、输入校验、SQL 注入防护等安全要求。
