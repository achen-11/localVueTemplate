# Kooboo 核心 API

> Kooboo 后端开发最常用的核心 API：`k.request`、`k.response`、`k.cookie`、`k.state`、`k.label`。

---

## 目录

- [k.request](#krequest--http-请求) - HTTP 请求
- [k.response](#kresponse--http-响应) - HTTP 响应
- [k.cookie](#kcookie--cookie-操作) - Cookie 操作
- [k.state](#kstate--渲染状态) - 渲染状态
- [k.label / k.t](#klabel--kt--国际化) - 国际化
- [k.utils](#kutils--工具函数) - 工具函数

---

## k.request — HTTP 请求

获取客户端请求信息。

### 查询参数 (queryString)

```typescript
// 获取单个参数
const id = k.request.queryString.id  // 类型: string | undefined
const name = k.request.get('name')    // 类型: string | undefined

// 获取所有参数
const params = k.request.queryString
// { id: '123', name: 'john' }

// 直接从函数参数中获取
k.api.get('get-user', (id: string, name: string) => {
    return { id, name }
})
```

> 注意：queryString 的值类型一定是字符串 string，因为 URL 参数格式为 `?id=xxx`

### 查询参数类型安全

由于 TypeScript 无法自动推断 queryString 的类型，需要进行类型转换：

```typescript
// 方式一（推荐）：使用 k.request.get() + 类型转换
const cardId = k.request.get('id') || ''                    // 字符串
const page = +(k.request.get('page')) || 1                 // 数字（+ 号转数字）
const isActive = k.request.get('active') === 'true'        // 布尔

// 方式二：类型断言
const query = k.request.queryString as unknown as { id: string }
const cardId = query.id

// 方式三：解构并添加默认值
const { id, type } = k.request.queryString as any
```

> **重要**：
> - `k.request.get('xxx')` 返回 `string | undefined`
> - 必须处理可能为 undefined 的情况，使用 `|| ''` 或 `|| 默认值`
> - 数字转换使用 `+` 前缀，如 `+(k.request.get('page'))`

### 表单数据 (form)

通常仅在带有文件上传的请求时使用。

```javascript
// 获取表单提交的数据
const email = k.request.form.email
const password = k.request.form.password

// 获取所有表单数据
const formData = k.request.form
```

### POST/PUT 请求体 (JSON)

在 `k.api.post()` 和 `k.api.put()` 回调中有两种方式获取请求体：

```typescript
// 方式一（推荐）：直接在回调函数参数中接收
// @k-url /api/user/{action}

k.api.post('create-user', (body: CreateUserBody) => {
    const { userName, password, email } = body
    return { success: true, data: { userName } }
})

// 方式二：使用 k.request.body（需要自行 JSON.parse）
k.api.post('create-user', () => {
    const bodyStr = k.request.body
    const body = JSON.parse(bodyStr) as CreateUserBody
    const { userName, password, email } = body
    return { success: true, data: { userName } }
})
```

#### 类型声明建议

```typescript
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
const url = k.request.url  // "/api/test"

// 客户端 IP
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

// 输出 JSON（推荐）
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
// 设置 Cookie（按天数）
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

// 方式二：设置为已过期
k.cookie.set('token', '', -1)
```

### 获取所有 Cookie 键

```javascript
const keys = k.cookie.keys
// ['token', 'userId', 'lang']
```

---

## k.state — 渲染状态

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
<!-- 方式一：k-label（无需声明 env="server"） -->
<h1 k-label="page.title"></h1>

<!-- 方式二：k.t()（需要声明 env="server"） -->
<h1>{{ k.t('page.title') }}</h1>

<!-- 动态键 -->
<input :placeholder="k.t('Name')">
```

---

## k.utils — 工具函数

### clientJS 客户端交互

```javascript
// 设置客户端变量（服务端）
// 约等于 window.config = { apiUrl: '/api', theme: 'dark' }
// 注意：setVariable 的值必须是对象或数组，不能是函数或简单类型
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

```html
<!-- page 顶部检查登录 -->
<script env="server" type="module">
    if (!k.cookie.get('token')) {
        k.response.redirect('/login?returnurl=' + encodeURIComponent(k.request.url))
        return
    }
</script>
```

### API 响应封装

```typescript
// api/user.ts
k.api.get('info', (userId: string) => {
    const user = k.DB.sqlite.users.findOne({ _id: userId })
    if (!user) {
        k.response.statusCode(401)
        return { success: false, message: '未登录' }
    }
    return { success: true, data: user }
})
```

### 文件上传处理

```typescript
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

## 快速索引

| API | 用途 |
|-----|------|
| `k.request.queryString` | 获取 URL 查询参数 |
| `k.request.form` | 获取表单数据 |
| `k.request.body` | 获取 POST/PUT 请求体 |
| `k.request.files` | 获取上传文件 |
| `k.response.json()` | 输出 JSON |
| `k.response.redirect()` | 重定向 |
| `k.cookie.set/get` | Cookie 操作 |
| `k.state.set/get` | 模板渲染状态 |
| `k.label / k.t` | 国际化 |
| `k.utils.clientJS` | 客户端变量 |
