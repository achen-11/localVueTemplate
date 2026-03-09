# Kooboo AI Plugins

为 AI 提供 Kooboo 项目开发能力的 **Plugin**，内含多个 Skill，按「通用 API」与「前端模式」拆分。

---

## 结构

```
kooboo-ai-plugins/
├── README.md                 # 本说明
├── references/               # 本 plugin 内的公共文档（主要为清单）
│   ├── checklist-common.md   # 通用交付检查清单
│   ├── checklist-local-vue.md
│   ├── checklist-ssr.md      # TODO：待补全
│   └── checklist-script-vue.md  # TODO：待补全
└── skills/
    ├── kooboo-api/           # 通用 API / 路由 / 结构 索引入口
    │   └── SKILL.md
    ├── kooboo-local-vue/     # Local Vue 模式（已实现）
    │   └── SKILL.md
    ├── kooboo-ssr/           # SSR 模式（TODO）
    │   └── SKILL.md
    └── kooboo-script-vue/    # Script Vue / CDN Vue 模式（TODO）
        └── SKILL.md
```

- **API 与结构正文**：位于与本 plugin 同仓库的根目录 `references/`（如 `api-core.md`、`routing.md`、`structure.md`、`frontend-modes.md` 等），由 **kooboo-api** 及各模式 Skill 引用。
- **清单**：通用 + 各模式清单放在本 plugin 的 `references/` 下。

---

## 触发方式

- **P（项目触发）**：当前工作区为 Kooboo 项目时，AI 可自动考虑使用本 plugin 下的 skill。  
  判定方式：工作区根或常见子目录存在 `kooboo.d.ts`，或存在 `Kooboo/`、`_site/` 等典型 Kooboo 目录。
- **M（手动触发）**：用户通过指令或命令显式调用（如「用 Kooboo API」「按 Local Vue 来做」等）。

---

## 当前实现状态

| Skill           | 状态   | 说明 |
|----------------|--------|------|
| kooboo-api     | 已实现 | 通用 API/路由/结构索引，指向仓库 references |
| kooboo-local-vue | 已实现 | Local Vue 步骤、对接方式、清单 |
| kooboo-ssr     | TODO   | 占位，待验证 Local Vue 后补全 |
| kooboo-script-vue | TODO | 占位，待验证 Local Vue 后补全 |

---

## 使用说明（给 AI）

1. 在 Kooboo 项目内开发时，优先根据需求选择：
   - 只涉及 **HTTP/路由/数据库/结构** → 使用 **kooboo-api**，并查阅仓库根 `references/` 下对应文档。
   - 使用 **Local Vue** 开发前端 → 使用 **kooboo-local-vue**，需要服务端 API 时配合 **kooboo-api**。
   - 使用 **SSR** 或 **Script Vue** → 使用对应 skill（当前为 TODO，可先查 `references/frontend-modes.md` 对应小节）。
2. 交付前按「通用 + 当前模式」对照本 plugin 内 `references/checklist-common.md` 与对应模式 checklist。
