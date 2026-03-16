# KSQL ORM 使用文档

## 概述

KSQL 是一个轻量级的 SQLite ORM (对象关系映射) 库，提供了简洁的 API 来操作 SQLite 数据库。主要特性包括：

- 类型安全的模型定义
- 自动化的 CRUD 操作
- 内置时间戳和软删除功能
- 自动表结构管理
- 丰富的查询功能

## 安装与引入

```typescript
// 通过模块系统引入
import { define, DataTypes } from 'module:k_sqlite'
```

## 模型定义

### 基本定义

```typescript
const Model = define(tableName: string, schema: ModelSchema, config?: ModelConfig)
```

### 字段选项

| 选项 | 类型 | 说明 |
|------|------|------|
| `type` | `DataTypes` | 字段数据类型 (必填) |
| `autoincrement` | `boolean` | 是否自增 (仅限 Number 类型) |
| `initialValue` | `number` | 自增初始值 |
| `required` | `boolean` | 是否必填 |
| `primaryKey` | `boolean` | 是否主键 |
| `index` | `boolean` | `string[]` | 单列或多列索引 |
| `select` | `boolean` | 是否默认选中 |
| `default` | `any` | `() => any` | 默认值 |

### 配置选项

| 选项 | 类型 | 说明 |
|------|------|------|
| `timestamps` | `boolean` | `{createdAt: string, updatedAt: string}` | 时间戳配置 |
| `softDelete` | `boolean` | `{isDeleted: string, deletedAt: string}` | 软删除配置 |

### 示例

```typescript
const Task = define('tasks', {
  id: {
    type: DataTypes.Number,
    primaryKey: true,
    autoincrement: true,
    initialValue: 10000
  },
  name: {
    type: DataTypes.String,
    required: true
  },
  completed: {
    type: DataTypes.Boolean,
    default: false
  }
}, {
  timestamps: true,
  softDelete: true
})
```

## 数据类型

| 数据类型 | SQLite 类型 | 说明 |
|----------|------------|------|
| `DataTypes.String` | TEXT | 字符串 |
| `DataTypes.Number` | INTEGER | 整数 |
| `DataTypes.Boolean` | INTEGER | 布尔值 (0/1) |
| `DataTypes.Timestamp` | INTEGER | 时间戳 (毫秒) |
| `DataTypes.Float` | REAL | 浮点数 |
| `DataTypes.Array` | TEXT | 自动 JSON 序列化 |
| `DataTypes.Object` | TEXT | 自动 JSON 序列化 |

## CRUD 操作

### 创建

```typescript
// 创建记录
const id = Model.create(data: Partial<Model>): string

// 不存在时创建
Model.createIfNotExists(data: Partial<Model>, where: WhereParams<Model>): string | null
```

### 读取

```typescript
// 按ID查询
Model.findById(id: string, params?: QueryParams<Model>): Model | null

// 条件查询单个
Model.findOne(where: WhereParams<Model>, params?: QueryParams<Model>): Model | null

// 条件查询多个
Model.findAll(where: WhereParams<Model>, params?: QueryParams<Model>): Model[]

// 分页查询
Model.findPaginated(where: WhereParams<Model>, params?: QueryParams<Model>): {
  list: Model[],
  page: number,
  pageSize: number,
  total: number
}
```

### 更新

```typescript
// 按ID更新
Model.updateById(id: string, data: Partial<Model>, isTimeUpdated?: boolean): string | null

// 条件更新单个
Model.updateOne(where: WhereParams<Model>, data: Partial<Model>, isTimeUpdated?: boolean): string | null

// 批量更新
Model.updateMany(where: WhereParams<Model>, data: Partial<Model>, isTimeUpdated?: boolean): string[]

// 更新或创建
Model.updateOrCreate(data: Partial<Model>, isTimeUpdated?: boolean): string | null
```

### 删除

