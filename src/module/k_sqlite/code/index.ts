/**
 * @name k_sqlite
 * @description ORM 对象关系映射(sqlite)
 */

/**
 * 开发模式
 * 自动检测表创建
 * */
// const isDev = k.site.info.setting.get('K_SQLITE_IS_DEV') === 'true'
const isDev = true;
const loggerCategory = 'k_sqlite';
export const DataTypes = {
  // Text
  String: String as unknown as StringConstructor,
  Array: 'Array' as unknown as any[],
  Object: 'Object' as unknown as Record<string, any>,
  // INTEGER
  Number: Number as unknown as NumberConstructor,
  Boolean: Boolean as unknown as BooleanConstructor,
  Timestamp: 'Timestamp' as unknown as NumberConstructor,
  // REAL
  Float: 'Float' as unknown as NumberConstructor
};
// 基础类型映射
type DataTypeMapping<T> = T extends StringConstructor ? string : T extends NumberConstructor ? number : T extends BooleanConstructor ? boolean : T extends 'Float' ? number : T extends 'Timestamp' ? number : T extends 'Array' ? any[] : T extends 'Object' ? Record<string, any> : T extends ArrayConstructor ? any[] : T extends (infer U)[] ? DataTypeMapping<U>[] : T extends object ? { [K in keyof T]: DataTypeMapping<T[K]> } : T;
export const Operators = k.DB.sqlite.operators();
export type TSchemaOption = {
  type: (typeof DataTypes)[keyof typeof DataTypes] | any; // 类型
  autoincrement?: boolean; // 自增
  initialValue?: number; // 自增初始值
  required?: boolean; // 必填
  primaryKey?: boolean; // 主键
  unique?: boolean; // 单列唯一
  index?: boolean; // 单列索引
  // 外键
  ref?: {
    tableName: string; // 关联的表名
    fieldName: string; // 关联的字段名
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT'; //  删除关联数据时的行为
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT'; // 更新关联数据时的行为
  };
  select?: boolean; // 默认读取是否选中
  default?: string | number | boolean | object | symbol | ((params: any) => string | number | boolean | object | symbol); // 默认值
};
type ModelSchema = {
  [key: string]: TSchemaOption;
};
type ModelConfig = {
  // hook
  beforeTableCreate?: () => void;
  afterTableCreate?: () => void;
  timestamps?: true | false | {
    createdAt: `${any}${string}`;
    updatedAt: `${any}${string}`;
  };
  softDelete?: true | false | {
    isDeleted: `${any}${string}`;
    deletedAt: `${any}${string}`;
  };
  uniques?: Array<{
    columns: string[]; // 组合唯一的字段名数组
    name?: string; // 可选的自定义约束名
  }>;
  indexes?: Array<{
    columns: string[]; // 组合索引的字段名数组
    name?: string; // 可选的自定义索引名
    unique?: boolean; // 是否创建唯一索引
  }>;
  dragAndDrop?: true | false; // 是否启用拖拽排序

  // Function
  idGenerator?: () => string | number; // 自定义ID生成方法
};
type OutputBaseModal<T extends ModelConfig> =
// 基础字段
{
  _id: string;
} & (T['timestamps'] extends true // 合并时间戳字段
? {
  createdAt: number;
  updatedAt: number;
} : T['timestamps'] extends {
  createdAt: infer C;
  updatedAt: infer U;
} ? { [K in C & string]: number } & { [K in U & string]: number } : {}) &
// 合并软删除字段
(T['softDelete'] extends true ? {
  isDeleted: boolean;
  deletedAt: number;
} : T['softDelete'] extends {
  isDeleted: infer I;
  deletedAt: infer D;
} ? { [K in I & string]: boolean } & { [K in D & string]: number } : {}) &
// 合并拖拽排序字段
(T extends {
  dragAndDrop: true;
} ? {
  dragAndDrop: number;
} : {});
type OutputModel<T extends ModelSchema> = { [K in keyof T]: T[K] extends {
  type: infer Type;
} ? DataTypeMapping<Type> : never };
type WhereParams<T> = { [K in keyof T]?: any // 完全无约束
| (T[K] extends object ? WhereParams<T[K]> : never) } & {
  [operator: string]: any;
};
type OrderParams<T> = keyof T | `-${keyof T & string}` | {
  prop: keyof T;
  order?: 'ascending' | 'descending' | 'ASC' | 'DESC';
};

