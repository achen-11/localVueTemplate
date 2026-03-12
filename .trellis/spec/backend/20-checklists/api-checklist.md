# API Checklist

> 作用域：`api/**/*.ts` 与首页路由声明文件

---

## Rules

| Rule ID | Severity | Why                          | Check                                              | Fix Hint                                  |
| ------- | -------- | ---------------------------- | -------------------------------------------------- | ----------------------------------------- |
| API-001 | Blocker  | 缺失路由声明会导致接口不可达 | API 文件顶部必须有 `// @k-url /api/.../{action}`   | 按模块声明固定路由前缀                    |
| API-002 | Blocker  | 参数解析错误会导致运行时异常 | `k.request.body` 使用前必须解析（如 `JSON.parse`） | 先解析 body 再读取字段                    |
| API-003 | Blocker  | SQL 注入风险不可接受         | 原生 SQL 必须参数化，禁止字符串拼接                | 使用 `@param` 或 `?` 占位符               |
| API-004 | Blocker  | 鉴权解析错误会造成权限风险   | JWT decode 后必须解析并验证状态字段                | `JSON.parse` decode 结果并检查 code/value |
| API-005 | Warning  | 接口风格不一致增加调用方成本 | 按 REST 方法语义定义 API（GET/POST/PUT/DELETE）    | 对齐资源语义并规范命名                    |
| API-006 | Warning  | 页面入口声明缺失影响路由行为 | 首页应声明 `<!-- @k-url / -->`                     | 在首页模板首行补声明                      |

---

## 执行结果

- [ ] API-001
- [ ] API-002
- [ ] API-003
- [ ] API-004
- [ ] API-005
- [ ] API-006
