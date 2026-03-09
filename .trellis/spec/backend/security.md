# Kooboo 安全与网络

> 涵盖 `k.security`（安全加密）、`k.net`（网络请求）、`k.mail`（邮件发送）、`k.site`（网站信息）四个模块。

---

## 目录

- [k.security](#ksecurity--安全加密) - 安全加密
- [k.net](#knet--网络请求) - 网络请求
- [k.mail](#kmail--邮件发送) - 邮件发送
- [k.site](#ksite--网站信息) - 网站信息
- [完整示例](#完整示例) - 综合示例

---

## k.security — 安全加密

### 哈希

```javascript
// MD5 哈希
const md5Hash = k.security.md5('password')
// 输出: 5f4dcc3b5aa765d61d8327deb882cf99

// SHA256 哈希
const sha256Hash = k.security.sha256('password')
// 输出: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8

// SHA512 哈希
const sha512Hash = k.security.sha512('password')
```

### 加密/解密

```javascript
// AES 加密
const encrypted = k.security.encrypt('Hello World', 'my-secret-key')
// 输出: base64 编码的加密字符串

// AES 解密
const decrypted = k.security.decrypt(encrypted, 'my-secret-key')
// 输出: Hello World
```

### Base64

```javascript
// 编码
const encoded = k.security.toBase64('Hello World')
// 输出: SGVsbG8gV29ybGQ=

// 解码
const decoded = k.security.decodeBase64(encoded)
// 输出: Hello World
```

### JWT

```javascript
// 生成 JWT
const token = k.security.jwt.encode({ userId: 123, role: 'admin' })
// 输出: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 解析 JWT（重要：返回的是 JSON 字符串，需要 JSON.parse）
const resultString = k.security.jwt.decode(token)
const result = JSON.parse(resultString)

// 成功时: { code: 0, value: { userId: 123, role: 'admin', iat: ..., exp: ... } }
// 失败时: { code: 1, value: "error message" }
```

> **注意**：`decode()` 返回的是 JSON 字符串，必须使用 `JSON.parse()` 解析。
> 成功时 `result.code === 0`，payload 在 `result.value` 中。

### 随机字符串

```javascript
// 生成随机字符串
const randomStr = k.security.random(16)
// 输出: a8f5f167f44d496e

// 生成随机 UUID
const uuid = k.security.uuid()
// 输出: 550e8400-e29b-41d4-a716-446655440000
```

---

## k.net — 网络请求

> 使用 `k.net.httpClient` 进行代理转发请求。

### 基础请求

```javascript
// GET 请求
const response = k.net.httpClient.send('https://api.example.com/data', 'GET')
const body = response.bodyString()
const statusCode = response.statusCode

// POST JSON
const content = k.net.httpClient.createJsonContent({
    name: 'John',
    email: 'john@example.com'
})
const response = k.net.httpClient.send('https://api.example.com/create', 'POST', content)

// POST 表单
const formContent = k.net.httpClient.createFormUrlEncodedContent({
    name: 'John',
    message: 'Hello'
})
const response = k.net.httpClient.send('https://api.example.com/submit', 'POST', formContent)

// PUT 请求
const response = k.net.httpClient.send('https://api.example.com/update/1', 'PUT', content)

// DELETE 请求
const response = k.net.httpClient.send('https://api.example.com/delete/1', 'DELETE')

// 带请求头
const response = k.net.httpClient.send(
    'https://api.example.com/data',
    'GET',
    undefined,
    { 'Authorization': 'Bearer token' }
)

// 带超时（30秒）
const response = k.net.httpClient.send(
    'https://api.example.com/data',
    'GET',
    undefined,
    undefined,
    30000
)
```

### 文件上传

```javascript
// POST multipart 表单（支持文件上传）
const multipartContent = k.net.httpClient.createMultipartFormDataContent()
multipartContent.add('name', 'jobs')
multipartContent.addFile('file', 'image.png', k.file.readBinary('image.png'))

const response = k.net.httpClient.send('https://api.example.com/upload', 'POST', multipartContent)
const result = response.bodyString()
```

### 批量请求

```javascript
// 批量请求
const batchRequest = k.net.httpClient.createBatchRequest()

const task1 = batchRequest.addTask('https://example.com/1.png', 'GET')
task1.responseType = 'File'
task1.savePath = 'images/1.png'

const task2 = batchRequest.addTask('https://example.com/info.json', 'GET')
task2.responseType = 'String'

k.net.httpClient.send(batchRequest)

// 获取结果
const isSuccess = task1.isSuccess
const errorMessage = task1.errorMessage
const fileResult = task1.fileResult
const stringResult = task2.stringResult
```

### 响应处理

```javascript
const response = k.net.httpClient.send('https://api.example.com/data', 'GET')

// 响应状态码
const status = response.statusCode

// 响应头
const contentType = response.getHeader('content-type')

// 响应体（字符串）
const body = response.bodyString()

// 响应体（二进制）
const binary = response.bodyBinary()

// 保存到文件
const fileInfo = response.save('path/to/save/file.txt')
const fileInfo = response.saveBinary('path/to/save/image.png')
```

---

## k.mail — 邮件发送

### SMTP 发送

```javascript
// 创建 SMTP 服务器配置
const server = k.mail.createSmtpServer()
server.host = 'smtp.qq.com'           // 服务器地址
server.port = 465                     // 端口（SSL 通常使用 465）
server.ssl = true                     // 是否启用 SSL
server.username = 'your-email@qq.com' // 用户名
server.password = 'your-auth-code'    // SMTP 授权码

// 创建邮件
const msg = k.mail.createMessage()

// 设置发件人
msg.from = 'your-email@qq.com'

// 设置收件人
msg.to = 'user@example.com'
// 多个收件人用逗号分隔
// msg.to = 'user1@example.com, user2@example.com'

// 设置主题
msg.subject = '欢迎注册'

// 设置正文（纯文本）
msg.body = '欢迎加入我们的网站！'

// 或设置 HTML 正文
msg.htmlBody = '<h1>欢迎</h1><p>欢迎加入我们的网站！</p>'

// 发送邮件
k.mail.smtp.send(server, msg)
```

### 完整示例

```typescript
// services/send-email.ts
export function sendEmailCode(email: string, code: string) {
    const emailContent = `
    <div style="font-family: Arial, sans-serif;">
        <h1>验证码</h1>
        <p>您好！您正在进行邮箱验证，验证码为：</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${code}
        </div>
        <p>验证码有效期为5分钟，请及时使用。</p>
    </div>
    `

    const server = k.mail.createSmtpServer()
    server.host = ENV.EMAIL_HOST
    server.port = ENV.EMAIL_PORT
    server.ssl = true
    server.username = ENV.SENDER_EMAIL
    server.password = ENV.EMAIL_PASSWORD

    const msg = k.mail.createMessage()
    msg.from = ENV.SENDER_EMAIL
    msg.to = email
    msg.subject = '邮箱验证码 - 系统'
    msg.htmlBody = emailContent

    k.mail.smtp.send(server, msg)
}
```

---

## k.site — 网站信息

### 基本信息

```javascript
// 网站 ID
const siteId = k.site.webSite.id

// 网站信息
const info = k.site.info
info.host      // 域名
info.name      // 网站名称
info.baseUrl   // 基础 URL
info.culture   // 当前语言

// 多语言
const currentLang = k.site.multilingual.currentCulture   // 'en'
const availableLangs = k.site.multilingual.cultures      // { "en": "English" }
```

### 资源管理

```javascript
// 页面
k.site.pages.all()
k.site.pages.get('page-id')

// 视图
k.site.views.all()

// 布局
k.site.layouts.all()

// 脚本
k.site.scripts.all()

// 样式
k.site.styles.all()

// 图片/媒体
k.site.images.all()
```

---

## 完整示例

### 调用外部 API

```typescript
// api/fetch-products.ts
k.api.get('fetch-products', () => {
    const response = k.net.httpClient.send(
        'https://api.example.com/products',
        'GET',
        undefined,
        { 'Authorization': 'Bearer ' + k.cookie.get('token') }
    )

    if (response.statusCode !== 200) {
        k.response.statusCode(502)
        return { success: false, message: '获取商品失败' }
    }

    const data = JSON.parse(response.bodyString())
    const products = data.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price
    }))

    return { success: true, data: products }
})
```

### 用户密码处理

```typescript
// 注册时密码哈希
k.api.post('register', (body: any) => {
    const { username, password, email } = body

    // 检查用户是否已存在
    const existing = k.DB.sqlite.users.findOne({ email })
    if (existing) {
        k.response.json({ success: false, message: '邮箱已被注册' })
        return k.api.httpCode(400)
    }

    // MD5 加密
    const passwordHash = k.security.md5(password)

    // 创建用户
    k.DB.sqlite.users.append({
        username,
        email,
        password: passwordHash
    })

    return { success: true, message: '注册成功' }
})

// 登录时验证密码
k.api.post('login', (body: { email: string, password: string }) => {
    const { email, password } = body

    const user = k.DB.sqlite.users.findOne({ email })
    if (!user) {
        return { success: false, message: '用户不存在' }
    }

    const passwordHash = k.security.md5(password)
    if (user.password !== passwordHash) {
        return { success: false, message: '密码错误' }
    }

    // 生成 JWT
    const token = k.security.jwt.encode({
        userId: user._id,
        email: user.email
    })

    return { success: true, token }
})
```

---

## 认证与授权

### JWT + Cookie 认证流程

推荐使用 JWT + Cookie 进行用户认证：

```typescript
// 1. 登录时生成 Token
k.api.post('login', (body: { phone: string; password: string }) => {
    const member = verifyPassword(phone, password)
    if (!member) {
        return { success: false, message: '手机号或密码错误' }
    }

    // 生成 JWT Token
    const token = k.security.jwt.encode({
        memberId: member._id,
        name: member.name,
        phone: member.phone
    })

    // 存入 Cookie（7天有效期）
    k.cookie.set('auth_token', token, 7)

    return { success: true, data: { id: member._id, name: member.name } }
})

// 2. 验证 Token
k.api.get('info', () => {
    const token = k.cookie.get('auth_token')
    if (!token) {
        return { success: false, message: '未登录', code: 401 }
    }

    const result = k.security.jwt.decode(token)
    // result 包含 { memberId, name, phone, iat, exp }

    return { success: true, data: result }
})

// 3. 登出时删除 Cookie
k.api.post('logout', () => {
    k.cookie.remove('auth_token')
    return { success: true }
})
```

### 推荐：使用 AuthService

建议封装认证工具函数：

```typescript
// code/Services/AuthService.ts
import { getMemberById } from 'code/Services/MemberService'

// 生成 Token
export function generateToken(payload: { memberId: string; name: string; phone: string }): string {
    return k.security.jwt.encode(payload)
}

// 验证 Token
export function verifyToken(token: string): { memberId: string; name: string; phone: string } | null {
    try {
        const result = k.security.jwt.decode(token)
        return result as { memberId: string; name: string; phone: string }
    } catch {
        return null
    }
}

// 获取当前登录用户
export function getCurrentMember(): { memberId: string; name: string; phone: string } | null {
    const token = k.cookie.get('auth_token')
    if (!token) return null
    return verifyToken(token)
}

// 登录时写入 Cookie
export function setAuthCookie(payload: { memberId: string; name: string; phone: string }, days: number = 7) {
    const token = generateToken(payload)
    k.cookie.set('auth_token', token, days)
}

// 登出时删除 Cookie
export function clearAuthCookie() {
    k.cookie.remove('auth_token')
}
```

### 使用示例

```typescript
// api/member.ts
import { getCurrentMember, setAuthCookie, clearAuthCookie } from 'code/Services/AuthService'

// 登录
k.api.post('login', (body) => {
    const member = verifyPassword(body.phone, body.password)
    if (!member) {
        return { success: false, message: '手机号或密码错误' }
    }

    // 写入 Cookie
    setAuthCookie({ memberId: member._id, name: member.name, phone: member.phone }, 7)

    return { success: true, data: { id: member._id, name: member.name } }
})

// 需要登录的接口
k.api.get('list', () => {
    const member = getCurrentMember()
    if (!member) {
        return { success: false, message: '未登录', code: 401 }
    }
    // ...
})

// 登出
k.api.post('logout', () => {
    clearAuthCookie()
    return { success: true }
})
```

> **注意**：
> - JWT Token 存储在 Cookie 中，默认会自动发送
> - 需要在 Kooboo 后台启用 JWT 功能：`系统设置 → JWT 设置`
> - Cookie 名称建议使用 `auth_token` 或 `token`

---

## 快速索引

### 安全 (k.security)

| 功能 | API |
|------|-----|
| MD5 | `k.security.md5(str)` |
| SHA256 | `k.security.sha256(str)` |
| AES 加密 | `k.security.encrypt(data, key)` |
| AES 解密 | `k.security.decrypt(encrypted, key)` |
| Base64 编码 | `k.security.toBase64(str)` |
| Base64 解码 | `k.security.decodeBase64(str)` |
| JWT 生成 | `k.security.jwt.encode(payload)` |
| JWT 解析 | `k.security.jwt.decode(token)` |
| 随机字符串 | `k.security.random(len)` |
| UUID | `k.security.uuid()` |

### 网络 (k.net)

| 功能 | API |
|------|-----|
| 发送请求 | `k.net.httpClient.send(url, method, content?, headers?, timeout?)` |
| JSON 内容 | `k.net.httpClient.createJsonContent(body)` |
| 表单内容 | `k.net.httpClient.createFormUrlEncodedContent(body)` |
| Multipart | `k.net.httpClient.createMultipartFormDataContent()` |
| 批量请求 | `k.net.httpClient.createBatchRequest()` |
| 响应字符串 | `response.bodyString()` |
| 响应二进制 | `response.bodyBinary()` |

### 邮件 (k.mail)

| 功能 | API |
|------|-----|
| 创建 SMTP 服务器 | `k.mail.createSmtpServer()` |
| 创建邮件 | `k.mail.createMessage()` |
| 发送邮件 | `k.mail.smtp.send(server, msg)` |
