# Kooboo 后端交付检查清单

> 代码交付前必须检查的项目，确保符合 Kooboo 项目规范。

---

## 目录

- [API 规范检查](#api-规范检查) - API 文件规范
- [数据库规范检查](#数据库规范检查) - 数据库操作规范
- [路由规范检查](#路由规范检查) - 路由定义规范
- [安全规范检查](#安全规范检查) - 安全相关检查
- [代码结构检查](#代码结构检查) - 目录结构规范

---

## API 规范检查

| 检查项 | 说明 | 状态 |
|--------|------|------|
| @k-url 路由声明 | API 文件顶部必须添加 `@k-url` 路由声明 | [ ] |
| 路由格式正确 | 使用 `{action}` 占位符，如 `/api/user/{action}` | [ ] |
| Model 引用路径 | 必须指定文件名，禁止 `code/Models` | [ ] |
| 聚合文件引用 | 有聚合用 `code/Models/index`，无聚合用具体文件名 | [ ] |
| API 合并 | 同一模块的接口应合并在一个文件中 | [ ] |
| Query 参数 | 单资源 id 建议用 query 参数而非路径参数 | [ ] |

### 示例

```typescript
// ✅ 正确
// api/user.ts
// @k-url /api/user/{action}

import { User } from 'code/Models/index'

k.api.get('info', () => {
    const userId = k.request.queryString.userId
    const user = User.findById(userId)
    return { success: true, data: user }
})

// ❌ 错误：缺少 @k-url
import { User } from 'code/Models/index'

k.api.get('info', () => { ... })

// ❌ 错误：Model 引用路径错误
import { User } from 'code/Models'  // 禁止
```

---

## 数据库规范检查

| 检查项 | 说明 | 状态 |
|--------|------|------|
| 主键使用 _id | 使用 `_id` 而非 `id` | [ ] |
| 同步调用 | k_sqlite 是同步的，不需要 await | [ ] |
| Model 定义 | 不需要手动定义 id 字段 | [ ] |
| 关联查询 | 使用 map 而非 Promise.all | [ ] |
| timestamps | 建议添加 `timestamps: true` | [ ] |
| 软删除 | 敏感数据建议启用 `softDelete: true` | [ ] |

### 示例

```typescript
// ✅ 正确
const user = User.findById(userId)
return { id: user._id }

// ❌ 错误：使用了 id 而非 _id
return { id: user.id }

// ✅ 正确：同步调用
const user = User.findById(id)
const users = User.findAll({})

// ❌ 错误：不需要 await
const user = await User.findById(id)
```

---

## 路由规范检查

| 检查项 | 说明 | 状态 |
|--------|------|------|
| 页面路由声明 | index.html 首行必须有 `<!-- @k-url / -->` | [ ] |
| API 路由声明 | API 文件必须有 `// @k-url /api/xxx/{action}` | [ ] |
| 通配路由顺序 | 通配路由必须在具体路由之后 | [ ] |
| 路由命名 | 使用小写和连字符，如 `/user-profile` | [ ] |
| RESTful 风格 | 使用 GET/POST/PUT/DELETE 对应查/增/改/删 | [ ] |

### 首页路由检查

```html
<!-- ✅ 正确：index.html 首行 -->
<!-- @k-url / -->
<!DOCTYPE html>
<html>
...
</html>

<!-- ❌ 错误：缺少路由声明 -->
<!DOCTYPE html>
<html>
...
</html>
```

---

## 安全规范检查

| 检查项 | 说明 | 状态 |
|--------|------|------|
| 密码加密 | 存储密码必须加密（MD5/SHA256） | [ ] |
| SQL 注入 | 使用参数化查询或 ORM，避免拼接 SQL | [ ] |
| JWT 解析 | `jwt.decode()` 返回字符串，必须 JSON.parse 并检查 code | [ ] |
| 敏感信息 | 不要在代码中硬编码密钥/密码 | [ ] |
| CORS | 外部 API 调用注意跨域配置 | [ ] |
| 输入验证 | 接收用户输入时进行验证 | [ ] |

### 示例

```typescript
// ✅ 正确：密码加密存储
const passwordHash = k.security.md5(password)
User.create({ userName, password: passwordHash })

// ❌ 错误：明文存储密码
User.create({ userName, password })

// ✅ 正确：参数化查询
const results = k.DB.sqlite.query('SELECT * FROM users WHERE email = @email', { email: email })

// ❌ 错误：SQL 拼接（可能导致注入）
const results = k.DB.sqlite.query('SELECT * FROM users WHERE email = "' + email + '"')

// ✅ 正确：JWT 解析
const resultStr = k.security.jwt.decode(token)
const result = JSON.parse(resultStr)
if (result.code === 0 && result.value && result.value.memberId) {
    // token 有效
}

// ❌ 错误：直接使用 decode 结果
const payload = k.security.jwt.decode(token)  // 返回的是字符串！
```

---

## 代码结构检查

| 检查项 | 说明 | 状态 |
|--------|------|------|
| 目录结构 | 遵循 page/view/layout/code/api 目录结构 | [ ] |
| code/Services | 业务逻辑必须放在 `code/Services/` | [ ] |
| code/Utils | 通用工具函数放在 `code/Utils/` | [ ] |
| Model 位置 | 数据模型必须放在 `code/Models/` | [ ] |
| 命名约定 | 文件使用 kebar-case，类使用 PascalCase | [ ] |

### 目录结构示例

```
project/
├── page/           # ✅ 正确
├── api/            # ✅ 正确
├── code/
│   ├── Models/     # ✅ 正确
│   │   └── User.ts
│   ├── Services/  # ✅ 正确
│   │   └── AuthService.ts
│   └── Utils/     # ✅ 正确
│       └── ResponseUtils.ts
└── src/            # Kooboo 静态资源
    ├── page/
    ├── css/
    └── js/
```

```typescript
// ❌ 错误：业务逻辑放在 code/ 根目录
// code/auth.ts
export function login() { ... }

// ✅ 正确：业务逻辑放在 code/Services/
// code/Services/AuthService.ts
export function login() { ... }

// ❌ 错误：工具函数放在 code/ 根目录
// code/format.ts
export function formatDate() { ... }

// ✅ 正确：工具函数放在 code/Utils/
// code/Utils/DateUtils.ts
export function formatDate() { ... }
```

---

## 快速检查脚本

可以在项目根目录运行以下命令检查：

```bash
# 检查是否缺少 @k-url 声明
grep -r "^// @k-url" api/ | wc -l

# 检查 index.html 是否有首页声明
grep "@k-url /" src/page/index.html

# 检查是否使用了错误的 Model 引用
grep "from 'code/Models'" api/*.ts
```

---

## 交付前自检清单

- [ ] 所有 API 文件都有 `@k-url` 路由声明
- [ ] 所有 API 文件 Model 引用路径正确
- [ ] 数据库操作使用正确的 `_id` 主键
- [ ] 没有使用 `await` 调用 k_sqlite
- [ ] index.html 有 `<!-- @k-url / -->` 声明
- [ ] 密码已加密存储
- [ ] JWT 解析使用 JSON.parse 并检查 code
- [ ] 目录结构符合规范
- [ ] 业务逻辑放在 `code/Services/` 目录
- [ ] 通用工具函数放在 `code/Utils/` 目录
