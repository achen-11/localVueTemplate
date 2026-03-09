# Kooboo 路由系统

> Kooboo 使用 `@k-url` 注释语法定义路由，支持页面路由和 API 路由。

---

## 目录

- [页面路由](#页面路由) - HTML 页面路由定义
- [API 路由](#api-路由) - API 端点路由定义
- [路由规范](#路由规范) - 命名和最佳实践

---

## 页面路由

在 HTML 文件顶部使用注释定义路由。

### 基础路由

```html
<!-- @k-url / -->
```

### 动态路由

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

> 注意：`env="server"` 表示该代码仅在服务端执行，客户端不会包含这部分代码。

---

## API 路由

在 `api/*.ts` 文件顶部使用注释定义路由。

### 基础 API 路由

```typescript
// @k-url /api/auth
```

### 动态路由 (API)

使用 `{action}` 定义动态路由参数：

```typescript
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

```typescript
// @k-url /api/auth/{action}

// GET /api/auth (无参数时的通配匹配)
k.api.get(() => {
    return { success: true, message: '通配路由' }
})
```

### 路由顺序注意事项

> 重要：通配路由必须在所有具体路由之后定义，否则将不会匹配到子路由。

```typescript
// 错误示范
// @k-url /api/auth/{action}

// 通配路由放在前面 - 错误！
k.api.get(() => {
    return { success: true, message: '通配路由' }
})

// 该 API 永远不会被匹配到
k.api.get('logout', () => {
    return { success: true, message: '退出成功' }
})
```

```typescript
// 正确示范
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

## 路由规范

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

- 具体路由优先：路径越具体越靠前
- 通配路由放最后：避免拦截其他路由

### 4. API 按模块合并

同一模块的多个接口应放在一个 api 文件中，使用 `@k-url /api/模块名/{action}`，在同一文件内用多个 `k.api.get/post('actionName', ...)` 定义。

```typescript
// 正确：合并在一个文件
// api/order.ts
// @k-url /api/order/{action}
k.api.get('list', ...)
k.api.post('create', ...)
k.api.put('update', ...)
k.api.delete('remove', ...)

// 错误：拆成多个文件
// api/order-list.ts
// api/order-create.ts
// api/order-update.ts
```

### 5. 单资源 id 建议用 query 参数

类似 id 的单资源标识建议使用 query 参数，在 handler 中从 query 取 id；避免使用路径参数 `/{id}`。

```typescript
// 正确：使用 query 参数
// @k-url /api/order?id={id}
k.api.get('get', () => {
    const id = k.request.queryString.id
    // ...
})

// 错误：使用路径参数
// @k-url /api/order/{id}
k.api.get('get', (id: string) => {
    // ...
})
```

---

## 完整示例

### 用户 API 模块

```typescript
// api/user.ts
// @k-url /api/user/{action}

import { User } from 'code/Models/index'

// GET /api/user/info
k.api.get('info', () => {
    const userId = k.request.queryString.userId
    constById(userId)
    return { success: true, data: user }
 user = User.find})

// POST /api/user/login
k.api.post('login', (body) => {
    const { userName, password } = body

    const user = User.findOne({ userName })
    if (!user) {
        return { success: false, message: '用户不存在' }
    }

    // 密码验证...
    k.session.set('userId', user._id)
    return { success: true, data: { id: user._id } }
})

// POST /api/user/register
k.api.post('register', (body) => {
    const { userName, password, email } = body

    // 检查用户是否存在
    const exists = User.findOne({ userName })
    if (exists) {
        return { success: false, message: '用户名已存在' }
    }

    const id = User.create({ userName, password, email })
    return { success: true, id }
})

// POST /api/user/logout
k.api.post('logout', () => {
    k.session.remove('userId')
    return { success: true }
})
```

### 页面路由示例

```html
<!-- page/index.html -->
<!-- @k-url / -->

<script env="server">
    k.state.set('title', '首页')
</script>

<h1>{{ k.state.get('title') }}</h1>
```

```html
<!-- page/products.html -->
<!-- @k-url /products/{category} -->

<script env="server">
    const category = k.state.get('category')
    const products = k.DB.sqlite.products.findAll({ category })

    k.state.set('products', products)
</script>

<div>
    <h1>分类: {{ k.state.get('category') }}</h1>
    <ul>
        <li v-for="product in {{ JSON.stringify(k.state.get('products')) }}">
            {{ product.name }}
        </li>
    </ul>
</div>
```

---

## 快速索引

| 类型 | 语法 | 示例 |
|------|------|------|
| 首页 | `<!-- @k-url / -->` | page/index.html |
| 页面路由 | `<!-- @k-url /path -->` | page/products.html |
| 动态路由 | `<!-- @k-url /path/{param} -->` | page/user/{id} |
| API 路由 | `// @k-url /api/path/{action}` | api/user.ts |
| Query 参数 | `{paramName}={value}` | /api/user?id=123 |
