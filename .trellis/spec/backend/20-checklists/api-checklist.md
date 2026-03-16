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
| API-007 | Blocker  | 使用错误的请求查询对象会导致参数获取失败 | GET 参数必须使用 `k.request.queryString`，禁止 `k.request.query` | 将 `k.request.query` 替换为 `k.request.queryString` |
| API-008 | Warning  | queryString 值默认是字符串，直接使用会产生隐式类型错误 | 对 `page/pageSize/limit/offset` 等数值参数做显式转换 | 使用 `parseInt/Number` 并设置兜底默认值 |
| API-009 | Warning  | `any` 会绕过请求参数类型检查 | 请求体和查询参数避免 `any`，应使用明确接口类型 | 为 body/query 参数定义 interface/type |
| API-010 | Blocker  | 将 string 直接断言为接口类型会导致 TS 类型错误或隐藏风险 | `k.request.body` 禁止直接 `as SomeInterface`（单步断言） | 先 `JSON.parse(k.request.body)`，再做类型收敛（必要时配合 `unknown` 过桥） |

---

## 执行结果

- [ ] API-001
- [ ] API-002
- [ ] API-003
- [ ] API-004
- [ ] API-005
- [ ] API-006
- [ ] API-007
- [ ] API-008
- [ ] API-009
- [ ] API-010
