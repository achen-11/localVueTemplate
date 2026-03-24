# Kooboo WebSocket 实时通信规范

> 本规范定义 Kooboo 平台 WebSocket 实时通信的标准模式，供 AI 和开发者直接使用。

---

## 概述

Kooboo 提供了一套完整的 WebSocket API，支持服务端与客户端的双向实时通信。本规范基于 task-banner 项目实战经验总结。

---

## 核心技术栈

| 组件 | 说明 |
|------|------|
| `k.net.webSocket` | Kooboo 全局 WebSocket API |
| `useSocket` | 服务端 WebSocket 封装工具 |
| `SocketParser` | 消息序列化/反序列化工具 |
| `mitt` | 客户端事件发射器 (EventEmitter) |

---

## 服务端 API

### 核心方法

```typescript
// 接收 WebSocket 连接（阻塞，直到连接关闭）
k.net.webSocket.accept(sid: string, handler: (ctx: SocketContext) => void): void

// 获取指定连接
k.net.webSocket.get(connectionId: string): SocketConnection | null

// 获取所有连接 ID 列表
k.net.webSocket.list(): string[]

// 发送文本消息
connection.sendText(message: string, success?: Function): void

// 关闭连接
connection.close(): void
```

### SocketContext 对象

```typescript
interface SocketContext {
  text: string           // 接收到的文本消息
  data: any             // 解析后的 JSON 数据
  connectionId: string  // 连接 ID
}
```

### SocketConnection 对象

```typescript
interface SocketConnection {
  sendText(message: string, success?: Function): void
  close(): void
}
```

---

## 消息格式

### 标准消息结构

```typescript
interface SocketMessage {
  event: string           // 事件类型
  data: any               // 事件数据
  time?: number           // 时间戳（毫秒）
  to?: string             // 目标连接 ID（用于发送）
  is_group?: boolean      // 是否群发
}
```

### SocketParser 工具

```typescript
// 解析消息
SocketParser.parse(data: string): SocketMessage | null

// 序列化消息（移除 null/undefined）
SocketParser.stringify(message: SocketMessage): string
```

---

## 服务端实现模式

### 1. 创建 WebSocket API 端点

```typescript
// api/websocket/connect.ts
// @k-url /api/websocket/connect

import { useSocket } from 'code/Utils/useSocket'
import { SocketParser } from 'code/Utils/useSocket'

// 1. 鉴权检查
if (!k.account.isLogin) {
  k.api.httpCode(401)
}

// 2. 获取当前用户
const currentUser = getCurrentUser()
const sid = currentUser._id  // 使用用户 ID 作为连接标识

// 3. 处理已存在的连接（可选）
if (k.net.webSocket.list().find(id => id === sid)) {
  const oldConnection = k.net.webSocket.get(sid)
  oldConnection.close()
}

// 4. 创建 socket 实例
const socket = useSocket(sid)

// 5. 监听事件
socket.on('enter', () => {
  k.logger.information('WebSocket', `User ${sid} connected`)
  socket.send({
    to: sid,
    event: 'enter',
    data: { sid }
  })
})

socket.on('heartbeat', () => {
  socket.send({ to: sid, event: 'heartbeat' })
})

// 6. 启动连接（阻塞）
socket.accept()
```

### 2. 发送消息给指定用户

```typescript
// code/Services/websocket.ts

function sendToUser(userId: string, event: string, data: any): boolean {
  try {
    const connection = k.net.webSocket.get(userId)
    if (!connection) {
      return false  // 用户不在线
    }

    const message = SocketParser.stringify({
      event,
      data,
      time: Date.now()
    })

    connection.sendText(message)
    return true
  } catch (err) {
    k.logger.error('WebSocket', `Failed to send: ${err}`)
    return false
  }
}
```

### 3. 广播消息

```typescript
function broadcast(event: string, data: any): number {
  const allConnections = k.net.webSocket.list()
  let sentCount = 0

  for (const connectionId of allConnections) {
    try {
      const connection = k.net.webSocket.get(connectionId)
      if (connection) {
        const message = SocketParser.stringify({
          event,
          data,
          time: Date.now()
        })
        connection.sendText(message)
        sentCount++
      }
    } catch (err) {
      k.logger.warning('WebSocket', `Failed to send to ${connectionId}: ${err}`)
    }
  }

  return sentCount
}
```

---

## 事件类型定义

