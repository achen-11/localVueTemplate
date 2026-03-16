---
name: kooboo-backend-task
description: Kooboo 后端开发任务自动化工作流。自动执行 Plan→Model→Service→API→Verify 完整流程，集成 gate 检查和自动修复。当用户说"开发后端功能"、"创建 API"、"添加 Model"、或输入 /backend-task 时必须使用此 skill。确保每次后端任务都遵循规范并通过 gate 检查。
---

# Kooboo Backend Task

执行 Kooboo 后端开发的完整自动化工作流。

## 开始之前

1. **读取核心协议**：
   - `.trellis/spec/backend/00-protocol.md`
   - `.trellis/spec/backend/10-workflow/index.md`
   - `.trellis/spec/backend/index.md`

2. **确认任务目标**：如果用户未明确说明任务，询问具体要开发什么功能。

## 工作流阶段（必须按顺序执行）

### Phase 1: Plan（计划阶段）

1. 读取 `.trellis/spec/backend/10-workflow/plan.md`
2. 读取 `.trellis/spec/backend/code-structure.md`
3. 分析需求，设计代码结构
4. 输出 Plan 阶段的产物：
   - 功能描述
   - 涉及的模块（Model/Service/API）
   - 数据库变更（如有）
5. **运行 Gate 检查**：`pnpm backend:workflow`
6. 如果 `Final Gate: FAIL`，修复 Blocker 后重新检查
7. 报告 Plan 阶段状态

### Phase 2: Model（模型阶段）

1. 读取 `.trellis/spec/backend/10-workflow/model.md`
2. 读取 `.trellis/spec/backend/database.md`
3. 实现数据模型
4. 输出 Model 阶段的产物：
   - Entity/Model 定义
   - 数据库迁移脚本（如有）
5. **运行 Gate 检查**：`pnpm backend:workflow`
6. 如果 `Final Gate: FAIL`，修复 Blocker 后重新检查
7. 报告 Model 阶段状态

### Phase 3: Service（服务阶段）

1. 读取 `.trellis/spec/backend/10-workflow/service.md`
2. 读取 `.trellis/spec/backend/database.md`
3. 读取 `.trellis/spec/backend/security.md`
4. 实现业务逻辑
5. 输出 Service 阶段的产物：
   - Service 类/函数
   - 业务规则验证
6. **运行 Gate 检查**：`pnpm backend:workflow`
7. 如果 `Final Gate: FAIL`，修复 Blocker 后重新检查
8. 报告 Service 阶段状态

### Phase 4: API（接口阶段）

1. 读取 `.trellis/spec/backend/10-workflow/api.md`
2. 读取 `.trellis/spec/backend/api-core.md`
3. 读取 `.trellis/spec/backend/routing.md`
4. 读取 `.trellis/spec/backend/security.md`
5. 实现 API 端点
6. 输出 API 阶段的产物：
   - 路由定义
   - Controller/Handler
   - 请求/响应 DTO
7. **运行 Gate 检查**：`pnpm backend:workflow`
8. 如果 `Final Gate: FAIL`，修复 Blocker 后重新检查
9. 报告 API 阶段状态

### Phase 5: Verify（验证阶段）

1. 读取 `.trellis/spec/backend/10-workflow/verify.md`
2. 读取 `.trellis/spec/backend/20-checklists/` 下的所有 checklist：
   - `model-checklist.md`
   - `service-checklist.md`
   - `api-checklist.md`
   - `release-gate.md`
3. 运行最终验证：`pnpm backend:workflow`
4. 如果 `Final Gate: FAIL`，修复所有 Blocker
5. 如果只有 Warning，记录风险但可以继续

## Gate 检查规则

- **必须修复**：所有 Blocker（阻塞问题）
- **可选但需记录**：Warning（警告）
- **重试机制**：每次修复后重新运行 `pnpm backend:workflow`

## 命令参考

- 快速检查：`pnpm backend:check`
- JSON 输出：`pnpm backend:check:json`
- 完整流程（推荐）：`pnpm backend:workflow`

## 输出格式

任务完成后，报告必须包含：

```
## 任务完成报告

### 执行摘要
- 任务目标：[描述]
- 完成时间：[时间]

### 阶段状态
| 阶段 | 状态 | Gate | Blocker | Warning |
|------|------|------|---------|---------|
| Plan | ✅ | PASS/FAIL | N | N |
| Model | ✅ | PASS/FAIL | N | N |
| Service | ✅ | PASS/FAIL | N | N |
| API | ✅ | PASS/FAIL | N | N |
| Verify | ✅ | PASS/FAIL | N | N |

### 最终结果
- Final Gate: [PASS/FAIL]
- Blocker 总数: [N]
- Warning 总数: [N]

### 下一步建议
[如有后续任务或改进建议]
```

## 注意事项

- 严格按照 Plan → Model → Service → API → Verify 顺序执行，不可跳过
- 每个阶段必须运行 gate 检查并修复 blocker
- 如果用户在任务中途改变需求，评估是否需要重新开始
- 保持与用户的沟通，及时汇报进度
