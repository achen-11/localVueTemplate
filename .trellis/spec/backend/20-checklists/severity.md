# 规则严重级别说明

---

## 级别定义

- `Blocker`：阻断交付。未修复不得进入下一阶段或提交。
- `Warning`：非阻断。允许继续，但必须记录风险与后续处理建议。

---

## 报告要求

每条规则输出至少包含：

- `ruleId`
- `severity`
- `scope`（model/service/api/release）
- `message`
- `suggestion`
