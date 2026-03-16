# 前端交付检查清单

> 代码交付前必须检查的项目，确保符合项目规范。

---

## 目录

- [代码规范检查](#代码规范检查)
- [构建检查](#构建检查)
- [Kooboo 集成检查](#kooboo-集成检查)
- [API 请求规范](#api-请求规范)
- [图标规范](#图标规范)

---

## 代码规范检查

| 检查项 | 说明 | 状态 |
|--------|------|------|
| TypeScript 类型 | 所有函数/变量有明确类型 | [ ] |
| 无 any | 不使用 `any` 类型 | [ ] |
| Props 类型 | Props 使用 TypeScript 接口定义 | [ ] |
| 组件命名 | 组件文件使用 PascalCase | [ ] |

---

## 构建检查

| 检查项 | 说明 | 状态 |
|--------|------|------|
| npm install | 依赖已安装 | [ ] |
| npm run build | 在项目根目录执行构建，成功无错误 | [ ] |
| 产物路径 | 构建产物在正确位置 | [ ] |

### 构建命令

```bash
# ✅ 正确：在项目根目录执行
npm run build

# ❌ 错误：不要进入 Frontend 目录执行
cd Frontend && npm run build
```

---

## Kooboo 集成检查

### Local Vue 特有检查

| 检查项 | 说明 | 状态 |
|--------|------|------|
| Vue Router | 使用 hash 模式 `createWebHashHistory()` | [ ] |
| API 路径 | 正确调用 Kooboo API | [ ] |
| 首页声明 | `src/page/index.html` 有 `<!-- @k-url / -->` | [ ] |

### Vue Router 检查

```typescript
// ✅ 正确：hash 模式
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...]
})

// ❌ 错误：history 模式（会被 Kooboo 接管）
const router = createRouter({
  history: createWebHistory(),
  routes: [...]
})
```

### 首页声明检查

```html
<!-- src/page/index.html -->
<!-- ✅ 正确 -->
<!-- @k-url / -->
<!DOCTYPE html>
<html>
...
</html>

<!-- ❌ 错误：缺少声明 -->
<!DOCTYPE html>
<html>
...
</html>
```

---

## API 请求规范

### 必须使用 axios

- ✅ 推荐使用 `axios` 进行 HTTP 请求
- ⚠️ 不推荐使用原生 `fetch`，建议用 axios 封装

### 封装 request.js

在 `Frontend/src/utils/request.js` 中封装 axios：

```javascript
import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 只有 needToken: true 时才添加 Authorization 头
    if (config.needToken === true) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { data } = response
    if (data.success === false) {
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    return data
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default request
```

### API 模块封装示例

在 `Frontend/src/api/user.js` 中：

```javascript
import request from '@/utils/request'

// 登录接口 - 不需要 token（不传 needToken 参数）

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 需要 token 的接口 - 加上 needToken: true

export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get',
    needToken: true
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post',
    needToken: true
  })
}
```

### 在组件中使用

```vue
<script setup>
import { login, getUserInfo } from '@/api/user'

const handleLogin = async () => {
  try {
    // 登录不需要 token
    const res = await login({ username: 'admin', password: '123456' })
    console.log('登录成功', res)
  } catch (error) {
    console.error('登录失败', error)
  }
}

const loadUserInfo = async () => {
  try {
    // 获取用户信息需要 token
    const res = await getUserInfo()
    console.log(res.data)
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}
</script>
```

---

## 图标规范

### 必须使用图标库

- ✅ 使用 Element Plus Icons、`@element-plus/icons-vue`、`lucide-vue-next` 等图标库
- ✅ 也可以使用 [Lucide](https://lucide.dev/) 图标库（轻量、可定制）
- ❌ 禁止使用 emoji 作为图标

### 正确示例

#### Element Plus Icons
```vue
<template>
  <!-- ✅ 正确：使用图标库 -->
  <el-icon><Plus /></el-icon>
  <el-icon><Delete /></el-icon>
  <el-icon><Edit /></el-icon>
</template>

<script setup>
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
</script>
```

#### Lucide Icons
```vue
<template>
  <!-- ✅ 正确：使用 Lucide 图标 -->
  <Plus class="icon" />
  <Trash2 class="icon" />
  <Pencil class="icon" />
</template>

<script setup>
import { Plus, Trash2, Pencil } from 'lucide-vue-next'
</script>

<style scoped>
.icon {
  width: 20px;
  height: 20px;
}
</style>
```

### 错误示例

```vue
<template>
  <!-- ❌ 错误：使用 emoji -->
  <span>➕</span>
  <span>🗑️</span>
  <span>✏️</span>
</template>
```

### 为什么不用 emoji？

1. **跨平台兼容性** - 不同系统 emoji 显示不一致
2. **可访问性** - 屏幕阅读器对 emoji 支持不佳
3. **可维护性** - emoji 在代码中语义不明确
4. **设计一致性** - 图标库可以统一风格

---

## 交付前自检清单

- [ ] TypeScript 类型完整，无 `any`
- [ ] Props 使用 TypeScript 接口定义
- [ ] Vue Router 使用 hash 模式
- [ ] 在项目根目录执行 `npm run build` 成功
- [ ] `src/page/index.html` 有 `<!-- @k-url / -->` 声明
- [ ] API 调用使用封装的 request.js，不使用 fetch
- [ ] 使用图标库，不使用 emoji