// 查询参数
type QueryParams<T, U = T> = {
  page?: number;
  pageSize?: number;
  select?: Array<keyof T> | string | '*';
  include?: Array<keyof T>;
  exclude?: Array<keyof T>;
  isDeserialize?: boolean; // default true
  order?: 'RANDOM()' | OrderParams<T> | OrderParams<T>[];
  includeDeleted?: boolean; // default false
  // 转换函数，支持返回不同类型
  transform?: (item: T) => U;
};
type Nullable<T> = { [P in keyof T]: T[P] | null };
export function define<TModelSchema extends ModelSchema, TModelConfig extends ModelConfig>(tableName: string, schema: TModelSchema, config?: TModelConfig) {
  if (!tableName) {
    throw new Error('Table name is required');
  }
  let hasPrimaryKey = false;
  const DataTypesList = Object.values(DataTypes);
  Object.keys(schema).forEach(key => {
    const col = schema[key];
    // 有自定义主键
    hasPrimaryKey = col.primaryKey || hasPrimaryKey;

    // 类型转换 将非DataTypes类型转换为DataTypes类型
    if (!DataTypesList.includes(col.type)) {
      if (Array.isArray(col.type) || col.type === Array) {
        col.type = DataTypes.Array;
      } else if (col.type === Object || typeof col.type === 'object' && col.type !== null) {
        col.type = DataTypes.Object;
      } else {
        // 无效类型 抛出错误
        throw new Error(`[${tableName}] Invalid type: ${col.type}`);
      }
    }
  });
  type Model = OutputBaseModal<TModelConfig> & OutputModel<TModelSchema>;
  const TableInstance = k.DB.sqlite.getTable(tableName);
  (schema as any)['_id'] = {
    type: DataTypes.String,
    required: true,
    index: true,
    // 强制为索引
    primaryKey: !hasPrimaryKey,
    // 如果没有其他主键，则 _id 作为主键
    unique: hasPrimaryKey // 当_id不是主键需要约束为唯一
  };

  // 是否自动添加时间戳
  let timestampsConfig: Exclude<ModelConfig['timestamps'], true> = false;
  if (config?.timestamps) {
    const {
      createdAt = 'createdAt',
      updatedAt = 'updatedAt'
    } = typeof config.timestamps === 'object' ? config.timestamps : {};
    (schema as any)[createdAt] = {
      type: DataTypes.Timestamp,
      required: true
    };
    (schema as any)[updatedAt] = {
      type: DataTypes.Timestamp,
      required: true
    };
    timestampsConfig = {
      createdAt,
      updatedAt
    };
  }

  // dragAndDrop
  if (config?.dragAndDrop) {
    ;
    (schema as any)['dragAndDrop'] = {
      type: DataTypes.Timestamp,
      required: true
    };
  }

  // 处理软删除配置
  let softDeleteConfig: Exclude<ModelConfig['softDelete'], true> = false;
  if (config?.softDelete) {
    const {
      isDeleted = 'isDeleted',
      deletedAt = 'deletedAt'
    } = typeof config.softDelete === 'object' ? config.softDelete : {};
    (schema as any)[isDeleted] = {
      type: DataTypes.Boolean,
      default: false
    };
    (schema as any)[deletedAt] = {
      type: DataTypes.Timestamp
    };
    softDeleteConfig = {
      isDeleted,
      deletedAt
    };
  }
  function getDefaultModel(model?: Nullable<Partial<Model>>): Model {
    const defaultModel = Object.keys(schema).reduce((acc, cur) => {
      if (typeof schema[cur].default === 'function') {
        acc[cur] = schema[cur].default(model);
      } else if (!['undefined', 'symbol'].includes(typeof schema[cur].default)) {
        acc[cur] = schema[cur].default;
      }
      return acc;
    }, {} as any);
    if (timestampsConfig) {
      const now = getNow();
      (defaultModel as any)[timestampsConfig.createdAt] = now;
      (defaultModel as any)[timestampsConfig.updatedAt] = now;
    }

    // 自定义ID生成方法
    if (config?.idGenerator) {
      ;
      (defaultModel as any)['_id'] = config.idGenerator();
    } else {
      ;
      (defaultModel as any)['_id'] = k.security.newGuid();
    }
    if (config?.dragAndDrop) {
      ;
      (defaultModel as any)['dragAndDrop'] = Date.now();
    }
    return defaultModel;
  }
  function create(model: Nullable<Partial<Model>>): string {
    // 提取默认值
    const defaultModel = getDefaultModel();
    const props = _getProps();
    let newModel = pickProperties({
      ...defaultModel,
      ...removeNullUndefined(model)
    }, props);

    // 根据schema规则序列化数据
    newModel = serialize(newModel, schema);
    TableInstance.add(newModel);
    return newModel._id as string;
  }
  function createMany(models: Nullable<Partial<Model>>[], options?: {
    autoincrement?: boolean;
  }) {
    const records: Record<string, any>[] = [];
    const props = _getProps().filter(prop => {
      const isAutoincrement = schema[prop].autoincrement && schema[prop].primaryKey && schema[prop].type === DataTypes.Number;
      if (isAutoincrement && !options?.autoincrement) {
        return false;
      }
      return true;
    });
    const now = getNow();
    for (let index = 0; index < models.length; index++) {
      const model = models[index];
      const newModel: Record<string, any> = {};
      if (config?.dragAndDrop) {
        newModel['dragAndDrop'] = now + index * 10;
      }
      if (timestampsConfig) {
        newModel[timestampsConfig.createdAt] = now;
        newModel[timestampsConfig.updatedAt] = now;
      }
      for (const prop of props) {
        if (prop === '_id') {
          if (!model?._id) {
            if (config?.idGenerator) {
              newModel[prop] = config.idGenerator();
            } else {
              newModel[prop] = k.security.newGuid();
            }
            continue;
          }
        }
        if (model[prop] === undefined && newModel[prop] === undefined) {
          let defaultValue = schema[prop].default;
          if (typeof defaultValue === 'function') {
            defaultValue = defaultValue(model);
          }
          newModel[prop] = defaultValue ?? null;
        }
        if (model[prop] !== undefined) {
          newModel[prop] = model[prop];
        }
        if (newModel[prop] === null && schema[prop].required) {
          throw new Error(`models[${index}].${prop} requires a value`);
        }
      }

      // 根据schema规则序列化数据
      records.push(serialize(newModel, schema));
    }
    const names = props.join(', ');
    const values = props.map(it => `@${it}`).join(', ');
    return k.DB.sqlite.execute(`INSERT INTO '${tableName}' (${names}) VALUES (${values})`, records);
  }
  function _getProps() {
    const props = Object.keys(schema);
    return props;
  }

  /** 如果数据库未找到，则创建 */
  function createIfNotExists(model: Nullable<Partial<Model>>, where: WhereParams<Model>) {
    if (count(where) > 0) {
      return null;
    } else {
      return create(model);
    }
  }
  function deleteById(id: string): boolean {
    const count = k.DB.sqlite.execute(`DELETE FROM '${tableName}' WHERE _id = @id;`, {
      id
    });
    return count === 1;
  }
  function deleteByIds(ids: string[]): boolean {
    const count = k.DB.sqlite.execute(`DELETE FROM '${tableName}' WHERE _id IN @ids;`, {
      ids
    });
    return !!count;
  }
  function deleteOne(where: WhereParams<Model>): boolean {
    const id = findOne(where)?._id;
    return id ? deleteById(id) : false;
  }
  function deleteMany(where: WhereParams<Model>): boolean {
    const ids = findAll(where, {
      transform: item => item._id,
      select: ['_id']
    });
    return deleteByIds(ids);
  }
  function removeById(id: string): boolean {
    if (softDeleteConfig) {
      const now = getNow();
      const updateData = {
        [softDeleteConfig.isDeleted]: true,
        [softDeleteConfig.deletedAt]: now
      };
      return !!updateById(id, updateData as Model, false); // 禁用时间戳自动更新
    }
    return deleteById(id); // 降级到物理删除
  }
  function removeByIds(ids: string[]): boolean {
    if (softDeleteConfig) {
      const now = getNow();
      const count = k.DB.sqlite.execute(`UPDATE '${tableName}' SET '${softDeleteConfig.isDeleted}' = @isDeleted, '${softDeleteConfig.deletedAt}' = @deletedAt WHERE _id IN @ids`, {
        isDeleted: true,
        deletedAt: now,
        ids
      });
      return !!count;
    }
    return deleteByIds(ids); // 降级到物理删除
  }
  function removeOne(where: WhereParams<Model>): boolean {
    const id = findOne(where, {
      isDeserialize: false
    })?._id;
    return id ? removeById(id) : false;
  }
  function removeMany(where: WhereParams<Model>): boolean {
    const ids = findAll(where, {
      isDeserialize: false,
      select: ['_id'],
      transform: item => item._id
    });
    return removeByIds(ids);
  }
  function restoreByIds(ids: string[]) {
    if (!softDeleteConfig || ids.length === 0) return [];

    // 执行批量更新
    const affectedRows = k.DB.sqlite.execute(`UPDATE '${tableName}' SET ${softDeleteConfig.isDeleted} = @isDeleted, ${softDeleteConfig.deletedAt} = @deletedAt WHERE _id IN @ids`, {
      isDeleted: false,
      deletedAt: null,
      ids
    });

    // 返回成功恢复的ID数量
    return [`Recovery successfully: ${affectedRows} records`];
  }
  function clear(): number {
    if (!softDeleteConfig) return 0;
    return k.DB.sqlite.execute(`DELETE FROM '${tableName}' WHERE ${softDeleteConfig.isDeleted} = @value`, {
      value: true
    });
  }
  function updateOne(where: WhereParams<Model>, model: Nullable<Partial<Model>>, isTimeUpdated = true) {
    // 不需要反序列化
    const oldModel = findOne(where, {
      isDeserialize: false,
      select: '*'
    });
    if (!oldModel) {
      return null;
    }

    // 更新时间戳
    if (timestampsConfig && isTimeUpdated) {
      const now = getNow();
      delete model[timestampsConfig.createdAt];
      (model as any)[timestampsConfig.updatedAt] = now;
    }

    // 只存储schema定义的字段，并序列化数据
    const updateData = serialize(pickProperties(model, Object.keys(schema)), schema) as any;

    // 构建SET子句和参数
    const setClauses = [];
    const params: Record<string, any> = {};
    for (const key in updateData) {
      if (key !== '_id' && updateData[key] !== undefined) {
        setClauses.push(`'${key}' = @${key}`);
        params[key] = updateData[key];
      }
    }
    if (setClauses.length === 0) {
      return null; // 没有需要更新的字段
    }

    // 添加_id到参数
    params._id = oldModel._id;

    // 执行SQL更新
    const affectedRows = k.DB.sqlite.execute(`UPDATE '${tableName}' SET ${setClauses.join(', ')} WHERE _id = @_id`, params);
    return affectedRows > 0 ? oldModel._id : null;
  }
  function updateById(id: string, model: Nullable<Partial<Model>>, isTimeUpdated = true) {
    return updateOne({
      _id: id
    } as any, model, isTimeUpdated);
  }

  /**
   * 保存数据(不存在则创建)
   */
  function updateOrCreate(model: Nullable<Partial<Model>>, isTimeUpdated = true) {
    if (model._id) {
      return updateOne({
        _id: model._id
      } as any, model, isTimeUpdated);
    } else {
      return create(model);
    }
  }
  function updateMany(where: WhereParams<Model>, model: Nullable<Partial<Model>>, isTimeUpdated = true): string[] {
    // 更新时间戳
    if (timestampsConfig && isTimeUpdated) {
      const now = getNow();
      delete model[timestampsConfig.createdAt];
      (model as any)[timestampsConfig.updatedAt] = now;
    }

    // 只存储schema定义的字段，并序列化数据
    const updateData = serialize(pickProperties(model, Object.keys(schema)), schema) as any;

    // 获取所有需要更新的记录ID
    const ids = findAll(where, {
      select: ['_id'],
      isDeserialize: false
    }).map(item => item._id);
    if (ids.length === 0) {
      return [];
    }

    // 构建SET子句
    const setClauses = Object.keys(updateData).filter(key => key !== '_id').map(key => `'${key}' = @${key}`).join(', ');

    // 执行批量更新
    const paramsWithIds = {
      ...updateData,
      ids
    };
    k.DB.sqlite.execute(`UPDATE '${tableName}' SET ${setClauses} WHERE _id IN @ids`, paramsWithIds);
    return ids;
  }
  function patchMany<UpdateProps extends Array<keyof Model>, KeyProps extends Array<keyof Model>>(models: Array<Partial<Model> & Pick<Model, UpdateProps[number] | KeyProps[number]>>, updateProps: UpdateProps, keyProps: KeyProps, isTimeUpdated: boolean = true) {
    const list: Array<Record<string, any>> = [];
    const requiredProps = _uniq(updateProps.concat(keyProps) as string[]);
    const updatedAt = timestampsConfig && isTimeUpdated ? getNow() : undefined;
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const record: Record<string, any> = {
        updatedAt
      };
      for (const prop of requiredProps) {
        if (typeof model[prop] === 'undefined') {
          throw new Error(`Property models[${i}].${prop} is required`);
        }
        record[prop] = model[prop];
      }
      list.push(record);
    }
    const uniqUpdateProps = _uniq(updateProps as string[]);
    if (updatedAt && !uniqUpdateProps.includes('updatedAt')) {
      uniqUpdateProps.push('updatedAt');
    }
    const updateColumns = uniqUpdateProps.map(name => `${name} = @${name}`).join(', ');
    const keyColumns = _uniq(keyProps as string[]).map(name => `${name} = @${name}`).join(' AND ');
    const sql = `UPDATE '${tableName}' SET ${updateColumns} WHERE ${keyColumns};`;
    return k.DB.sqlite.execute(sql, list);
  }
  function _uniq<T>(list: T[]) {
    return [...new Set(list)];
  }

  // 查询方法自动过滤软删除数据
  function applySoftDelete(where: WhereParams<Model>, params: QueryParams<Model>) {
    if (softDeleteConfig && !params.includeDeleted) {
      return {
        ...where,
        [softDeleteConfig.isDeleted]: {
          [Operators.NE]: true
        }
      };
    }
    return where;
  }

  // 过滤where中的空值
  function filterEmptyWhereValues(where: WhereParams<Model>): WhereParams<Model> {
    if (!where || typeof where !== 'object') return where;
    if (Array.isArray(where)) {
      return where.map(item => {
        if (item === undefined) {
          return Infinity;
        } else if (typeof item === 'object') {
          return filterEmptyWhereValues(item);
        } else {
          return item;
        }
      }) as any;
    }
    const transformed: Record<string, any> = {};
    for (const [key, value] of Object.entries(where)) {
      if (value === undefined) {
        transformed[key] = Infinity;
      } else if (Array.isArray(value)) {
        transformed[key] = value.length === 0 ? Infinity : filterEmptyWhereValues(value as any);
      } else if (typeof value === 'object') {
        transformed[key] = filterEmptyWhereValues(value as any);
      } else {
        transformed[key] = value;
      }
    }
    return transformed as WhereParams<Model>;
  }
  function findOne<U = Model>(where: WhereParams<Model>, params: QueryParams<Model, U> = {}): U | null {
    where = applySoftDelete(filterEmptyWhereValues(where), params as QueryParams<Model>);
    let query = TableInstance.query(where);
    // const total = query.count()

    const {
      page = 1,
      pageSize = 1,
      isDeserialize,
      select,
      include,
      exclude
    } = params;

    // order
    const orderList = _getOrderList(params);
    if (orderList.length) {
      query.orderBy(orderList.join(','));
    }

    // paging
    let model: Model = query.skip((page - 1) * pageSize).take(pageSize)?.[0] as any;
    if (!model) {
      return null;
    }

    // select
    model = pickProperties(model, parseSelect(schema, select, include, exclude)) as any;

    // serialize
    if (isDeserialize !== false) {
      model = deserialize(model, schema);
    }
    // 应用 transform
    if (params.transform) {
      return params.transform(model);
    }
    return model as unknown as U;
  }
  function findById<U = Model>(id: string, params: QueryParams<Model, U> = {}): U | null {
    return findOne({
      _id: id
    } as any, params);
  }
  function findAll<U = Model>(where: WhereParams<Model>, params: QueryParams<Model, U> = {}): U[] {
    where = applySoftDelete(filterEmptyWhereValues(where), params as QueryParams<Model>);
    let query = TableInstance.query(where);
    // const total = query.count()

    if (typeof params.page === 'string') {
      params.page = parseInt(params.page);
    }
    if (typeof params.pageSize === 'string') {
      params.pageSize = parseInt(params.pageSize);
    }
    const {
      page,
      pageSize,
      isDeserialize = false,
      select,
      include,
      exclude
    } = params;

    // order
    const orderList = _getOrderList(params);
    if (orderList.length) {
      query.orderBy(orderList.join(','));
    }

    // paging
    let list: Model[] = (page && pageSize ? query.skip((page - 1) * pageSize).take(pageSize) : query.all()) as any;

    // select
    const returnFields = parseSelect(schema, select, include, exclude);
    return list.map(model => {
      // select
      model = pickProperties(model, returnFields) as any;

      // serialize
      if (isDeserialize !== false) {
        model = deserialize(model, schema);
      }
      return params.transform ? params.transform(model) : model as unknown as U;
    });
  }

  /**
   * 分页查询
   */
  function findPaginated<U = Model>(where: WhereParams<Model>, params: QueryParams<Model, U> = {
    page: 1,
    pageSize: 10
  }) {
    where = applySoftDelete(filterEmptyWhereValues(where), params as QueryParams<Model>);
    let query = TableInstance.query(where);
    const total = query.count();
    if (typeof params.page === 'string') {
      params.page = parseInt(params.page);
    }
    if (typeof params.pageSize === 'string') {
      params.pageSize = parseInt(params.pageSize);
    }
    const {
      page,
      pageSize,
      isDeserialize = false,
      select,
      include,
      exclude
    } = params;

    // order
    const orderList = _getOrderList(params);
    if (orderList.length) {
      query.orderBy(orderList.join(','));
    }

    // paging
    let queryData: Model[] = (page && pageSize ? query.skip((page - 1) * pageSize).take(pageSize) : query.all()) as any;

    // select
    const returnFields = parseSelect(schema, select, include, exclude);
    const list = queryData.map(model => {
      // select
      model = pickProperties(model, returnFields) as any;

      // serialize
      if (isDeserialize !== false) {
        model = deserialize(model, schema);
      }
      return params.transform ? params.transform(model) : model as unknown as U;
    });
    return {
      list,
      page,
      pageSize,
      total
    };
  }
  function _getOrderList<U = Model>(params: QueryParams<Model, U>) {
    const {
      order
    } = params;
    // order
    const orderList = (order ? Array.isArray(order) ? order : [order] : []).map(item => {
      if (!item) return '';

      // Handle string format ordering
      if (typeof item === 'string') {
        if (item === 'RANDOM()') return 'RANDOM()';
        // Handle descending order marker (field name starting with -)
        if (item.startsWith('-')) {
          return `\`${item.substring(1)}\` DESC`;
        }
        return `\`${item}\``;
      }

      // Handle object format ordering
      if (typeof item === 'object' && 'prop' in item) {
        const orderDirection = item.order === 'descending' || item.order === 'DESC' ? ' DESC' : '';
        return `\`${String(item.prop)}\`${orderDirection}`;
      }
      return '';
    }).filter(Boolean);

    // If no order specified and dragAndDrop is configured, default to dragAndDrop DESC (newest data on top)
    if (!orderList.length && config?.dragAndDrop) {
      orderList.push('dragAndDrop DESC');
    }
    return orderList;
  }

  /**
   * 数量查询
   */
  function count(where: WhereParams<Model>, params: QueryParams<Model> = {}) {
    where = applySoftDelete(filterEmptyWhereValues(where), params);
    return TableInstance.query(where).count();
  }
  function sum(field: keyof Model, where: WhereParams<Model>, params: QueryParams<Model> = {}) {
    where = applySoftDelete(filterEmptyWhereValues(where), params);
    const list = findAll(where, {
      ...params,
      select: [field]
    });
    return (list as any).reduce((a: any, c: any) => a + c[field], 0);
  }
  function max(field: keyof Model, where: WhereParams<Model>, params: QueryParams<Model> = {}) {
    where = applySoftDelete(filterEmptyWhereValues(where), params);
    const value = findOne(where, {
      ...params,
      order: {
        prop: field,
        order: 'descending'
      },
      select: [field]
    })?.[field] || 0;
    return value;
  }
  function min(field: keyof Model, where: WhereParams<Model>, params: QueryParams<Model> = {}) {
    where = applySoftDelete(filterEmptyWhereValues(where), params);
    const value = findOne(where, {
      ...params,
      order: {
        prop: field,
        order: 'ascending'
      },
      select: [field]
    })?.[field] || 0;
    return value;
  }
  function diffSchema() {
    // 获取当前表的结构信息
    const tableInfo = k.DB.sqlite.query(`PRAGMA table_info('${tableName}')`) || [];

    // 获取当前表的索引信息
    const indexInfo = k.DB.sqlite.query(`PRAGMA index_list('${tableName}')`) || [];

    // 构建当前表的结构映射
    const currentSchema: Record<string, {
      type: string;
      notNull: boolean;
      defaultValue: any;
      primaryKey: boolean;
      index: boolean;
    }> = {};

    // 处理列信息
    tableInfo.forEach((column: any) => {
      currentSchema[column.name] = {
        type: column.type.toUpperCase(),
        notNull: column.notnull === 1,
        defaultValue: column.dflt_value,
        primaryKey: column.pk === 1,
        index: false // 先初始化为false，后面处理索引
      };
    });

    // 处理索引信息
    indexInfo.forEach((index: any) => {
      // 获取索引的列信息
      const indexColumns = k.DB.sqlite.query<{
        cid: number;
        name: string;
      }[]>(`PRAGMA index_info('${index.name}')`);
      indexColumns.forEach(col => {
        if (currentSchema[col.name]) {
          currentSchema[col.name].index = true;
        }
      });
    });

    // 构建差异报告
    const differences: {
      missingColumns: string[]; // 数据库中缺少的列
      extraColumns: string[]; // 数据库中存在但Schema中没有的列
      typeMismatches: Array<{
        column: string;
        expected: string;
        actual: string;
      }>;
      constraintMismatches: Array<{
        column: string;
        property: 'primaryKey' | 'notNull' | 'index';
        expected: boolean;
        actual: boolean;
      }>;
    } = {
      missingColumns: [],
      extraColumns: [],
      typeMismatches: [],
      constraintMismatches: []
    };

    // 检查Schema中定义的列是否存在于数据库
    Object.keys(schema).forEach(columnName => {
      if (!currentSchema[columnName]) {
        differences.missingColumns.push(columnName);
        return;
      }
      const schemaDef = schema[columnName];
      const dbColumn = currentSchema[columnName];

      // 检查类型是否匹配
      let expectedType: string;
      switch (schemaDef.type) {
        case DataTypes.String:
        case DataTypes.Array:
        case DataTypes.Object:
          expectedType = 'TEXT';
          break;
        case DataTypes.Number:
        case DataTypes.Boolean:
        case DataTypes.Timestamp:
          expectedType = 'INTEGER';
          break;
        case DataTypes.Float:
          expectedType = 'REAL';
          break;
        default:
          expectedType = 'TEXT';
        // 默认处理
      }
      if (dbColumn.type !== expectedType) {
        differences.typeMismatches.push({
          column: columnName,
          expected: expectedType,
          actual: dbColumn.type
        });
      }

      // 检查约束是否匹配
      if (schemaDef.primaryKey !== undefined && schemaDef.primaryKey !== dbColumn.primaryKey) {
        differences.constraintMismatches.push({
          column: columnName,
          property: 'primaryKey',
          expected: !!schemaDef.primaryKey,
          actual: dbColumn.primaryKey
        });
      }
      if (schemaDef.required !== undefined && schemaDef.required !== dbColumn.notNull) {
        differences.constraintMismatches.push({
          column: columnName,
          property: 'notNull',
          expected: !!schemaDef.required,
          actual: dbColumn.notNull
        });
      }
      if (schemaDef.index !== undefined) {
        const expectedIndex = !!schemaDef.index;
        if (expectedIndex !== dbColumn.index) {
          differences.constraintMismatches.push({
            column: columnName,
            property: 'index',
            expected: expectedIndex,
            actual: dbColumn.index
          });
        }
      }
    });

    // 检查数据库中存在的但Schema中没有的列
    Object.keys(currentSchema).forEach(columnName => {
      if (!schema[columnName] && columnName !== '_id') {
        // 忽略自动添加的_id字段
        differences.extraColumns.push(columnName);
      }
    });
    return {
      currentSchema,
      definedSchema: Object.keys(schema).reduce((acc, key) => {
        const schemaDef = schema[key];
        acc[key] = {
          type: schemaDef.type === DataTypes.String ? 'TEXT' : schemaDef.type === DataTypes.Number ? 'INTEGER' : schemaDef.type === DataTypes.Float ? 'REAL' : schemaDef.type === DataTypes.Boolean ? 'INTEGER' : schemaDef.type === DataTypes.Timestamp ? 'INTEGER' : schemaDef.type === DataTypes.Array ? 'TEXT' : schemaDef.type === DataTypes.Object ? 'TEXT' : 'TEXT',
          notNull: !!schemaDef.required,
          primaryKey: !!schemaDef.primaryKey,
          index: !!schemaDef.index
        };
        return acc;
      }, {} as Record<string, {
        type: string;
        notNull: boolean;
        primaryKey: boolean;
        index: boolean;
      }>),
      differences
    };
  }

  //==================  表相关方法  ====================//
  /**
   * 同步表结构（会删除旧表并重建）
   * @param transformFn 可选的数据转换函数，用于迁移旧数据
   */
  function syncTableSchema(transformFn?: (oldData: any[]) => Nullable<Partial<Model>>[]) {
    let result = null;
    k.DB.sqlite.transaction(() => {
      const isExists = isExistsTable(tableName);
      transformFn = transformFn || (data => data);

      // 1. 备份旧数据（如果有转换函数）
      const oldData = isExists ? TableInstance.all() : [];

      // 2. 删除旧表
      isExists && deleteTable(tableName);

      // 3. 创建新表
      createTable(tableName, schema, config);

      // 4. 如果有转换函数，则迁移数据
      if (transformFn && oldData.length > 0) {
        // 转换数据
        const transformedData = transformFn(oldData);
        if (transformedData.length === 0) {
          return {
            success: true,
            migratedCount: 0,
            message: '表结构已同步（无数据迁移）'
          };
        }

        // 获取默认值
        const defaultModel = getDefaultModel();

        // 批量插入
        transformedData.forEach(model => {
          const newModel = {
            ...defaultModel,
            ...removeNullUndefined(model)
          };
          const rowData = serialize(pickProperties(newModel, Object.keys(schema)), schema) as any;

          // 构建插入SQL
          const columns = Object.keys(rowData).map(col => `'${col}'`).join(', ');
          const values = Object.keys(rowData).map(col => `@${col}`).join(', ');
          const sql = `INSERT INTO '${tableName}' (${columns}) VALUES (${values})`;

          // 执行SQL
          k.DB.sqlite.execute(sql, rowData);
        });
        result = {
          success: true,
          migratedCount: transformedData.length,
          message: `表结构已同步并迁移了 ${transformedData.length} 条数据`
        };
      }
    });
    if (result) {
      return result;
    }
    return {
      success: true,
      migratedCount: 0,
      message: '表结构已同步（无数据迁移）'
    };
  }

  /**
   * 手动还原旧数据
   * @param data 要还原的数据数组
   * @param transformFn 可选的数据转换函数，用于转换旧数据格式
   */
  function restoreData(data: any[], transformFn?: (oldData: any[]) => Nullable<Partial<Model>>[]) {
    // 检查表是否存在
    if (!isExistsTable(tableName)) {
      throw new Error(`表 ${tableName} 不存在，无法还原数据`);
    }

    // 如果有转换函数，则转换数据
    const transformedData = transformFn ? transformFn(data) : data;
    if (transformedData.length === 0) {
      return {
        success: true,
        restoredCount: 0,
        message: '没有数据需要还原'
      };
    }

    // 获取默认值
    const defaultModel = getDefaultModel();

    // 开始事务
    k.DB.sqlite.execute('BEGIN TRANSACTION');
    try {
      // 批量插入
      transformedData.forEach(model => {
        const newModel = {
          ...defaultModel,
          ...removeNullUndefined(model)
        };
        const rowData = serialize(pickProperties(newModel, Object.keys(schema)), schema) as any;

        // 构建插入SQL
        const columns = Object.keys(rowData).map(col => `'${col}'`).join(', ');
        const values = Object.keys(rowData).map(col => `@${col}`).join(', ');
        const sql = `INSERT INTO '${tableName}' (${columns}) VALUES (${values})`;

        // 执行SQL
        k.DB.sqlite.execute(sql, rowData);
      });

      // 提交事务
      k.DB.sqlite.execute('COMMIT');
      return {
        success: true,
        restoredCount: transformedData.length,
        message: `成功还原了 ${transformedData.length} 条数据`
      };
    } catch (error) {
      // 回滚事务
      k.DB.sqlite.execute('ROLLBACK');
      throw new Error(`数据还原失败: ${(error as Error).message}`);
    }
  }
  function _move(sourceId: string, prevId: string | undefined, nextId: string | undefined): [Model[], string | null] {
    const ids: string[] = [sourceId!];
    if (!prevId && !nextId) {
      return [[], 'prevId & nextId is null'];
    }
    if (prevId) {
      ids.push(prevId);
    }
    if (nextId) {
      ids.push(nextId);
    }
    const list = k.DB.sqlite.query<Model[]>(`SELECT * FROM '${tableName}' WHERE _id IN @ids`, {
      ids
    });
    const target = list.find(it => it._id === sourceId);
    if (!target) {
      return [[], 'target not found'];
    }
    if (prevId && nextId) {
      const prev: Model = list.find(it => it._id === prevId)!;
      const next: Model = list.find(it => it._id === nextId)!;
      if (!prev || !next) {
        return [[], 'prev or next not found'];
      }
      return _calculateToUpdates(prev, next, target);
    } else if (prevId) {
      const prev: Model = list.find(it => it._id === prevId)!;
      if (!prev) {
        return [[], 'prev not found'];
      }

      // 界面上拖到最上面，数据最大
      const [next] = k.DB.sqlite.query<Model[]>(`SELECT * FROM '${tableName}' WHERE _id != @id AND dragAndDrop > @dragAndDrop ORDER BY dragAndDrop ASC LIMIT 1`, {
        id: sourceId,
        dragAndDrop: prev.dragAndDrop
      });
      if (!next) {
        // sequence如果找不到next，直接设置一个很大的值
        target.dragAndDrop = (prev.dragAndDrop as number) + 1000;
        return [[target], null];
      }
      return _calculateToUpdates(prev, next, target);
    } else if (nextId) {
      const next: Model = list.find(it => it._id === nextId)!;
      if (!next) {
        return [[], 'next not found'];
      }
      const [prev] = k.DB.sqlite.query<Model[]>(`SELECT * FROM '${tableName}' WHERE _id != @id AND dragAndDrop < @dragAndDrop ORDER BY dragAndDrop DESC LIMIT 1`, {
        id: sourceId,
        dragAndDrop: next.dragAndDrop
      });
      if (!prev) {
        // sequence如果找不到prev，直接设置一个很小的值
        target.dragAndDrop = (next.dragAndDrop as number) - 1000;
        return [[target], null];
      }
      return _calculateToUpdates(prev, next, target);
    }
    return [[], 'prevId & nextId is null'];
  }
  function _calculateToUpdates(prev: Model, next: Model, target: Model): [Model[], string | null] {
    const nextDragAndDrop: number = Math.ceil(next.dragAndDrop as number);
    const prevDragAndDrop: number = Math.floor(prev.dragAndDrop as number);
    // 1. 中间插入, 有足够空间，取中间值
    if (nextDragAndDrop - prevDragAndDrop >= 2) {
      target.dragAndDrop = (nextDragAndDrop + prevDragAndDrop) / 2;
      return [[target], null];
    }
    // 2. 空间不够，挪动多条位置，直到有足够空间
    const sortedList = k.DB.sqlite.query<Model[]>(`SELECT * FROM '${tableName}' WHERE dragAndDrop >= @prevDragAndDrop AND dragAndDrop <= @nextDragAndDrop ORDER BY dragAndDrop ASC`, {
      prevDragAndDrop,
      nextDragAndDrop
    });
    const toUpdates: Model[] = [];
    let enough = false;
    let lastNum = 0;
    let start = false;
    for (let i = 0; i < sortedList.length; i++) {
      const item = sortedList[i];
      if (item._id === prev._id) {
        start = true;
        lastNum = item.dragAndDrop as number;
        toUpdates.push(target);
        continue;
      }
      if (!start) continue;
      if (item._id === target._id) continue;
      toUpdates.push(item);
      const diff = (item.dragAndDrop as number) - prevDragAndDrop;
      if (diff >= toUpdates.length) {
        lastNum = item.dragAndDrop as number;
        enough = true;
        break;
      }

      // sequence每次循环都更新lastNum，与C#代码保持一致
      lastNum = item.dragAndDrop as number;
    }
    if (!enough) {
      // 如果空间不够，则取最后一个元素的dragAndDrop值，并加上10倍的步长
      lastNum = prevDragAndDrop + 10 * (toUpdates.length - 1);
    }

    // 计算步长
    const step = (lastNum - prevDragAndDrop) / (toUpdates.length - 1 || 1);

    // 如果空间足够，则移除最后一个元素（不需要更新它）
    if (enough) {
      toUpdates.pop();
    }
    const result = toUpdates.map((it, ix) => {
      it.dragAndDrop = prevDragAndDrop + step * (ix + 1);
      return it;
    });
    return [result, null];
  }
  type MoveRecordFunction = (sourceId: string, target: {
    prevId?: string;
    nextId?: string;
  }) => Record<string, number>;
  function move(source: string, target: {
    prevId?: string;
    nextId?: string;
  }) {
    const {
      prevId,
      nextId
    } = target;
    const [toUpdates, error] = _move(source, prevId, nextId);
    if (error) {
      k.logger.error(loggerCategory, `move ${source} to ${JSON.stringify(target)} error: ${error}`);
    }
    const result: Record<string, number> = {};
    if (!toUpdates.length) {
      k.logger.warning(loggerCategory, `move ${source} to ${JSON.stringify(target)} toUpdates is empty`);
    } else {
      const sql: string[] = [];
      const params: Record<string, any> = {};
      for (let i = 0; i < toUpdates.length; i++) {
        const item = toUpdates[i];
        const value = item.dragAndDrop as number;
        result[item._id] = value;
        sql.push(`UPDATE '${tableName}' SET dragAndDrop = @value${i} WHERE _id = @id${i};`);
        params[`value${i}`] = value;
        params[`id${i}`] = item._id;
      }
      k.DB.sqlite.execute(sql.join('\n'), params);
    }
    return result;
  }

  //================ -END 表相关方法 -==================//

  const modelMethods = {
    getDefaultModel,
    create,
    createMany,
    createIfNotExists,
    deleteById,
    deleteByIds,
    deleteOne,
    deleteMany,
    removeById,
    removeByIds,
    removeOne,
    removeMany,
    restoreByIds,
    clear,
    updateOne,
    updateById,
    updateOrCreate,
    updateMany,
    patchMany,
    findOne,
    findById,
    findAll,
    findPaginated,
    count,
    sum,
    max,
    min,
    diffSchema,
    syncTableSchema,
    restoreData,
    _createTable: () => createTable(tableName, schema, config),
    _deleteTable: () => deleteTable(tableName),
    $type: {} as Model
  };
  if (config?.dragAndDrop) {
    ;
    (modelMethods as any).move = move;
  }

  // 开发模式 自动创建表
  if (isDev && !isExistsTable(tableName)) {
    if (typeof config?.beforeTableCreate === 'function') {
      config.beforeTableCreate();
    }
    createTable(tableName, schema, config);
    if (typeof config?.afterTableCreate === 'function') {
      config.afterTableCreate();
    }
  }
  return modelMethods as typeof modelMethods & (TModelConfig extends {
    dragAndDrop: true;
  } ? {
    /**
     * 移动数据
     * @param source 源数据ID
     * @param target 目标位置，prevId和nextId至少一个不为undefined
     * @param target.prevId 目标位置的上一个数据ID，如果为undefined，则表示目标位置在第一个
     * @param target.nextId 目标位置的下一个数据ID，如果为undefined，则表示目标位置在最后一个
     * @returns 移动后的数据
     */
    move: MoveRecordFunction;
  } : {});
}
export const ksql = {
  DataTypes,
  Operators,
  define,
  // 手动执行sql
  query: (sql: string, param?: any) => k.DB.sqlite.query(sql, param),
  // 手动查询
  execute: (sql: string, param?: any) => k.DB.sqlite.execute(sql, param),
  // 手动执行
  transaction: (cb: () => void) => k.DB.sqlite.transaction(cb) // 事务
};
export default ksql;

