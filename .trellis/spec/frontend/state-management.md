# 状态管理规范

> 本项目的状态管理方案。

---

## 概述

本项目使用 **Pinia** 作为状态管理方案。

---

## 状态分类

| 状态类型 | 存储位置 | 示例 |
|----------|----------|------|
| 组件局部状态 | `ref()` / `reactive()` | 组件内部表单数据 |
| 全局状态 | Pinia Store | 用户信息、购物车 |
| 服务端状态 | Pinia + API | 商品列表、订单数据 |
| URL 状态 | Vue Router | 页面参数、筛选条件 |

---

## Pinia Store 结构

### 创建 Store

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.userName || '')

  // Actions
  async function fetchUser(userId: string) {
    loading.value = true
    try {
      const res = await userApi.getInfo(userId)
      user.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function login(credentials: LoginCredentials) {
    loading.value = true
    try {
      const res = await userApi.login(credentials)
      token.value = res.data.token
      user.value = res.data.user
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = ''
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    userName,
    fetchUser,
    login,
    logout
  }
})
```

### 使用 Store

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 访问状态
console.log(userStore.isLoggedIn)

// 调用 Actions
userStore.login({ userName: 'john', password: '123' })
</script>
```

---

## 何时使用全局状态

### 适合放入全局状态

- 用户登录信息
- 购物车内容
- 主题/语言设置
- 多组件共享的数据

### 不适合放入全局状态

- 组件内部临时数据（如表单输入）
- 仅在单个组件中使用的数据
- 可由 URL 管理的状态

---

## 常见错误

### 1. 将所有状态放入 Store

```typescript
// ❌ 错误：每个状态都放 Store
const searchQuery = ref('')
const currentPage = ref(1)
const sortBy = ref('name')

// ✅ 正确：组件局部状态
const searchQuery = ref('')
const currentPage = ref(1)
const sortBy = ref('name')
```

### 2. 修改 State 而非通过 Actions

```typescript
// ❌ 错误：直接修改
userStore.user.name = 'John'

// ✅ 正确：通过 Actions 修改
async function updateUserName(newName: string) {
  await userApi.updateName(newName)
  userStore.user.name = newName
}
```

### 3. 未初始化 Store

```typescript
// ❌ 错误：未使用 defineStore
import { ref } from 'vue'

export const userStore = ref({})  // 不是 Pinia Store

// ✅ 正确：使用 defineStore
export const useUserStore = defineStore('user', () => { ... })
```
