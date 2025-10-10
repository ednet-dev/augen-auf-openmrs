# Plugin Guide - Augmented Coding

**Commands, Hooks, Agents - Usage & Customization**

---

## Slash Commands (17)

### Workflow Commands

**`/quality-gate`**
- **Use**: Run all quality checks before commit
- **When**: Before every commit (mandatory)
- **Output**: ✅ GREEN or ❌ RED with failures
- **Time**: 2-5 minutes

**`/sync-team`**
- **Use**: Sync with upstream, show team activity
- **When**: Session start, before claiming tasks
- **Output**: Recent commits, active locks, conflicts
- **Time**: 30 seconds

**`/claim-task <pattern>`**
- **Use**: Lock task in BACKLOG.md safely
- **When**: Starting new work
- **Output**: Task locked with agent ID + timestamp
- **Time**: 30 seconds
- **Example**: `/claim-task "Create BilateralInput"`

### TDD Commands

**`/tdd-red <feature>`**
- **Use**: Write failing test (RED phase)
- **When**: Starting new feature
- **Output**: Test file created, hypothesis documented
- **Time**: 5-10 minutes
- **Example**: `/tdd-red validateBCVA`

**`/tdd-green <feature>`**
- **Use**: Implement minimal code (GREEN phase)
- **When**: After RED phase
- **Output**: Code that makes tests pass
- **Time**: 10-20 minutes
- **Example**: `/tdd-green validateBCVA`

### Parallel Execution

**`/parallel-stream <STREAM>`**
- **Use**: Execute entire work stream in parallel
- **When**: FORMS, DATA, LAYOUT streams (independent tasks)
- **Output**: 5-7 agents spawned, WAIT_ALL, integration tests
- **Time**: 45-60 minutes (vs 3-4 hours serial)
- **Example**: `/parallel-stream FORMS`

### Task Management (from Agent Protocol)

**`/next-task`**
- **Use**: Find next available task
- **When**: Completed current task
- **Output**: Next unclaimed task in current stream

**`/task-status`**
- **Use**: Show work stream status
- **When**: Session start, progress check
- **Output**: 9 streams progress table

**`/complete-task`**
- **Use**: Mark task complete with validation
- **When**: Task finished + quality gate passed
- **Output**: BACKLOG.md updated, task marked ✅

**`/handoff`**
- **Use**: Generate handoff document
- **When**: Ending session, transferring work
- **Output**: Progress, blockers, next steps

**`/sync-backlog`**
- **Use**: Pull + sync BACKLOG.md
- **When**: Before claiming, checking updates
- **Output**: Latest backlog, conflict detection

---

### Contract Management (NEW)

**`/contract-define <stream> <contract-name>`**
- **Use**: Generate contract template
- **When**: Before implementation (Week 1 for Stream A)
- **Output**: `contracts/<stream>/<contract>.ts`
- **Time**: 5 minutes
- **Example**: `/contract-define foundation validation`

**`/contract-validate <stream>`**
- **Use**: Check implementation matches contracts
- **When**: Before commit
- **Output**: ✅ Compliant or ❌ Violations
- **Time**: 30 seconds

**`/contract-change <contract-path>`**
- **Use**: Propose contract change
- **When**: Contract insufficient
- **Output**: CHANGE-XXX in CHANGES.md
- **Time**: 5 minutes

**`/contract-accept <change-id>`**
- **Use**: Accept change, migrate code
- **When**: After negotiation
- **Output**: Contract updated, code migrated
- **Time**: 5-15 minutes

**`/contract-reject <change-id> <reason>`**
- **Use**: Reject change
- **When**: Too disruptive
- **Output**: CHANGE-XXX rejected
- **Time**: 2 minutes

### Browser Feedback (NEW)

**`/dev-watch`**
- **Use**: Start dev server, browser feedback loop
- **When**: Session start
- **Output**: Server running at http://localhost:8080/openmrs/spa/augen-auf
- **Workflow**: Code change → Hot reload → Dev reports → Agent adjusts

---

## Hooks (14)

### Blocking Hooks (Prevent Commits)

**`pre-commit-quality.json`**
- **Event**: Before `git commit`
- **Command**: `./scripts/quality-gate.sh`
- **Use**: Enforce zero-tolerance quality
- **Blocks if**: Tests fail, type errors, lint issues
- **Customize**: Edit `timeout`, `retries` in hook JSON

**`prevent-ephemeral.json`**
- **Event**: Before `git add`
- **Command**: Check for `*_STATUS.md`, `*_LOG.md` patterns
- **Use**: Prevent temp file commits
- **Blocks if**: Ephemeral files staged
- **Customize**: Add patterns in `ephemeralPatterns` array

