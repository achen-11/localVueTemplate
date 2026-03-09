# 组件开发规范

> 本项目的 Vue 组件开发规范。

---

## 概述

本项目使用 Vue 3 + Composition API 开发组件，采用 `<script setup>` 语法。

---

## 组件结构

### 标准组件模板

```vue
<template>
  <div class="组件名">
    <!-- 模板内容 -->
  </div>
</template>

<script setup lang="ts">
// 1. 导入
import { ref, computed } from 'vue'

// 2. 类型定义
interface Props {
  title: string
  disabled?: boolean
}

// 3. Props（使用 withDefaults 设置默认值）
const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

// 4. Emits
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'click'): void
}>()

// 5. 响应式数据
const count = ref(0)

// 6. 计算属性
const isDisabled = computed(() => props.disabled || count.value > 10)

// 7. 方法
const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
/* 样式 */
.组件名 {
  /* 使用 Tailwind CSS */
}
</style>
```

---

## Props 规范

### 定义方式

```typescript
// 方式一：基础类型
defineProps<{
  title: string
  count: number
  isActive: boolean
}>()

// 方式二：带默认值
const props = withDefaults(defineProps<{
  title: string
  disabled?: boolean
}>(), {
  disabled: false
})

// 方式三：使用类型声明（推荐）
interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'medium'
})
```

### 命名规范

- Props 命名使用 **camelCase**
- 传递时使用 **kebab-case**

```vue
<!-- 组件使用 -->
<Button button-label="提交" button-variant="primary" />
```

---

## Emit 规范

### 定义方式

```typescript
// 方式一：类型声明（推荐）
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'change', data: User): void
  (e: 'click'): void
}>()

// 使用
emit('update', 'new value')
emit('click')

// 方式二：数组语法（简单场景）
const emit = defineEmits(['update', 'click'])
```

---

## 样式规范

### 使用 Tailwind CSS

```vue
<template>
  <button
    class="px-4 py-2 rounded-lg font-medium transition-colors"
    :class="{
      'bg-blue-500 hover:bg-blue-600 text-white': variant === 'primary',
      'bg-gray-200 hover:bg-gray-300 text-gray-700': variant === 'secondary'
    }"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
```

### Scoped CSS

对于 Tailwind 无法覆盖的场景，使用 scoped CSS：

```vue
<style scoped>
.custom-style {
  /* 自定义样式 */
}
</style>
```

---

## 组件分类

### 通用组件 (components/common/)

可被任意页面复用的组件，如：
- `Button.vue` - 按钮
- `Input.vue` - 输入框
- `Modal.vue` - 弹窗
- `Header.vue` - 页头
- `Footer.vue` - 页脚

### 业务组件 (components/business/)

与特定业务相关的组件，如：
- `ProductCard.vue` - 商品卡片
- `OrderList.vue` - 订单列表

### 页面组件 (views/)

每个视图页面对应的组件，如：
- `HomeView.vue` - 首页
- `UserProfileView.vue` - 用户资料页

---

## 组件通信

### Props 向下传递

```typescript
// 父组件
<ChildComponent :user="user" @update="handleUpdate" />
```

### Emit 向上传递

```typescript
// 子组件
const emit = defineEmits<{
  (e: 'update', value: string): void
}>()

const handleChange = () => {
  emit('update', 'new value')
}
```

### Provide/Inject（跨层级通信）

```typescript
// 父组件
import { provide } from 'vue'

provide('userContext', {
  user: ref(currentUser),
  updateUser
})
```

```typescript
// 子组件
import { inject } from 'vue'

const { user, updateUser } = inject('userContext')
```

---

## 常见错误

### 1. Props 未定义类型

```typescript
// ❌ 错误
defineProps({
  title: String
})

// ✅ 正确
defineProps<{
  title: string
}>()
```

### 2. 未使用 defineEmits

```typescript
// ❌ 错误
const emit = (event: string) => {}

// ✅ 正确
const emit = defineEmits(['click'])
```

### 3. 忘记使用 v-model

```typescript
// ❌ 错误
<ChildComponent :value="value" />

// ✅ 正确（如果组件支持 v-model）
<ChildComponent v-model="value" />

// ✅ 或者
<ChildComponent :modelValue="value" @update:modelValue="value = $event" />
```
