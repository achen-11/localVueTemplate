# Service 阶段

---

## 目标

将业务逻辑封装在 `code/Services/`，保持 API 层简洁、可复用、可维护。

## 输入

- 已通过检查的 Model

## 关键动作

- 将业务判断、数据组合、异常语义放入 Service。
- API 不直接操作复杂业务逻辑。
- 统一错误语义与返回约定，减少 API 层重复判断。

## 退出标准

- Service 规则通过（无 Blocker）。
- API 可以通过调用 Service 完成业务，不越层。

## 关联清单

- `../20-checklists/service-checklist.md`

## 参考知识文档

- `../database.md`：Service 中的数据读取、过滤、分页与聚合模式。
- `../security.md`：密码处理、权限边界、敏感数据安全策略。
- `../code-structure.md`：Service 与 API/Model 的分层职责边界。
