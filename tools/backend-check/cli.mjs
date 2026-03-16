#!/usr/bin/env node
import path from "node:path";

import { runBackendCheck } from "./index.mjs";

function parseArgs(argv) {
  const result = {
    rootDir: process.cwd(),
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") {
      result.json = true;
      continue;
    }
    if (arg === "--root" && argv[i + 1]) {
      result.rootDir = path.resolve(argv[i + 1]);
      i += 1;
    }
  }

  return result;
}

function printTextReport(report) {
  const { summary, violations } = report;
  console.log("Backend Check Report");
  console.log(`- Model: ${summary.model}`);
  console.log(`- Service: ${summary.service}`);
  console.log(`- API: ${summary.api}`);
  console.log(`- Blockers: ${summary.blockerCount}`);
  console.log(`- Warnings: ${summary.warningCount}`);
  console.log(`- Final Gate: ${summary.finalGate}`);

  if (violations.length === 0) return;

  console.log("");
  console.log("Violations:");
  for (const item of violations) {
    console.log(
      `- [${item.severity}] ${item.ruleId} (${item.scope}) ${item.file}:${item.line} - ${item.message}`,
    );
    console.log(`  suggestion: ${item.suggestion}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = await runBackendCheck({ rootDir: args.rootDir });

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printTextReport(report);
  }

  process.exit(report.summary.finalGate === "PASS" ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
});
