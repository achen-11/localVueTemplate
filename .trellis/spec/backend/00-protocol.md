# Kooboo Backend AI 执行协议

> 本文档定义 AI 在 Kooboo 后端任务中的固定执行顺序、阶段闸门和失败处理策略。

---

## 1) 适用范围

- 适用于 `api/`、`code/Models/`、`code/Services/`、`code/Utils/` 相关后端开发任务。
- 前端任务不在本协议范围内。

---

## 2) 固定执行顺序（必须）

1. Plan
2. Model
3. Service
4. API
5. Verify

AI 不得跳过阶段直接实现后续层级（例如直接在 API 中落业务逻辑）。

---

## 3) 阶段输入/输出

| 阶段    | 进入条件             | 输出物                          |
| ------- | -------------------- | ------------------------------- |
| Plan    | 需求明确到可执行     | 任务边界、影响文件、验收标准    |
| Model   | 数据结构与约束已确认 | 模型定义、字段规则、主键策略    |
| Service | Model 通过检查       | 业务函数、错误语义、复用边界    |
| API     | Service 通过检查     | 路由、参数解析、响应格式        |
| Verify  | API 通过检查         | 分层检查结果、release gate 结论 |

---

## 4) 失败处理策略

- `Blocker`：必须停止后续阶段，先修复再继续。
- `Warning`：允许继续，但必须在最终报告中列出并给出处理建议。

严重级别定义见 `20-checklists/severity.md`。

---

## 5) 子任务拆分协议（分而治之）

出现以下任一情况必须拆分子任务：

- 涉及 2 个以上业务域。
- 影响文件超过 6 个。
- 含高风险操作（鉴权、数据迁移、删除逻辑、事务一致性）。

拆分规则：

- 每个子任务只覆盖一个明确目标。
- 子任务仍遵循本协议五阶段。
- 汇总时按 `Model -> Service -> API -> Verify` 聚合结果，不允许只汇总 API 改动。

---

## 6) 文档导航

- 流程定义：`10-workflow/index.md`
- 分层清单：`20-checklists/`
- 总闸门：`20-checklists/release-gate.md`

### 阶段到知识文档映射（简版）

| 阶段 | 优先参考文档 |
|---|---|
| Plan | `code-structure.md` |
| Model | `database.md` |
| Service | `database.md`, `security.md` |
| API | `api-core.md`, `routing.md`, `security.md` |
| Verify | `20-checklists/release-gate.md` |