// 用到的函数

// 序列化到数据库
function serialize<T extends Record<string, any>, TModelSchema extends ModelSchema>(newModel: T, schema: TModelSchema): T {
  for (const [key, value] of Object.entries(newModel)) {
    const schemaItem = schema[key];
    if (!schemaItem) continue; // 跳过schema未定义的字段

    // NULL处理
    if (value === null || value === undefined) {
      ;
      (newModel as any)[key] = null;
      continue;
    }

    // 类型处理
    switch (schemaItem.type) {
      case DataTypes.Array:
        if (Array.isArray(value) || value === null) {
          ;
          (newModel as any)[key] = JSON.stringify(value);
        } else {
          // 允许写入非数组类型，存储为字符串，读取时非JSON字符串将返回[]
          ;
          (newModel as any)[key] = value;
        }
        break;
      case DataTypes.Object:
        if (isObject(value) || value === null) {
          ;
          (newModel as any)[key] = JSON.stringify(value);
        } else {
          // 允许写入非对象类型，存储为字符串，读取时非JSON字符串将返回[]
          ;
          (newModel as any)[key] = value;
        }
        break;

      // 自动转换的类型
      case DataTypes.Boolean:
        ;
        (newModel as any)[key] = value ? 1 : 0;
        break;
      case DataTypes.Timestamp:
        if (value === null) {
          ;
          (newModel as any)[key] = null;
          continue;
        } else if (!isTimestamp(value)) {
          const time = new Date(value).getTime();
          if (isTimestamp(time)) {
            ;
            (newModel as any)[key] = time;
          } else {
            throw new TypeError(`Field ${key} must be a plain Timestamp, got ${typeof value}.\n${value}`);
          }
        }
        break;
      case DataTypes.Number:
        ;
        (newModel as any)[key] = Number(value);
        break;
      case DataTypes.String:
        ;
        (newModel as any)[key] = String(value);
        break;
      case DataTypes.Float:
        ;
        (newModel as any)[key] = parseFloat(value);
        break;
      default:
        ;
        (newModel as any)[key] = value;
      // 未知类型保持原样
    }
  }
  return newModel;
}

