# 前端交付检查清单

> 代码交付前必须检查的项目，确保符合项目规范。

---

## 目录

- [代码规范检查](#代码规范检查)
- [构建检查](#构建检查)
- [Kooboo 集成检查](#kooboo-集成检查)

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
| npm run build | 构建成功无错误 | [ ] |
| 产物路径 | 构建产物在正确位置 | [ ] |

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

## 交付前自检清单

- [ ] TypeScript 类型完整，无 `any`
- [ ] Props 使用 TypeScript 接口定义
- [ ] Vue Router 使用 hash 模式
- [ ] `npm run build` 成功
- [ ] `src/page/index.html` 有 `<!-- @k-url / -->` 声明
- [ ] API 调用路径正确
