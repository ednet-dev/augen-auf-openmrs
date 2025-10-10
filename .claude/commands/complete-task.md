---
description: Mark task complete with quality gate validation and cleanup
scope: project
---

# Complete Task

Mark your locked task complete. Runs quality gate + cleanup automatically.

## Usage

```bash
/complete-task
```

No arguments needed - finds your locked task automatically via `.agent_id`.

## What It Does

### 1. Find Your Locked Task
```bash
grep "🔒 \[$AGENT_ID\]" BACKLOG.md
```

### 2. Run Quality Gate (Mandatory)
```bash
./scripts/quality-gate.sh
```

Enforces:
- ✅ All tests passing
- ✅ Zero TypeScript errors
- ✅ Zero lint issues
- ✅ No circular dependencies

**If gate fails → task NOT marked complete. Fix issues first.**

### 3. Run Cleanup
```bash
./scripts/agent-cleanup.sh
```

Removes ephemeral files:
- `*-TEMP.md`, `*-WIP.md`, `*-SCRATCH.md`
- `.agent/*/scratch/`
- `PARALLEL_STATE.md`, `MIGRATION_STATUS.md`, etc.

### 4. Mark Complete
Transform:
```diff
- - [ ] 🔒 [AGENT-1728561234] 2025-10-10T14:30:00Z Create scripts/test.sh
+ - [x] ✅ [AGENT-1728561234] Create scripts/test.sh
```

Format: `- [x] ✅ [AGENT-{id}] {task}`

### 5. Output
```
✅ Task marked complete!

📋 Summary:
   Agent: AGENT-1728561234
   Task: Create scripts/test.sh

📌 Next steps:
   1. Review changes: git status
   2. Commit: git commit -m "Add <feature> to <achieve value>"
   3. Find next: /next-task

💡 Tip: Follow commit format: {Action} {what} to {achieve value}
```

## Commit Message Format

**STRICT format - Single English sentence:**

```bash
# GOOD:
git commit -m "Add test runner script to enforce TDD workflow"
git commit -m "Implement task claiming to enable parallel work"
git commit -m "Create quality gate to prevent broken commits"

# BAD:
git commit -m "WIP"
git commit -m "Fixed stuff"
git commit -m "AGENT-123: Changes"
```

**Formula**: `{Action} {what} to {achieve value/why}`

## Skipping Quality Gate (Not Recommended)

```bash
./scripts/task-complete.sh --skip-quality-gate
```

Only use if:
- Quality gate script broken (fix it instead!)
- Non-code task (docs only)
- Emergency hotfix (still commit clean code!)

## Error Scenarios

### No Locked Task
```
❌ No locked task found for AGENT-1728561234

Current locks in BACKLOG:
  - [ ] 🔒 [AGENT-9999] 2025-10-10T14:25:00Z Other task

# Solution: Claim a task first
/claim-task <#>
```

### Quality Gate Failed
```
❌ Quality gate failed. Fix issues before completing.

Run manually: ./scripts/quality-gate.sh
Skip check: ./scripts/task-complete.sh --skip-quality-gate (not recommended)

# Solution: Fix the issues
./scripts/check-lint.sh    # Lint errors?
./scripts/check-types.sh   # Type errors?
./scripts/test.sh          # Test failures?
```

## Full Workflow

```bash
# 1. Find work
/next-task

# 2. Claim task
/claim-task 1

# 3. TDD cycle (RED → GREEN → REFACTOR)
./scripts/test.sh --watch

# 4. Verify quality
./scripts/quality-gate.sh

# 5. Complete task (includes quality gate)
/complete-task

# 6. Commit
git add .
git commit -m "Add <feature> to <achieve value>"

# 7. Push
git push origin main

# 8. Next task
/next-task
```

## Implementation

Delegates to `./scripts/task-complete.sh` which:
- Loads `.agent_id`
- Finds locked task by agent ID
- Runs `quality-gate.sh` (fails if RED)
- Runs `agent-cleanup.sh`
- Atomic sed replacement: `[ ]` → `[x]`, add ✅, remove lock
- Outputs next steps

## Related Commands

- `/task-status` - Check current work
- `/next-task` - Find next task
- `/claim-task <#>` - Claim task
