# OpenMRS Medical Plugin

**Version**: 1.0.0
**Framework**: Agent Protocol v1.1
**Domain**: Healthcare / Ophthalmology

## Overview

Augmented coding plugin for OpenMRS 3.x medical module development. Optimized for:
- Medical data validation (bilateral forms, measurements)
- PHI/PII protection (automated scanning)
- Distributed team coordination (9 parallel work streams)
- Novice developer onboarding (high-density slash commands)

## Quick Start

### For Novice Developers

```bash
# Scaffold complete bilateral form component (TDD-first)
/medical-form "BCVA Input"

# Generate OpenMRS concept mapping
/openmrs-concept "Astigmatism"

# Sync with distributed team
/sync-backlog
```

### For Experienced Developers

```bash
# Complete pre-surgery workflow implementation
/presurgery-workflow

# Validate medical data ranges
/validate-medical

# Save to OpenMRS encounter
/encounter-save
```

### For Agent Handoff

```bash
# Generate handoff document
/handoff
```

## Slash Commands (8 Total)

| Command | Purpose | Complexity | Time Saved |
|---------|---------|------------|------------|
| `/medical-form` | Scaffold bilateral form component | Low | 15 min |
| `/openmrs-concept` | Generate concept mapping boilerplate | Low | 10 min |
| `/bilateral-test` | Write left/right symmetry tests | Medium | 20 min |
| `/validate-medical` | Add validation rules with tests | Medium | 25 min |
| `/encounter-save` | Generate encounter save logic | Medium | 30 min |
| `/presurgery-workflow` | Complete assessment flow | High | 2 hours |
| `/sync-backlog` | Pull upstream & check locks | Low | 5 min |
| `/handoff` | Generate agent handoff doc | Low | 10 min |

## Specialized Agents (5 Total)

| Agent | Role | Use When |
|-------|------|----------|
| `medical-validator` | PHI checks, validation | Validating medical inputs |
| `bilateral-form-builder` | Left/right forms | Building eye assessment UI |
| `openmrs-integration-agent` | API integration | Connecting to OpenMRS backend |
| `parallel-stream-coordinator` | Orchestration | Managing 9 BACKLOG streams |
| `medical-tdd-enforcer` | TDD discipline | Ensuring test-first medical code |

## Safety Hooks (4 Total)

| Hook | Event | Purpose | Blocking |
|------|-------|---------|----------|
| `prevent-phi-commits` | PreToolUse | Block patient data in commits | Yes |
| `pre-commit-medical-validation` | PreToolUse | Zero-tolerance medical checks | Yes |
| `post-test-coverage-reminder` | PostToolUse | Enforce 80% coverage | No |
| `prevent-breaking-openmrs-api` | PreToolUse | API contract compliance | Yes |

## Medical Patterns

### 🏥 BILATERAL_CAPTURE
**Intent**: Capture left/right eye data symmetrically
**When**: Building ophthalmology assessment forms
**Pattern**: Mirror data structures, copy operations, asymmetry detection

### 💉 MEDICAL_VALIDATION
**Intent**: Validate medical measurements exhaustively
**When**: Any medical input component
**Pattern**: Boundary tests, range validation, unit tests for correctness

### 🔐 PHI_PROTECTION
**Intent**: Prevent patient data leaks
**When**: All commits, logs, error messages
**Pattern**: Automated scanning, no PII in console.log, audit trails

### 🌐 OPENMRS_INTEGRATION
**Intent**: Save data to OpenMRS backend
**When**: Form submissions, workflow state changes
**Pattern**: Concept mapping, encounter creation, observation persistence

### 🔀 PARALLEL_STREAMS
**Intent**: Coordinate 9 work streams in BACKLOG
**When**: Multiple agents working simultaneously
**Pattern**: Lock protocol, sync daemon, handoff documents

## Configuration

### Quality Standards

```json
{
  "testCoverageMinimum": 80,
  "medicalLogicCoverageMinimum": 90,
  "typeScriptErrors": 0,
  "lintIssues": 0
}
```

### Medical Validation Ranges

```json
{
  "bcvaRange": [0.0, 1.0],
  "astigmatismRange": [-10.0, 10.0],
  "axialLengthRange": [15.0, 35.0]
}
```

## For Contributors

### First-Time Setup

