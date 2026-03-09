# Kooboo 核心 API

本文档涵盖 Kooboo 最常用的核心 API：`k.request`、`k.response`、`k.session`、`k.cookie`、`k.state`、`k.label`。

---

## k.request — HTTP 请求

获取客户端请求信息。

### 查询参数(params)
注意: 因为是 params, 所以类型必定是 string
```javascript
// 获取单个参数
const id = k.request.queryString.id
const name = k.request.get('name')

// 获取所有参数
const params = k.request.queryString
// { id: '123', name: 'john' }

// 直接从函数中获取
k.api.get((id: string, name: string)=>{
    return { id, name }
})

```

### 表单数据(form)
通常仅在带有 file 的请求时使用
```javascript
// 获取表单提交的数据（表单编码）
const email = k.request.form.email
const password = k.request.form.password

// 获取所有表单数据
const formData = k.request.form
```

### POST/PUT 请求体（JSON）

在 `k.api.post()` 和 `k.api.put()` 回调函数中，有两种方式获取请求体：

```typescript
// 方式一（推荐）：直接在回调函数参数中接收
// @k-url /api/user/{action}

k.api.post('create-user', (body: CreateUserBody) => {
    const { userName, password, email } = body
    return { success: true, data: { userName } }
})

// 方式二：使用 k.request.body（需要自行 JSON.parse）
k.api.post('create-user', () => {
    const bodyStr = k.request.body  // 原始字符串
    const body = JSON.parse(bodyStr) as CreateUserBody  // 手动解析
    const { userName, password, email } = body
    return { success: true, data: { userName } }
})
```

#### 类型声明

建议为 body 参数添加类型声明，提高代码可维护性：

```typescript
// @k-url /api/user/{action}

// 少量字段：行内直接定义类型
k.api.post('login', (body: { userName: string, password: string }) => {
    const { userName, password } = body
    // ...
})

// 字段较多：定义接口
interface CreateUserBody {
    userName: string
    displayName: string
    password: string
    email?: string
    phone?: string
    department?: string
    role?: string
}

k.api.post('create-user', (body: CreateUserBody) => {
    const { userName, displayName, password, email } = body
    // ...
})
```

### 请求信息

```javascript
// HTTP 方法
const method = k.request.method  // 'GET', 'POST', 'PUT', 'DELETE'

// 请求 URL
const url = k.request.url // "/api/test"

// 客户端信息
const ip = k.request.clientIp

// 请求头
const token = k.request.headers.get('Authorization')
```

### 文件上传

```javascript
// 处理文件上传
if (k.request.files && k.request.files.length > 0) {
    const file = k.request.files[0]

    // 保存文件
    file.save('uploads/' + file.fileName)

    // 或获取文件信息
    const fileName = file.fileName
    const binaryData = file.bytes
    const contentType = file.contentType
}
```

---

## k.response — HTTP 响应

设置服务器响应。

### 输出内容

```javascript
// 输出文本
k.response.write('Hello World')

// 输出 JSON
k.response.json({ success: true, data: { id: 1 } })

// 输出 HTML
k.response.write('<h1>Hello</h1>')
k.response.setHeader('Content-Type', 'text/html')
```

### 设置响应头

```javascript
// 设置响应头
k.response.setHeader('Cache-Control', 'no-cache')
k.response.setHeader('Content-Type', 'application/json')

// 设置 CORS 头
k.response.setHeader('Access-Control-Allow-Origin', '*')
k.response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
```

### 重定向

```javascript
// 页面重定向
k.response.redirect('/login')
k.response.redirect('/login?returnurl=' + encodeURIComponent(k.request.url))
```

### 状态码

```javascript
// 设置状态码
k.api.httpCode(400)

// 快速返回 404
k.api.notFound()

// 快速返回 500
k.api.serverError()
```
---

## k.cookie — Cookie 操作

管理客户端 Cookie。

### 设置 Cookie

```javascript
// 设置 Cookie（天数）
k.cookie.set('token', 'abc123', 7)  // 7 天过期

// 按分钟设置
k.cookie.setByMinutes('session', 'xyz', 30)  // 30 分钟

// 设置路径
k.cookie.set('token', 'abc', 7, '/')

// 设置域
k.cookie.set('token', 'abc', 7, '/', '.example.com')
```

### 获取 Cookie

```javascript
const token = k.cookie.get('token')
```

### 删除 Cookie

```javascript
// 方式一
k.cookie.remove('token')
k.cookie.remove('token', '/')

// 方式二
k.cookie.set('token', '', -1)  // 立即过期
```

### 获取所有 Cookie 键

```javascript
const keys = k.cookie.keys
// ['token', 'userId', 'lang']
```

---

## k.state — 渲染状态(上下文)

在 SSR 模式下设置状态，供模板使用。

### 基本操作

```javascript
// 设置状态（供模板使用）
k.state.set('products', products)
k.state.set('currentUser', user)

// 设置当前项
k.state.setCurrent('product', product)

// 获取状态
const products = k.state.get('products')
```

### 与 clientJS 区别

```javascript
// k.state - 供模板渲染使用
k.state.set('title', '首页')

// k.utils.clientJS - 供客户端 JavaScript 使用
// 约等于在客户端执行 window.products = products
k.utils.clientJS.setVariable('products', products)
```

