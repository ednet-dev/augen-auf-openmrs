---
description: Claim task with automatic lock and upstream sync
argument-hint: <task-description-pattern>
allowed-tools: Read(BACKLOG.md), Edit(BACKLOG.md), Bash(git*), Bash(./scripts/*)
model: sonnet
---

# Claim Task - Multi-Agent Safe

**Purpose**: Claim a task from BACKLOG.md with automatic sync and lock to prevent conflicts

**Arguments**: `$1` - Task description pattern (grep pattern to find task)

STARTER_SYMBOL=🎯

---

## Phase 1: Sync Before Claiming

STARTER_SYMBOL=🔄

1. **Sync with upstream**:
   ```bash
   ./scripts/sync-upstream.sh
   git pull origin main --rebase
   ```

2. **Verify BACKLOG.md is current**:
   ```bash
   git log -1 --oneline -- BACKLOG.md
   ```

---

## Phase 2: Find Task

STARTER_SYMBOL=🔍

1. **Search for unclaimed task**:
   ```bash
   grep -n "- \[ \] $1" BACKLOG.md | grep -v "🔒"
   ```

2. **Verify task exists and is unclaimed**:
   - ✅ Task found and has `- [ ]` (unclaimed)
   - ❌ Task has `🔒` (already claimed)
   - ❌ Task not found (check pattern)

3. **Display task details**:
   ```markdown
   Found task:
   Stream: [Stream name from BACKLOG.md]
   Task: $TASK_DESCRIPTION
   Line: $LINE_NUMBER
   Status: Unclaimed ✅
   ```

---

## Phase 3: Claim Task

STARTER_SYMBOL=🔒

1. **Generate agent ID** (if not exists):
   ```bash
   if [ ! -f .agent_id ]; then
     echo "AGENT-$(date +%s)" > .agent_id
   fi
   export AGENT_ID=$(cat .agent_id)
   ```

2. **Lock task in BACKLOG.md**:
   ```bash
   # Original: - [ ] Create BilateralInput component
   # Updated:  - [ ] 🔒 [AGENT-1234567890] Create BilateralInput component - 2025-10-10T14:30:00Z

   sed -i '' "s/- \[ \] $TASK_PATTERN/- [ ] 🔒 [$AGENT_ID] $TASK_PATTERN - $(date -Iseconds)/" BACKLOG.md
   ```

3. **Commit lock immediately**:
   ```bash
   git add BACKLOG.md
   git commit -m "Lock task: $TASK_DESCRIPTION

Agent: $AGENT_ID
Stream: $STREAM_NAME
Timestamp: $(date -Iseconds)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
   git push origin main
   ```

---

## Phase 4: Initialize Work Context

STARTER_SYMBOL=🛠️

1. **Create agent work directory**:
   ```bash
   mkdir -p .agent/$AGENT_ID
   ```

2. **Create work log**:
   ```markdown
   # Agent $AGENT_ID Work Log

   ## Task: $TASK_DESCRIPTION
   **Stream**: $STREAM_NAME
   **Claimed**: $(date -Iseconds)
   **Status**: In Progress

   ## Progress
   - [ ] RED: Write failing test
   - [ ] GREEN: Implement minimal code
   - [ ] REFACTOR: Clean code
   - [ ] Quality gate: Pass
   - [ ] Commit: Done

   ## Notes
   [Add notes as work progresses]
   ```

3. **Start TDD cycle**:
   ```bash
   echo "Ready to start TDD cycle for: $TASK_DESCRIPTION"
   echo ""
   echo "Next step: /tdd-red $FEATURE_NAME"
   ```

---

## Phase 5: Display Claimed Task Info

STARTER_SYMBOL=📋

```markdown
✅ TASK CLAIMED SUCCESSFULLY

**Agent ID**: $AGENT_ID
**Task**: $TASK_DESCRIPTION
**Stream**: $STREAM_NAME
**Lock Time**: $(date)

**Your claimed tasks** (from BACKLOG.md):
$(grep "🔒 \[$AGENT_ID\]" BACKLOG.md)

**Recommended workflow**:
1. /tdd-red $FEATURE_NAME     # Write failing test
2. /tdd-green $FEATURE_NAME   # Implement code
3. /quality-gate              # Verify quality
4. git commit                 # Commit changes
5. Mark complete in BACKLOG.md

**Work directory**: .agent/$AGENT_ID/
```

---

## Conflict Handling

**If task was just claimed by another agent**:

```markdown
❌ TASK ALREADY CLAIMED

Task: $TASK_DESCRIPTION
Claimed by: [AGENT-XXXXXXXXX]
Claimed at: [TIMESTAMP]

Options:
1. Choose different task: grep "- \[ \]" BACKLOG.md | grep -v "🔒"
2. Wait if lock is stale (>15 min): Check timestamp
3. Coordinate: Add comment in BACKLOG.md about dependency
```

**Automatic retry**:
```bash
LOCK_TIME=$(grep "🔒.*$TASK_PATTERN" BACKLOG.md | sed 's/.*- //')
if [ "$(( $(date +%s) - $(date -d "$LOCK_TIME" +%s) ))" -gt 900 ]; then
  echo "⚠️  Lock is stale (>15 min) - proceeding to claim"
  # Claim task
else
  echo "❌ Task recently claimed - choose another task"
  exit 1
fi
```

---

## Multi-Agent Safety Features

1. **Sync before claim**: Ensures BACKLOG.md is current
2. **Atomic lock**: Single sed command + immediate commit
3. **Push immediately**: Makes lock visible to other agents
4. **Timestamp tracking**: Detects stale locks (>15 min)
5. **Agent ID**: Unique identifier for each agent session

---

## Success Criteria

- [✅] Synced with upstream before claiming
- [✅] Task found and unclaimed
- [✅] Lock committed and pushed immediately
- [✅] Agent work directory created
- [✅] Ready to start TDD workflow
- [✅] No conflicts with other agents