// 反序列化
function deserialize<T extends Record<string, any>, TModelSchema extends ModelSchema>(dbModel: T, schema: TModelSchema): T {
  const result: any = {
    ...dbModel
  };
  for (const [key, value] of Object.entries(result)) {
    const schemaItem = schema[key];
    if (!schemaItem || value === null) continue;
    switch (schemaItem.type) {
      // 处理JSON序列化类型
      case DataTypes.Array:
        result[key] = typeof value === 'string' ? parseJsonSafe(value, []) : Array.isArray(value) ? value : [];
        break;
      case DataTypes.Object:
        result[key] = typeof value === 'string' ? parseJsonSafe(value, {}) : isObject(value) ? value : {};
        break;

      // 基本类型安全转换
      case DataTypes.Boolean:
        result[key] = !!value;
        break;
      case DataTypes.Timestamp:
        result[key] = value ? Number(value) : null;
        break;
      case DataTypes.Number:
        result[key] = value !== undefined ? Number(value) : value;
        break;
      case DataTypes.Float:
        result[key] = value !== undefined ? parseFloat(String(value)) : NaN;
        break;
      case DataTypes.String:
        result[key] = String(value);
        break;
    }
  }
  return result;
}

// 安全解析JSON（带错误处理）
function parseJsonSafe(jsonString: string, defaultValue: any) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
}
function parseSelect<TModelSchema extends ModelSchema>(schema: TModelSchema, select?: string | string[] | any, include?: string[] | any, exclude?: string[] | any) {
  let fields = [];
  if (Array.isArray(select)) {
    fields = select;
  } else if (select === '*') {
    fields = Object.keys(schema);
  } else if (typeof select === 'string' && select.trim()) {
    fields = select.split(',').map(i => i.trim());
  } else {
    fields = Object.keys(schema).filter(key => schema[key].select !== false);
  }
  // include
  if (Array.isArray(include)) {
    fields = [...new Set([...fields, ...include])];
  }
  // exclude
  if (Array.isArray(exclude)) {
    fields = fields.filter(i => !exclude.includes(i));
  }
  return fields;
}
function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}
function isTimestamp(value: any) {
  return Number.isInteger(value) && value > 0 && new Date(value).getTime() === value;
}
function excludeProperties<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const copy = {
    ...obj
  };
  for (const key of keys) {
    delete copy[key];
  }
  return copy;
}
function pickProperties<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result: Pick<T, K> = {} as Pick<T, K>;
  for (const key of keys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}
