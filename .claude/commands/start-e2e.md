---
description: Claim task and initialize complete E2E delivery workflow
argument-hint: <task-description-pattern>
allowed-tools: Read(BACKLOG.md), Edit(BACKLOG.md), Write(.agent/**), Bash(git*), Bash(./scripts/*), Bash(yarn*)
model: sonnet
scope: project
---

# Start E2E - Complete Task Delivery Workflow

**Purpose**: Claim task + initialize full E2E workflow from TDD to commit

**Arguments**: `$1` - Task description pattern (grep pattern)

STARTER_SYMBOL=🚀

---

## Phase 1: Sync and Validate

STARTER_SYMBOL=🔄

1. **Sync with upstream**:
   ```bash
   ./scripts/sync-upstream.sh
   git pull origin distributed-main --rebase
   ```

2. **Check BACKLOG current**:
   ```bash
   git log -1 --oneline -- BACKLOG.md
   ```

3. **Verify dev dependencies**:
   ```bash
   # Check Node version
   node --version  # Should be >=22 <23

   # Check yarn
   yarn --version  # Should have pnpm functionality

   # Check OpenMRS CLI
   npx openmrs --version  # Should be >= 5.0.0
   ```

---

## Phase 2: Claim Task (Multi-Agent Safe)

STARTER_SYMBOL=🔒

1. **Find unclaimed task**:
   ```bash
   TASK_PATTERN="$1"
   TASK_LINE=$(grep -n "^  - \[ \] $TASK_PATTERN" BACKLOG.md | grep -v "🔒" | head -1)

   if [ -z "$TASK_LINE" ]; then
     echo "❌ Task not found or already claimed"
     echo "Try: /browse-backlog ready"
     exit 1
   fi

   LINE_NUM=$(echo "$TASK_LINE" | cut -d: -f1)
   TASK_DESC=$(echo "$TASK_LINE" | cut -d: -f2- | sed 's/^  - \[ \] //')
   ```

2. **Extract stream context**:
   ```bash
   # Find which stream this task belongs to
   STREAM_HEADER=$(awk "NR<$LINE_NUM" BACKLOG.md | grep "^### STREAM" | tail -1)
   STREAM_NUM=$(echo "$STREAM_HEADER" | sed 's/^### STREAM \([0-9]*\):.*/\1/')
   STREAM_NAME=$(echo "$STREAM_HEADER" | sed 's/^### STREAM [0-9]*: //')
   ```

3. **Generate/load agent ID**:
   ```bash
   if [ ! -f .agent_id ]; then
     echo "AGENT-$(date +%s)" > .agent_id
   fi
   export AGENT_ID=$(cat .agent_id)
   ```

4. **Lock task**:
   ```bash
   TIMESTAMP=$(date -Iseconds)
   sed -i '' "${LINE_NUM}s/- \[ \]/- [ ] 🔒 [$AGENT_ID]/" BACKLOG.md
   sed -i '' "${LINE_NUM}s/$/ - $TIMESTAMP/" BACKLOG.md
   ```

5. **Commit lock immediately**:
   ```bash
   git add BACKLOG.md
   git commit -m "Lock task: $TASK_DESC

Agent: $AGENT_ID
Stream: $STREAM_NUM - $STREAM_NAME
Line: $LINE_NUM

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
   git push origin distributed-main
   ```

---

## Phase 3: Initialize Work Environment

STARTER_SYMBOL=🛠️

1. **Create agent directory**:
   ```bash
   mkdir -p .agent/$AGENT_ID
   ```

2. **Create E2E checklist**:
   ```markdown
   # E2E Delivery Checklist - $TASK_DESC

   **Agent**: $AGENT_ID
   **Stream**: $STREAM_NUM - $STREAM_NAME
   **Started**: $(date)
   **Status**: 🔄 IN PROGRESS

   ## TDD Cycle

   - [ ] 🔴 RED: Write failing test
     - File: `src/**/__tests__/*.test.tsx`
     - Command: `yarn test --watch`
     - Expected: Test fails (RED)

   - [ ] 🟢 GREEN: Implement minimal code
     - File: `src/**/*.tsx`
     - Command: `yarn test`
     - Expected: Test passes (GREEN)

   - [ ] 🔵 REFACTOR: Clean code while tests pass
     - Refactor implementation
     - Keep tests GREEN
     - Improve readability, remove duplication

   ## E2E Testing

   - [ ] 🎭 E2E Test: Write Playwright test
     - File: `e2e/**/*.spec.ts`
     - Command: `yarn test:e2e`
     - Expected: E2E test passes

   - [ ] 🌐 Browser Manual Test:
     - Start dev server: `yarn start`
     - Open: http://localhost:8080/openmrs/spa/augen-auf
     - Verify: Feature works as expected
     - Report any issues to agent

   ## Quality Gates

   - [ ] ✅ Type Check:
     - Command: `./scripts/check-types.sh`
     - Expected: No TypeScript errors

   - [ ] ✅ Lint Check:
     - Command: `./scripts/check-lint.sh`
     - Expected: No ESLint errors

   - [ ] ✅ All Tests Pass:
     - Command: `./scripts/test.sh`
     - Expected: All tests GREEN

   - [ ] ✅ Quality Gate:
     - Command: `./scripts/quality-gate.sh`
     - Expected: 100% GREEN (zero tolerance)

   ## Commit & Push

   - [ ] 🧹 Cleanup Ephemeral Files:
     - Command: `./scripts/agent-cleanup.sh`
     - Expected: No temp/scratch files

   - [ ] 🔐 Security Scan:
     - Command: `./scripts/pre-commit-check.sh`
     - Expected: No secrets, no PHI/PII

   - [ ] 📝 Commit:
     - Format: "Add X to enable Y"
     - Include co-author: Claude <noreply@anthropic.com>
     - Command: `git commit -m "..."`

   - [ ] 🚀 Push:
     - Command: `git push origin distributed-main`
     - Expected: Success

   - [ ] ✅ Mark Complete in BACKLOG.md:
     - Change: `- [ ] 🔒` → `- [x]`
     - Commit: "Complete task: $TASK_DESC"
     - Push: Share completion with team

   ## Notes

   [Add notes, blockers, decisions as work progresses]
   ```

   Save to: `.agent/$AGENT_ID/e2e-checklist.md`

3. **Create work log**:
   ```markdown
   # Work Log - $AGENT_ID

   ## Task: $TASK_DESC
   **Stream**: $STREAM_NUM - $STREAM_NAME
   **Claimed**: $TIMESTAMP
   **Status**: 🔄 IN PROGRESS

   ### Session Log

   #### $(date '+%Y-%m-%d %H:%M:%S') - Task Claimed
   - Locked in BACKLOG.md
   - E2E checklist created
   - Ready to start TDD

   [Log entries will be added as work progresses]

   ### Blockers

   [Document any blockers here]

   ### Decisions

   [Document key technical decisions]

   ### References

   - BACKLOG.md line: $LINE_NUM
   - E2E checklist: .agent/$AGENT_ID/e2e-checklist.md
   - Stream docs: STREAM_PARTITIONING.md
   ```

   Save to: `.agent/$AGENT_ID/work-log.md`

---

## Phase 4: Start Dev Server (Background)

STARTER_SYMBOL=🌐

1. **Check if dev server already running**:
   ```bash
   if lsof -ti:8080 > /dev/null 2>&1; then
     echo "✅ Dev server already running on port 8080"
   else
     echo "🚀 Starting dev server..."
     yarn start > .agent/$AGENT_ID/dev-server.log 2>&1 &
     DEV_SERVER_PID=$!
     echo $DEV_SERVER_PID > .agent/$AGENT_ID/dev-server.pid

     echo "Waiting for dev server to be ready..."
     sleep 10

     echo "✅ Dev server started (PID: $DEV_SERVER_PID)"
     echo "📍 URL: http://localhost:8080/openmrs/spa/augen-auf"
   fi
   ```

2. **Provide browser feedback instructions**:
   ```markdown
   ## 🌐 Browser Feedback Loop

   **Dev Server**: http://localhost:8080/openmrs/spa/augen-auf

   **How to provide feedback**:
   1. Open URL in browser
   2. Observe what you see
   3. Report to agent in this format:

   **Format**:
   ```
   Browser shows: [What you see]
   Expected: [What should be there]
   Issue: [Description if error]
   ```

   **Examples**:
   ✅ "Browser shows: Form rendered with bilateral inputs, left/right columns aligned"
   ⚠️ "Browser shows: BCVA input displays 4 decimals, expected 2"
   ❌ "Browser shows: Error - Cannot read property 'left' of undefined"
   ```

---

## Phase 5: Initialize TDD Environment

STARTER_SYMBOL=✅

1. **Create test file template** (if new component):
   ```typescript
   // Example: src/components/Forms/__tests__/BilateralInput.test.tsx
   import { render, screen } from '@testing-library/react';
   import { BilateralInput } from '../BilateralInput';

   describe('BilateralInput', () => {
     it('should fail initially - RED phase', () => {
       // TODO: Write failing test
       render(<BilateralInput />);

       // This should fail because component doesn't exist yet
       expect(screen.getByTestId('bilateral-input')).toBeInTheDocument();
     });
   });
   ```

2. **Run test (should FAIL - RED)**:
   ```bash
   ./scripts/test.sh --watch
   # Expected: Test fails (component doesn't exist)
   ```

3. **Display TDD guidance**:
   ```markdown
   ## 🔴 RED Phase (Current)

   **Goal**: Write a failing test

   **Next steps**:
   1. Define what the component should do
   2. Write test that describes the behavior
   3. Run test - it should FAIL
   4. Confirm RED state

   **Command**:
   ```bash
   /tdd-red $FEATURE_NAME
   ```

   When test fails (RED), move to GREEN phase:
   ```bash
   /tdd-green $FEATURE_NAME
   ```
   ```

---

## Phase 6: Create E2E Test Template

STARTER_SYMBOL=🎭

1. **Create Playwright E2E test**:
   ```typescript
   // Example: e2e/forms/bilateral-input.spec.ts
   import { test, expect } from '@playwright/test';

   test.describe('BilateralInput Component', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('http://localhost:8080/openmrs/spa/augen-auf');
       // TODO: Navigate to form with bilateral input
     });

     test('should display left and right eye inputs', async ({ page }) => {
       // TODO: Write E2E test
       const leftInput = page.locator('[data-testid="left-eye-input"]');
       const rightInput = page.locator('[data-testid="right-eye-input"]');

       await expect(leftInput).toBeVisible();
       await expect(rightInput).toBeVisible();
     });

     test('should copy data from left to right', async ({ page }) => {
       // TODO: Test copy functionality
     });
   });
   ```

2. **E2E test runs AFTER unit tests pass**

---

## Phase 7: Display Workflow Summary

STARTER_SYMBOL=📋

```markdown
# 🚀 E2E WORKFLOW STARTED

