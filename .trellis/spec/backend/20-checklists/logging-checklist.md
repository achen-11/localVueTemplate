# Logging Checklist

> 作用域：`src/api/**/*.ts`、`src/code/**/*.ts`

---

## Rules

| Rule ID | Severity | Why | Check | Fix Hint |
|---|---|---|---|---|
| LOG-001 | Blocker | Kooboo 服务端没有 console 对象 | 禁止使用 `console.log/warn/error/info` | 改用 `k.logger.debug/information/warning/error` |
| LOG-002 | Blocker | 日志信息不完整影响问题排查 | 记录错误时必须包含相关上下文信息 | 使用 `k.logger.error('Category', 'message with ${context}')` 格式 |

---

## 执行结果

- [ ] LOG-001
- [ ] LOG-002
