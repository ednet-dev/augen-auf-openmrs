---
description: Interactive BACKLOG.md browser with stream filtering
argument-hint: [filter-option]
allowed-tools: Read(BACKLOG.md), Bash(grep*), Bash(wc*)
model: sonnet
scope: project
---

# Browse Backlog - Interactive Task Browser

**Purpose**: Rich, filterable view of BACKLOG.md showing streams, progress, and recommended tasks

**Arguments**:
- `$1` (optional) - Filter: `ready`, `blocked`, `stream-N`, `effort-low`, `effort-high`, `all`

STARTER_SYMBOL=📋

---

## Phase 1: Load and Parse BACKLOG.md

STARTER_SYMBOL=📖

1. **Read BACKLOG.md**:
   ```bash
   cat BACKLOG.md
   ```

2. **Extract stream information**:
   ```bash
   # Get all streams with their titles
   grep "^### STREAM" BACKLOG.md

   # Count tasks per stream
   awk '/^### STREAM/,/^---$/ {print}' BACKLOG.md | grep "^- \[" | wc -l
   ```

3. **Parse task statuses**:
   ```bash
   # Unclaimed tasks: - [ ]
   grep "^  - \[ \]" BACKLOG.md | grep -v "🔒"

   # Claimed tasks: - [ ] 🔒
   grep "^  - \[ \] 🔒" BACKLOG.md

   # Completed tasks: - [x]
   grep "^  - \[x\]" BACKLOG.md
   ```

---

## Phase 2: Calculate Stream Progress

STARTER_SYMBOL=📊

For each of the 13 streams, calculate:

```bash
# Stream 1 example
STREAM_NUM=1
STREAM_NAME=$(grep "^### STREAM $STREAM_NUM:" BACKLOG.md | sed 's/^### STREAM [0-9]*: //')

# Count tasks
TOTAL=$(awk "/^### STREAM $STREAM_NUM:/,/^---\$/ {print}" BACKLOG.md | grep "^  - \[" | wc -l | tr -d ' ')
COMPLETED=$(awk "/^### STREAM $STREAM_NUM:/,/^---\$/ {print}" BACKLOG.md | grep "^  - \[x\]" | wc -l | tr -d ' ')
CLAIMED=$(awk "/^### STREAM $STREAM_NUM:/,/^---\$/ {print}" BACKLOG.md | grep "^  - \[ \] 🔒" | wc -l | tr -d ' ')
UNCLAIMED=$(awk "/^### STREAM $STREAM_NUM:/,/^---\$/ {print}" BACKLOG.md | grep "^  - \[ \]" | grep -v "🔒" | wc -l | tr -d ' ')

# Calculate percentage
if [ "$TOTAL" -gt 0 ]; then
  PERCENT=$(( COMPLETED * 100 / TOTAL ))
else
  PERCENT=0
fi

# Status indicator
if [ "$COMPLETED" -eq "$TOTAL" ]; then
  STATUS="✅ COMPLETE"
elif [ "$CLAIMED" -gt 0 ]; then
  STATUS="🔄 IN PROGRESS"
elif [ "$UNCLAIMED" -gt 0 ]; then
  STATUS="📋 READY"
else
  STATUS="⏸️  PENDING"
fi
```

---

## Phase 3: Check Dependencies

STARTER_SYMBOL=🔗

**Extract dependencies from BACKLOG.md**:

```bash
# Stream dependencies are in the "Dependencies:" line
# Example: **Dependencies**: INFRA (testing setup)

# Stream is ready if all dependency streams are 100% complete
for stream in 1 2 3 4 5 6 7 8 9 10 11 12 13; do
  DEPS=$(awk "/^### STREAM $stream:/,/^---\$/" BACKLOG.md | grep "Dependencies:" | sed 's/.*Dependencies\*\*: //')

  if [ -z "$DEPS" ] || [ "$DEPS" = "None (can start immediately)" ]; then
    echo "Stream $stream: READY (no dependencies)"
  else
    # Check if dependency streams are complete
    echo "Stream $stream: DEPENDS ON $DEPS"
  fi
done
```

