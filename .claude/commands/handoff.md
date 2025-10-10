---
description: Generate comprehensive handoff document for agent transfer
scope: project
---

# Agent Handoff Generator

Create detailed handoff document when transferring work to another agent or ending session.

## Usage

```bash
/handoff
```

## What Gets Generated

A comprehensive handoff document capturing:
1. Current progress on claimed tasks
2. Remaining work in your stream
3. Blockers and dependencies
4. Key files modified
5. Test status
6. Next steps for the next agent

## Handoff Template

```markdown
# HANDOFF from AGENT-{YOUR_ID}

**Date**: {timestamp}
**Stream**: {stream name from BACKLOG}
**Session Duration**: {hours worked}
**Commits**: {number of commits made}

---

## 📋 Context

**What I Was Working On**:
{Brief description of the task/stream}

**Goal**:
{What this work aims to achieve}

**Assigned Tasks** (from BACKLOG.md):
- [x] ✅ Task 1 (completed)
- [x] ✅ Task 2 (completed)
- [ ] 🔄 Task 3 (in progress, 60% complete)
- [ ] ⏸️ Task 4 (not started)
- [ ] ⏸️ Task 5 (not started)

---

## ✅ Progress Summary

### Completed (100%)
1. **Task 1**: Description
   - Files: `path/to/file1.ts`, `path/to/file2.test.ts`
   - Tests: ✅ 15/15 passing
   - Committed: Yes (commit hash: abc123)

2. **Task 2**: Description
   - Files: `path/to/file3.tsx`, `path/to/file4.ts`
   - Tests: ✅ 8/8 passing
   - Committed: Yes (commit hash: def456)

### In Progress (60%)
3. **Task 3**: Description
   - Files: `path/to/file5.ts` (WIP, not committed)
   - Tests: ⚠️ 3/5 passing (2 failing - see below)
   - Remaining Work:
     - Implement validation for edge case X
     - Fix failing tests for boundary condition Y
     - Add error handling for scenario Z
   - Estimated Time: 30-45 minutes

### Not Started (0%)
4. **Task 4**: Description
   - Dependencies: None
   - Estimated Time: 1-2 hours
   - Recommended: Start with TDD (write tests first)

5. **Task 5**: Description
   - Dependencies: Task 4 must complete first
   - Estimated Time: 1 hour
   - Notes: Requires integration with OpenMRS API

---

## 🚧 Blockers & Issues

### Blocker 1: {Description}
- **Issue**: {What's blocking progress}
- **Impact**: {Which tasks are affected}
- **Possible Solutions**:
  1. {Option A}
  2. {Option B}
- **Waiting On**: {Person/resource/decision}

### Issue 2: {Description}
- **Type**: Technical Debt | Bug | Missing Dependency
- **Severity**: High | Medium | Low
- **Workaround**: {If any}

---

## 📁 Key Files Modified

### Created
- `src/components/Forms/BilateralInput.tsx` - Bilateral input component
- `src/components/Forms/__tests__/BilateralInput.test.tsx` - Unit tests
- `src/utils/validation/bcvaValidator.ts` - BCVA validation logic

### Modified
- `src/components/Forms/index.ts` - Added exports for new components
- `BACKLOG.md` - Updated task status

### Work In Progress (Not Committed)
- `src/components/Forms/AstigmatismInput.tsx` - 60% complete
- `src/components/Forms/__tests__/AstigmatismInput.test.tsx` - 3/5 tests passing

---

## 🧪 Test Status

### Passing Suites
- ✅ BilateralInput: 15/15 tests
- ✅ BCVAValidator: 8/8 tests
- ✅ Forms/index: 3/3 tests

### Failing Suites
- ❌ AstigmatismInput: 3/5 tests
  - Failing: "should validate range -10.0 to +10.0"
  - Failing: "should show error for out-of-range values"
  - Root Cause: Validation logic not yet implemented
  - Fix: Add range check in `validateAstigmatism()` function

### Coverage
- Overall: 78% (target: 80%)
- Medical Logic: 92% (target: 90%) ✅
- Need: 2% more coverage on utility functions

---

## 🔄 Dependencies

### Completed Dependencies (Ready)
- ✅ STREAM 1: INFRA (testing setup)
- ✅ STREAM 2: DATA (types and concepts)

### Pending Dependencies (Blocking)
- ⏸️ STREAM 4: SIDEBAR (needed for navigation integration)
  - ETA: Unknown (assigned to AGENT-XXX)
  - Impact: Can't test navigation until ready

### Downstream Dependencies (Blocked by This Work)
- STREAM 8: PRESURGERY (waiting on STREAM 7: FORMS to complete)
  - Current STREAM 7 progress: 60%
  - ETA for completion: 2-3 hours

---

## 🎯 Next Steps for Next Agent

### Immediate (Start Here)
1. **Review failing tests**
   ```bash
   ./scripts/test.sh Forms/AstigmatismInput --watch
   ```
2. **Implement validation logic**
   - File: `src/utils/validation/astigmatismValidator.ts`
   - Function: `validateAstigmatism(value: number)`
   - Range: -10.0 to +10.0 diopters

3. **Make tests pass (TDD GREEN phase)**
   ```bash
   ./scripts/test.sh Forms/AstigmatismInput
   # Should see: ✅ 5/5 tests passing
   ```

### Medium Priority (Next 1-2 hours)
4. **Complete Task 4**: {Task name}
   - Start with tests: `/bilateral-test "AstigmatismInput"`
   - Implement component
   - Integration with parent form

5. **Start Task 5**: {Task name}
   - Depends on Task 4 completion
   - Use `/openmrs-concept` to scaffold

### Before Committing
6. **Run quality gate**
   ```bash
   ./scripts/quality-gate.sh
   # Must be 100% GREEN
   ```

7. **Cleanup ephemeral files**
   ```bash
   ./scripts/agent-cleanup.sh
   ```

8. **Update BACKLOG.md**
   - Mark completed tasks: `- [x] ✅ [AGENT-{ID}] Task - {timestamp}`
   - Update in-progress percentage

---

## 📚 Important Context

### Medical Validation Ranges
- **BCVA**: 0.0-1.0 (decimal), 1 decimal place
- **Astigmatism**: -10.0 to +10.0 (diopters), 2 decimal places
- **Axial Length**: 15.0-35.0 (mm), 2 decimal places

### OpenMRS Concept UUIDs
- BCVA Left: `TODO_BCVA_LEFT_UUID` (not yet in production)
- BCVA Right: `TODO_BCVA_RIGHT_UUID`
- Astigmatism Left: `TODO_ASTIGMATISM_LEFT_UUID`

### Project Conventions
- TDD: Always write tests first (RED → GREEN → REFACTOR)
- Bilateral: All ophthalmology data has left/right structure
- PHI Protection: No patient data in logs/commits
- Quality Gate: Zero tolerance (0 errors, 0 warnings)

---

## 💬 Notes & Learnings

### What Went Well
- Bilateral component pattern is reusable across all inputs
- Validation strategy with boundary tests caught 3 edge cases
- TDD workflow helped maintain focus

### Challenges Encountered
- OpenMRS type definitions have dependency issues (workaround: check types on src/ only)
- Astigmatism range includes negative values (required extra tests)
- Copy operation needed careful state management (used useCallback)

### Recommendations for Next Agent
- Start with the failing tests - they have clear TODOs
- Use `/validate-medical` to scaffold validation faster
- Check BACKLOG.md every 30 min (sync daemon running)
- Ask for help if blocked >15 min (add 🚨 to BACKLOG)

---

## 🔗 Related Work

### Parallel Streams in Progress
- STREAM 3: LAYOUT (AGENT-XXX, 80% complete)
- STREAM 6: WORKFLOW (AGENT-YYY, 40% complete)

### Communication
- Slack channel: #openmrs-augen-auf
- BACKLOG.md: Use 🚨 for blockers
- Sync daemon: Running every 5 min (./scripts/start-agent-sync.sh)

---

## ✋ Handoff Checklist

Before handing off, I:
- [x] Committed all completed work
- [x] Ran quality gate on committed code (GREEN)
- [x] Updated BACKLOG.md with task status
- [x] Documented blockers in BACKLOG
- [x] Created this handoff document
- [x] Cleaned up ephemeral files
- [ ] Notified next agent (if known)

---

**Handoff Complete** ✅

Next agent: Please review this document, claim the remaining tasks in BACKLOG.md, and continue from "Next Steps" above.

If you have questions, check:
- CLAUDE.md for project overview
- BACKLOG.md for full context
- `./scripts/test.sh --help` for TDD workflow

Good luck! 🚀
```