```typescript
// 建议的事件类型（可根据项目扩展）

type SystemEvents =
  | 'enter'        // 用户进入/连接成功
  | 'ping'         // 心跳请求
  | 'pong'         // 心跳响应
  | 'heartbeat'    // 客户端心跳
  | 'subscribe'    // 订阅主题

type BusinessEvents =
  | 'notification'  // 通知消息
  | 'message'       // 私信
  | 'post_created'  // 帖子创建
  | 'post_updated'  // 帖子更新
  | 'reply_created' // 回复创建
  | 'like_added'    // 点赞
  | 'follow_added'  // 关注
```

---

## 前端实现模式

### 重要说明

- **Kooboo 的 `k.net.webSocket` 是服务端 API**，只能在 Kooboo 服务器环境中使用
- **前端可以选择任意 WebSocket 技术栈**：原生 API、socket.io-client、或其他第三方库
- 前端只需连接到 Kooboo 的 WebSocket 端点即可

### 1. 完整消息流程

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   业务逻辑      │ → │ NotificationService │ → │ k.net.webSocket │
│ (ForumPostService)│     │  (sendToUser)     │     │  (推送消息)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        ↓
                        ┌─────────────────┐     ┌─────────────────┐
                        │  浏览器客户端   │ ← │   Kooboo 服务器   │
                        │  (接收消息)     │     │  (转发消息)     │
                        └─────────────────┘     └─────────────────┘
```

### 2. 连接 URL 格式

```
wss://domain.com/api/websocket/connect   # 生产环境
ws://domain.com/api/websocket/connect     # 开发环境
```

### 3. 前端技术栈选择（可选）

**原生 WebSocket API：**
```typescript
const ws = new WebSocket('wss://domain.com/api/websocket/connect')
ws.onopen = () => ws.send(JSON.stringify({ event: 'enter', data: { userId } }))
ws.onmessage = (event) => console.log(JSON.parse(event.data))
```

**socket.io-client：**
```typescript
import { io } from 'socket.io-client'
const socket = io('wss://domain.com', { path: '/api/websocket/connect' })
socket.on('notification', (data) => console.log(data))
```

**推荐：选择符合项目已有技术栈的方案，保持一致性。**

### 4. 连接管理最佳实践

| 问题 | 解决方案 |
|------|----------|
| 重复连接 | 使用 Map 存储连接，同一用户只保持一个连接 |
| 组件重渲染 | 使用 `useRef` 存储连接，或模块级 Map |
| 用户登出 | 清理连接，标记 `userId = null` |
| 意外断开 | `onclose` 中根据业务状态决定是否重连 |
| 关闭代码 1000 | 表示正常关闭，不自动重连 |

---

## 心跳机制

### 客户端 → 服务端

```typescript
// 客户端每 30 秒发送一次心跳
setInterval(() => {
  socket.send({
    to: sid,
    event: 'heartbeat'
  })
}, 30000)
```

### 服务端响应

```typescript
socket.on('heartbeat', () => {
  socket.send({
    to: sid,
    event: 'heartbeat'  // 原样返回
  })
})
```

### 自动重连

```typescript
// 客户端监听连接关闭，自动重连
ws.on('close', () => {
  setTimeout(() => {
    connectWebSocket()
  }, 5000)
})
```

---

## 消息推送场景

### 推送给指定用户

```typescript
// 发送通知给指定用户
export function pushNotification(userId: string, notification: any) {
  sendToUser(userId, 'notification', {
    type: notification.type,
    title: notification.title,
    content: notification.content,
    isRead: false
  })
}
```

### 广播给所有在线用户

```typescript
// 系统公告
export function broadcastSystemMessage(message: string) {
  broadcast('system_message', {
    type: 'system',
    message,
    timestamp: Date.now()
  })
}
```

---

## 最佳实践

| 实践 | 说明 |
|------|------|
| 使用用户 ID 作为连接 ID | 便于定向发送消息 |
| 心跳保活 | 每 30 秒发送心跳，避免连接被代理关闭 |
| 消息序列化 | 使用 SocketParser 处理 null/undefined |
| 错误处理 | 发送失败不影响主业务流程 |
| 日志记录 | 记录连接/断开、发送失败等关键事件 |

---

## 文件结构

```
src/
├── api/
│   └── websocket/
│       └── connect.ts      # WebSocket 连接端点
├── code/
│   ├── Utils/
│   │   ├── useSocket.ts   # Socket 封装
│   │   └── mitt.ts        # 事件发射器
│   └── Services/
│       └── websocket.ts    # WebSocket 推送服务
```

### 可复用脚本

```
.trellis/spec/backend/scripts/
└── mitt.ts                 # 事件发射器 (直接复制使用)
```

---

## 参考项目

- task-banner: `/Users/achen/Priv/task-banner/src/code/Services/websocket.ts`
- Kooboo best-practices: `/Users/achen/Priv/Yardi/Kooboo-Template/skill/kooboo-development/references/best-practices.md`
