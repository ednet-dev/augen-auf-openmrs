---
description: Sync with upstream and show distributed team activity
argument-hint: (none)
allowed-tools: Bash(git*), Bash(./scripts/sync-upstream.sh)
model: sonnet
---

# Sync Team - Multi-Agent Coordination

**Purpose**: Sync with upstream repository and display recent distributed team activity

**Arguments**: None

STARTER_SYMBOL=🔄

---

## Phase 1: Fetch Latest Changes

1. **Run sync script**:
   ```bash
   ./scripts/sync-upstream.sh
   ```

2. **Check for updates**:
   ```bash
   git fetch origin
   git status
   ```

3. **Pull if safe** (no local uncommitted changes):
   ```bash
   if [ -z "$(git status --porcelain)" ]; then
     git pull origin main --rebase
     echo "✅ Synced with upstream"
   else
     echo "⚠️  Local changes detected - stash before pulling"
     git status --short
   fi
   ```

---

## Phase 2: Show Recent Team Activity

STARTER_SYMBOL=👥

1. **Recent commits from other agents**:
   ```bash
   echo "## Recent Team Activity (last 10 commits)"
   git log --oneline --graph --decorate -10
   ```

2. **Files changed by team**:
   ```bash
   echo "## Recently Modified Files"
   git log --name-only --pretty=format: -10 | sort -u | grep -v "^$"
   ```

3. **Active work streams** (from BACKLOG.md):
   ```bash
   echo "## Currently Claimed Tasks"
   grep "🔒" BACKLOG.md
   ```

---

## Phase 3: Check for Conflicts

STARTER_SYMBOL=🔍

1. **Check if BACKLOG.md changed**:
   ```bash
   if git diff HEAD@{1} HEAD -- BACKLOG.md | grep -q "+.*🔒"; then
     echo "⚠️  BACKLOG.md updated by other agents:"
     git diff HEAD@{1} HEAD -- BACKLOG.md | grep "🔒"
   fi
   ```

2. **Check for stale locks** (>15 minutes):
   ```bash
   ./scripts/check-stale-locks.sh
   ```

3. **Detect potential conflicts**:
   ```bash
   git diff --name-only HEAD origin/main
   ```

---

## Phase 4: Display Status

STARTER_SYMBOL=📊

```markdown
# Team Sync Status - $(date)

## Upstream Status
- Remote: origin/main
- Behind: $(git rev-list HEAD..origin/main --count) commits
- Ahead: $(git rev-list origin/main..HEAD --count) commits
- Local changes: $(git status --porcelain | wc -l) files

## Recent Team Activity
[Show last 5 commits with agent IDs if present]

## Active Work Streams
[Show claimed tasks with agent IDs and timestamps]

## Recommended Actions
[List any conflicts, stale locks, or sync issues]
```

---

## Multi-Agent Safety Checks

1. **Before claiming new task**:
   ```bash
   /sync-team
   # Verify task not claimed by another agent
   # Verify BACKLOG.md is current
   ```

2. **Before pushing changes**:
   ```bash
   /sync-team
   # Pull latest to avoid conflicts
   # Verify no one else modified same files
   ```

3. **At session start**:
   ```bash
   /sync-team
   # Get current state of distributed work
   ```

---

## Sync Daemon Integration

**If sync daemon is running**:
```bash
# Check daemon status
if ps aux | grep -q "[s]ync-upstream.sh"; then
  echo "✅ Sync daemon is running (auto-sync every 5 min)"
  tail -5 .agent_sync.log
else
  echo "⚠️  Sync daemon not running"
  echo "Start with: ./scripts/start-agent-sync.sh"
fi
```

---

## Conflict Resolution Protocol

**If conflicts detected**:

```markdown
🚨 CONFLICT DETECTED

Conflicting file: $FILE
Other agent: $AGENT_ID
Your changes: $YOUR_CHANGES
Their changes: $THEIR_CHANGES

Resolution Options:
1. Pull their changes, rebase yours: git pull --rebase
2. Stash yours, apply after sync: git stash && git pull && git stash pop
3. Coordinate: Add blocker comment in BACKLOG.md
```

---

## Output Format

**If sync successful**:
```markdown
✅ TEAM SYNC: SUCCESS

Updated to latest (5 new commits)
Active agents: 3
Your claimed tasks: 2
Conflicts: 0

Ready to continue work.
```

**If conflicts exist**:
```markdown
⚠️  TEAM SYNC: CONFLICTS DETECTED

Behind upstream: 3 commits
Conflicts: BACKLOG.md, src/components/Forms/BilateralInput.tsx
Other agent working on: STREAM 7: FORMS

RESOLVE CONFLICTS before continuing.
```

---

## Success Criteria

- [✅] Synced with upstream
- [✅] Recent team activity displayed
- [✅] No stale locks detected
- [✅] No unresolved conflicts
- [✅] Ready to continue work