**Dependency indicators**:
- ✅ **READY** - All dependencies satisfied
- ⏸️ **BLOCKED** - Waiting for dependencies
- 🔄 **PARTIAL** - Some dependencies satisfied

---

## Phase 4: Display Stream Overview

STARTER_SYMBOL=📊

```markdown
# 📋 BACKLOG BROWSER

**Project**: Augen Auf OpenMRS Module
**Last Updated**: 2025-10-10
**Total Streams**: 13
**Overall Progress**: XX% (YY/ZZ tasks complete)

---

## Stream Status

### ✅ Foundation (Ready to Start)

**STREAM 1: INFRA** - Testing & Quality Infrastructure
├─ Progress: 0/9 tasks (0%)
├─ Status: 📋 READY (no dependencies)
├─ Effort: 2-3 hours
└─ Next: Create scripts/test.sh

**STREAM 2: DATA** - OpenMRS Concepts & Data Model
├─ Progress: 0/7 tasks (0%)
├─ Status: 📋 READY (no dependencies)
├─ Effort: 4-6 hours
└─ Next: Define OpenMRS concepts for ophthalmology

### ⏸️ Dependent (Waiting for Foundation)

**STREAM 3: LAYOUT** - Application Shell & Three-Column Layout
├─ Progress: 0/8 tasks (0%)
├─ Status: ⏸️ BLOCKED (needs INFRA)
├─ Effort: 4-5 hours
└─ Next: Write tests for three-column layout

**STREAM 4: SIDEBAR** - Workflow Stages Navigation
├─ Progress: 0/6 tasks (0%)
├─ Status: ⏸️ BLOCKED (needs LAYOUT)
├─ Effort: 3-4 hours
└─ Next: Write tests for workflow stages navigation

[... Continue for all 13 streams ...]

---

## 🎯 Recommended Next Tasks

**For Stream A (Foundation) developers**:
1. 🟢 Create scripts/test.sh (STREAM 1, 30 min)
   Ready ✅ | High Priority | Unlocks: All other streams

2. 🟢 Define OpenMRS concepts (STREAM 2, 2 hours)
   Ready ✅ | Core Domain | Unlocks: Forms, Workflows

**For Stream B (Layout & Nav) developers**:
3. 🔴 Write tests for layout (STREAM 3, 1 hour)
   Blocked ⏸️ | Needs: STREAM 1 complete

**For Stream C (Forms & Patients) developers**:
4. 🔴 Write tests for bilateral input (STREAM 7, 1 hour)
   Blocked ⏸️ | Needs: STREAM 1, 2 complete

---

## Quick Actions

Start recommended task:
```bash
/start-e2e "Create scripts/test.sh"
```

Claim specific task:
```bash
/claim-task "Define OpenMRS concepts"
```

Assign yourself to a stream:
```bash
/stream-assign A  # Foundation
/stream-assign B  # Layout & Nav
/stream-assign C  # Forms & Patients
/stream-assign D  # Workflows
```

View your claimed tasks:
```bash
/task-status
```

Sync with team:
```bash
/sync-team
```
```

---

## Phase 5: Apply Filters (If Provided)

STARTER_SYMBOL=🔍

**Filter types**:

### `ready` - Show only ready tasks
```bash
# Only tasks with satisfied dependencies and unclaimed
grep "^  - \[ \]" BACKLOG.md | grep -v "🔒"
# Filter by stream status (READY, not BLOCKED)
```

### `blocked` - Show blocked tasks
```bash
# Tasks in streams with unsatisfied dependencies
# Status: ⏸️ BLOCKED
```

### `stream-N` - Show specific stream
```bash
# Example: /browse-backlog stream-7
# Show only STREAM 7: FORMS tasks
awk '/^### STREAM 7:/,/^---$/ {print}' BACKLOG.md
```