---

## k.label / k.t — 国际化

处理多语言文本。

### 基本用法

```javascript
// 获取翻译
const title = k.label('page.title')
const welcome = k.label('Welcome')

// 带参数的翻译
const greeting = k.t('Hello {name}', { name: 'John' })
// 输出: Hello John

const count = k.t('{count} items', { count: 5 })
// 输出: 5 items
```

### 在模板中使用

```html
<!-- 直接使用 -->
<!-- 方式一: k-label -->
<!-- 环境要求: 无需声明 env="server" -->
<h1 k-label="page.title"></h1>

<!-- 方式二: k.t() (推荐) -->
<!-- 环境要求: 需要声明 env="server" -->
<h1>{{ k.t('page.title')}}</h1>

<!-- 动态键 -->
<input :placeholder="k.t('Name')" >
```

---

## k.utils — 工具函数

### clientJS 客户端交互

```javascript
// 设置客户端变量（服务端）
// 约等于在客户端执行 window.config = { apiUrl: '/api', theme: 'dark' }
// 环境要求: 需要声明 env="server"
// 注意: serVariable 的值必须是一个对象或者数组, 不能是函数或者简单数据类型
k.utils.clientJS.setVariable('config', {
    apiUrl: '/api',
    theme: 'dark'
})

// 在客户端访问
window.config  // { apiUrl: '/api', theme: 'dark' }
```

---

## 常用组合示例

### 登录检查

```javascript
// page 顶部检查登录
<script env="server" type="module">
    if (!k.cookie.get('token')) {
        k.response.redirect('/login?returnurl=' + encodeURIComponent(k.request.url))
        return
    }
</script>
```

### API 响应封装

```javascript
// api/user.ts
k.api.get('info', (userId: string) => {
    const user = k.DB.sqlite.users.findOne({ id: userId })
    if (!user) {
        k.response.statusCode(401)
        return { success: false, message: '未登录' }
    }
    return { success: true, data: user }
})
```

### 文件上传处理

```javascript
// api/upload.ts
k.api.post('upload', () => {
    if (!k.request.files || k.request.files.length === 0) {
        k.response.statusCode(400)
        return { success: false, message: '没有上传文件' }
    }

    const file = k.request.files[0]
    const fileName = Date.now() + '_' + file.fileName
    file.save('uploads/' + fileName)

    return { success: true, url: '/media/uploads/' + fileName }
})
```

---

## ⚠️ API 文件规范

### 1. 必须添加 @k-url 路由声明 (kooboo cli 语法)

API 文件顶部必须使用 `@k-url` 声明路由：

```typescript
// @k-url /api/user/{action}
import { User } from 'code/Models/User'

k.api.get('user-info', () => {
    // ...
})
```

动态路由使用 `{action}` 占位：

```typescript
// @k-url /api/menu/{action}
```

### 2. 正确的 Model 引用路径

引用 Model 时**禁止**使用 `code/Models`（无文件名）。有聚合时用聚合文件路径（如 `code/Models/index`），无聚合时直接引用具体模型文件（如 `code/Models/User`）：

```typescript
// ✅ 正确：有聚合
import { User } from 'code/Models/index'
import { Menu, MenuItem } from 'code/Models/index'

// ✅ 正确：无聚合，直接引用具体文件
import { User } from 'code/Models/User'

// ❌ 错误：禁止无文件名
import { User } from 'code/Models'

// ❌ 错误：不要使用相对路径
import { User } from '../code/Models'
```

### 3. 同一模块 API 合并在一个文件

同一模块的多个接口应放在一个 api 文件中，使用 `@k-url /api/模块名/{action}`，文件内多个 `k.api.get/post('actionName', ...)`。不要按 action 拆成多个文件（如 api/order-list.ts、api/order-create.ts）。

### 4. 单资源 id 建议用 query 参数

类似 id 的单资源标识建议使用 query 参数（如 `@k-url /api/order?id={id}`），在 handler 内通过 `k.request.queryString.id` 获取；避免使用路径参数 `/{id}`。

### 5. API 端点调用示例

```typescript
// @k-url /api/user/{action}
import { User, Menu, MenuItem } from 'code/Models/index'

// GET 请求（userId 通过 query 传入，建议单资源 id 用 query）
k.api.get('user-info', (userId: string) => {
    const user = User.findById(userId)
    return { success: true, data: user }
})

// 或从 query 显式读取
k.api.get('user-info', () => {
    const userId = k.request.queryString.userId
    const user = User.findById(userId)
    return { success: true, data: user }
})

// POST 请求
k.api.post('user-login', (body) => {
    const { userName, password } = body
    
    const user = User.findOne({ userName })
    if (!user) {
        return { success: false, message: '用户不存在' }
    }
    
    k.session.set('userId', user._id)
    return { success: true, data: { id: user._id } }
})
```

---

## 快速索引

| API | 用途 |
|-----|------|
| k.request | 获取请求参数、表单、文件 |
| k.response | 输出内容、JSON、重定向 |
| k.session | 服务端会话存储 |
| k.cookie | 客户端 Cookie |
| k.state | 模板渲染状态 |
| k.label / k.t | 国际化 |
| k.utils.clientJS | 客户端变量传递 |
