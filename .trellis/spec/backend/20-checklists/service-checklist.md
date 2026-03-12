# Service Checklist

> 作用域：`code/Services/**/*.ts`

---

## Rules

| Rule ID | Severity | Why | Check | Fix Hint |
|---|---|---|---|---|
| SERVICE-001 | Blocker | 分层失效会导致 API 维护成本失控 | 业务逻辑必须在 Service 层，不在 API 层堆叠 | 将业务处理抽离到 `code/Services/` |
| SERVICE-002 | Blocker | 路径不规范会造成解析失败或可维护性下降 | 引用 Model/Service/Utils 必须使用 `code/<Layer>/<File>` 具体路径 | 禁止 `code/Models` 裸路径和相对跨层引用 |
| SERVICE-003 | Blocker | 同步/异步误用会引发逻辑错误 | Kooboo `k_sqlite` 为同步调用，不应 `await` | 移除无效 `await` 并检查调用链 |
| SERVICE-004 | Warning | 密码明文会带来安全风险 | 涉及密码存储时必须加密 | 使用 `k.security` 对密码进行加密后存储 |
| SERVICE-005 | Warning | 错误语义不统一影响 API 稳定性 | 推荐统一 Service 错误返回语义 | 约定统一错误对象并在 API 层映射 |
| SERVICE-006 | Blocker | 使用 MongoDB 风格运算符会导致 k_sqlite 查询失效 | 禁止在 Service 中使用 `$gte/$lte/$ne/$contains/$or` | 使用 `Operators` 并改为 `[GTE]/[LTE]/[NE]/[CONTAINS]/[OR]` |
| SERVICE-007 | Blocker | 使用 Operators 但未导入会导致运行时错误 | 若使用 `[GTE]/[LTE]/[NE]/[CONTAINS]/[OR]`，必须导入 `Operators` | `import { Operators } from 'module/k_sqlite'` 并解构所需操作符 |

---

## 执行结果

- [ ] SERVICE-001
- [ ] SERVICE-002
- [ ] SERVICE-003
- [ ] SERVICE-004
- [ ] SERVICE-005
- [ ] SERVICE-006
- [ ] SERVICE-007
