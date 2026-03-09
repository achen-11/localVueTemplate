# 代码示例索引

本文档指向 `data/code-examples.json`，该文件包含 31 个常用代码模式。

---

## 使用方式

当需要常用代码模式时，查阅下方的分类表，找到对应的 pattern name，然后参考 `data/code-examples.json` 中的完整示例。

---

## 分类速查表

### 路由 (routing)

| pattern name | 说明 |
|--------------|------|
| `页面路由定义` | 在 HTML 文件顶部定义 `@k-url` 路由 |

### SSR (ssr)

| pattern name | 说明 |
|--------------|------|
| `SSR 数据获取` | 服务端获取数据并传递给客户端 |
| `客户端 JavaScript 交互` | 服务端和客户端数据传递 |

### API (api)

| pattern name | 说明 |
|--------------|------|
| `GET API 定义` | 定义 GET 类型的 API 端点 |
| `POST API 定义` | 定义 POST 类型的 API 端点 |
| `错误响应` | 返回 HTTP 错误码 (400/401/404/500) |

### Request (request)

| pattern name | 说明 |
|--------------|------|
| `查询参数获取` | 获取 URL 查询参数 |
| `表单数据获取` | 获取表单提交的数据 |
| `请求信息获取` | 获取请求信息（方法、URL、IP、请求头） |
| `文件上传处理` | 处理文件上传 |

### Response (response)

| pattern name | 说明 |
|--------------|------|
| `JSON 响应` | 返回 JSON 格式的响应 |
| `页面重定向` | 重定向到其他页面 |

### Cookie (cookie)

| pattern name | 说明 |
|--------------|------|
| `Cookie 设置` | 设置、获取和删除 Cookie |

### Database (database)

| pattern name | 说明 |
|--------------|------|
| `SQLite 查询` | 执行 SQLite 查询 |
| `k_sqlite ORM` | k_sqlite ORM 数据库操作（同步） |

### File (file)

| pattern name | 说明 |
|--------------|------|
| `文件读取` | 读取文件和获取文件信息 |
| `文件写入` | 写入文本和二进制文件 |

### Content (content)

| pattern name | 说明 |
|--------------|------|
| `内容查询` | 查询内容管理中的数据 |
| `内容增删改` | 内容的创建、更新、删除操作 |

### Commerce (commerce)

| pattern name | 说明 |
|--------------|------|
| `电商商品列表` | 获取商品列表和详情 |
| `购物车操作` | 购物车的增删改查 |

### Net (net)

| pattern name | 说明 |
|--------------|------|
| `外部 API 请求` | 发送 HTTP 请求到外部 API |

### Security (security)

| pattern name | 说明 |
|--------------|------|
| `数据加密` | 数据加密和解密 |
| `Base64 编码` | Base64 编码和解码 |
| `JWT 令牌` | 生成和解析 JWT 令牌 |

### i18n (i18n)

| pattern name | 说明 |
|--------------|------|
| `多语言标签` | 使用国际化标签 |

### Layout (layout)

| pattern name | 说明 |
|--------------|------|
| `布局使用` | 使用 Kooboo 布局系统 |

### View (view)

| pattern name | 说明 |
|--------------|------|
| `视图组件引用` | 引用可复用的视图组件 |

### Mail (mail)

| pattern name | 说明 |
|--------------|------|
| `邮件发送` | 通过 SMTP 发送邮件 |

### Site (site)

| pattern name | 说明 |
|--------------|------|
| `网站信息获取` | 获取当前网站的基本信息 |

### Module (module)

| pattern name | 说明 |
|--------------|------|
| `模块配置` | Kooboo 模块的 Module.config 配置 |

---

## 查找完整示例

### 方式 1：按分类查找

在 `data/code-examples.json` 中，所有 pattern 按 `category` 字段分组：

```json
{
  "patterns": [
    {
      "name": "页面路由定义",
      "category": "routing",
      "example": "<!-- @k-url /products/{category} -->",
      "description": "在 HTML 文件顶部定义页面路由"
    }
  ]
}
```

### 方式 2：按名称搜索

查找 `name` 字段匹配目标模式的示例。

---

## 示例结构

每个 pattern 包含：

| 字段 | 说明 |
|------|------|
| `name` | 模式名称 |
| `category` | 所属分类 |
| `example` | 代码示例 |
| `description` | 简短说明 |

---

## 常用示例快速引用

### 页面路由

```html
<!-- @k-url /products/{category} -->
```

### SSR 数据获取

```html
<script env="server" type="module">
  const products = k.DB.sqlite.products.all()
  k.state.set('products', products)
  k.utils.clientJS.setVariable('products', products)
</script>
```

同一模块的多个 action（如 list、create）应放在一个 api 文件中，使用 `@k-url /api/模块名/{action}`。

### GET API

```typescript
// @k-url /api/products/{action}
k.api.get('list', () => {
  return k.DB.sqlite.products.all()
})
```

### POST API

```typescript
// @k-url /api/orders/{action}
k.api.post('create-order', (body: { productId: string, quantity: number }) => {
  const { productId, quantity } = body
  const order = k.DB.sqlite.orders.add({ productId, quantity })
  return { success: true, orderId: order._id }
})
```

### 使用 k_sqlite ORM（同步操作）

```typescript
// @k-url /api/users/{action}
// 引用 Model：有聚合用 code/Models/index，无聚合用 code/Models/User；禁止 code/Models
import { User } from 'code/Models/index'

// k_sqlite 是同步操作，不需要 await
// userId 建议通过 query 传入（单资源 id 用 query）
k.api.get('user-info', (userId: string) => {
    const user = User.findById(userId)
    
    return { success: true, data: { id: user._id, name: user.userName } }
})

// 少量字段：行内定义类型
k.api.post('login', (body: { userName: string, password: string }) => {
    const { userName, password } = body
    
    const user = User.findOne({ userName })
    return { success: true, data: { id: user._id } }
})

// 字段较多：定义接口
interface CreateUserBody {
    userName: string
    displayName: string
    password: string
    email?: string
}

k.api.post('create-user', (body: CreateUserBody) => {
    const { userName, displayName, password, email } = body
    
    const id = User.create({
        userName,
        displayName,
        password: k.security.password.hash(password),
        email
    })
    
    return { success: true, id }
})
```

### SQLite 查询

```typescript
// 原生 SQL 查询
const results = k.DB.sqlite.query('SELECT * FROM products WHERE price > ?', [100])

// 查询所有
const products = k.DB.sqlite.products.all()

// 按条件查询
const { GT } = k.DB.sqlite.operators()
const products = k.DB.sqlite.products.findAll({
    category: 'electronics',
    price: { [GT]: 100 }
})

// 单条查询
const product = k.DB.sqlite.products.find({ _id: 1 })
```

### 文件读取

```typescript
const content = k.file.read('data/config.json')
const info = k.file.load('image.jpg')
const imageUrl = info.url
```

### 文件写入

```typescript
k.file.write('logs/activity.log', 'User logged in')
k.file.writeBinary('uploads/image.jpg', bytes)
```

### 加密

```typescript
const encrypted = k.security.encrypt(data, key)
const decrypted = k.security.decrypt(encrypted, key)
const hash = k.security.sha256(password)
```

### JWT

```typescript
const token = k.security.jwt.encode({ userId: 123 })
const payloadString = k.security.jwt.decode(token)
const payload = JSON.parse(payloadString)
```

---

## 相关参考

- **API 核心**：`references/api-core.md`
- **数据库**：`references/api-database.md`
- **电商**：`references/api-commerce.md`
- **安全**：`references/api-security.md`
- **路由**：`references/routing.md`
