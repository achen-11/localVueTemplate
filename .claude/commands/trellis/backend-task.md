Start a backend development task using the Kooboo backend protocol.

Execute these steps:
1. Read `.trellis/spec/backend/00-protocol.md`
2. Read `.trellis/spec/backend/10-workflow/index.md`
3. Read `.trellis/spec/backend/index.md`
4. Ask user for task goal if not provided in current message
5. Execute task in strict order:
   - Plan -> Model -> Service -> API -> Verify
6. At each phase, read corresponding references:
   - Plan -> `code-structure.md`
   - Model -> `database.md`
   - Service -> `database.md`, `security.md`
   - API -> `api-core.md`, `routing.md`, `security.md`
   - Verify -> `20-checklists/*.md`
7. Run `pnpm backend:workflow` before concluding
8. If `Final Gate: FAIL`, fix blockers first and re-run
9. Final report must include:
   - Current phase completion
   - Gate status (PASS/FAIL)
   - Blocker count
   - Warning count

Use this command as default entry for backend feature tasks.
