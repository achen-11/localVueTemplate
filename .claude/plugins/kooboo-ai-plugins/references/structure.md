# Kooboo 项目结构

## 典型目录结构

```
project/
├── page/              # 页面文件（路由入口）
│   └── *.html         # 每个 .html 文件对应一个页面路由
├── view/              # 可复用视图组件
│   ├── common/        # 公共组件（header, footer）
│   ├── components/   # 业务组件
│   └── page/          # 页面级视图
├── layout/            # 布局文件
│   └── *.html         # 定义页面骨架 + placeholder
├── module/            # 可安装模块
│   └── module_name/
│       ├── root/
│       │   ├── Module.config    # 模块配置
│       │   └── Event.js         # 模块事件
│       ├── view/                # 模块视图
│       ├── code/                # 模块代码
│       └── api/                 # 模块 API
├── code/              # 业务代码（服务端）
│   ├── Models/        # 数据模型
│   ├── Services/     # 业务逻辑
│   └── *.ts          # 其他服务
├── api/               # API 端点定义
│   └── *.ts          # API 实现
├── css/               # 样式文件
├── js/                # 客户端 JavaScript
└── media/             # 静态资源（图片等）
```

---

## 各目录职责

### page/ — 页面入口

- 每个 `.html` 文件对应一个 URL 路由
- 使用 `<!-- @k-url /path -->` 定义路由
- 可以包含 SSR 脚本 `<script env="server">` 和客户端脚本 `<script>`
- 示例：`page/index.html`、`page/products.html`

### view/ — 可复用视图组件

- 类似 Vue 组件，可被 page 引用
- 使用 `<view id="view.path">` 引用
- 支持属性传递：`k-slot-define` / `k-slot-insert`
- 示例：`view/common/header.html`、`view/components/product-card.html`

### layout/ — 页面布局

- 定义页面骨架，包含 `<placeholder>` 占位符
- page 使用 `<layout id="layout.name">` 引用
- 示例：`layout/main.html`、`layout/admin.html`

### module/ — 可安装模块

- 可打包安装的插件系统
- 每个模块有独立 `Module.config`
- 可包含 view、code、api
- 示例：`module/k_sqlite/`、`module/http_request/`

### code/ — 业务代码（服务端）

- TypeScript 服务端代码
- 不直接暴露为 API，供其他代码调用
- 目录结构：`code/Models/`、`code/Services/`
- **业务逻辑层**必须放在 `code/Services/xxx.ts`（如 `code/Services/auth.ts`），**不得**在 `code/` 根目录下创建业务服务文件（如 `code/auth.ts`）；引用时使用 `code/Services/xxx`。
- 命名约定：PascalCase（如 `OrderService.ts`）

### api/ — API 端点

- 使用 `k.api.get()` / `k.api.post()` 定义
- 直接暴露为 HTTP 端点
- 命名约定：kebab-case（如 `api-order.ts`）
- **必须在文件顶部添加 `@k-url /api/xxx/{action}` 声明**

```typescript
// @k-url /api/user/{action}
// 引用 Model：有聚合用聚合文件路径（如 code/Models/index），无聚合用 code/Models/User；禁止写 code/Models
import { User } from 'code/Models/index'

k.api.get('user-info', () => {
    const userId = k.session.get('userId')
    const user = User.findById(userId)
    return { success: true, data: { id: user._id } }
})
```

### css/ — 样式

- 页面级样式文件
- 被 page 引用

### js/ — 客户端 JavaScript

- 页面交互逻辑
- 不运行在服务端

### media/ — 静态资源

- 图片、字体等
- 可通过 CDN 访问

---

## Local Vue 项目结构

独立 Vue 3 + Vite 项目（通过 API 与 Kooboo 交互）：

```
localVueProject/
├── src/
│   ├── views/              # 页面组件
│   │   └── HomeView.vue
│   ├── components/         # 可复用组件
│   ├── api/                # API 调用封装
│   ├── stores/             # Pinia 状态管理
│   ├── router/             # Vue Router
│   ├── types/              # TypeScript 类型
│   └── main.ts
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

与 Kooboo 交互方式：
- 通过 `k.api` 定义的端点进行 HTTP 调用
- 或使用 `k.net.url` 在服务端代理请求

---

## 数据模型目录（code/Models/）

使用 k_sqlite ORM 时，模型文件放在 `code/Models/`。**引用 Model 时**：有聚合则用聚合文件路径（如 `code/Models/index`），无聚合则直接引用具体文件（如 `import { User } from 'code/Models/User'`）；**禁止**使用 `code/Models`（无文件名）。

```typescript
// code/Models/User.ts
import { ksql, DataTypes } from 'module/k_sqlite'

const User = ksql.define(
  'users',
  {
    userName: { type: DataTypes.String, required: true },
    email: { type: DataTypes.String, unique: true },
    password: { type: DataTypes.String, required: true },
    isActive: { type: DataTypes.Boolean, default: true }
  },
  {
    timestamps: true,
    softDelete: true
  }
)

export { User }
```

### ⚠️ 重要：不要在 Model 中手动定义 id 字段

k_sqlite 会自动生成 `_id` 主键，Model 定义时**不要**手动添加 id：

```typescript
// ✅ 正确：不需要定义 id
const User = ksql.define('users', {
    userName: { type: DataTypes.String, required: true },
    email: { type: DataTypes.String }
}, { timestamps: true })

// ❌ 错误：不需要手动定义 id
const User = ksql.define('users', {
    id: { type: DataTypes.Number, primaryKey: true },  // 不需要！
    userName: { type: DataTypes.String }
})
```

---

## 模块目录结构

```
module_name/
├── root/
│   ├── Module.config    # 必需：模块配置
│   ├── Event.js        # 模块生命周期事件
│   └── Readme.md       # 模块说明
├── view/               # 模块视图（可选）
├── code/               # 模块代码（可选）
├── api/                # 模块 API（可选）
└── package.json        # 依赖配置（可选）
```

### Module.config 示例

```json
{
  "name": "my_module",
  "description": "模块描述",
  "version": "1.0.0",
  "menu": {
    "name": "我的模块",
    "icon": "icon.svg"
  }
}
```

---

## 快速对照表

| 目录 | 用途 | 运行环境 |
|------|------|----------|
| page/ | 页面入口 | SSR + Client |
| view/ | 组件 | SSR |
| layout/ | 布局 | SSR |
| code/ | 业务逻辑 | Server |
| api/ | HTTP 端点 | Server |
| js/ | 客户端逻辑 | Client |
| css/ | 样式 | Client |
| module/ | 插件 | Server |