**`security-check.json`**
- **Event**: Before `git commit`
- **Command**: `./scripts/pre-commit-check.sh`
- **Use**: Scan for secrets, PHI/PII
- **Blocks if**: API keys, passwords, patient data found
- **Customize**: Add patterns in `scanPatterns` array

**`backlog-sync.json`**
- **Event**: Before editing `BACKLOG.md`
- **Command**: `./scripts/sync-upstream.sh`
- **Use**: Prevent BACKLOG conflicts
- **Blocks if**: Sync fails
- **Customize**: Edit `timeout` in hook JSON

**`tdd-enforcement.json`**
- **Event**: Before writing source files
- **Command**: `./scripts/check-test-exists.sh`
- **Use**: Enforce test-first development
- **Blocks if**: No test file exists
- **Customize**: Add paths to `excludePatterns`

**`medical-validation-coverage.json`**
- **Event**: Before writing medical files
- **Command**: `./scripts/check-medical-coverage.sh`
- **Use**: Enforce 100% medical validation coverage
- **Blocks if**: Missing boundary tests, null handling, etc.
- **Customize**: Edit `filePatterns`, `requiredCoverage`

**`prevent-phi-commits.json`**
- **Event**: Before `git commit`
- **Command**: Scan for PHI patterns
- **Use**: Medical data protection
- **Blocks if**: Patient data detected
- **Customize**: Add PHI patterns

**`prevent-breaking-openmrs-api.json`**
- **Event**: Before API changes
- **Command**: API contract check
- **Use**: OpenMRS compatibility
- **Blocks if**: Breaking changes detected
- **Customize**: Edit API contract rules

**`validate-contract-compliance.json`** (NEW)
- **Event**: Before commit
- **Command**: `./scripts/contract-validate.sh all`
- **Use**: Ensure implementation matches contracts
- **Blocks if**: Missing exports, type mismatches
- **Customize**: Edit `streams` array in hook JSON

