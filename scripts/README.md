# Task Management Scripts

Agent Protocol v1.1 task workflow commands for distributed team coordination.

## Quick Start

```bash
# 1. Find available work
./scripts/task-next.sh

# 2. Claim task (auto-syncs with team)
./scripts/task-claim.sh 1

# 3. Work (TDD cycle)
./scripts/test.sh --watch

# 4. Complete (runs quality gate)
./scripts/task-complete.sh

# 5. Commit & push
git add . && git commit -m "Add feature to achieve value"
```

## Scripts

### `task-next.sh` - Find Next Task
Find unclaimed tasks with satisfied dependencies.

```bash
./scripts/task-next.sh        # Show ready tasks
./scripts/task-next.sh --all  # Show all (including blocked)
```

**Output**: Numbered list of available tasks, ranked by priority + dependencies.

**Slash command**: `/next-task`

---

### `task-claim.sh` - Claim Task
Atomically claim a task with upstream sync. FCFS conflict resolution.

```bash
./scripts/task-claim.sh <task_number>  # From task-next.sh output
./scripts/task-claim.sh <line_number>  # Direct BACKLOG.md line
```

**Features**:
- Syncs git (fetch + pull --rebase)
- Generates agent ID on first use → `.agent_id`
- Locks task: `🔒 [AGENT-{id}] {ISO8601-timestamp} {task}`
- FCFS: Earlier timestamp wins conflicts

**Slash command**: `/claim-task <#>`

---

### `task-complete.sh` - Mark Complete
Mark task done with quality gate + cleanup.

```bash
./scripts/task-complete.sh                  # Run quality gate
./scripts/task-complete.sh --skip-quality-gate  # Skip (not recommended)
```

**Steps**:
1. Find your locked task (via `.agent_id`)
2. Run `quality-gate.sh` (must be GREEN)
3. Run `agent-cleanup.sh` (remove ephemeral files)
4. Update BACKLOG: `[ ] 🔒` → `[x] ✅`

**Slash command**: `/complete-task`

---

### `task-status.sh` - Status Dashboard
Show current work, active locks, team activity, progress.

```bash
./scripts/task-status.sh           # Basic view
./scripts/task-status.sh --verbose # Include git log
```

**Output**:
- Your active task (if any)
- All locked tasks (with age: active/stale)
- Progress stats (% complete)
- Team activity (recent commits, --verbose only)

**Lock states**:
- ✅ **Active** (0-15 min) - Fresh lock
- ⏰ **Stale** (>15 min) - May be claimed

**Slash command**: `/task-status`

---

## Workflow Examples

### Solo Agent
```bash
/next-task          # → Task #3 recommended
/claim-task 3       # → Locked
# ... implement ...
/complete-task      # → Quality gate → Marked complete
git commit -m "Add feature X to achieve Y"
```

### Multi-Agent Team
```bash
# Agent A
/claim-task 1       # Locks "Create test.sh"

# Agent B (different machine, simultaneously)
/claim-task 2       # Locks "Create types.ts"

# Both commit independently (no conflicts)
```

### Stale Lock Handling
```bash
/task-status
# Shows: AGENT-999 locked 20 min ago (stale)

# Option 1: Notify
echo "🚨 BLOCKING: AGENT-123 claiming stale lock" >> BACKLOG.md

# Option 2: Claim directly (>15 min)
/claim-task <line_number>
```

---

## Lock Format (BACKLOG.md)

**Unclaimed**:
```markdown
- [ ] Create scripts/test.sh - Unified test runner
```

**Claimed**:
```markdown
- [ ] 🔒 [AGENT-1728561234] 2025-10-10T14:30:00Z Create scripts/test.sh
```

**Completed**:
```markdown
- [x] ✅ [AGENT-1728561234] Create scripts/test.sh
```

---

## Dependencies

- `bash` (4.0+)
- `git`
- `grep`, `sed`, `awk` (standard POSIX tools)
- `date` (GNU or BSD)

**Platform support**: macOS, Linux (handles `sed` differences automatically)

---

## Files Created

- `.agent_id` - Your persistent agent ID
- `BACKLOG.md` - Shared task state (git-tracked)

**Ephemeral files** (auto-cleaned): None. Scripts use only git and BACKLOG.md.

---

## Integration with Existing Scripts

These task scripts complement:
- `test.sh` - TDD test runner
- `quality-gate.sh` - Linter + type-check + tests
- `agent-cleanup.sh` - Ephemeral file cleanup
- `pre-commit-check.sh` - Security scan

**Full TDD workflow**:
```bash
/claim-task 1
./scripts/test.sh --watch      # RED → GREEN → REFACTOR
/complete-task                 # Runs quality-gate.sh
git commit -m "Add X to Y"
```

---

## Troubleshooting

### "No unclaimed tasks found"
All tasks are locked or completed. Check status:
```bash
/task-status --verbose
```

### "Merge conflict detected"
Two agents claimed same task:
```bash
git status
# Resolve BACKLOG.md conflicts (keep earlier timestamp)
git add BACKLOG.md
git rebase --continue
```

### "Quality gate failed"
Fix issues before completing:
```bash
./scripts/check-lint.sh
./scripts/check-types.sh
./scripts/test.sh
```

### "Lock is stale but still shown as active"
Example lock in BACKLOG.md documentation section. Ignore or remove example.

---

## Advanced: Dependency Tracking

`task-next.sh` parses stream dependencies from BACKLOG.md:

```markdown
### STREAM 4: SIDEBAR
**Dependencies**: LAYOUT
```

→ Only shows STREAM 4 tasks if STREAM 3 (LAYOUT) is 100% complete.

**Override**: Use `--all` flag to see blocked tasks.

---

## Slash Commands

All scripts have corresponding slash commands in `.claude/commands/`:

- `/next-task` → `task-next.sh`
- `/claim-task <#>` → `task-claim.sh`
- `/complete-task` → `task-complete.sh`
- `/task-status` → `task-status.sh`

**Usage in Claude Code**:
```
/next-task
[Claude runs script and shows output]
```

---

## Contributing

Follow agent-protocol patterns:
- High semantic density (terse output)
- 💎 STDOUT_DISTILLATION (minimal GREEN, full RED)
- ✅ TEST_FIRST (TDD mandatory)
- Zero-tolerance quality gates

**Commit format**: `{Action} {what} to {achieve value}`

Example: `Add task claiming to enable parallel distributed work`

---

**Version**: 1.0.0
**Protocol**: Agent Protocol v1.1
**Last Updated**: 2025-10-10
