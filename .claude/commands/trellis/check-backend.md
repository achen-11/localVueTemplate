Check if the code you just wrote follows the backend development guidelines.

Execute these steps:
1. Run `git status` to see modified files
2. Read `.trellis/spec/backend/index.md` to understand which guidelines apply
3. Based on what you changed, read the relevant guideline files:
   - Protocol and phase order → `.trellis/spec/backend/00-protocol.md`
   - Workflow stages → `.trellis/spec/backend/10-workflow/index.md`
   - Model changes → `.trellis/spec/backend/20-checklists/model-checklist.md`
   - Service changes → `.trellis/spec/backend/20-checklists/service-checklist.md`
   - API changes → `.trellis/spec/backend/20-checklists/api-checklist.md`
   - Final release decision → `.trellis/spec/backend/20-checklists/release-gate.md`
4. Review your code against the guidelines
5. Report any violations and fix them if found
