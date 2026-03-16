# Backend Workflow（流程层）

> 流程层只定义“做事顺序与阶段出口”，不重复规则细节。

---

## 阶段总览

1. `plan.md`：任务边界与验收定义
2. `model.md`：数据模型与约束
3. `service.md`：业务逻辑与复用边界
4. `api.md`：路由、参数、响应
5. `verify.md`：分层检查与交付闸门

---

## 使用方式

- 执行时按上面顺序逐阶段推进。
- 每个阶段完成后进入对应 checklist 自检。
- 阶段未通过不得进入下一阶段。

---

## 阶段到知识文档映射

| 阶段 | 优先参考文档 | 作用 |
|---|---|---|
| Plan | `../code-structure.md` | 确认目录职责、改动落点和分层边界 |
| Model | `../database.md` | 字段定义、查询约束、ORM 用法 |
| Service | `../database.md`, `../security.md` | 业务逻辑中的数据访问与安全处理 |
| API | `../api-core.md`, `../routing.md`, `../security.md` | 请求响应、路由声明、参数与鉴权安全 |
| Verify | `../20-checklists/release-gate.md` | 聚合分层结果并给出交付结论 |
