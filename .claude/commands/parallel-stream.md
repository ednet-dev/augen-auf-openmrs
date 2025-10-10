---
description: Execute all tasks in a work stream in parallel
argument-hint: <stream-name> (e.g., "FORMS" or "PRESURGERY")
allowed-tools: Read, Write, Task, Bash(git*), Bash(./scripts/*)
model: sonnet
---

# Parallel Stream Execution

**Purpose**: Coordinate parallel execution of all tasks within a single work stream from BACKLOG.md

**Arguments**: `$1` - Stream name (e.g., "FORMS", "PRESURGERY", "LAYOUT")

STARTER_SYMBOL=🔀

---

## Prerequisites

1. **Parse stream from BACKLOG.md**:
   ```bash
   grep -A 50 "STREAM.*$1" BACKLOG.md | grep "- \[ \]" > stream_tasks.txt
   cat stream_tasks.txt
   ```

2. **Count tasks**:
   ```bash
   TASK_COUNT=$(wc -l < stream_tasks.txt)
   echo "Stream $1 has $TASK_COUNT tasks"
   ```

3. **Check parallel capacity**: Max 10 agents, recommend 5-7 for optimal performance

4. **Verify no tasks are locked by other agents**:
   ```bash
   grep "🔒" stream_tasks.txt
   # If any locked, check timestamp - if >15min, proceed; if <15min, wait
   ```

---

## Phase 1: Initialize Parallel Execution

STARTER_SYMBOL=🔀

1. **Create STREAM_STATUS.md**:
   ```markdown
   # Stream $1 Parallel Execution: $(date -Iseconds)

   ## Tasks ($TASK_COUNT total)

   [List all tasks with PENDING status]

   ## Statistics
   - Total: $TASK_COUNT
   - Pending: $TASK_COUNT (100%)
   - In Progress: 0
   - Complete: 0
   - Blocked: 0
   ```

2. **Spawn parallel agents** using Task tool:
   ```markdown
   🔀 PARALLEL [$TASK_COUNT] {
     For each task:
     - Task N → Spawn subagent with tdd-enforcer persona
   }
   ```

3. **Each agent follows TDD**:
   - RED: Write failing test first
   - GREEN: Minimal implementation
   - REFACTOR: Clean code while tests pass
   - Run quality gate before marking complete

---

## Phase 2: Monitor Progress

STARTER_SYMBOL=🔍

**Update STREAM_STATUS.md as agents complete**:
```markdown
- [🔄] Create BilateralInput component → Agent-A1 [IN_PROGRESS] 60%
- [✅] Create CheckboxGroup component → Agent-A2 [COMPLETE] Tests: 15/15 ✅
- [🔴] Create MeasurementInput component → Agent-A3 [BLOCKED] Dependency issue
- [⏳] Create BCVAInput component → Agent-A4 [PENDING]
```

**Statistics**:
```markdown
- Complete: 1/4 (25%)
- In Progress: 1/4 (25%)
- Blocked: 1/4 (25%)
- Pending: 1/4 (25%)
```

---

## Phase 3: WAIT_ALL

STARTER_SYMBOL=⏸️

**Wait for completion**:
```markdown
WAIT_ALL condition:
- All agents in: [COMPLETE] or [BLOCKED]
- No agents in: [PENDING] or [IN_PROGRESS]
```

**Aggregate results**:
```bash
echo "Complete: $(grep -c COMPLETE STREAM_STATUS.md)"
echo "Blocked:  $(grep -c BLOCKED STREAM_STATUS.md)"
```

**Handle blocked tasks**:
- Document blockers in STREAM_STATUS.md
- Create follow-up tasks in BACKLOG.md
- Notify about dependencies

---

## Phase 4: Integration Testing

STARTER_SYMBOL=🧪

1. **Run stream integration tests**:
   ```bash
   # For FORMS stream example:
   ./scripts/test.sh components/Forms
   ```

2. **Verify all components work together**:
   - Test form composition
   - Test bilateral data flow
   - Test validation integration

3. **Run quality gate**:
   ```bash
   ./scripts/quality-gate.sh
   ```

---

## Phase 5: Commit Stream Work

STARTER_SYMBOL=✅

```bash
git add .
git commit -m "Implement $1 stream components to enable medical data capture

Completed in parallel using Agent Protocol v1.1:
$(grep COMPLETE STREAM_STATUS.md | sed 's/.*\] /- /')

All tasks passed quality gate:
- Tests: 100% passing
- Types: 0 errors
- Lint: 0 issues
- Medical validation: Complete

Stream: $1
Tasks: $(grep -c COMPLETE STREAM_STATUS.md)/$(grep -c "\- \[" STREAM_STATUS.md)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 6: Cleanup

STARTER_SYMBOL=🧹

```bash
./scripts/agent-cleanup.sh --auto-delete STREAM_STATUS.md
rm stream_tasks.txt
rm .session_started  # Reset for next session
```

---

## Parallelization Performance

| Task Count | Agents | Duration | Speedup |
|------------|--------|----------|---------|
| 1-3        | Same   | ~30 min  | 1x      |
| 4-7        | 5      | ~45 min  | 2-3x    |
| 8-10       | 7      | ~1 hour  | 3-4x    |

---

## Success Criteria

- [✅] All non-blocked tasks completed
- [✅] Integration tests pass
- [✅] Quality gate GREEN
- [✅] Changes committed
- [✅] Ephemeral files cleaned
- [✅] BACKLOG.md updated with task completion