## ✅ Task Claimed

**Task**: $TASK_DESC
**Stream**: $STREAM_NUM - $STREAM_NAME
**Agent**: $AGENT_ID
**Locked at**: $TIMESTAMP
**Line**: $LINE_NUM in BACKLOG.md

## 🛠️ Environment Ready

✅ Work directory: `.agent/$AGENT_ID/`
✅ E2E checklist: `.agent/$AGENT_ID/e2e-checklist.md`
✅ Work log: `.agent/$AGENT_ID/work-log.md`
✅ Dev server: http://localhost:8080/openmrs/spa/augen-auf (running)
✅ Test environment: Ready for TDD

## 📍 Current Phase: 🔴 RED

**Next Steps**:

1. **Write Failing Test**:
   ```bash
   /tdd-red $FEATURE_NAME
   ```

2. **Implement Code** (after RED):
   ```bash
   /tdd-green $FEATURE_NAME
   ```

3. **Run Quality Gate** (after GREEN):
   ```bash
   /quality-gate
   ```

4. **Complete Task** (after all checks pass):
   ```bash
   /complete-task
   ```

## 📚 References

- E2E Checklist: `.agent/$AGENT_ID/e2e-checklist.md`
- Work Log: `.agent/$AGENT_ID/work-log.md`
- Stream Docs: `STREAM_PARTITIONING.md`
- Testing Strategy: `E2E_TESTING.md`
- Agent Protocol: `CLAUDE.md` (TDD Workflow section)