### `effort-low` - Tasks 2-3 hours or less
```bash
# Filter by "Estimated Effort" line in stream header
grep -A 20 "Estimated Effort: 2-3 hours" BACKLOG.md
```

### `effort-high` - Tasks 6+ hours
```bash
# Filter by "Estimated Effort" >= 6 hours
grep -A 20 "Estimated Effort: [6-9]" BACKLOG.md
```

### `all` - Show everything (default)
```bash
# Full BACKLOG.md display with progress indicators
```

---

## Phase 6: Show Agent Context (If Available)

STARTER_SYMBOL=🤖

```bash
# Load agent ID if exists
if [ -f .agent_id ]; then
  AGENT_ID=$(cat .agent_id)
  echo "Agent ID: $AGENT_ID"

  # Show agent's claimed tasks
  echo "Your claimed tasks:"
  grep "🔒 \[$AGENT_ID\]" BACKLOG.md

  # Show agent's assigned stream (if exists)
  if [ -f .agent/$AGENT_ID/stream.txt ]; then
    STREAM=$(cat .agent/$AGENT_ID/stream.txt)
    echo "Assigned stream: $STREAM"
  fi
fi
```

---

## Interactive Mode (Optional Enhancement)

If argument is empty, prompt user:

```markdown
📋 BACKLOG BROWSER - Filter Options

Select view:
[1] Ready tasks only (can start now)
[2] Blocked tasks (waiting for dependencies)
[3] Stream-specific (enter stream number)
[4] Low effort tasks (2-3 hours)
[5] High effort tasks (6+ hours)
[6] My stream only (if assigned)
[A] All tasks (full backlog)

Enter choice:
```

---

## Output Examples

### Example 1: `/ browse-backlog ready`

```markdown
📋 READY TASKS (Dependencies Satisfied)

**STREAM 1: INFRA** (9 tasks ready):
- [ ] Create scripts/test.sh - Unified test runner
- [ ] Create scripts/quality-gate.sh - Combined linter
- [ ] Create scripts/check-types.sh - TypeScript validation
[... 6 more ...]

**STREAM 2: DATA** (7 tasks ready):
- [ ] Define OpenMRS concepts for ophthalmology domain
- [ ] Create TypeScript types for medical data structures
[... 5 more ...]

Total ready: 16 tasks
Estimated effort: 12-18 hours

Start with: /start-e2e "Create scripts/test.sh"
```

### Example 2: `/browse-backlog stream-7`

```markdown
📋 STREAM 7: FORMS - Reusable Form Components

**Status**: ⏸️ BLOCKED (needs STREAM 1, 2 complete)
**Progress**: 0/7 tasks (0%)
**Effort**: 6-8 hours
**Dependencies**: DATA (types), INFRA (testing)

**Tasks**:
- [ ] **TDD**: Write tests for all form components
- [ ] Create bilateral input component (left/right eye symmetry)
- [ ] Create checkbox group component
- [ ] Create measurement input component
- [ ] Create BCVA input component
- [ ] Create radio button group for anesthesia
- [ ] Add form validation library integration
- [ ] Create form state persistence (auto-save)

**Acceptance Criteria**:
- All components unit tested with Jest
- Validation errors displayed inline
- Components follow OpenMRS Carbon design system

**When ready**:
/start-e2e "bilateral input component"
```

---

## Success Criteria

- [✅] All 13 streams parsed correctly
- [✅] Progress calculated accurately
- [✅] Dependencies checked properly
- [✅] Filters work as expected
- [✅] Recommendations shown based on current state
- [✅] Agent context displayed if available

---

## Related Commands

- `/next-task` - Quick view of top 3 recommendations
- `/task-status` - Your claimed tasks and team activity
- `/claim-task <pattern>` - Claim a specific task
- `/start-e2e <task>` - Claim and start full E2E workflow
- `/stream-assign <letter>` - Assign to stream (A/B/C/D)
