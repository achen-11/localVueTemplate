# Kooboo 后端开发步骤

> 开发 Kooboo 后端的标准流程,确保代码结构一致。

---

## 目录

- [概述](#概述)
- [第一步:创建数据模型](#第一步创建数据模型)
- [第二步:创建 Services 层](#第二步创建-services-层)
- [第三步:创建 API 端点](#第三步创建-api-端点)
- [开发示例](#开发示例)

---

## 概述

Kooboo 后端遵循四层架构:

```
API 层: api/*.ts - 处理请求/响应
Services 层: code/Services/*.ts - 封装业务逻辑
Utils 层: code/Utils/*.ts - 通用工具函数
Models 层: code/Models/*.ts - 定义数据结构
```

---

## 第一步:创建数据模型

### 1.1 创建 Model 文件

在 `code/Models/` 目录下创建模型文件:

```typescript
// code/Models/Member.ts
import { ksql, DataTypes } from 'module/k_sqlite'

const Member = ksql.define('members', {
    name: { type: DataTypes.String, required: true },
    phone: { type: DataTypes.String, unique: true },
    password: { type: DataTypes.String, required: true },
    email: { type: DataTypes.String },
    status: { type: DataTypes.String, defaultValue: 'active' }
}, { timestamps: true })

export { Member }
```

### 1.2 路径规范

| 类型 | 正确写法 | 错误写法 |
|------|----------|----------|
| Models 导出 | `code/Models/Member` | `./Member` |
| Services 引用 | `code/Services/MemberService` | `../Services/MemberService` |
| API 引用 Models | `code/Models/Member` | `code/Models` |

---

## 第二步:创建 Services 层

### 2.1 为什么要分层

- **API 层**:只负责接收请求、返回响应
- **Services 层**:封装业务逻辑,保持 API 简洁
- **复用性**:业务逻辑可在多个 API 中复用

### 2.2 创建 Service 文件

在 `code/Services/` 目录下创建服务文件:

```typescript
// code/Services/MemberService.ts
import { Member } from 'code/Models/Member'

export function createMember(name: string, phone: string, password: string) {
    // 密码加密
    const passwordHash = k.security.md5(password)

    const id = Member.create({
        name,
        phone,
        password: passwordHash,
        status: 'active'
    })

    return id
}

export function getMemberById(id: string) {
    return Member.findById(id)
}

export function getMemberByPhone(phone: string) {
    const members = Member.findAll({ where: { phone } })
    return members[0] || null
}

export function verifyPassword(phone: string, password: string): boolean {
    const member = getMemberByPhone(phone)
    if (!member) return false

    const passwordHash = k.security.md5(password)
    return member.password === passwordHash
}

export function updateMember(id: string, data: Partial<{ name: string; email: string }>) {
    const member = Member.findById(id)
    if (!member) return false

    Member.update(id, data)
    return true
}
```

---

## 第三步:创建 Utils 工具层(可选)

### 3.1 何时使用 Utils

Utils 层用于存放通用工具函数,当代码中出现重复的工具逻辑时应抽取到 Utils:

- 统一的响应格式
- 日期格式化
- 数据验证
- 字符串处理

### 3.2 创建 Utils 文件

在 `code/Utils/` 目录下创建工具文件:

```typescript
// code/Utils/ResponseUtils.ts
// 统一响应格式

export function success<T = any>(data?: T, message?: string) {
    return {
        success: true,
        message: message || '操作成功',
        data
    }
}

export function fail(message: string, code?: number) {
    return {
        success: false,
        message,
        code
    }
}

export function paginate<T = any>(items: T[], total: number, page: number, pageSize: number) {
    return {
        success: true,
        data: items,
        pagination: { total, page, pageSize }
    }
}
```

---

## 第四步:创建 API 端点

### 3.1 创建 API 文件

在 `api/` 目录下创建 API 文件:

```typescript
// api/member.ts
// @k-url /api/member/{action}

import { createMember, getMemberById, getMemberByPhone, verifyPassword, updateMember } from 'code/Services/MemberService'

// GET /api/member/info
k.api.get('info', () => {
    const memberId = k.request.queryString.id
    if (!memberId) {
        return { success: false, message: '缺少会员ID' }
    }

    const member = getMemberById(memberId)
    if (!member) {
        return { success: false, message: '会员不存在' }
    }

    return { success: true, data: member }
})

// POST /api/member/create
k.api.post('create', (body: { name: string; phone: string; password: string }) => {
    const { name, phone, password } = body

    // 参数验证
    if (!name || !phone || !password) {
        return { success: false, message: '缺少必要参数' }
    }

    // 检查手机号是否已存在
    const existing = getMemberByPhone(phone)
    if (existing) {
        return { success: false, message: '手机号已被注册' }
    }

    const id = createMember(name, phone, password)
    return { success: true, id }
})

// PUT /api/member/update
k.api.put('update', (body: { id: string; name?: string; email?: string }) => {
    const { id, ...updates } = body

    const member = getMemberById(id)
    if (!member) {
        return { success: false, message: '会员不存在' }
    }

    updateMember(id, updates)
    return { success: true }
})
```

### 3.2 API 命名规范

| 方法 | 用途 | 示例 |
|------|------|------|
| `k.api.get` | 查询 | `k.api.get('list')`, `k.api.get('detail')` |
| `k.api.post` | 创建 | `k.api.post('create')`, `k.api.post('login')` |
| `k.api.put` | 更新 | `k.api.put('update')` |
| `k.api.delete` | 删除 | `k.api.delete('delete')` |

### 3.3 API 响应格式

统一响应格式:

```typescript
// 成功响应
return { success: true, data: ... }

// 失败响应
return { success: false, message: '错误信息' }

// 带分页的列表
return { success: true, data: items, total: 100, page: 1, pageSize: 20 }
```

---

## 开发示例

以会员管理功能为例,展示完整开发流程:

### 1. 定义 Model

```typescript
// code/Models/Member.ts
import { ksql, DataTypes } from 'module/k_sqlite'

const Member = ksql.define('members', {
    name: { type: DataTypes.String, required: true },
    phone: { type: DataTypes.String, unique: true },
    password: { type: DataTypes.String, required: true }
}, { timestamps: true })

export { Member }
```

### 2. 创建 Service

```typescript
// code/Services/MemberService.ts
import { Member } from 'code/Models/Member'

export function createMember(data: { name: string; phone: string; password: string }) {
    const passwordHash = k.security.md5(data.password)
    return Member.create({ ...data, password: passwordHash })
}

export function getMemberById(id: string) {
    return Member.findById(id)
}
```

### 3. 创建 API

```typescript
// api/member.ts
// @k-url /api/member/{action}

import { createMember, getMemberById } from 'code/Services/MemberService'

k.api.post('create', (body) => {
    const id = createMember(body)
    return { success: true, id }
})

k.api.get('detail', () => {
    const id = k.request.queryString.id
    const member = getMemberById(id)
    return { success: true, data: member }
})
```

---

## 快速命令

```bash
# 检查 Model 文件
ls -la code/Models/

# 检查 Service 文件
ls -la code/Services/

# 检查 API 文件
ls -la api/
```

---

## 下一步

- [API 核心](./api-core.md) - 了解 k.request, k.response 等核心 API
- [数据库操作](./database.md) - 深入了解 k_sqlite ORM
- [交付检查](./quality-guidelines.md) - 代码交付检查清单
