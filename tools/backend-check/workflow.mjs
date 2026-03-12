#!/usr/bin/env node
import { runBackendCheck } from "./index.mjs";

function printNextSteps(finalGate) {
  console.log("");
  console.log("Backend Workflow Next Step:");
  if (finalGate === "PASS") {
    console.log("- Gate 通过，可继续进入实现或提交流程。");
    console.log("- 建议继续按 .trellis/spec/backend/10-workflow/verify.md 完成验证记录。");
    return;
  }

  console.log("- Gate 未通过，请先修复 Blocker，再继续后续阶段。");
  console.log("- 修复后重新运行: pnpm backend:workflow");
  console.log("- 协议参考: .trellis/spec/backend/00-protocol.md");
}

async function main() {
  const report = await runBackendCheck();
  const { summary } = report;
  console.log("Backend Workflow Report");
  console.log(`- Model: ${summary.model}`);
  console.log(`- Service: ${summary.service}`);
  console.log(`- API: ${summary.api}`);
  console.log(`- Blockers: ${summary.blockerCount}`);
  console.log(`- Warnings: ${summary.warningCount}`);
  console.log(`- Final Gate: ${summary.finalGate}`);
  printNextSteps(summary.finalGate);
  process.exit(summary.finalGate === "PASS" ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
});