**`detect-contract-breaking-changes.json`** (NEW)
- **Event**: Before editing contracts/**
- **Command**: `./scripts/contract-diff.sh`
- **Use**: Warn on breaking changes
- **Blocks if**: Never (warning only)
- **Customize**: Edit change classification rules

**`post-code-change-browser-check.json`** (NEW)
- **Event**: After editing components
- **Command**: Echo browser check reminder
- **Use**: Remind to verify in browser
- **Blocks if**: Never (reminder only)
- **Customize**: Edit URL pattern

### Non-Blocking Hooks (Reminders)

**`session-status.json`**
- **Event**: Session start
- **Command**: `./scripts/task-status.sh`
- **Use**: Show current work status
- **Output**: 9 streams progress, active agents

**`post-edit-test-reminder.json`**
- **Event**: After editing source files
- **Command**: Echo test reminder
- **Use**: Remind to run tests
- **Output**: "💡 Run ./scripts/test.sh to verify"

**`post-test-coverage-reminder.json`**
- **Event**: After running tests
- **Command**: Check coverage
- **Use**: Ensure adequate coverage
- **Output**: Coverage percentage, warnings

**`pre-commit-medical-validation.json`**
- **Event**: Before commit (medical files)
- **Command**: Medical validation check
- **Use**: Extra medical safety layer
- **Output**: Validation status

---

## Agents (8)

### Coordination Agents

**`parallel-coordinator`**
- **Specialization**: Orchestration
- **Use When**: Parallel stream execution
- **Responsibilities**:
  - Spawn 5-7 subagents
  - Track progress in PARALLEL_STATUS.md
  - WAIT_ALL protocol
  - Aggregate results
- **Invoke**: Via `/parallel-stream` command
- **Max Concurrent**: 10 agents

**`parallel-stream-coordinator`**
- **Specialization**: Stream-specific orchestration
- **Use When**: Complex stream dependencies
- **Responsibilities**:
  - Analyze dependencies
  - Batch task execution
  - Handle blockers

### Discipline Agents

**`tdd-enforcer`**
- **Specialization**: TDD discipline
- **Use When**: Feature implementation
- **Responsibilities**:
  - Enforce RED-GREEN-REFACTOR
  - Block code before tests
  - Document TDD_LOG.md
- **STARTER_SYMBOL**: 🔴 (RED), 🟢 (GREEN), 🧹 (REFACTOR)

**`medical-tdd-enforcer`**
- **Specialization**: Medical TDD
- **Use When**: Medical validation code
- **Responsibilities**:
  - Enforce 100% coverage
  - Boundary value testing
  - Null/undefined handling

### Validation Agents

**`medical-validator`**
- **Specialization**: Medical logic review
- **Use When**: Reviewing medical validation
- **Responsibilities**:
  - 100% coverage verification
  - Boundary test check
  - Error message clarity
  - No magic numbers
- **STARTER_SYMBOL**: 🏥

**`quality-guardian`**
- **Specialization**: Quality enforcement
- **Use When**: Pre-commit checks
- **Responsibilities**:
  - Zero-tolerance enforcement
  - All quality checks pass
  - Block commits on failure
- **STARTER_SYMBOL**: 🛡️

### Domain-Specific Agents

**`bilateral-form-builder`**
- **Specialization**: Bilateral UI components
- **Use When**: Left/right eye forms
- **Responsibilities**:
  - Mirror data structures
  - Copy operations (left↔right)
  - Independent validation

**`openmrs-integration-agent`**
- **Specialization**: OpenMRS API
- **Use When**: Backend integration
- **Responsibilities**:
  - Concept mapping
  - Encounter creation
  - Observation persistence
  - Offline support

---

## Customization

### Add New Command

```bash
# 1. Create file
cat > .claude/commands/my-command.md << 'EOF'
---
description: Short description (shown in autocomplete)
argument-hint: <required-args>
allowed-tools: Read, Write, Bash(./scripts/*)
model: sonnet
---

# My Command

**Purpose**: What this command does

**Arguments**: `$1` - Description

STARTER_SYMBOL=🎯

## Procedure

1. Step 1
2. Step 2
...
EOF

# 2. Test
# Type /my-command in Claude Code
```

### Add New Hook

```bash
# 1. Create hook JSON
cat > .claude/hooks/my-hook.json << 'EOF'
{
  "event": "PreToolUse",
  "matcher": "Bash(git push*)",
  "command": "./scripts/my-check.sh",
  "description": "Check before push",
  "blocking": true,
  "enabled": true,
  "configuration": {
    "timeout": 60000
  }
}
EOF

# 2. Create script
cat > scripts/my-check.sh << 'EOF'
#!/usr/bin/env bash
# Your validation logic
exit 0  # Success
EOF
chmod +x scripts/my-check.sh

# 3. Test
# Hook triggers automatically on matching event
```

### Add New Agent

```bash
# Create agent markdown
cat > .claude/agents/my-agent.md << 'EOF'
---
name: my-agent
description: Agent purpose
tools: Read, Write, Bash(./scripts/*)
model: sonnet
---

# My Agent

You are a specialized agent that...

STARTER_SYMBOL=🤖

## Responsibilities
1. Task 1
2. Task 2
...
EOF

# Invoke with: "Use my-agent to implement X"
```

### Modify Quality Standards

Edit `.claude-plugin/manifest.json`:

```json
{
  "configuration": {
    "qualityGate": {
      "testCoverageMinimum": 90,  // Change from 80
      "medicalValidationCoverage": 100,
      "typeScriptErrors": 0,
      "lintIssues": 0
    }
  }
}
```

### Add Medical Validation Pattern

Edit `scripts/check-medical-coverage.sh`:

```bash
# Add file pattern
MEDICAL_PATTERNS=(
  "src/**/medical*.ts"
  "src/**/validation*.ts"
  "src/**/bilateral*.ts"
  "src/**/my-pattern*.ts"  # New pattern
)
```

### Disable Hook Temporarily

Edit hook JSON:

```json
{
  "enabled": false,  // Set to false
  ...
}
```

Or delete hook file:
```bash
rm .claude/hooks/unwanted-hook.json
```

---

## Semantic Guide

### Command Naming

- **Verbs**: `claim`, `sync`, `complete`, `handoff`
- **Context**: `quality-gate`, `tdd-red`, `parallel-stream`
- **Pattern**: `<verb>-<noun>` or `<context>-<action>`

### Hook Events

- **PreToolUse**: Before tool executes (can block)
- **PostToolUse**: After tool completes (notifications)
- **UserPromptSubmit**: On user input (context)

### Agent Starter Symbols

- 🔀 Parallel coordinator
- 🔴 RED phase
- 🟢 GREEN phase
- 🧹 REFACTOR phase
- 🛡️ Quality enforcement
- 🏥 Medical validation
- 🎯 Task focus

### File Patterns

- **Commands**: `.claude/commands/*.md`
- **Agents**: `.claude/agents/*.md`
- **Hooks**: `.claude/hooks/*.json`
- **Templates**: `templates/memory/*.template.md`
- **Scripts**: `scripts/*.sh`

---

## Quick Reference

**Start work**:
```bash
/sync-team
/claim-task "task"
/tdd-red feature
/tdd-green feature
/quality-gate
```

**Parallel execution**:
```bash
/parallel-stream FORMS  # 2-3x faster
```

**Customization**:
- Commands: Edit `.claude/commands/*.md`
- Hooks: Edit `.claude/hooks/*.json`
- Agents: Edit `.claude/agents/*.md`
- Standards: Edit `.claude-plugin/manifest.json`

**Disable temporarily**:
- Hook: Set `"enabled": false` in JSON
- Command: Delete `.md` file
- Agent: Delete `.md` file
