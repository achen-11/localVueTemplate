# Kooboo 日志规范

> Kooboo 后端日志使用规范。

---

## 重要约束

| 约束 | 说明 |
|------|------|
| **禁止 console** | Kooboo 服务端没有 console 对象 |
| **必须使用 k.logger** | 所有日志必须使用 `k.logger` API |

---

## k.logger API

```typescript
// 基本用法
k.logger.debug(message: string)
k.logger.debug(category: string, message: string)

k.logger.information(message: string)
k.logger.information(category: string, message: string)

k.logger.warning(message: string)
k.logger.warning(category: string, message: string)

k.logger.error(message: string)
k.logger.error(category: string, message: string)
```

### 使用示例

```typescript
// 简单消息
k.logger.debug('Processing order xxx')

// 带分类的消息（推荐用于区分模块）
k.logger.information('OrderService', 'Order xxx created successfully')
k.logger.warning('OrderService', 'Order xxx missing create date!')
k.logger.error('OrderService', 'Order xxx failed: network error')
```

---

## 日志级别选择

| 级别 | 使用场景 |
|------|----------|
| `debug` | 开发调试信息，生产环境默认不显示 |
| `information` | 正常业务流程记录（如：用户登录、订单创建） |
| `warning` | 异常但可处理的情况（如：缺少可选字段、使用了默认值） |
| `error` | 操作失败需要调查（如：数据库错误、外部服务调用失败） |

---

## 常见错误

### ❌ 错误示例

```typescript
// 错误：使用 console（Kooboo 不支持）
console.log('Processing...')
console.warn('Warning message')
console.error('Error:', error)

// 错误：拼接字符串而非传参
k.logger.error('User ' + userId + ' not found')
```

### ✅ 正确示例

```typescript
// 正确：使用 k.logger
k.logger.information('UserService', 'Processing login request')
k.logger.warning('UserService', 'User not found, using default avatar')
k.logger.error('UserService', 'Database connection failed')

// 正确：使用模板字符串
k.logger.error('UserService', `User ${userId} not found`)
```

---

## 与 API 返回值的区别

| 类型 | 使用场景 | 示例 |
|------|----------|------|
| **日志 (k.logger)** | 记录操作过程，供开发者/运维排查问题 | `k.logger.information('AdminService', 'Deleting post')` |
| **API 返回值** | 向调用方返回操作结果 | `return successResponse({ success: true })` |

---

## 规范来源

- Kooboo 类型定义：`.trellis/kooboo.d.ts`（搜索 `KLogger`）
