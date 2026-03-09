# Hook 开发规范

> 本项目的自定义 Hook 开发规范。

---

## 概述

本项目使用 Vue 3 Composition API，自定义 Hook 用于封装可复用的逻辑。

---

## Hook 命名规范

- 使用 **use** 前缀
- 命名使用 camelCase

```typescript
// ✅ 正确
useUser.ts
useAuth.ts
useFetchData.ts

// ❌ 错误
user.ts
UserHook.ts
```

---

## 自定义 Hook 结构

### 基本结构

```typescript
// hooks/useUser.ts
import { ref, computed } from 'vue'
import { userApi } from '@/api/user'

export function useUser() {
  // 响应式状态
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 计算属性
  const isLoggedIn = computed(() => !!user.value)

  // 方法
  const fetchUser = async (userId: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await userApi.getInfo(userId)
      user.value = res.data
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials: { userName: string; password: string }) => {
    // 登录逻辑
  }

  const logout = () => {
    user.value = null
  }

  // 返回
  return {
    user,
    loading,
    error,
    isLoggedIn,
    fetchUser,
    login,
    logout
  }
}
```

### 使用 Hook

```vue
<script setup lang="ts">
import { useUser } from '@/hooks/useUser'

const { user, loading, error, fetchUser, login } = useUser()

// 调用
fetchUser('123')
</script>
```

---

## 数据获取

### API 调用封装

```typescript
// hooks/useFetch.ts
import { ref } from 'vue'
import axios from 'axios'

export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetch = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get<T>(url)
      data.value = res.data
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch }
}
```

---

## 常见错误

### 1. 忘记返回响应式数据

```typescript
// ❌ 错误
export function useUser() {
  const user = ref(null)  // 未返回
}

// ✅ 正确
export function useUser() {
  const user = ref(null)
  return { user }
}
```

### 2. 在 Hook 外修改状态

```typescript
// ❌ 错误
const user = ref(null)
export function useUser() {
  // ...
}
export function modifyUser() {
  user.value = { name: 'John' }  // 不推荐
}

// ✅ 正确
export function useUser() {
  const user = ref(null)
  const setUser = (newUser) => {
    user.value = newUser
  }
  return { user, setUser }
}
```

### 3. 重复创建相同的 Hook

```typescript
// ❌ 错误：在多个组件中创建相同的 Hook
export function ComponentA() {
  const { user } = useUser()
}

export function ComponentB() {
  const { user } = useUser()  // 每个组件都创建新的状态
}

// ✅ 正确：使用 Pinia 或 provide/inject 共享状态
```
