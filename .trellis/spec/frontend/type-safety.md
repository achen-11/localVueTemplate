# 类型安全规范

> 本项目的 TypeScript 类型规范。

---

## 概述

本项目使用 **TypeScript** 进行类型检查。

---

## 类型组织

### 类型定义位置

| 类型 | 存放位置 | 示例 |
|------|----------|------|
| 公共类型 | `src/types/` | `User.ts`, `ApiResponse.ts` |
| 组件类型 | 组件内部 | Props, Emits |
| API 类型 | `src/api/` | 请求/响应类型 |

### 公共类型示例

```typescript
// types/User.ts
export interface User {
  _id: string
  userName: string
  email: string
  phone?: string
  isActive: boolean
  createdAt: string
}

export interface UserCreate {
  userName: string
  password: string
  email: string
}

// types/ApiResponse.ts
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}
```

---

## 禁止的模式

### 1. 禁止使用 any

```typescript
// ❌ 错误
const data: any = fetchData()

// ✅ 正确
const data: User = fetchData()
```

### 2. 避免类型断言

```typescript
// ❌ 错误
const user = data as User

// ✅ 正确
const user = data // 类型推断
```

### 3. 避免不确定的类型

```typescript
// ❌ 错误
function handleData(data: any) { ... }

// ✅ 正确
function handleData(data: User) { ... }
```

---

## 常见模式

### 可选属性

```typescript
interface User {
  name: string
  email?: string  // 可选
}
```

### 联合类型

```typescript
type Status = 'pending' | 'active' | 'disabled'

interface User {
  status: Status
}
```

### 泛型

```typescript
// API 响应泛型
async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const res = await axios.get(url)
  return res.data
}

// 使用
const user = await fetchData<User>('/api/user')
```

---

## API 类型

### 请求类型

```typescript
// api/user.ts
export interface LoginRequest {
  userName: string
  password: string
}

export interface RegisterRequest {
  userName: string
  password: string
  email: string
}
```

### 响应类型

```typescript
export interface LoginResponse {
  token: string
  user: User
}

export interface ApiError {
  success: false
  message: string
  code?: number
}
```
