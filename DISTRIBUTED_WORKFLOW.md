# Distributed Agent Workflow

**Quick Guide**: 4 developers, 4 parallel streams, contract-first development

---

## Setup (One-Time)

### Option A: 4 Terminal Windows (Recommended)

```bash
# Terminal 1: Dev 1 - Stream A (Foundation)
cd ~/projects/augen-auf-openmrs

# Terminal 2: Dev 2 - Stream B (Layout & Nav)
cd ~/projects/augen-auf-openmrs-B
git clone ~/projects/augen-auf-openmrs .

# Terminal 3: Dev 3 - Stream C (Forms & Patients)
cd ~/projects/augen-auf-openmrs-C
git clone ~/projects/augen-auf-openmrs .

# Terminal 4: Dev 4 - Stream D (Workflows)
cd ~/projects/augen-auf-openmrs-D
git clone ~/projects/augen-auf-openmrs .
```

### Option B: 4 Worktrees (Git Experts)

```bash
# Main repo
cd ~/projects/augen-auf-openmrs

# Create worktrees
git worktree add ../augen-auf-openmrs-B main  # Stream B
git worktree add ../augen-auf-openmrs-C main  # Stream C
git worktree add ../augen-auf-openmrs-D main  # Stream D

# Terminal 1: cd ~/projects/augen-auf-openmrs     (Stream A)
# Terminal 2: cd ~/projects/augen-auf-openmrs-B   (Stream B)
# Terminal 3: cd ~/projects/augen-auf-openmrs-C   (Stream C)
# Terminal 4: cd ~/projects/augen-auf-openmrs-D   (Stream D)
```

---

## Daily Workflow

### 1. Morning Sync (All Devs)

**Each terminal**:
```bash
git pull origin distributed-main --rebase
/sync-team
/stream-status
```

**Assigned streams** (see STREAM_PARTITIONING.md):
- Dev 1 (Terminal 1) → Stream A: Foundation (INFRA + DATA)
- Dev 2 (Terminal 2) → Stream B: Layout & Nav (LAYOUT + SIDEBAR)
- Dev 3 (Terminal 3) → Stream C: Forms & Patients (FORMS + PATIENT-MGT)
- Dev 4 (Terminal 4) → Stream D: Workflows (WORKFLOW + PRESURGERY + ACTIONS)

### 2. Check Contracts (Week-Specific)

**Week 1 (Dev 1 only)**:
```bash
# Dev 1: Define foundation contracts
/contract-define foundation types
/contract-define foundation validation
/contract-define foundation concepts
git push
```

**Week 2+ (All devs)**:
```bash
# Pull latest contracts
git pull
ls contracts/foundation/  # Should see types.ts, validation.ts, etc.

# Validate you can use them
/contract-validate <your-stream>
```

---

### 3. Start Dev Server + Browser Feedback

**Each dev**:
```bash
/dev-watch
# Starts yarn start (OpenMRS dev server)
# URL: http://localhost:8080/openmrs/spa/augen-auf
```

**Browser feedback loop**:
1. Agent makes code changes
2. Hot reload in browser
3. Dev reports: "Browser shows: [what you see]"
4. Agent adjusts based on feedback
5. Repeat

---

### 4. Claim Tasks (Each Dev)

**Dev 1 (Stream A - Terminal 1)**:
```bash
/claim-task "Create scripts/test.sh"
# Foundation work
```

**Dev 2 (Stream B - Terminal 2)**:
```bash
# Week 1: Wait for Stream A contracts
# Week 2+: git pull, then:
/claim-task "Implement main app shell"
```

**Dev 3 (Stream C - Terminal 3)**:
```bash
# Week 1: Wait for Stream A contracts
# Week 2+: git pull, then:
/claim-task "Create BilateralInput"
```

**Dev 4 (Stream D - Terminal 4)**:
```bash
# Week 1-2: Wait for Streams A, B, C contracts
# Week 3+: git pull, then:
/claim-task "Design workflow state machine"
```

---

### 5. Work in Parallel (TDD + Browser Feedback)

**Each agent follows**:
```bash
# RED phase
/tdd-red <feature>

# GREEN phase
/tdd-green <feature>

# REFACTOR phase (keep tests green)

# Quality check
/quality-gate
```

**Each dev reports to agent**:
- "Browser shows form rendered correctly" ✅
- "Browser shows error: Cannot read property 'left'" ❌
- "BCVA input shows 4 decimals, needs 2" ⚠️

**Agent responds**:
- Fixes issues
- Runs tests
- Asks dev to refresh browser
- Confirms fix

---

### 6. Push + Sync (After Each Completion)

**After completing task**:
```bash
# Cleanup
./scripts/agent-cleanup.sh

# Commit
git add .
git commit -m "Add X to enable Y"

# Push immediately
git push origin distributed-main

# Sync other agents
# Switch to other terminals:
git pull origin distributed-main --rebase
```

---

## Conflict Resolution

### Case 1: Push Conflict

```bash
# Agent A pushes first ✅
git push origin distributed-main

# Agent B tries to push ❌
git push origin distributed-main  # Rejected

# Agent B resolves:
git pull origin distributed-main --rebase
# Resolve conflicts (usually BACKLOG.md)
git push origin distributed-main  # Now succeeds ✅
```

### Case 2: Same File Edited

