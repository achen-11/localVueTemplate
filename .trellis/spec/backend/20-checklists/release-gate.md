# Release Gate（交付闸门）

> 本清单只聚合阶段结论，不重复底层规则定义。

---

## Gate 条件

| Gate ID | Severity | 条件 | 结果 |
|---|---|---|---|
| GATE-001 | Blocker | Model 层 Blocker 全部通过 | 未通过则禁止交付 |
| GATE-002 | Blocker | Service 层 Blocker 全部通过 | 未通过则禁止交付 |
| GATE-003 | Blocker | API 层 Blocker 全部通过 | 未通过则禁止交付 |
| GATE-004 | Warning | Warning 项已汇总并附处理建议 | 未满足则允许交付但标注风险 |

---

## 交付结论模板

```text
Backend Check Report
- Model: PASS/FAIL
- Service: PASS/FAIL
- API: PASS/FAIL
- Warnings: <count>
- Final Gate: PASS/FAIL
```

---

## 关联文档

- `severity.md`
- `model-checklist.md`
- `service-checklist.md`
- `api-checklist.md`
