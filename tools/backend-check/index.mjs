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
};

const API_RULES = {
  MISSING_K_URL: "API-001",
  RAW_BODY_USAGE: "API-002",
  SQL_STRING_BUILD: "API-003",
  JWT_PARSE_REQUIRED: "API-004",
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
  if (!content.includes("ksql.define")) return violations;

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

  return {
    summary: summarize(violations),
    violations,
  };
}
