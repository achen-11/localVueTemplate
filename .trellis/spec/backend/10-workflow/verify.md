# Verify 阶段

---

## 目标

聚合分层检查结果，形成交付结论，决定是否允许进入提交阶段。

## 输入

- Model/Service/API 分层检查结果

## 关键动作

- 执行分层检查并记录失败项。
- 运行 release gate 汇总。
- 对 Warning 给出处理建议与优先级。

## 退出标准

- 无 Blocker。
- 已产出结构化检查报告（至少包含层级、规则 ID、结果）。

## 关联清单

- `../20-checklists/release-gate.md`

## 参考知识文档

- `../20-checklists/model-checklist.md`
- `../20-checklists/service-checklist.md`
- `../20-checklists/api-checklist.md`
- `../20-checklists/release-gate.md`
