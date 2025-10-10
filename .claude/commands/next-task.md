---
description: Find next available task with dependency awareness
scope: project
---

# Next Available Task

Find unclaimed tasks ready to work on (dependencies satisfied). Shows top recommendations.

## Usage

```bash
/next-task
```

## What It Does

1. **Parse BACKLOG.md** - Extract all unclaimed tasks
2. **Check Dependencies** - Verify each task's dependencies are complete
3. **Rank by Priority** - Show highest-priority ready tasks first
4. **Recommend** - Suggest optimal next task

## Output

```
🔍 Next Available Tasks

[1] ✅ STREAM 1: INFRA - Testing & Quality Infrastructure
    Task: Create scripts/test.sh - Unified test runner
    Status: Ready (no dependencies)

[2] ✅ STREAM 2: DATA - OpenMRS Concepts & Data Model
    Task: Define OpenMRS concepts for ophthalmology domain
    Status: Ready (no dependencies)

[3] ⏸️  STREAM 4: SIDEBAR - Workflow Navigation
    Task: Implement sidebar with collapsible sections
    Status: Blocked (needs LAYOUT)

💡 Recommended: Task #1
    High priority, no dependencies, unlocks downstream work

Claim with: /claim-task 1
```

## Implementation

Delegates to `./scripts/task-next.sh` which:
- Parses unclaimed tasks: `grep "^- \[ \]" BACKLOG.md | grep -v "🔒"`
- Extracts stream context and dependencies
- Checks completion status of dependency streams
- Returns only tasks with satisfied dependencies

## Options

```bash
/next-task           # Show ready tasks only
./scripts/task-next.sh --all  # Show all tasks (including blocked)
```

## Next Steps

After reviewing:

```bash
# Claim recommended task
/claim-task 1

# OR use script directly
./scripts/task-claim.sh 1
```

## Related Commands

- `/claim-task <#>` - Claim a task
- `/task-status` - View current work
- `/sync-backlog` - Sync with team
