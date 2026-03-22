import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_PREFIXES = ["", "src"];

const MODEL_RULES = {
  INVALID_STRING_TYPE: "MODEL-001",
  FIND_ALL_NO_ARGS: "MODEL-003",
};

const SERVICE_RULES = {
  INVALID_IMPORT_PATH: "SERVICE-002",
  AWAIT_SYNC_KSQL: "SERVICE-003",
  MONGO_STYLE_OPERATORS: "SERVICE-006",
  MISSING_OPERATORS_IMPORT: "SERVICE-007",
  FIND_ALL_LIMIT_OFFSET: "SERVICE-008",
};

const API_RULES = {
  MISSING_K_URL: "API-001",
  RAW_BODY_USAGE: "API-002",
  SQL_STRING_BUILD: "API-003",
  JWT_PARSE_REQUIRED: "API-004",
  WRONG_QUERY_OBJECT: "API-007",
  QUERYSTRING_TYPE_CONVERSION: "API-008",
  REQUEST_ANY_USAGE: "API-009",
  BODY_DIRECT_ASSERTION: "API-010",
};

const LOGGING_RULES = {
  CONSOLE_USAGE: "LOG-001",
};

function lineNumberFor(content, index) {
  if (index < 0) return 1;
  return content.slice(0, index).split("\n").length;
}

async function collectTsFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTsFiles(full)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

async function collectLayerFiles(rootDir, relativeDir) {
  const all = [];
  for (const prefix of SOURCE_PREFIXES) {
    const target = prefix ? path.join(rootDir, prefix, relativeDir) : path.join(rootDir, relativeDir);
    all.push(...(await collectTsFiles(target)));
  }
  return [...new Set(all)];
}

async function loadFileContents(files) {
  const pairs = await Promise.all(
    files.map(async (file) => ({
      file,
      content: await readFile(file, "utf8"),
    })),
  );
  return pairs;
}

function createViolation(scope, ruleId, severity, file, line, message, suggestion) {
  return { scope, ruleId, severity, file, line, message, suggestion };
}

