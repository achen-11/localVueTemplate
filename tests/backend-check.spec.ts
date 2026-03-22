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
  it("flags service operator misuse rules", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backend-check-"));

    try {
      await writeFixtureFile(
        root,
        "code/Services/BookingService.ts",
        "export function list(now: number) {\n" +
          "  return Booking.findAll({ scheduleTime: { $gte: now } })\n" +
          "}\n" +
          "export function list2(now: number) {\n" +
          "  return Booking.findAll({ scheduleTime: { [GTE]: now } })\n" +
          "}\n",
      );

      const result = await runBackendCheck({ rootDir: root });
      expect(result.violations.some((v) => v.ruleId === "SERVICE-006")).toBe(true);
      expect(result.violations.some((v) => v.ruleId === "SERVICE-007")).toBe(true);
      expect(result.summary.finalGate).toBe("FAIL");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("flags wrong query object and weak query typing in api", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backend-check-"));

    try {
      await writeFixtureFile(
        root,
        "api/member.ts",
        "// @k-url /api/member/{action}\n" +
          "k.api.get('list', () => {\n" +
          "  const page = k.request.queryString.page\n" +
          "  const fromBadObj = k.request.query.id\n" +
          "  return { page, fromBadObj }\n" +
          "})\n" +
          "k.api.post('create', () => {\n" +
          "  const body = k.request.body as any\n" +
          "  return { success: !!body }\n" +
          "})\n",
      );

      const result = await runBackendCheck({ rootDir: root });
      expect(result.violations.some((v) => v.ruleId === "API-007")).toBe(true);
      expect(result.violations.some((v) => v.ruleId === "API-008")).toBe(true);
      expect(result.violations.some((v) => v.ruleId === "API-009")).toBe(true);
      expect(result.summary.finalGate).toBe("FAIL");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("does not flag API-008 when queryString values are explicitly converted", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backend-check-"));

    try {
      await writeFixtureFile(
        root,
        "api/member.ts",
        "// @k-url /api/member/{action}\n" +
          "k.api.get('list', () => {\n" +
          "  const { page, pageSize } = k.request.queryString\n" +
          "  const pageNum = parseInt(page, 10) || 1\n" +
          "  const pageSizeNum = Number(pageSize) || 20\n" +
          "  return { pageNum, pageSizeNum }\n" +
          "})\n",
      );

      const result = await runBackendCheck({ rootDir: root });
      expect(result.violations.some((v) => v.ruleId === "API-008")).toBe(false);
      expect(result.summary.finalGate).toBe("PASS");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("flags API-010 for direct body assertion but allows unknown bridge", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backend-check-"));

    try {
      await writeFixtureFile(
        root,
        "api/member.ts",
        "// @k-url /api/member/{action}\n" +
          "k.api.post('create', () => {\n" +
          "  const badBody = k.request.body as CreateMemberBody\n" +
          "  const goodBody = k.request.body as unknown as CreateMemberBody\n" +
          "  return { ok: !!badBody && !!goodBody }\n" +
          "})\n",
      );

      const result = await runBackendCheck({ rootDir: root });
      const api010Violations = result.violations.filter((v) => v.ruleId === "API-010");
      const api002Violations = result.violations.filter((v) => v.ruleId === "API-002");
      expect(api010Violations.length).toBe(1);
      expect(api002Violations.length).toBe(1);
      expect(result.summary.finalGate).toBe("FAIL");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("flags API-002 when body is asserted via unknown without JSON.parse", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backend-check-"));

    try {
      await writeFixtureFile(
        root,
        "api/member.ts",
        "// @k-url /api/member/{action}\n" +
          "k.api.post('create', () => {\n" +
          "  const body = k.request.body as unknown as CreateMemberBody\n" +
          "  return { success: !!body }\n" +
          "})\n",
      );

      const result = await runBackendCheck({ rootDir: root });
      expect(result.violations.some((v) => v.ruleId === "API-002")).toBe(true);
      expect(result.summary.finalGate).toBe("FAIL");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("flags MODEL-003 even without ksql.define", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backend-check-"));

    try {
      await writeFixtureFile(
        root,
        "code/Models/ValidationTemp.ts",
        "export function badFindAll(User: any) {\n" +
          "  return User.findAll()\n" +
          "}\n",
      );

      const result = await runBackendCheck({ rootDir: root });
      expect(result.summary.blockerCount).toBeGreaterThan(0);
      expect(result.violations.some((v) => v.ruleId === "MODEL-003")).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

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

  it("flags console usage in service files", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backend-check-"));

    try {
      await writeFixtureFile(
        root,
        "code/Services/AdminLogService.ts",
        "export function logAdminAction(params) {\n" +
          "  console.warn('No logged in user, cannot log action')\n" +
          "}\n",
      );

      const result = await runBackendCheck({ rootDir: root });
      expect(result.violations.some((v) => v.ruleId === "LOG-001")).toBe(true);
      expect(result.summary.finalGate).toBe("FAIL");
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
