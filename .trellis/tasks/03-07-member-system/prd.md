# 健身房会员体系 - MVP 开发计划

## 目标

开发健身房预约系统的**会员体系模块**，支持会员卡管理、额度管理、基础数据维护。

---

## 核心功能

### 1. 会员管理
- 会员注册（姓名、手机号、密码）
- 会员登录
- 会员信息查看/编辑

### 2. 会员卡种（基础数据）
| 卡种类型 | 说明 | 额度 |
|----------|------|------|
| 次卡 | 按次消费 | 次数（如10次、20次） |
| 月卡 | 包月 | 天数（30天） |
| 季卡 | 包季 | 天数（90天） |
| 年卡 | 包年 | 天数（365天） |
| 私教包 | 私教课程 | 课时数 |

### 3. 会员卡发行
- 管理员给会员开卡
- 选择卡种、设置有效期
- 记录开卡时间

### 4. 额度管理
- 查看各卡种剩余额度
- 消费时扣减额度
- 额度不足提示

---

## 基础数据定义

### 教练/老师
```typescript
interface Coach {
  name: string          // 姓名
  phone?: string        // 联系电话
  specialty: string     // 擅长领域（如：瑜伽、普拉提）
  avatar?: string       // 头像URL
  isActive: boolean     // 是否在职
}
```

### 课程类型
```typescript
interface CourseType {
  name: string          // 课程名称（如：瑜伽、动感单车）
  description?: string // 课程描述
  duration: number      // 时长（分钟）
  coachRequired: boolean // 是否需要教练
}
```

### 教室/场地
```typescript
interface Room {
  name: string          // 教室名称（如：1号教室）
  capacity: number      // 容纳人数
  equipment?: string   // 主要器械
  isActive: boolean    // 是否可用
}
```

### 会员卡种
```typescript
interface CardType {
  name: string          // 卡种名称（如：月卡、次卡）
  type: 'times' | 'month' | 'quarter' | 'year' | 'private'  // 类型
  value: number        // 额度（次数或天数）
  price: number        // 价格（元）
  validityDays: number // 有效期（天数）
  description?: string // 描述
}
```

### 会员
```typescript
interface Member {
  name: string         // 姓名
  phone: string        // 手机号（登录账号）
  password: string     // 密码（加密存储）
  memberCards: MemberCard[]  // 持有的会员卡
  createdAt: string   // 注册时间
}
```

### 会员卡
```typescript
interface MemberCard {
  cardTypeId: string   // 卡种ID
  remainingValue: number // 剩余额度
  expireDate: string   // 过期时间
  status: 'active' | 'expired' | 'used_up'  // 状态
  createdAt: string   // 开卡时间
}
```

---

## 预约冲突规则

| 场景 | 规则 |
|------|------|
| 同一教室同一时间 | 不能排课 |
| 同一教练同一时间 | 不能排课 |
| 同一学员同一时间 | 不能预约 |

---

## API 设计

### 会员相关
- `POST /api/member/register` - 注册
- `POST /api/member/login` - 登录
- `GET /api/member/info` - 获取会员信息
- `PUT /api/member/info` - 更新会员信息

### 卡种相关（管理员）
- `GET /api/card-type/list` - 获取卡种列表
- `POST /api/card-type/create` - 创建卡种
- `PUT /api/card-type/update` - 更新卡种
- `DELETE /api/card-type/delete` - 删除卡种

### 开卡（管理员）
- `POST /api/member-card/issue` - 给会员开卡

### 额度管理
- `GET /api/member-card/list` - 获取会员所有卡
- `GET /api/member-card/detail` - 获取单张卡详情

### 基础数据
- `GET /api/coach/list` - 教练列表
- `GET /api/course-type/list` - 课程类型列表
- `GET /api/room/list` - 教室列表

---

## 页面设计

### 前端页面（Frontend/src/views/）
| 页面 | 说明 |
|------|------|
| HomeView | 首页（展示课程、教练） |
| MemberRegisterView | 会员注册 |
| MemberLoginView | 会员登录 |
| MemberProfileView | 个人中心（查看卡、额度） |
| CardTypeListView | 卡种列表（管理员） |
| CardIssueView | 开卡页面（管理员） |

---

## MVP 交付标准

- [ ] 会员可以注册、登录
- [ ] 管理员可以管理卡种（增删改查）
- [ ] 管理员可以给会员开卡
- [ ] 会员可以查看自己的卡和剩余额度
- [ ] 预约冲突规则已实现（为后续预约功能预留）

---

## 技术说明

- 前端：Vue3 + Pinia + axios + TailwindCSS
- 后端：Kooboo API（k.api.get/post）
- 数据库：k_sqlite ORM
- 构建：npm run build → src/page, src/css, src/js
- 首页声明：src/page/index.html 首行必须有 `<!-- @k-url / -->`