**Prevention**: Choose independent streams
- ✅ Agent A: FORMS (src/components/Forms/*)
- ✅ Agent B: LAYOUT (src/components/Layout/*)
- ❌ Both: BACKLOG.md (auto-synced by hooks)

**If conflict happens**:
```bash
# Pull with rebase
git pull origin distributed-main --rebase

# Resolve conflicts
# For BACKLOG.md: Keep both locks, merge manually
# For code: Coordinate with other dev

# Continue
git rebase --continue
git push origin distributed-main
```

---

## Contract Change Workflow

**When contract change needed during implementation**:

```bash
# Dev 4 needs async validation (Week 3)
/contract-change contracts/foundation/validation.ts
# Creates CHANGE-001 in contracts/CHANGES.md
# Adds notification to BACKLOG.md

# Dev 4 notifies owner via BACKLOG.md:
"🚨 CONTRACT CHANGE-001: Need asyncValidate for server validation"

# Dev 1 reviews within 24 hours
git pull  # See CHANGE-001
# Review proposed change
/contract-accept CHANGE-001  # Or /contract-reject CHANGE-001

# If accepted:
# - Agents migrate all affected code
# - Contract version bumped (1.0.0 → 1.1.0)
# - All tests run

# Dev 3-4 pull updated code:
git pull
# Code already migrated by agents
# Review and test locally
```

**Negotiation happens between humans via BACKLOG.md or Slack**

---

## Stream Assignments (Avoid Conflicts)

**4 Parallel Streams** (contract boundaries):

**Stream A: Foundation** (Dev 1, Week 1):
- STREAM 1: INFRA (scripts/*)
- STREAM 2: DATA (contracts/foundation/*, src/types/*)
- **Output**: types, validation, concepts, test-utils

**Stream B: Layout & Nav** (Dev 2, Week 2-3):
- STREAM 3: LAYOUT (src/components/Layout/*)
- STREAM 4: SIDEBAR (src/components/Sidebar/*)
- **Depends**: Stream A contracts
- **Output**: navigation-api, layout-slots, filter-state

**Stream C: Forms & Patients** (Dev 3, Week 2-4):
- STREAM 7: FORMS (src/components/Forms/*)
- STREAM 5: PATIENT-MGT (src/components/Patients/*)
- **Depends**: Stream A contracts
- **Output**: form-api, validation-hooks, patient-selection

**Stream D: Workflows** (Dev 4, Week 3-6):
- STREAM 6: WORKFLOW (src/state/*)
- STREAM 8: PRESURGERY (src/components/PreSurgery/*)
- STREAM 9: ACTIONS (src/services/*)
- **Depends**: Streams A, B, C contracts
- **Output**: state-machine, encounter-api, export-api

---

## Quick Rules

1. **Sync before claiming**: `/sync-team` or `git pull`
2. **Push after completing**: Don't hoard commits locally
3. **Choose independent streams**: Avoid file conflicts
4. **Run quality gate**: Must be GREEN before push
5. **Cleanup ephemeral files**: `./scripts/agent-cleanup.sh`

---

## Example Timeline (4 Devs, 6 Weeks)

**Week 1: Stream A Only**
```bash
Dev 1: Define contracts → Implement INFRA + DATA → Push contracts
Dev 2-4: Review contracts, provide feedback, wait
```

**Week 2: Streams B + C Start**
```bash
Dev 1: Support, answer questions
Dev 2: Pull A contracts → Define B contracts → Implement LAYOUT + SIDEBAR
Dev 3: Pull A contracts → Define C contracts → Implement FORMS
Dev 4: Review B+C contracts, prepare
```

**Week 3-4: Stream D Starts**
```bash
Dev 1: Maintenance, contract changes if needed
Dev 2: Finish Stream B, push contracts
Dev 3: Finish Stream C, push contracts
Dev 4: Pull all contracts → Implement WORKFLOW + PRESURGERY
```

**Week 5-6: Integration**
```bash
All devs: E2E testing, integration bugs, contract changes as needed
```

**Result**:
- 4 devs working in parallel
- Minimal conflicts (contract boundaries)
- 2-3x faster than serial development

---

## Troubleshooting

**"My push was rejected"**
→ `git pull origin distributed-main --rebase` then push again

**"BACKLOG.md has conflicts"**
→ Both agents claimed tasks - first lock wins, merge manually

**"Tests pass locally but fail after pull"**
→ Run `/quality-gate` after every pull

**"Other agent modified my file"**
→ Choose different streams to avoid conflicts

**"How do I see other agents' work?"**
→ `git pull` then check `BACKLOG.md` for `🔒` locks

---

## Performance Tips

**3 agents, independent streams**: 2-3x faster
**5 agents, batched work**: 3-4x faster (needs coordination)
**1 agent**: Baseline

**Optimal setup**: 3 agents, 3 terminals, 3 work streams

**Bottleneck**: Integration at end - plan sequential if needed

---

## Cleanup (End of Day)

```bash
# Each terminal:
./scripts/agent-cleanup.sh
git status  # Should be clean

# Optional: Delete clones (if using clone method)
rm -rf ~/projects/augen-auf-openmrs-clone1
rm -rf ~/projects/augen-auf-openmrs-clone2

# Or keep them for tomorrow's session
```

---

**Remember**: Communication is key. If conflict happens, coordinate via BACKLOG.md comments or Slack.
