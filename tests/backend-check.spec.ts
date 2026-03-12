import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { runBackendCheck } from "../tools/backend-check/index.mjs";

async function writeFixtureFile(root: string, rel: string, content: string) {
  const full = path.join(root, rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content, "utf8");
}

describe("backend check engine", () => {
  it("returns blocker violations and failed gate", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backend-check-"));

    try {
      await writeFixtureFile(
        root,
        "api/user.ts",
        "import { User } from 'code/Models/User'\n" +
          "k.api.post('create', () => {\n" +
          "  const x = k.request.body.userName\n" +
          "  return { success: true }\n" +
          "})\n",
      );

      const result = await runBackendCheck({ rootDir: root });
      expect(result.summary.blockerCount).toBeGreaterThan(0);
      expect(result.summary.finalGate).toBe("FAIL");
      expect(result.violations.some((v) => v.ruleId === "API-001")).toBe(true);
      expect(result.violations.some((v) => v.ruleId === "API-002")).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("passes clean files and returns PASS gate", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backend-check-"));

    try {
      await writeFixtureFile(
        root,
        "code/Models/User.ts",
        "import { ksql, DataTypes } from 'module/k_sqlite'\n" +
          "export const User = ksql.define('users', {\n" +
          "  userName: { type: DataTypes.String }\n" +
          "}, { timestamps: true })\n",
      );
      await writeFixtureFile(
        root,
        "code/Services/UserService.ts",
        "import { User } from 'code/Models/User'\n" +
          "export function byId(id: string) {\n" +
          "  return User.findById(id)\n" +
          "}\n",
      );
      await writeFixtureFile(
        root,
        "api/user.ts",
        "// @k-url /api/user/{action}\n" +
          "k.api.post('create', () => {\n" +
          "  const body = JSON.parse(k.request.body)\n" +
          "  return { success: !!body }\n" +
          "})\n",
      );

      const result = await runBackendCheck({ rootDir: root });
      expect(result.summary.blockerCount).toBe(0);
      expect(result.summary.finalGate).toBe("PASS");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