function getNow(): number {
  const now = Date.now();
  return now;
}
function removeNullUndefined<T extends Record<string, any>>(obj: T): { [K in keyof T]: Exclude<T[K], null | undefined> } {
  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== null && value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}
function isExistsTable(tableName: string) {
  return !!k.DB.sqlite.sqlite_master.count({
    type: 'table',
    name: tableName
  });
}
function createTable(tableName: string, schema: ModelSchema, config?: ModelConfig) {
  try {
    // 1. 构建CREATE TABLE语句
    let columns: string[] = [];
    let autoIncrementInitializers: {
      name: string;
      value: number;
    }[] = [];
    let indexQueries: string[] = [];
    const primaryKeys: string[] = [];
    const uniqueConstraints: {
      columns: string[];
      name?: string;
    }[] = [];
    const foreignKeyConstraints: {
      column: string;
      refTable: string;
      refColumn: string;
      onDelete?: string;
      onUpdate?: string;
    }[] = [];

    // 处理每个列定义
    for (const [columnName, columnConfig] of Object.entries(schema)) {
      // 1.1 处理自增主键（特殊语法）
      if (columnConfig.primaryKey && columnConfig.autoincrement) {
        if (columnConfig.type !== DataTypes.Number) {
          throw new Error(`AUTOINCREMENT can only be used with INTEGER PRIMARY KEY. ` + `Column '${columnName}' is type ${columnConfig.type}`);
        }
        let columnDef = `'${columnName}' INTEGER PRIMARY KEY AUTOINCREMENT`;

        // 处理其他约束
        if (columnConfig.required) {
          columnDef += ' NOT NULL';
        }
        columns.push(columnDef);

        // 记录需要设置初始值的自增列
        if (columnConfig.initialValue) {
          autoIncrementInitializers.push({
            name: columnName,
            value: columnConfig.initialValue
          });
        }
        continue; // 跳过后续处理
      }

      // 1.2 处理普通列
      let columnDef = `'${columnName}'`;

      // 处理数据类型
      switch (columnConfig.type) {
        case DataTypes.String:
        case DataTypes.Array:
        case DataTypes.Object:
          columnDef += ' TEXT';
          break;
        case DataTypes.Number:
        case DataTypes.Boolean:
        case DataTypes.Timestamp:
          columnDef += ' INTEGER';
          break;
        case DataTypes.Float:
          columnDef += ' REAL';
          break;
        default:
          columnDef += ' TEXT';
        // 默认处理
      }

      // 处理约束
      if (columnConfig.primaryKey) {
        primaryKeys.push(columnName);
      }
      if (columnConfig.required) {
        columnDef += ' NOT NULL';
      }
      if (columnConfig.unique) {
        uniqueConstraints.push({
          columns: [columnName],
          name: `${tableName}_${columnName}_unique`
        });
      }
      if (columnConfig.ref) {
        foreignKeyConstraints.push({
          column: columnName,
          refTable: columnConfig.ref.tableName,
          refColumn: columnConfig.ref.fieldName,
          onDelete: columnConfig.ref.onDelete,
          onUpdate: columnConfig.ref.onUpdate
        });
      }
      if (columnConfig.default !== undefined) {
        const defaultValue = typeof columnConfig.default === 'function' ? columnConfig.default({}) : columnConfig.default;
        if (defaultValue !== undefined) {
          // 处理对象/数组类型的默认值
          let sqlDefaultValue: string | undefined;
          if (typeof defaultValue === 'object') {
            sqlDefaultValue = `'${JSON.stringify(defaultValue)}'`;
          } else if (typeof defaultValue === 'string') {
            sqlDefaultValue = `'${defaultValue.replace(/'/g, "''")}'`;
          } else if (typeof defaultValue === 'symbol') {
            sqlDefaultValue = defaultValue.description;
          } else {
            sqlDefaultValue = String(defaultValue);
          }
          if (sqlDefaultValue) {
            columnDef += ` DEFAULT ${sqlDefaultValue}`;
          }
        }
      }
      columns.push(columnDef);

      // 处理单列索引
      if (columnConfig.index) {
        const indexName = `${tableName}_${columnName}_idx`;
        indexQueries.push(`CREATE INDEX IF NOT EXISTS '${indexName}' ON '${tableName}'('${columnName}')`);
      }
    }
    if (config?.dragAndDrop && !columns.some(c => c.startsWith("'dragAndDrop' "))) {
      columns.push(`'dragAndDrop' INTEGER NOT NULL DEFAULT (CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER))`);
      indexQueries.push(`CREATE INDEX IF NOT EXISTS '${tableName}_dragAndDrop_idx' ON '${tableName}'('dragAndDrop')`);
    }

    // 2. 处理配置中的组合约束和索引
    // 处理组合唯一约束
    if (config?.uniques) {
      for (const unique of config.uniques) {
        uniqueConstraints.push({
          columns: unique.columns,
          name: unique.name || `${tableName}_${unique.columns.join('_')}_unique`
        });
      }
    }

    // 处理组合索引
    if (config?.indexes) {
      for (const index of config.indexes) {
        const indexName = index.name || `${tableName}_${index.columns.join('_')}_idx`;
        const columnsList = index.columns.map(c => `'${c}'`).join(', ');
        indexQueries.push(`CREATE ${index.unique ? 'UNIQUE ' : ''}INDEX IF NOT EXISTS '${indexName}' ON '${tableName}'(${columnsList})`);
      }
    }

    // 3. 处理表级约束（主键、唯一、外键）
    if (primaryKeys.length > 0) {
      columns.push(`PRIMARY KEY (${primaryKeys.map(c => `'${c}'`).join(', ')})`);
    }

    // 处理唯一约束
    for (const constraint of uniqueConstraints) {
      columns.push(`CONSTRAINT '${constraint.name}' UNIQUE (${constraint.columns.map(c => `'${c}'`).join(', ')})`);
    }

    // 处理外键约束
    for (const fk of foreignKeyConstraints) {
      let fkClause = `FOREIGN KEY ('${fk.column}') REFERENCES '${fk.refTable}'('${fk.refColumn}')`;
      if (fk.onDelete) fkClause += ` ON DELETE ${fk.onDelete}`;
      if (fk.onUpdate) fkClause += ` ON UPDATE ${fk.onUpdate}`;
      columns.push(fkClause);
    }

    // 4. 执行创建操作
    // 4.1 创建主表
    const createTableQuery = `CREATE TABLE IF NOT EXISTS '${tableName}' (${columns.join(', ')})`;
    k.DB.sqlite.execute(createTableQuery);

    // 4.2 设置自增初始值
    for (const {
      name,
      value
    } of autoIncrementInitializers) {
      k.DB.sqlite.execute(`INSERT OR REPLACE INTO sqlite_sequence (name, seq) ` + `VALUES ('${tableName}', ${value - 1})`);
    }

    // 4.3 创建索引
    for (const indexQuery of indexQueries) {
      k.DB.sqlite.execute(indexQuery);
    }
    return {
      success: true,
      message: `Table '${tableName}' created successfully`,
      indexesCreated: indexQueries.length,
      foreignKeysCreated: foreignKeyConstraints.length
    };
  } catch (error) {
    throw new Error(`Failed to create table '${tableName}': ${error instanceof Error ? error.message : String(error)}`);
  }
}
function deleteTable(tableName: string) {
  try {
    // 删除表
    k.DB.sqlite.execute(`DROP TABLE IF EXISTS '${tableName}'`);

    // 检查 sqlite_sequence 表是否存在
    const seqExists = k.DB.sqlite.query(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'`).length > 0;

    // 如果存在则重置计数器
    if (seqExists) {
      k.DB.sqlite.execute(`DELETE FROM sqlite_sequence WHERE name = '${tableName}'`);
    }
    return `Table ${tableName} deleted successfully`;
  } catch (error) {
    throw new Error(`Failed to delete table ${tableName}: ${error instanceof Error ? error.message : String(error)}`);
  }
}