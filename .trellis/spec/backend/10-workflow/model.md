# Model 阶段

---

## 目标

建立稳定的数据模型，确保字段类型、主键、查询方式符合 Kooboo 约束。

## 输入

- Plan 阶段确认的数据需求

## 关键动作

- 在 `code/Models/` 定义或修改模型。
- 使用 `DataTypes` 定义字段类型。
- 确保主键逻辑基于 `_id`。

## 退出标准

- Model 规则通过（无 Blocker）。
- 字段约束可支持 Service 业务逻辑。

## 关联清单

- `../20-checklists/model-checklist.md`

## 参考知识文档

- `../database.md`：模型字段、查询方式、`k_sqlite` 约束与示例。
- `../code-structure.md`：Model 文件组织与命名约定。
