---
description: Sync with upstream, check task locks, show distributed team activity
scope: project
---

# Backlog Sync & Coordination

Pull latest changes from upstream, check for lock conflicts, and display recent distributed team activity.

## Usage

```bash
/sync-backlog
```

## Steps

### 1. Git Fetch & Pull
```bash
git fetch origin main
git pull origin main --rebase
```

### 2. Check for Conflicts
- Detect merge conflicts in `BACKLOG.md`
- Detect lock conflicts (two agents claimed same task)
- Detect stale locks (locked >15 min with no commits)

### 3. Display Team Activity
Parse git log to show:
- Recent commits (last 10)
- Active agents (who committed in last 2 hours)
- Completed streams (from BACKLOG.md)
- Blocked tasks (🚨 markers in BACKLOG.md)

### 4. Show Lock Status
```markdown
## Current Locks (Active)

- 🔒 [AGENT-1728561234] STREAM 3: LAYOUT - Locked 5 min ago by alice@example.com
- 🔒 [AGENT-1728562345] STREAM 7: FORMS (3/7 complete) - Locked 12 min ago by bob@example.com

## Stale Locks (>15 min, no commits)

- ⏰ [AGENT-1728560000] STREAM 5: PATIENT-MGT - Locked 23 min ago by charlie@example.com
  → Recommend: Check if charlie@ is still working or unlock task

## Available Tasks (Unclaimed)

- [ ] STREAM 1: INFRA - Testing setup (0 dependencies)
- [ ] STREAM 2: DATA - Concept definitions (0 dependencies)
- [ ] STREAM 4: SIDEBAR - Navigation (depends on STREAM 3)
```

### 5. Conflict Resolution Prompt

If conflicts detected:

```markdown
## ⚠️ BACKLOG Conflicts Detected

### Conflict 1: Duplicate Lock
- Task: "Create scripts/test.sh"
- Agent A: 🔒 [AGENT-AAA] - 10:30 AM
- Agent B: 🔒 [AGENT-BBB] - 10:32 AM

**Resolution**:
- Earlier lock (AGENT-AAA) keeps the task
- AGENT-BBB should find different task

### Conflict 2: Stale Lock
- Task: "Implement patient list component"
- Agent: 🔒 [AGENT-CCC] - 9:00 AM (45 min ago)
- Last commit: 9:15 AM (30 min ago, not related to this task)

**Resolution**:
- Lock is stale (>15 min, no progress)
- You may claim this task
- Notify agent via BACKLOG.md: "🚨 BLOCKED: AGENT-{YOUR_ID} claiming stale lock"
```

## Output Format

```
🔄 Backlog Sync Report

Git Status:
✅ Fetched from origin/main
✅ Pulled 3 new commits
✅ No merge conflicts

Recent Team Activity (Last 2 hours):
- alice@example.com: "Add bilateral input component to enable left/right data capture" (5 min ago)
- bob@example.com: "Implement BCVA validation to prevent invalid measurements" (18 min ago)
- charlie@example.com: "Create quality-gate script to enforce zero-tolerance standards" (1 hour ago)

Active Locks:
- STREAM 3: LAYOUT (alice@, 5 min) ✅ Active
- STREAM 7: FORMS (bob@, 12 min) ✅ Active

Stale Locks:
- STREAM 5: PATIENT-MGT (charlie@, 23 min) ⏰ Stale - May be claimed

Completed Streams:
- STREAM 1: INFRA ✅ 100%
- STREAM 2: DATA ✅ 100%

Available Tasks (No Dependencies):
- STREAM 4: SIDEBAR (depends on STREAM 3, not ready)
- STREAM 6: WORKFLOW (no dependencies) ← You can claim this!
- STREAM 9: ACTIONS (depends on STREAM 8, not ready)

Recommended Next Task:
→ STREAM 6: WORKFLOW - State Machine for Patient Journey
  Reason: No dependencies, high priority, unclaimed

Claim command:
sed -i '' 's/- \[ \] STREAM 6:/- [ ] 🔒 [AGENT-$(date +%s)] STREAM 6:/' BACKLOG.md
```

## Advanced: Auto-Resolve Conflicts

```bash
# If BACKLOG.md has merge conflicts
if git diff --name-only --diff-filter=U | grep -q "BACKLOG.md"; then
  echo "⚠️  BACKLOG.md has merge conflicts"

  # Strategy: Keep both locks, let agents resolve manually
  git checkout --ours BACKLOG.md     # Keep your locks
  git add BACKLOG.md

  # Add conflict marker
  echo "🚨 CONFLICT: Multiple agents claimed tasks. Review locks above." >> BACKLOG.md

  git commit -m "Resolve BACKLOG merge conflict (manual review needed)"
fi
```

## Monitoring Active Work

```bash
# Show what each agent is working on
git log --all --since="2 hours ago" --format="%h %an %s" | \
  grep -E "AGENT-|Add|Implement|Fix" | \
  head -10
```

## Sync Daemon Integration

This command is also run automatically by `./scripts/sync-upstream.sh` every 5 minutes:

```bash
# Manual sync
/sync-backlog

# Start daemon (auto-sync every 5 min)
./scripts/start-agent-sync.sh

# Check sync logs
tail -f .agent_sync.log
```

## Example

```bash
/sync-backlog

# Output:
# 🔄 Backlog Sync Report
#
# Git Status:
# ✅ Fetched from origin/main
# ✅ Pulled 3 new commits
# ✅ No merge conflicts
#
# Recent Team Activity (Last 2 hours):
# - alice@example.com: "Add bilateral input component..." (5 min ago)
# - bob@example.com: "Implement BCVA validation..." (18 min ago)
#
# Active Locks:
# - STREAM 3: LAYOUT (alice@, 5 min) ✅ Active
# - STREAM 7: FORMS (bob@, 12 min) ✅ Active
#
# Available Tasks:
# → STREAM 6: WORKFLOW (no dependencies) ← Recommended
#
# Next step:
# Claim STREAM 6 and start TDD workflow
```