## Output Format

```
✅ Handoff document generated

File: .agent/HANDOFF-AGENT-{YOUR_ID}-{timestamp}.md

Summary:
- Stream: STREAM 7: FORMS
- Progress: 60% (3/5 tasks complete)
- Blockers: 1 (waiting on validation implementation)
- Next agent: Should complete AstigmatismInput (30-45 min)

Document includes:
- ✅ Progress summary
- ✅ Blockers identified
- ✅ Key files listed
- ✅ Test status
- ✅ Next steps (prioritized)
- ✅ Medical context
- ✅ Learnings & recommendations

Handoff checklist: 5/6 complete

Share this document:
- Add to BACKLOG.md: "📄 Handoff doc: .agent/HANDOFF-AGENT-{YOUR_ID}.md"
- Notify next agent in Slack: #openmrs-augen-auf
- Push to origin: git push origin main
```

## Example

```bash
# At end of work session
/handoff

# Generates: .agent/HANDOFF-AGENT-1728561234-2025-10-10T15:30:00Z.md
# Document captures:
# - STREAM 7: FORMS (60% complete)
# - 3 components done, 2 remaining
# - 1 blocker: AstigmatismInput validation
# - Next steps: Complete validation → commit → move to Task 4

# Agent adds to BACKLOG.md:
echo "📄 Handoff: .agent/HANDOFF-AGENT-1728561234.md" >> BACKLOG.md

# Commit and push
git add .agent/HANDOFF-* BACKLOG.md
git commit -m "Handoff STREAM 7 work (60% complete) for next agent"
git push origin main

# Stop sync daemon
./scripts/stop-agent-sync.sh

# Session complete ✅
```