1. Read `BACKLOG.md` - Understand 9 work streams
2. Read `CLAUDE.md` - Agent Protocol instructions
3. Run `/sync-backlog` - Get latest updates
4. Pick unclaimed task from BACKLOG
5. Lock task: `🔒 [AGENT-{YOUR_ID}] Task`
6. Start TDD: `./scripts/test.sh <module> --watch`

### Before Every Commit

```bash
./scripts/quality-gate.sh        # Must be GREEN
./scripts/agent-cleanup.sh       # Remove ephemeral files
./scripts/pre-commit-check.sh    # PHI scan
git commit -m "Add <feature> to <achieve value>"
```

### When Handing Off Work

```bash
/handoff
# Generates comprehensive handoff document with:
# - Current progress
# - Remaining tasks
# - Blockers
# - Key files
# - Next steps
```

## Examples

### Example 1: Novice Developer Builds Form Component

```bash
# 1. Claim task
grep "BilateralInput" BACKLOG.md
# Lock in BACKLOG.md: 🔒 [AGENT-123]

# 2. Generate boilerplate
/medical-form "BilateralInput"
# Creates: src/components/Forms/BilateralInput.tsx
#          src/components/Forms/__tests__/BilateralInput.test.tsx

# 3. TDD cycle
./scripts/test.sh Forms --watch
# RED → GREEN → REFACTOR

# 4. Commit
./scripts/quality-gate.sh
git commit -m "Add BilateralInput to enable left/right eye data capture"
```

### Example 2: Experienced Developer Completes Stream

```bash
# 1. Review stream
cat BACKLOG.md | grep "STREAM 8"

# 2. Complete workflow
/presurgery-workflow
# Agent analyzes BACKLOG, implements all STREAM 8 tasks in parallel

# 3. Integration test
./scripts/test.sh PreSurgery

# 4. Handoff
/handoff > .agent/STREAM-8-COMPLETE.md
git commit -m "Complete STREAM 8: Pre-surgery assessment form"
```

### Example 3: Distributed Team Coordination

```bash
# Agent A (Morning)
./scripts/start-agent-sync.sh    # Auto-sync every 5 min
grep "- \[ \]" BACKLOG.md         # Find available tasks
# Lock: 🔒 [AGENT-A] STREAM 3: LAYOUT
# ... works on layout ...

# Agent B (Afternoon, different timezone)
/sync-backlog                     # Pull latest
grep "🔒" BACKLOG.md              # Check locks
# Sees: AGENT-A working on STREAM 3
# Picks: STREAM 2: DATA (no conflict)
# Lock: 🔒 [AGENT-B] STREAM 2: DATA
# ... works in parallel ...

# Agent A (Evening)
# Auto-sync detects AGENT-B progress in STREAM 2
# Continues STREAM 3 without conflicts
# Quality gate GREEN → commit → push

# Agent C (Next day)
/sync-backlog
grep "BLOCKED\|🚨" BACKLOG.md     # Check for blockers
# No blockers, picks STREAM 4
```

## Troubleshooting

### Command Not Found

```bash
# Check commands installed
ls -la .claude/commands/

# Reload Claude Code
# Restart Claude Code session
```

### PHI Warning on Commit

```bash
# Hook blocked commit with PHI data
# Check pre-commit-check.sh output
# Remove patient data from code/logs
# Re-commit
```

### Quality Gate Failing

```bash
# Run individual checks
./scripts/check-types.sh
./scripts/check-lint.sh
./scripts/test.sh all

# Fix issues
# Re-run quality gate
./scripts/quality-gate.sh
```

## Maintenance

### Adding New Command

```bash
# Create command file
cat > .claude/commands/my-command.md <<EOF
---
description: Brief description
scope: project
---

# Command implementation
EOF

# Update manifest.json capabilities
# Test command: /my-command
```

### Updating Medical Validation Ranges

Edit `.claude-plugin/manifest.json`:

```json
{
  "configuration": {
    "medicalValidation": {
      "bcvaRange": [0.0, 1.2],  // Updated range
      ...
    }
  }
}
```

## Version History

**v1.0.0** (2025-10-10)
- Initial release
- 8 slash commands
- 5 specialized agents
- 4 safety hooks
- 5 medical patterns
- Production-ready for distributed teams

## License

MIT - Use freely, adapt generously, attribute kindly.

---

**Framework**: Agent Protocol v1.1
**Maintained By**: Augen Auf Team
**Repository**: https://github.com/your-org/augen-auf-openmrs
