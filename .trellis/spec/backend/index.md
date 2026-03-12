# Kooboo 后端开发规范（流程中心化版）

> 后端规范入口。目标是让 AI 与开发者都能按同一执行协议稳定交付。

---

## 快速开始

先阅读并按顺序执行：

1. [执行协议](./00-protocol.md)
2. [流程层](./10-workflow/index.md)
3. [分层清单与总闸门](./20-checklists/release-gate.md)

---

## 新结构索引

| 层级 | 文件/目录 | 用途 |
|---|---|---|
| 协议层 | [00-protocol.md](./00-protocol.md) | 定义固定执行顺序、失败处理、拆分策略 |
| 流程层 | [10-workflow/](./10-workflow/index.md) | 定义各阶段目标、输入、退出标准 |
| 清单层 | [20-checklists/](./20-checklists/release-gate.md) | 定义规则、严重级别、交付闸门 |

---

## 核心知识库（保持不变）

- [目录结构](./code-structure.md)
- [核心 API](./api-core.md)
- [数据库操作](./database.md)
- [路由系统](./routing.md)
- [安全规范](./security.md)

---

## 执行原则（摘要）

- 阶段顺序必须固定：`Plan -> Model -> Service -> API -> Verify`
- `Blocker` 必须修复后继续；`Warning` 允许继续但必须记录
- 涉及多域、高风险或大范围改动时必须拆分子任务
