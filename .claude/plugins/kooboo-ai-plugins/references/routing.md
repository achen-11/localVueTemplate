# Kooboo-cli 路由系统

## 目录

- [Kooboo-cli 路由系统](#kooboo-cli-路由系统)
  - [目录](#目录)
  - [页面路由](#页面路由)
    - [基础路由](#基础路由)
    - [动态路由 (页面)](#动态路由-页面)
  - [API 路由](#api-路由)
    - [基础 API 路由](#基础-api-路由)
    - [动态路由 (API)](#动态路由-api)
    - [通配路由](#通配路由)
    - [路由顺序注意事项](#路由顺序注意事项)
  - [路由最佳实践](#路由最佳实践)
    - [1. 路由命名规范](#1-路由命名规范)
    - [2. 动态参数命名](#2-动态参数命名)
    - [3. 路由优先级](#3-路由优先级)

---

## 页面路由

在 HTML 文件顶部使用注释定义路由。

### 基础路由

```html
<!-- @k-url / -->
```

### 动态路由 (页面)

使用 `{}` 定义动态参数：

```html
<!-- @k-url /products/{category} -->
<!-- @k-url /user/{userId}/profile -->
```

动态参数可通过 `k.state.get("paramName")` 获取：

```html
<script env="server">
    const category = k.state.get('category')
</script>

<div env="server">
    <h1>{{ category }}</h1>
</div>
```

> **注意**：`env="server"` 表示该代码仅在服务端执行，客户端不会包含这部分代码。

---

## API 路由

在 `api/*.ts` 文件顶部使用注释定义路由。

### 基础 API 路由

```ts
// @k-url /api/auth
```

### 动态路由 (API)

使用 `{action}` 定义动态路由参数：

```ts
// @k-url /api/auth/{action}

// GET /api/auth/login
k.api.get('login', () => {
    return { success: true, message: '登录成功' }
})

// POST /api/auth/logout
k.api.post('logout', () => {
    return { success: true, message: '退出成功' }
})

// PUT /api/auth/update
k.api.put('update', () => {
    return { success: true, message: '更新成功' }
})

// DELETE /api/auth/delete
k.api.delete('delete', () => {
    return { success: true, message: '删除成功' }
})
```

### 通配路由

不携带参数时默认为通配路由，匹配所有未明确匹配的子路由：

```ts
// @k-url /api/auth/{action}

// GET /api/auth (无参数时的通配匹配)
k.api.get(() => {
    return { success: true, message: '通配路由' }
})
```

### 路由顺序注意事项

> **⚠️ 重要**：通配路由必须在所有具体路由之后定义，否则将不会匹配到子路由。

```ts
// ❌ 错误示范
// @k-url /api/auth/{action}

// 通配路由放在前面
k.api.get(() => {
    return { success: true, message: '通配路由' }
})

// 该 API 永远不会被匹配到
k.api.get('logout', () => {
    return { success: true, message: '退出成功' }
})
```

```ts
// ✅ 正确示范
// @k-url /api/auth/{action}

// 具体路由放在前面
k.api.get('logout', () => {
    return { success: true, message: '退出成功' }
})

k.api.get('login', () => {
    return { success: true, message: '登录成功' }
})

// 通配路由放在最后
k.api.get(() => {
    return { success: true, message: '通配路由' }
})
```

---

## 路由最佳实践

### 1. 路由命名规范

| 类型 | 推荐 | 不推荐 |
|------|------|--------|
| 页面路由 | `/product-detail`、`/user-profile` | `/ProductDetail`、`/User_Profile` |
| API 路由 | `/api/products`、`/api/users` | `/api/Products`、`/API/users` |

- 使用小写字母和连字符 `-`
- 使用复数形式命名资源集合（如 `/users` 而非 `/user`）
- RESTful 风格：GET（获取）、POST（创建）、PUT（更新）、DELETE（删除）

### 2. 动态参数命名

| 推荐 | 不推荐 |
|------|--------|
| `/order/{orderId}` | `/order/{id}` |
| `/user/{userId}/profile` | `/user/{id}/profile` |

使用有意义的参数名称，提高代码可读性和可维护性。

### 3. 路由优先级

- **具体路由优先**：路径越具体越靠前
- **通配路由放最后**：避免拦截其他路由

### 4. API 按模块合并（同一模块一个文件）

**同一模块的多个接口应放在一个 api 文件中**，使用 `@k-url /api/模块名/{action}`，在同一文件内用多个 `k.api.get/post('actionName', ...)` 定义。

- ❌ 错误：拆成多个文件，如 `api/order-list.ts`、`api/order-create.ts`
- ✅ 正确：`api/order.ts`，且声明 `// @k-url /api/order/{action}`，文件内包含 `k.api.get('list', ...)`、`k.api.post('create', ...)` 等

### 5. 单资源 id 建议用 query 参数

**类似 id 的单资源标识建议使用 query 参数**，在 handler 中从 query 取 id；**避免**使用路径参数 `/{id}`。

- ❌ 错误：`// @k-url /api/order/{id}`，`k.api.get('get', (id: string) => ...)`
- ✅ 正确：`// @k-url /api/order?id={id}`，`k.api.get('get', (id: string) => ...)`，在回调内通过 query 获取 id
