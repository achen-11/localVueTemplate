---
name: kooboo-api
description: 在 Kooboo 项目中需要处理 HTTP 请求/响应、路由、数据库、项目结构时使用；API 与结构说明见仓库 references。触发条件：当前工作区为 Kooboo 项目（存在 kooboo.d.ts 或 Kooboo/、_site/ 等目录），或用户显式调用。
---

# Kooboo API / Core

本 Skill 提供 Kooboo 服务端通用 API 与项目结构的索引入口。**正文均在仓库根目录的 `references/` 下，此处不复制长文，仅做索引。**

---

## 何时使用

- 需要写或查：**HTTP 请求/响应、Session、Cookie、路由、SQLite、数据模型、项目目录约定** 时，使用本 Skill 并查阅下方对应文档。
- 与「选哪种前端模式」或「SSR/Script Vue/Local Vue 页面怎么写」无关时，用本 Skill；否则请用对应模式 Skill（kooboo-ssr / kooboo-script-vue / kooboo-local-vue）。

---

## 编写时务必遵守

编写 Kooboo 代码时请遵守以下约束，交付前对照 `references/anti-patterns.md` 自检
---

## 参考索引（references）

| 主题 | 查阅文件 |
|------|----------|
| 项目目录与各目录职责 | `references/structure.md` |
| 页面路由、API 路由、动态参数 | `references/routing.md` |
| request / response / session / cookie / state / label | `references/api-core.md` |
| SQLite、k_sqlite ORM、数据模型 | `references/api-database.md` |
| 常用代码模式与示例 | `references/examples.md`（及其中指向的 `data/code-examples.json`） |

若仓库中还有 `api-commerce.md`、`api-content.md`、`api-security.md`，需要商品/内容/安全相关 API 时也可查阅对应文件。

---

## 交付前自检

API 或服务端相关交付前，请对照 **本 plugin 内** `kooboo-ai-plugins/references/checklist-common.md`；若涉及具体前端模式，再对照对应 `checklist-ssr.md` / `checklist-script-vue.md` / `checklist-local-vue.md`（同目录下）。
