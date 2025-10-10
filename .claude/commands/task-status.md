---
description: Dashboard view of current work and team activity
scope: project
---

# Task Status Dashboard

Show your current work, all active locks, team activity, and overall progress.

## Usage

```bash
/task-status          # Basic view
/task-status --verbose  # Include team activity
```

## Output

```
📊 Task Status Dashboard

👤 Your Work (AGENT-1728561234):
  🔒 Create scripts/test.sh - Unified test runner
     ✅ Locked 8 min ago (active)

🔒 All Active Locks:
  → [YOU] AGENT-1728561234: Create scripts/test.sh
         ✅ Active (8 min)
  • AGENT-9999: Implement patient list component
         ✅ Active (3 min)
  • AGENT-8888: Design form schema for pre-surgery assessment
         ⏰ Stale (18 min) - may be claimed

📈 Progress:
  Total: 87 tasks
  ✅ Completed: 12 (14%)
  🔒 Active: 3
  📋 Available: 72

💡 Next Actions:
  1. Continue: ./scripts/test.sh --watch
  2. Complete: /complete-task

Show team activity: /task-status --verbose
```

## Lock Status Indicators

- **✅ Active** (0-15 min) - Lock is fresh, agent working
- **⏰ Stale** (>15 min) - No recent activity, may be claimed
- **→ [YOU]** - Your own lock

## Stale Lock Handling

If lock >15 min old → considered stale. You may:

```bash
# 1. Notify in BACKLOG (polite)
echo "🚨 BLOCKING: AGENT-{YOUR_ID} claiming stale lock" >> BACKLOG.md

# 2. Wait 5 min for response

# 3. Claim if no response
/claim-task <line_number>
```

## Verbose Mode (Team Activity)

```bash
/task-status --verbose
```

Additional output:

```
👥 Recent Team Activity (Last 2 hours):
  • a1b2c3d alice@example.com 5 min ago: Add bilateral input component to enable data capture
  • d4e5f6g bob@example.com 18 min ago: Implement BCVA validation to prevent invalid values
  • g7h8i9j charlie@example.com 1 hour ago: Create quality gate to enforce zero-tolerance
```

Shows:
- Commit hash
- Author email
- Time ago
- Commit message

## Progress Tracking

**Total Tasks** = Unclaimed + Claimed + Completed

**Percent Done** = (Completed / Total) × 100

Use to estimate:
- Remaining effort
- Team velocity
- Sprint completion

## Use Cases

### Before Claiming
```bash
# Check what's actively being worked on
/task-status

# Avoid duplicate work (similar tasks)
# Check for stale locks (claimable tasks)
```

### During Work
```bash
# Verify your lock is active
/task-status

# Monitor team progress
/task-status --verbose
```

### After Commit
```bash
# Confirm task marked complete
/task-status

# Check new available tasks
/next-task
```

## Implementation

Delegates to `./scripts/task-status.sh` which:
- Loads `.agent_id` if exists
- Parses BACKLOG.md for all locks
- Extracts timestamps, checks age (>15min = stale)
- Counts unclaimed/claimed/completed tasks
- Shows git log (if `--verbose`)

## Lock Age Calculation

```bash
# Parse ISO8601 timestamp
lock_time=$(date -d "$timestamp" +%s)
now_time=$(date +%s)
age_min=$(( (now_time - lock_time) / 60 ))

if [[ $age_min -gt 15 ]]; then
  echo "⏰ Stale"
else
  echo "✅ Active"
fi
```

## Related Commands

- `/next-task` - Find available tasks
- `/claim-task <#>` - Claim task
- `/complete-task` - Mark done
- `/sync-backlog` - Full team sync with conflict detection