```typescript
// 物理删除
Model.deleteById(id: string): boolean
Model.deleteOne(where: WhereParams<Model>): boolean
Model.deleteMany(where: WhereParams<Model>): Record<string, boolean>

// 软删除
Model.removeById(id: string): boolean
Model.removeOne(where: WhereParams<Model>): boolean
Model.removeMany(where: WhereParams<Model>): Record<string, boolean>

// 恢复软删除
Model.restoreByIds(ids: string[]): string[]

// 清除软删除记录
Model.clear(): number
```

## 查询参数

```typescript
interface QueryParams<Model> {
  page?: number                   // 页码 (从1开始)
  pageSize?: number               // 每页数量
  select?: Array<keyof Model>     // 选择字段
  include?: Array<keyof Model>    // 包含字段
  exclude?: Array<keyof Model>     // 排除字段
  isDeserialize?: boolean         // 是否反序列化 (默认true)
  order?: OrderParams<Model>      // 排序规则
  includeDeleted?: boolean         // 是否包含软删除记录
}

type OrderParams<Model> = 
  | 'RANDOM()' 
  | keyof Model 
  | {
      prop: keyof Model
      order?: 'ascending' | 'descending'
    }
```

## 聚合查询

```typescript
// 计数
Model.count(where: WhereParams<Model>, params?: QueryParams<Model>): number

// 求和
Model.sum(field: keyof Model, where: WhereParams<Model>, params?: QueryParams<Model>): number

// 最大值
Model.max(field: keyof Model, where: WhereParams<Model>, params?: QueryParams<Model>): number

// 最小值
Model.min(field: keyof Model, where: WhereParams<Model>, params?: QueryParams<Model>): number
```

## 表结构管理

```typescript
// 检查表结构差异
Model.diffSchema(): {
  currentSchema: Record<string, TableColumnInfo>
  definedSchema: Record<string, TableColumnInfo>
  differences: {
    missingColumns: string[]
    extraColumns: string[]
    typeMismatches: TypeMismatch[]
    constraintMismatches: ConstraintMismatch[]
  }
}

// 同步表结构
Model.syncTableSchema(transformFn?: (oldData: any[]) => Partial<Model>[]): {
  success: boolean
  migratedCount: number
  message: string
}

// 恢复数据
Model.restoreData(data: any[], transformFn?: (oldData: any[]) => Partial<Model>[]): {
  success: boolean
  restoredCount: number
  message: string
}
```

## 最佳实践

1. **主键设计**：
   - 优先使用自增整数主键
   - 设置合理的初始值避免冲突

2. **索引优化**：
   ```typescript
   // 单列索引
   userId: {
     type: DataTypes.String,
     index: true
   }
   
   // 多列组合索引
   projectInfo: {
     type: DataTypes.String,
     index: ['project_id', 'board_id']
   }
   ```

3. **默认值**：
   ```typescript
   status: {
     type: DataTypes.String,
     default: 'pending'
   },
   createdAt: {
     type: DataTypes.Timestamp,
     default: () => Date.now()
   }
   ```

4. **事务处理**：
   ```typescript
   k.DB.sqlite.execute('BEGIN TRANSACTION')
   try {
     // 批量操作...
     k.DB.sqlite.execute('COMMIT')
   } catch (error) {
     k.DB.sqlite.execute('ROLLBACK')
     throw error
   }
   ```

5. **复杂数据存储**：
   ```typescript
   // 数组存储
   tags: {
     type: DataTypes.Array // 自动序列化为JSON
   }
   
   // 对象存储
   metadata: {
     type: DataTypes.Object // 自动序列化为JSON
   }
   ```

## 注意事项

1. 所有模型会自动添加 `_id` 字段作为主键（除非已定义其他主键）
2. 启用 `timestamps` 会自动维护 `createdAt` 和 `updatedAt` 字段
3. 启用 `softDelete` 后删除操作会标记记录而不会物理删除
4. 数组和对象类型会自动进行 JSON 序列化/反序列化
5. 表结构变更后需要调用 `syncTableSchema` 同步