function runModelRules(file, content) {
  const violations = [];

  // 类型定义规则仅在模型定义上下文生效。
  if (content.includes("ksql.define")) {
    for (const match of content.matchAll(/type\s*:\s*['"`][^'"`]+['"`]/g)) {
      violations.push(
        createViolation(
          "model",
          MODEL_RULES.INVALID_STRING_TYPE,
          "Blocker",
          file,
          lineNumberFor(content, match.index ?? -1),
          "Model 字段类型不应使用字符串字面量。",
          "请使用 DataTypes.String/DataTypes.Number 等类型定义。",
        ),
      );
    }
  }

  for (const match of content.matchAll(/\.findAll\(\s*\)/g)) {
    violations.push(
      createViolation(
        "model",
        MODEL_RULES.FIND_ALL_NO_ARGS,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "findAll() 缺少参数。",
        "请改为 findAll({}) 或传入查询条件对象。",
      ),
    );
  }

  return violations;
}

function runServiceRules(file, content) {
  const violations = [];
  for (const match of content.matchAll(/from\s+['"]code\/(Models|Services|Utils)['"]/g)) {
    violations.push(
      createViolation(
        "service",
        SERVICE_RULES.INVALID_IMPORT_PATH,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "Service 引用了裸路径。",
        "请改为 code/<Layer>/<File> 具体文件路径。",
      ),
    );
  }

  for (const match of content.matchAll(/from\s+['"]\.\.\/(Models|Services|Utils)\//g)) {
    violations.push(
      createViolation(
        "service",
        SERVICE_RULES.INVALID_IMPORT_PATH,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "Service 引用了跨层相对路径。",
        "请使用 code/<Layer>/<File> 绝对逻辑路径。",
      ),
    );
  }

  for (const match of content.matchAll(/await\s+[\w$.]+\.(findAll|findById|findOne|create|update|delete|count)\s*\(/g)) {
    violations.push(
      createViolation(
        "service",
        SERVICE_RULES.AWAIT_SYNC_KSQL,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "检测到 await 同步 k_sqlite 调用。",
        "移除 await，并确认调用链按同步语义处理。",
      ),
    );
  }

  // 支持 Operators 的操作符
  const operatorsWithReplacement = ['$gt', '$gte', '$lt', '$lte', '$ne', '$or', '$and', '$contains'];
  // 不支持、需要使用原生 SQL 的操作符
  const operatorsNeedNativeSql = ['$in', '$nin', '$all', '$exists', '$type', '$not', '$regex', '$size', '$like'];

  const allMongoOps = [...operatorsWithReplacement, ...operatorsNeedNativeSql];
  const mongoOpsPattern = new RegExp('\\$(' + allMongoOps.map(op => op.slice(1)).join('|') + ')\\b', 'g');

  for (const match of content.matchAll(mongoOpsPattern)) {
    const operator = '$' + match[1];
    const needsNativeSql = operatorsNeedNativeSql.includes(operator);

    violations.push(
      createViolation(
        "service",
        SERVICE_RULES.MONGO_STYLE_OPERATORS,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "检测到 MongoDB 风格操作符，不适用于 k_sqlite。",
        needsNativeSql
          ? `k_sqlite 不支持 ${operator} 操作符，请改用原生 SQL（k.DB.sqlite.query）进行查询。`
          : "请改用 Operators，并使用 [GT]/[GTE]/[LT]/[LTE]/[NE]/[OR]/[AND]/[CONTAINS]。",
      ),
    );
  }

  const usesOperatorTokens = /\[(GT|GTE|LT|LTE|NE|OR|AND|CONTAINS)\]/.test(content);
  const importsOperators =
    /import\s*\{[^}]*\bOperators\b[^}]*\}\s*from\s*['"]module\/k_sqlite['"]/.test(content) ||
    /import\s+Operators\s+from\s*['"]module\/k_sqlite['"]/.test(content);
  if (usesOperatorTokens && !importsOperators) {
    violations.push(
      createViolation(
        "service",
        SERVICE_RULES.MISSING_OPERATORS_IMPORT,
        "Blocker",
        file,
        1,
        "检测到 Operators 用法但未导入 Operators。",
        "请从 module/k_sqlite 导入 Operators 并解构所需操作符。",
      ),
    );
  }

  // 检查 findAll 使用 limit/offset（k_sqlite 不支持）
  // 简化方法：找到 findAll( 之后，检查是否有 }, 后面跟 limit/offset
  const findAllPattern = /\.findAll\(/g;
  let match;
  while ((match = findAllPattern.exec(content)) !== null) {
    const startIdx = match.index;
    // 找到这个 findAll( 之后的 300 个字符
    const snippet = content.substring(startIdx, startIdx + 300);

    // 找到第一个 }, 位置（表示第一个参数结束）
    const firstParamEnd = snippet.indexOf('},');
    if (firstParamEnd > 0 && firstParamEnd < 200) {
      // 检查 }, 之后是否包含 limit 或 offset
      const afterSecondParam = snippet.substring(firstParamEnd);
      if (/\b(limit|offset)\b/.test(afterSecondParam)) {
        violations.push(
          createViolation(
            "service",
            SERVICE_RULES.FIND_ALL_LIMIT_OFFSET,
            "Blocker",
            file,
            lineNumberFor(content, startIdx),
            "检测到 findAll 使用 limit/offset，k_sqlite 不支持这些选项。",
            "请改用原生 SQL（k.DB.sqlite.query）进行分页查询。",
          ),
        );
      }
    }
  }

  return violations;
}

function runApiRules(file, content) {
  const violations = [];

  if (!content.includes("@k-url")) {
    violations.push(
      createViolation(
        "api",
        API_RULES.MISSING_K_URL,
        "Blocker",
        file,
        1,
        "API 文件缺少 @k-url 声明。",
        "在文件顶部添加 // @k-url /api/<module>/{action}",
      ),
    );
  }

  for (const match of content.matchAll(/k\.request\.body\./g)) {
    violations.push(
      createViolation(
        "api",
        API_RULES.RAW_BODY_USAGE,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "检测到未解析的 k.request.body 属性访问。",
        "先 JSON.parse(k.request.body) 再读取字段。",
      ),
    );
  }

  for (const match of content.matchAll(/const\s+\{[^}]+\}\s*=\s*k\.request\.body/g)) {
    violations.push(
      createViolation(
        "api",
        API_RULES.RAW_BODY_USAGE,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "检测到未解析的 k.request.body 解构赋值。",
        "先 JSON.parse(k.request.body) 后再解构字段。",
      ),
    );
  }

  // 间接 body 访问模式：先赋值 const body = k.request.body，再通过 body.xxx 读取。
  const bodyAliasPattern = /const\s+([A-Za-z_$][\w$]*)\s*=\s*k\.request\.body\b/g;
  const bodyAliases = [];
  for (const match of content.matchAll(bodyAliasPattern)) {
    const alias = match[1];
    if (!alias) continue;
    bodyAliases.push({ alias, index: match.index ?? -1 });
  }

  for (const { alias, index } of bodyAliases) {
    // 查找后续对 alias.xxx 的属性访问
    const propertyAccess = new RegExp(`\\b${alias}\\.[A-Za-z_$][\\w$]*`, "g");
    let propertyMatch;
    while ((propertyMatch = propertyAccess.exec(content)) !== null) {
      violations.push(
        createViolation(
          "api",
          API_RULES.RAW_BODY_USAGE,
          "Blocker",
          file,
          lineNumberFor(content, propertyMatch.index ?? index),
          "检测到通过中间变量访问未解析的 k.request.body。",
          "请先 JSON.parse(k.request.body) 再将结果赋值给中间变量并读取字段。",
        ),
      );
    }
  }

  // k.request.body 虽可通过 unknown 桥接做类型断言，但若未 JSON.parse，
  // 实际仍是字符串语义，属于 API-002。
  for (const match of content.matchAll(/k\.request\.body\s+as\s+unknown\s+as\s+[A-Za-z_$][\w$]*/g)) {
    violations.push(
      createViolation(
        "api",
        API_RULES.RAW_BODY_USAGE,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "检测到未解析的 k.request.body 类型桥接断言。",
        "请先 JSON.parse(k.request.body) 后再进行类型收敛。",
      ),
    );
  }

  const hasRawSqlCall = content.includes("k.DB.sqlite.query(") || content.includes("ksql.query(");
  const hasSqlConcatenation = /(SELECT|UPDATE|DELETE|INSERT).*(\+|\$\{)/i.test(content);
  if (hasRawSqlCall && hasSqlConcatenation) {
    violations.push(
      createViolation(
        "api",
        API_RULES.SQL_STRING_BUILD,
        "Blocker",
        file,
        1,
        "检测到可能的 SQL 字符串拼接。",
        "请改为参数化查询（@param 或 ? 占位符）。",
      ),
    );
  }

  if (content.includes("k.security.jwt.decode(") && !content.includes("JSON.parse(")) {
    violations.push(
      createViolation(
        "api",
        API_RULES.JWT_PARSE_REQUIRED,
        "Blocker",
        file,
        1,
        "检测到 JWT decode 结果未解析。",
        "请 JSON.parse(decodeResult) 并校验状态字段。",
      ),
    );
  }

  for (const match of content.matchAll(/k\.request\.query\b/g)) {
    violations.push(
      createViolation(
        "api",
        API_RULES.WRONG_QUERY_OBJECT,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "检测到 k.request.query，用法不符合 Kooboo 约定。",
        "请使用 k.request.queryString 获取查询参数。",
      ),
    );
  }

  // 只检查 k.request.body 相关的 any 用法，catch (e: any) 是允许的
  for (const match of content.matchAll(/k\.request\.body\s+as\s+any/g)) {
    violations.push(
      createViolation(
        "api",
        API_RULES.REQUEST_ANY_USAGE,
        "Warning",
        file,
        lineNumberFor(content, match.index ?? -1),
        "检测到 any 类型参数，类型约束不足。",
        "请为 body/query 参数定义明确的 interface/type。",
      ),
    );
  }

  for (const match of content.matchAll(/k\.request\.body\s+as\s+([A-Za-z_$][\w$]*)/g)) {
    const assertedType = match[1];
    if (["unknown", "any", "string"].includes(assertedType)) continue;
    violations.push(
      createViolation(
        "api",
        API_RULES.BODY_DIRECT_ASSERTION,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "检测到 k.request.body 直接断言为目标类型。",
        "请先转为 unknown 再断言，或先 JSON.parse 后做类型收敛。",
      ),
    );
  }

  for (const match of content.matchAll(/const\s+\w+\s*:\s*([A-Za-z_$][\w$]*)\s*=\s*k\.request\.body\b/g)) {
    const assignedType = match[1];
    if (["unknown", "any", "string"].includes(assignedType)) continue;
    violations.push(
      createViolation(
        "api",
        API_RULES.BODY_DIRECT_ASSERTION,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "检测到 k.request.body 直接赋值到非 string 类型变量。",
        "请先转为 unknown 再断言，或先 JSON.parse 后做类型收敛。",
      ),
    );
  }

  const hasNumericConversion = (identifier) =>
    new RegExp(`\\b(parseInt|Number)\\s*\\(\\s*${identifier}\\b`).test(content);

  const directNumericAssign = /const\s+(\w+)\s*=\s*k\.request\.queryString\.(page|pageSize|limit|offset)\b/g;
  for (const match of content.matchAll(directNumericAssign)) {
    const identifier = match[1];
    if (hasNumericConversion(identifier)) continue;
    violations.push(
      createViolation(
        "api",
        API_RULES.QUERYSTRING_TYPE_CONVERSION,
        "Warning",
        file,
        lineNumberFor(content, match.index ?? -1),
        "检测到 queryString 数值参数直接使用，可能存在类型隐式错误。",
        "请使用 parseInt/Number 显式转换并设置默认值。",
      ),
    );
  }

  const destructureNumericAssign = /const\s*\{([^}]*)\}\s*=\s*k\.request\.queryString\b/g;
  for (const match of content.matchAll(destructureNumericAssign)) {
    const raw = match[1] ?? "";
    const tokens = raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const numericIdentifiers = [];
    for (const token of tokens) {
      const [left, right] = token.split(":").map((x) => x.trim());
      const key = left;
      const alias = right || left;
      if (["page", "pageSize", "limit", "offset"].includes(key)) {
        numericIdentifiers.push(alias);
      }
    }
    for (const identifier of numericIdentifiers) {
      if (hasNumericConversion(identifier)) continue;
      violations.push(
        createViolation(
          "api",
          API_RULES.QUERYSTRING_TYPE_CONVERSION,
          "Warning",
          file,
          lineNumberFor(content, match.index ?? -1),
          `检测到 queryString 数值参数 ${identifier} 直接使用，可能存在类型隐式错误。`,
          "请使用 parseInt/Number 显式转换并设置默认值。",
        ),
      );
    }
  }

  return violations;
}

function runLoggingRules(file, content) {
  const violations = [];

  // LOG-001: 禁止使用 console（Kooboo 没有 console 对象）
  for (const match of content.matchAll(/console\.(log|warn|error|info|debug)\s*\(/g)) {
    violations.push(
      createViolation(
        "logging",
        LOGGING_RULES.CONSOLE_USAGE,
        "Blocker",
        file,
        lineNumberFor(content, match.index ?? -1),
        "检测到 console 使用。Kooboo 服务端没有 console 对象。",
        "请改用 k.logger.debug/information/warning/error。",
      ),
    );
  }

  return violations;
}

function summarize(violations) {
  const blockerCount = violations.filter((v) => v.severity === "Blocker").length;
  const warningCount = violations.filter((v) => v.severity === "Warning").length;
  const scopeStatus = (scope) =>
    violations.some((v) => v.scope === scope && v.severity === "Blocker") ? "FAIL" : "PASS";
  const finalGate = blockerCount > 0 ? "FAIL" : "PASS";

  return {
    blockerCount,
    warningCount,
    model: scopeStatus("model"),
    service: scopeStatus("service"),
    api: scopeStatus("api"),
    logging: scopeStatus("logging"),
    finalGate,
  };
}

export async function runBackendCheck(options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const [modelFiles, serviceFiles, apiFiles] = await Promise.all([
    collectLayerFiles(rootDir, "code/Models"),
    collectLayerFiles(rootDir, "code/Services"),
    collectLayerFiles(rootDir, "api"),
  ]);

  const [modelPairs, servicePairs, apiPairs] = await Promise.all([
    loadFileContents(modelFiles),
    loadFileContents(serviceFiles),
    loadFileContents(apiFiles),
  ]);

  const violations = [];
  for (const pair of modelPairs) violations.push(...runModelRules(pair.file, pair.content));
  for (const pair of servicePairs) violations.push(...runServiceRules(pair.file, pair.content));
  for (const pair of apiPairs) violations.push(...runApiRules(pair.file, pair.content));
  for (const pair of servicePairs) violations.push(...runLoggingRules(pair.file, pair.content));

  return {
    summary: summarize(violations),
    violations,
  };
}
