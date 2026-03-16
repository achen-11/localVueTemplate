# Auth Case 规范 — 用户认证流程标准

> 本文档定义 Kooboo 后端用户认证的标准实现案例，涵盖密码登录、短信/邮箱验证码登录、注册、忘记密码等核心场景。

---

## 目录

- [架构概述](#架构概述)
- [目录结构](#目录结构)
- [密码登录流程](#密码登录流程)
- [验证码登录流程](#验证码登录流程)
- [注册流程](#注册流程)
- [忘记密码流程](#忘记密码流程)
- [检查清单](#检查清单)
- [常见错误处理](#常见错误处理)

---

## 架构概述

### 认证方式

| 方式 | 说明 | 适用场景 |
|------|------|----------|
| 密码登录 | 账号 + MD5 哈希密码 | 常规登录 |
| 短信验证码 | 手机号 + 6位数字验证码 | 免密登录 |
| 邮箱验证码 | 邮箱 + 6位数字验证码 | 免密登录 |
| 用户名注册 | 用户名 + 密码 | 传统注册 |

### 核心组件

```
src/
├── api/forum/auth.ts          # API 路由层
├── code/
│   ├── Models/Forum_User.ts  # 用户 Model
│   ├── Services/auth.ts      # 认证 Service
│   └── Utils/ENV.ts          # 环境配置
```

---

## 目录结构

### API 层 (`src/api/`)

```typescript
// src/api/forum/auth.ts
// @k-url /api/forum/auth/{action}

import { login, register, sendVerificationCode, ... } from "code/Services/auth";
import { successResponse, failResponse } from "code/Utils/ResponseUtils";

// 登录
k.api.post('login', (body) => { ... })

// 发送验证码
k.api.post('send-code', (body) => { ... })

// 注册
k.api.post('register', (body) => { ... })

// 重置密码
k.api.post('reset-password', (body) => { ... })

// 退出登录
k.api.post('logout', () => { ... })

// 获取当前用户
k.api.get('me', () => { ... })
```

### Service 层 (`code/Services/`)

```typescript
// code/Services/auth.ts
// 导出函数：
// - login()          登录
// - register()       注册
// - sendVerificationCode()  发送验证码
// - verifyVerificationCode() 验证验证码
// - resetPassword()  重置密码
// - logout()         退出登录
// - getCurrentUser() 获取当前用户
// - validateAuthToken() 验证 Token
```

---

## 密码登录流程

### 流程图

```
前端                          后端
  │                             │
  ├──── POST /api/auth/login ───┤
  │   {account, password}       │
  │                             │
  │                     验证账号格式
  │                     验证密码(MD5)
  │                     生成 JWT
  │                     设置 Cookie
  │                             │
  │<─── {token, userInfo} ─────┤
```

### API 定义

```typescript
// 请求
k.api.post('login', (body: {
  account: string;           // 手机号/邮箱/用户名
  password?: string;          // 密码（密码模式）
  verificationCode?: string;  // 验证码（验证码模式）
  loginMode: 'password' | 'code';
  isRemember?: boolean;       // 是否记住登录（30天）
}) => { ... })

// 响应
{
  success: true,
  data: {
    token: "eyJhbG...",
    userId: "xxx",
    name: "用户名",
    phone: "13800138000",
    email: "user@example.com"
  }
}
```

### Service 实现

```typescript
// code/Services/auth.ts
export function login(body: {
  account: string
  password?: string
  verificationCode?: string
  loginMode: 'password' | 'code'
  isRemember?: boolean
}) {
  const { account, password, loginMode, isRemember = false } = body

  // 1. 验证账号格式
  const accountType = getAccountType(account)
  if (!accountType) {
    throw new Error('请输入正确的手机号、邮箱或用户名')
  }

  if (loginMode === 'password') {
    // 2. 密码登录
    const md5Password = k.security.md5(password.trim())

    // 3. 查找用户
    const user = findUserByAccount(account, accountType)
    if (!user || user.password !== md5Password) {
      throw new Error('账号或密码错误')
    }

    // 4. 更新最后登录时间
    Forum_User.updateById(user._id, { lastLoginAt: Date.now() })

    // 5. 签发 Token
    return issueToken(user, isRemember)
  }
  // ... 验证码登录见下文
}
```

### 关键点

| 要点 | 说明 |
|------|------|
| 账号格式验证 | 自动识别手机号/邮箱/用户名 |
| 密码存储 | MD5 哈希存储，禁止明文 |
| Token 签发 | JWT + Cookie，区分记住/不记住 |
| 错误信息 | 统一返回"账号或密码错误"（防枚举） |

---

## 验证码登录流程

### 流程图

```
前端                          后端
  │                             │
  ├──── POST /api/auth/send-code ┤
  │   {account, accountType}    │
  │                             │ 生成6位验证码
  │                             │ 缓存到 k.cache
  │                             │ 发送短信/邮件
  │                             │
  │<──── {message} ─────────────┤
  │                             │
  ├──── POST /api/auth/login ───┤
  │   {account, verificationCode}│
  │                             │ 验证验证码
  │                             │ 查找用户
  │                             │ 生成 JWT
  │                             │
  │<─── {token, userInfo} ─────┤
```

### 验证码类型

| codeType | 说明 | 验证码有效期 |
|----------|------|-------------|
| login | 登录验证码 | 5分钟 |
| register | 注册验证码 | 5分钟 |
| forgot | 忘记密码验证码 | 5分钟 |

### 发送验证码 API

```typescript
k.api.post('send-code', (body: {
  account: string;           // 手机号/邮箱
  accountType: 'phone' | 'email';
  codeType: 'login' | 'register' | 'forgot';
}) => { ... })
```

### 验证码发送实现

```typescript
export function sendVerificationCode(body: {
  accountType: 'phone' | 'email'
  account: string
  codeType: 'login' | 'register' | 'forgot'
}) {
  const { accountType, account, codeType } = body

  // 1. 验证账号格式
  if (accountType === 'phone' && !isPhone(account)) {
    throw new Error('请输入正确的手机号')
  }
  if (accountType === 'email' && !isEmail(account)) {
    throw new Error('请输入正确的邮箱地址')
  }

  // 2. 检查账号存在性（根据 codeType）
  const existing = findUserByAccount(account, accountType)
  if (codeType === 'login' || codeType === 'forgot') {
    if (!existing) {
      throw new Error(
        accountType === 'phone' ? '该手机号尚未注册' : '该邮箱尚未注册'
      )
    }
  }
  if (codeType === 'register' && existing) {
    throw new Error(accountType === 'phone' ? '手机号已存在' : '该邮箱已注册')
  }

  // 3. 检查发送频率（60秒冷却）
  const lastSent = k.cache.get(`forum_verify_time_${accountType}_${account}`)
  if (lastSent && Date.now() - lastSent < 60000) {
    throw new Error('验证码发送过于频繁，请稍后再试')
  }

  // 4. 生成 6 位验证码
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

  // 5. 缓存验证码（5分钟有效期）
  const TTL = 300 // 5 * 60 秒
  k.cache.set(cacheKey(accountType, account), verificationCode, TTL)
  k.cache.set(`forum_verify_time_${accountType}_${account}`, Date.now(), 60)

  // 6. 发送验证码
  if (accountType === 'phone') {
    k.sms.aliSMS.send(ENV.SMS_TEMPLATE_ID, '+86' + account, { code: verificationCode })
  } else {
    sendEmailCode(account, verificationCode)
  }

  return { message: '验证码已发送到您的' + (accountType === 'phone' ? '手机号' : '邮箱') }
}
```

### 验证码登录实现

```typescript
if (loginMode === 'code') {
  // 1. 验证验证码
  const code = k.cache.get(cacheKey(accountType, account))
  if (!code || code !== verificationCode.trim()) {
    throw new Error('验证码错误或已过期')
  }

  // 2. 验证成功后删除验证码（可选，取决于 ENV.VERIFY_CODE_ONE_TIME）
  if (ENV.VERIFY_CODE_ONE_TIME) {
    k.cache.remove(cacheKey(accountType, account))
  }

  // 3. 查找用户
  const user = findUserByAccount(account, accountType)
  if (!user) {
    throw new Error('账号不存在')
  }

  // 4. 签发 Token
  return issueToken(user, isRemember)
}
```

---

## 注册流程

### 流程图

```
前端                          后端
  │                             │
  ├──── POST /api/auth/send-code ┤  (手机/邮箱注册时)
  │   {account, accountType=phone, codeType=register}
  │                             │ 验证格式+检查存在
  │                             │ 生成+缓存验证码
  │                             │ 发送验证码
  │<──── {message} ─────────────┤
  │                             │
  ├──── POST /api/auth/register ─┤
  │   {userName?, phone?, email?, password, verificationCode, accountType}
  │                             │ 验证密码强度
  │                             │ 验证验证码
  │                             │ 检查账号存在
  │                             │ 创建用户(MD5密码)
  │                             │
  │<─── {token, userInfo} ─────┤
```

### API 定义

```typescript
k.api.post('register', (body: {
  userName?: string;         // 用户名（用户名注册时必填）
  phone?: string;            // 手机号（手机注册时必填）
  email?: string;            // 邮箱（邮箱注册时必填）
  password: string;          // 密码
  verificationCode?: string; // 验证码（手机/邮箱注册时必填）
  accountType: 'username' | 'phone' | 'email';
}) => { ... })
```

### Service 实现

```typescript
export function register(body: {
  userName?: string
  phone?: string
  email?: string
  password: string
  verificationCode: string
  accountType: 'username' | 'phone' | 'email'
}) {
  // 1. 验证密码强度
  const pwd = password.trim()
  if (pwd.length < 6) throw new Error('密码长度至少6位')
  if (pwd.length > 20) throw new Error('密码长度不能超过20位')

  // 2. 验证账号格式
  let normalizedAccount = ''
  if (accountType === 'phone') {
    if (!isPhone(phone)) throw new Error('请输入正确的手机号')
    normalizedAccount = phone.trim()
  } else if (accountType === 'email') {
    if (!isEmail(email)) throw new Error('请输入正确的邮箱地址')
    normalizedAccount = email.trim().toLowerCase()
  } else {
    if (!isUserName(userName)) throw new Error('请输入2-20位字母数字下划线组成的用户名')
    normalizedAccount = userName.trim()
  }

  // 3. 验证码验证（用户名注册不需要）
  if (accountType !== 'username') {
    const key = cacheKey(accountType, normalizedAccount)
    const stored = k.cache.get(key)
    if (!stored || stored !== verificationCode.trim()) {
      throw new Error('验证码错误或已过期')
    }
    // 验证成功后删除验证码
    if (ENV.VERIFY_CODE_ONE_TIME) {
      k.cache.remove(key)
    }
  }

  // 4. 检查账号是否已存在
  const existing = findUserByAccount(normalizedAccount, accountType)
  if (existing) {
    throw new Error(
      accountType === 'phone' ? '手机号已存在' :
      accountType === 'email' ? '该邮箱已注册' : '用户名已存在'
    )
  }

  // 5. 创建用户
  const md5Password = k.security.md5(pwd)
  const createData: any = {
    userName: normalizedAccount,
    displayName: normalizedAccount,
    password: md5Password,
  }
  if (accountType === 'phone') createData.phone = normalizedAccount
  if (accountType === 'email') createData.email = normalizedAccount

  const id = Forum_User.create(createData)

  // 6. 签发 Token
  return issueToken(Forum_User.findById(id), false)
}
```

---

## 忘记密码流程

### 流程图

```
前端                          后端
  │                             │
  ├──── POST /api/auth/send-code ┤
  │   {account, accountType, codeType=forgot}
  │                             │ 验证格式+检查存在
  │                             │ 生成+缓存验证码
  │                             │ 发送验证码
  │<──── {message} ─────────────┤
  │                             │
  ├──── POST /api/auth/reset-password ┤
  │   {account, accountType, newPassword, verificationCode}
  │                             │ 验证验证码
  │                             │ 验证新密码强度
  │                             │ 更新密码(MD5)
  │                             │
  │<──── {success} ────────────┤
```

### API 定义

```typescript
k.api.post('reset-password', (body: {
  account: string;           // 手机号/邮箱/用户名
  accountType: 'phone' | 'email' | 'username';
  newPassword: string;       // 新密码
  verificationCode: string;  // 验证码
}) => { ... })
```

### Service 实现

```typescript
export function resetPassword(body: {
  account: string
  accountType: 'phone' | 'email' | 'username'
  newPassword: string
  verificationCode: string
}) {
  const { account, accountType, newPassword, verificationCode } = body

  // 1. 验证新密码强度
  const pwd = newPassword.trim()
  if (pwd.length < 6) throw new Error('密码长度至少6位')
  if (pwd.length > 20) throw new Error('密码长度不能超过20位')

  // 2. 验证验证码
  const key = cacheKey(accountType, account)
  const stored = k.cache.get(key)
  if (!stored || stored !== verificationCode.trim()) {
    throw new Error('验证码错误或已过期')
  }
  if (ENV.VERIFY_CODE_ONE_TIME) {
    k.cache.remove(key)
  }

  // 3. 查找用户
  const user = findUserByAccount(account, accountType)
  if (!user) throw new Error('账号不存在')

  // 4. 更新密码
  Forum_User.updateById(user._id, {
    password: k.security.md5(pwd)
  })

  return { success: true }
}
```

---

## 检查清单

### 开发检查项

- [ ] **API 层**
  - [ ] API 路由定义在 `src/api/` 目录
  - [ ] 使用 `@k-url /api/xxx/{action}` 声明路由
  - [ ] 使用 `successResponse` / `failResponse` 包装响应
  - [ ] 所有异常都被 try-catch 捕获

- [ ] **参数验证**
  - [ ] 账号格式验证（手机号、邮箱、用户名）
  - [ ] 密码长度验证（6-20位）
  - [ ] 必填字段检查
  - [ ] 验证码格式验证（6位数字）

- [ ] **安全检查**
  - [ ] 密码使用 MD5 哈希存储
  - [ ] 禁止明文存储密码
  - [ ] 验证码有有效期限制（5分钟）
  - [ ] 验证码有发送频率限制（60秒）
  - [ ] 验证码一次有效（可选）
  - [ ] Token 有过期时间
  - [ ] 记住登录和默认登录区分过期时间
  - [ ] 错误信息不暴露账号存在性

- [ ] **Service 层**
  - [ ] 认证逻辑封装在 Service 层
  - [ ] 登录后更新最后登录时间
  - [ ] 注册/重置密码后删除已使用的验证码

- [ ] **验证码功能**
  - [ ] 发送验证码前验证账号格式
  - [ ] 根据 codeType 检查账号存在性
  - [ ] 限制发送频率（防刷）
  - [ ] 验证码缓存使用 k.cache
  - [ ] 区分手机号和邮箱的缓存 key

- [ ] **Token 管理**
  - [ ] 使用 JWT 生成 Token
  - [ ] Token 存入 Cookie
  - [ ] 支持设置 Token 过期时间
  - [ ] 获取用户信息时排除密码字段

### 代码质量检查

- [ ] TypeScript 类型完整
- [ ] 错误信息中英文统一
- [ ] 无硬编码配置（使用 ENV）
- [ ] 代码复用（提取公共函数）

---

## 常见错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 账号格式错误 | 返回"请输入正确的手机号、邮箱或用户名" |
| 密码错误 | 返回"账号或密码错误"（不暴露账号是否存在） |
| 验证码错误/过期 | 返回"验证码错误或已过期" |
| 验证码发送过于频繁 | 返回"验证码发送过于频繁，请稍后再试"（60秒冷却） |
| 账号已存在 | 根据场景返回对应信息 |
| 账号不存在 | 根据场景返回对应信息 |
| Token 过期 | 返回 401，前端跳转登录页 |

---

## 参考实现

完整实现参考本项目代码：

- **API 层**: [src/api/forum/auth.ts](../../../src/api/forum/auth.ts)
- **Service 层**: [src/code/Services/auth.ts](../../../src/code/Services/auth.ts)
- **Model**: [src/code/Models/Forum_User.ts](../../../src/code/Models/Forum_User.ts)

---

## 相关配置

### ENV 变量

| 变量 | 说明 | 示例 |
|------|------|------|
| VERIFY_CODE_ONE_TIME | 验证码一次有效 | `true` |
| MOCK_SMS | 模拟发送短信（测试用） | `true` |
| MOCK_SEND | 模拟发送验证码（测试用） | `true` |
| SMS_TEMPLATE_ID | 阿里云短信模板 ID | `SMS_xxx` |
| EMAIL_HOST | SMTP 服务器地址 | `smtp.qq.com` |
| EMAIL_PORT | SMTP 端口 | `465` |
| EMAIL_SSL | 启用 SSL | `true` |
| SENDER_EMAIL | 发件人邮箱 | `noreply@example.com` |

---

*本文档基于本项目实际代码整理，涵盖用户认证核心场景。*