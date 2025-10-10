---
description: Claim task with upstream sync and FCFS conflict resolution
scope: project
---

# Claim Task

Atomically claim a task with upstream sync. First-come-first-serve timestamp resolution for conflicts.

## Usage

```bash
/claim-task <task_number>
```

## Arguments

- `<task_number>` - Task number from `/next-task` output (e.g., 1, 2, 3)

## Example

```bash
# Find available tasks
/next-task

# Output shows:
# [1] ✅ STREAM 1: INFRA - Create scripts/test.sh

# Claim task #1
/claim-task 1
```

## What It Does

### 1. Sync with Upstream (FCFS Resolution)
```bash
git fetch origin main
git pull --rebase origin main
```

If conflict in BACKLOG.md → earlier timestamp wins, abort claim.

### 2. Generate/Load Agent ID
First claim: `AGENT-$(date +%s)` → saved to `.agent_id`
Subsequent: Load from `.agent_id`

### 3. Atomic Lock
Transform:
```diff
- - [ ] Create scripts/test.sh
+ - [ ] 🔒 [AGENT-1728561234] 2025-10-10T14:30:00Z Create scripts/test.sh
```

Lock format: `🔒 [AGENT-{id}] {ISO8601-timestamp} {task}`

### 4. Verify Success
```
✅ Claimed task: Create scripts/test.sh
🔒 Lock: [AGENT-1728561234] @ 2025-10-10T14:30:00Z

📋 Next steps:
   1. Start TDD: ./scripts/test.sh --watch
   2. Implement: Follow RED → GREEN → REFACTOR
   3. Complete: /complete-task
```

## Conflict Scenarios

### Scenario 1: Already Locked
```
❌ Task already locked:
   - [ ] 🔒 [AGENT-9999] 2025-10-10T14:25:00Z Create scripts/test.sh

Check lock age with: /task-status
```

If lock >15min stale → may be claimed (shows in status).

### Scenario 2: Merge Conflict
```
❌ Merge conflict detected. Resolve manually:
    git status
    # Fix conflicts in BACKLOG.md
    git add BACKLOG.md
    git rebase --continue
```

Resolution: Keep both locks, earlier timestamp wins. Update your claim.

### Scenario 3: Task Already Completed
```
❌ Line 45 is not an unclaimed task:
   - [x] ✅ [AGENT-8888] Create scripts/test.sh
```

Find new task: `/next-task`

## Implementation

Delegates to `./scripts/task-claim.sh` which:
- Syncs git (atomic pull with rebase)
- Resolves task number → line number in BACKLOG.md
- Validates task is unclaimed
- Atomic sed replacement with lock
- Creates `.agent_id` if missing

## Advanced Usage

```bash
# Claim by line number (for manual selection)
./scripts/task-claim.sh 45

# Claim by task number (from /next-task)
./scripts/task-claim.sh 1
```

## Related Commands

- `/next-task` - Find tasks
- `/task-status` - Check locks
- `/complete-task` - Mark done
- `/sync-backlog` - Team sync