## 🌐 Browser Feedback

**Dev Server**: Running at http://localhost:8080/openmrs/spa/augen-auf

**Provide feedback format**:
- "Browser shows: [what you see]"
- "Expected: [what should be there]"
- "Issue: [description if error]"

---

**TDD Workflow**: RED → GREEN → REFACTOR → E2E → QUALITY → COMMIT

Let's start with RED phase! 🔴
```

---

## Phase 8: Track Session Start

STARTER_SYMBOL=📊

1. **Update work log**:
   ```bash
   echo "
#### $(date '+%Y-%m-%d %H:%M:%S') - E2E Workflow Started
- Dev server started
- TDD environment initialized
- Ready for RED phase
" >> .agent/$AGENT_ID/work-log.md
   ```

2. **Create metrics tracking**:
   ```bash
   mkdir -p .agent/$AGENT_ID/metrics
   echo "Task: $TASK_DESC
Started: $(date -Iseconds)
Stream: $STREAM_NUM
Phase: RED
" > .agent/$AGENT_ID/metrics/current-task.txt
   ```

---

## Conflict Handling

**If task already claimed**:

```markdown
❌ TASK ALREADY CLAIMED

Task: $TASK_DESC
Claimed by: $OTHER_AGENT_ID
Claimed at: $OTHER_TIMESTAMP

Lock age: $AGE_MINUTES minutes

**Options**:

1. **Choose different task**:
   ```bash
   /browse-backlog ready
   /next-task
   ```

2. **Wait if stale** (>15 min):
   ```bash
   # Lock is stale - may reclaim
   /claim-task "$TASK_PATTERN"
   ```

3. **Coordinate**:
   Add comment in BACKLOG.md about dependency
```

---

## Success Criteria

- [✅] Task synced from upstream
- [✅] Task found and unclaimed
- [✅] Lock committed and pushed immediately
- [✅] Agent work directory created
- [✅] E2E checklist generated
- [✅] Work log initialized
- [✅] Dev server running
- [✅] TDD environment ready
- [✅] Ready to start RED phase

---

## Related Commands

- `/tdd-red <feature>` - Write failing test (RED phase)
- `/tdd-green <feature>` - Implement code (GREEN phase)
- `/quality-gate` - Run all quality checks
- `/complete-task` - Mark task done and cleanup
- `/browse-backlog` - View all available tasks
- `/task-status` - Check your claimed tasks
