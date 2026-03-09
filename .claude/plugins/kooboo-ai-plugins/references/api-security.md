# Kooboo 安全、网络、档涵盖 `邮件 API

本文k.security`（安全加密）、`k.net`（网络请求）、`k.mail`（邮件发送）三个模块。

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

// 解析 JWT
const resultString = k.security.jwt.decode(token)
const result = JSON.parse(resultString)
// 输出: { code: 0, value: { userId: 123, role: 'admin', iat: ..., exp: ... } }

```

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

> ⚠️ 使用 `k.net.httpClient`进行代理转发请求。

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

// 带超时
const response = k.net.httpClient.send(
    'https://api.example.com/data',
    'GET',
    undefined,
    undefined,
    30000  // 30秒超时
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
server.host = 'smtp.qq.com'  // 服务器地址
server.port = 465  // 端口（SSL 通常使用 465）
server.ssl = true  // 是否启用 SSL
server.username = 'your-email@qq.com'  // 用户名
server.password = 'your-auth-code'  // SMTP 授权码

// 创建邮件
const msg = k.mail.createMessage()

// 设置发件人
msg.from = 'your-email@qq.com'  // 发件人

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

// 发送邮件（需要传入 server 配置）
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

    // 创建 SMTP 服务器配置
    const server = k.mail.createSmtpServer()
    server.host = ENV.EMAIL_HOST  // 服务器地址
    server.port = ENV.EMAIL_PORT  // 端口
    server.ssl = true  // 是否启用 SSL
    server.username = ENV.SENDER_EMAIL  // 用户名
    server.password = ENV.EMAIL_PASSWORD  // SMTP 授权码

    // 创建邮件
    const msg = k.mail.createMessage()
    msg.from = ENV.SENDER_EMAIL  // 发件人
    msg.to = email  // 收件人
    msg.subject = '邮箱验证码 - 系统'  // 邮件标题
    msg.htmlBody = emailContent  // HTML 内容

    // 发送
    k.mail.smtp.send(server, msg)
}

// 在 API 中调用
k.api.post('send-code', (body: { email: string }) => {
    const { email } = body
    const code = Math.random().toString().slice(-6)  // 生成6位验证码

    sendEmailCode(email, code)

    return { success: true, message: '验证码已发送' }
})
```

---

## k.site — 网站信息

### 基本信息

```javascript
// 网站 ID
const siteId = k.site.webSite.id

// 网站信息
const info = k.site.info
info.host           // 域名
info.name           // 网站名称
info.baseUrl        // 基础 URL
info.culture        // 当前语言

// 多语言
const currentLang = k.site.multilingual.currentCulture // en
const availableLangs = k.site.multilingual.cultures // { "en": "English" }
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

## 完整示例：调用外部 API

```typescript
// api/fetch-products.ts
k.api.get('fetch-products', () => {
    // 从外部 API 获取商品数据
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

    // 处理数据并返回
    const products = data.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price
    }))

    return { success: true, data: products }
})
```

---

## 完整示例：用户密码处理

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

    // md5 加密
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
        k.response.json({ success: false, message: '用户不存在' })
        return k.api.httpCode(401)
    }

    const passwordHash = k.security.md5(password)
    if (user.password !== passwordHash) {
        k.response.json({ success: false, message: '密码错误' })
        return k.api.httpCode(401)
    }

    // 生成 JWT
    const token = k.security.jwt.encode({
        userId: user.id,
        email: user.email
    })

    return { success: true, token }
})
```

---

## 快速索引

### 安全 (k.security)

| 功能 | API |
|------|-----|
| MD5 | `k.security.md5(str)` |
| SHA256 | `k.security.sha256(str)` |
| 加密 | `k.security.encrypt(data, key)` |
| 解密 | `k.security.decrypt(encrypted, key)` |
| Base64 编码 | `k.security.toBase64(str)` |
| Base64 解码 | `k.security.decodeBase64(str)` |
| JWT 生成 | `k.security.jwt.encode(payload)` |
| JWT 解析 | `k.security.jwt.decode(token)` |
| 随机字符串 | `k.security.random(len)` |

### 网络 (k.net)

| 功能 | API |
|------|-----|
| 发送请求 | `k.net.httpClient.send(url, method, content?, headers?, timeout?)` |
| 创建 JSON 内容 | `k.net.httpClient.createJsonContent(body)` |
| 创建表单内容 | `k.net.httpClient.createFormUrlEncodedContent(body)` |
| 创建 multipart | `k.net.httpClient.createMultipartFormDataContent()` |
| 批量请求 | `k.net.httpClient.createBatchRequest()` |
| 响应字符串 | `response.bodyString()` |
| 响应二进制 | `response.bodyBinary()` |

### 邮件 (k.mail)

| 功能 | API |
|------|-----|
| 创建 SMTP 服务器 | `k.mail.createSmtpServer()` |
| 创建邮件 | `k.mail.createMessage()` |
| 发送 | `k.mail.smtp.send(server, msg)` |
