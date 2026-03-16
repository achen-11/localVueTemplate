# Model Checklist

> 作用域：`code/Models/**/*.ts`

---

## Rules

| Rule ID | Severity | Why | Check | Fix Hint |
|---|---|---|---|---|
| MODEL-001 | Blocker | Kooboo 模型类型约束必须明确 | `ksql.define` 字段必须使用 `DataTypes.*`，禁止字符串类型 | 使用 `import { ksql, DataTypes } from 'module/k_sqlite'` 并显式 `type` |
| MODEL-002 | Blocker | 主键访问约定不一致会导致数据错误 | 业务访问主键使用 `_id`，禁止依赖 `id` | 将 `id` 改为 `_id`，并同步返回结构 |
| MODEL-003 | Blocker | 查询语法错误会直接导致运行失败 | `findAll` 调用必须传参数，至少为 `{}` | 将 `findAll()` 改为 `findAll({})` |
| MODEL-004 | Warning | 缺少时间戳影响审计与排序 | 推荐启用 `timestamps: true` | 在模型选项中补齐 `timestamps: true` |
| MODEL-005 | Warning | 敏感数据生命周期不可控 | 涉及敏感业务时推荐 `softDelete: true` | 在模型选项中启用软删除策略 |

---

## 执行结果

- [ ] MODEL-001
- [ ] MODEL-002
- [ ] MODEL-003
- [ ] MODEL-004
- [ ] MODEL-005
