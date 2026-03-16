# Verify 阶段

---

## 目标

聚合分层检查结果，形成交付结论，决定是否允许进入提交阶段。

## 输入

- Model/Service/API 分层检查结果

## 关键动作

- 执行分层检查并记录失败项。
- 运行 release gate 汇总。
- 对 Warning 给出处理建议与优先级。

### 部署验证（可选但推荐）

在代码通过本地检查后，进行远程部署验证：

#### 前置条件

- 已安装 `kooboo-cli`（`kb` 命令可用）
- 已配置目标站点的环境变量（站点 URL、权限等）

#### 步骤

1. **推送代码到远程站点**

   ```bash
   kb push
   ```

   该命令会读取环境配置，全量推送到远程 Kooboo 站点。

2. **获取站点 Base URL**

   从环境变量或配置中获取远程站点地址，例如：

   ```bash
   # 假设站点 URL 存储在 KOOBOO_SITE_URL 环境变量
   SITE_URL=${KOOBOO_SITE_URL:-"https://your-site.kooboo.com"}
   ```

3. **执行接口测试**

   根据本次开发的接口进行 curl 测试：

   ```bash
   # 示例：POST 创建接口
   curl -X POST "${SITE_URL}/api/member/create" \
     -H "Content-Type: application/json" \
     -d '{"name":"test","phone":"13800000001","password":"123456"}'

   # 示例：GET 查询接口
   curl -X GET "${SITE_URL}/api/member/info?id=xxx"
   ```

4. **验证响应**

   - 检查返回 JSON 中的 `success` 字段
   - 验证业务逻辑正确（数据创建成功、查询返回正确内容等）
   - 检查无服务端异常

5. **失败处理**

   若测试失败：
   - 记录错误信息（请求参数、响应内容、错误堆栈）
   - 回退到对应开发阶段（Model/Service/API）进行修复
   - 修复后重新 `kb push` 并测试

#### 注意事项

- 建议使用测试数据，避免污染生产数据
- 敏感接口需要获取相应权限后再测试
- 复杂业务流程建议编写测试脚本批量执行

## 退出标准

- 无 Blocker。
- 已产出结构化检查报告（至少包含层级、规则 ID、结果）。

## 关联清单

- `../20-checklists/release-gate.md`

## 参考知识文档

- `../20-checklists/model-checklist.md`
- `../20-checklists/service-checklist.md`
- `../20-checklists/api-checklist.md`
- `../20-checklists/release-gate.md`
