# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Style

**User Preference**: Brief, minimalistic responses

✅ **DO**:
- Brief markdown bullet points
- Indented lists
- Minimal text

❌ **DON'T**:
- Verbose summaries
- "Let me create a report..." style messages
- Unnecessary explanations

## Commit Style

**Format**: Single simple English sentence explaining what/why/how

✅ **GOOD**:
- "Add contract-first protocol to enable parallel development with minimal conflicts"
- "Create distributed-main branch to separate agent work from human-reviewed code"
- "Add browser feedback loop to allow developers to report UI issues to agents"

❌ **BAD**:
- "WIP"
- "Updated files"
- "Changes"

**Strategy**: Group related files semantically, commit groups in parallel when independent

## Project Overview

This is an **OpenMRS 3 frontend module** built on the OpenMRS microfrontend architecture. It uses React 18, TypeScript, and the OpenMRS ESM Framework for building healthcare applications as part of the OpenMRS 3.x platform.

## 🚀 Distributed Workflow (Multi-Agent Setup)

**Run 3 Claude agents in parallel for 2-3x faster development:**

- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md) - 1-page cheat sheet
- **Full Guide**: [DISTRIBUTED_WORKFLOW.md](./DISTRIBUTED_WORKFLOW.md) - Detailed workflow
- **Augmented Coding**: [PROCEDURE.md](./PROCEDURE.md) - Slash commands, hooks, agents

**TL;DR**: Clone repo 3 times, assign each agent to independent work stream (FORMS, LAYOUT, SIDEBAR), work in parallel using TDD, push frequently, sync with `/sync-team`.

---

## Key Commands

### Development
```bash
# Install dependencies
yarn install

# Start development server (hot reload with OpenMRS tooling)
yarn start

# Build for production
yarn build

# Run webpack dev server manually
yarn serve
```

### CI/CD
The project uses GitHub Actions (`.github/workflows/build.yml`) for continuous integration on `main` and `develop` branches.

## Architecture

### OpenMRS ESM Framework Integration

This module follows the **OpenMRS microfrontend pattern**:

1. **Module Registration** (`src/index.ts`):
   - Uses `defineConfigSchema()` to register configuration
   - Exports `root` lifecycle using `getAsyncLifecycle()`
   - Module name: `@augen-auf/openmrs-esm-augen-auf`
   - Feature name: `augen-auf`

2. **Routing** (`src/routes.json`):
   - Defines pages and extensions following OpenMRS routes schema
   - Route: `/augen-auf`
   - Supports both online and offline modes

3. **Configuration Schema** (`src/config-schema.ts`):
   - Uses `@openmrs/esm-framework` Type system
   - Defines module-specific configuration properties

4. **Root Component** (`src/root.component.tsx`):
   - Main React component lazy-loaded by the framework
   - Entry point for the module's UI

### Build System

- **Webpack 5** with OpenMRS default configuration (`openmrs/default-webpack-config`)
- **SWC** for TypeScript transpilation (faster than Babel)
- Output: `dist/openmrs-esm-augen-auf.js` (browser bundle)

### TypeScript Configuration

- Target: ES2022
- Module system: ESNext
- Strict mode: **disabled** (as per OpenMRS conventions)
- React JSX support

## Key Dependencies

- `@openmrs/esm-framework`: Core framework for OpenMRS 3 microfrontends
- `react` / `react-dom`: 18.x (peer dependencies)
- `openmrs`: CLI and development tooling (v5.0.0)

## Development Workflow

1. **Local Development**: Use `yarn start` which runs `openmrs develop` command
   - This integrates the module with a local or remote OpenMRS instance
   - Provides hot module reloading

2. **Module Access**: After starting, the module is available at `/augen-auf` route

3. **Configuration**: Module configuration can be overridden via OpenMRS 3 configuration system

## Important Files

- `src/index.ts`: Module registration and lifecycle exports
- `src/routes.json`: Route and extension definitions (JSON schema validated)
- `src/config-schema.ts`: Configuration schema using OpenMRS Type system
- `src/root.component.tsx`: Main UI component
- `webpack.config.js`: Delegates to OpenMRS default webpack config

## OpenMRS-Specific Patterns

- **Single-SPA**: OpenMRS uses single-spa for microfrontend orchestration
- **Async Lifecycle**: Modules use `getAsyncLifecycle()` for lazy loading
- **Configuration Schema**: All config must be defined with types and defaults
- **Route Schema**: Routes follow OpenMRS JSON schema for validation

## Known Issues

### TypeScript Build Errors
The production build currently fails with TypeScript errors in `@openmrs/esm-styleguide` and `@openmrs/esm-utils` related to `@internationalized/date` type compatibility. This is a known issue with OpenMRS 5.8.1 dependencies.

**Workaround**: Use `yarn start` for development which may handle these errors differently. The TypeScript errors are in node_modules, not in the source code.

---

## 🤖 Agent Protocol v1.1 - Project Adaptation

This project follows the **Agent Protocol v1.1** for multi-agent coordination. Review `BACKLOG.md` for parallelizable work streams.

### Initialization Checklist

When starting work as an agent:

```bash
# 1. Sync with latest
git pull origin distributed-main

# 2. Start background sync daemon (auto-pulls every 5 minutes)
./scripts/start-agent-sync.sh

# 3. Review backlog
cat BACKLOG.md | grep "- \[ \]" | head -20

# 4. Generate agent ID
echo "AGENT-$(date +%s)" > .agent_id
export AGENT_ID=$(cat .agent_id)

# 5. Claim a task
# Edit BACKLOG.md: - [ ] Task → - [ ] 🔒 [AGENT-{ID}] Task - {timestamp}
```

**Important**: The sync daemon runs in the background and automatically:
- Fetches from origin every 5 minutes
- Pulls new commits if no local changes
- Alerts when BACKLOG.md is updated by other agents
- Shows recent activity from distributed team

Stop the daemon when done: `./scripts/stop-agent-sync.sh`

### TDD Workflow (MANDATORY)

**NEVER write implementation before tests. This is medical software - correctness is critical.**

```bash
# RED Phase: Write failing test FIRST
./scripts/test.sh <module> --watch
# Wait for RED output (failing test)

# GREEN Phase: Minimal code to pass
# Write just enough code to make test pass
./scripts/test.sh <module>
# Confirm GREEN output

# REFACTOR Phase: Clean while maintaining GREEN
./scripts/test.sh <module> --watch
# Keep tests passing while improving code
```

**Testing Strategy** (3 Layers):

**Unit Tests** (mocks OK):
- Use `@testing-library/react` for component tests
- Mock `@openmrs/esm-framework` hooks for isolation
- Fast feedback, test single units

**Integration Tests** (NO mocks):
- Test medical data validation exhaustively (boundary values, invalid inputs)
- Test bilateral data synchronization (left/right eye)
- Real OpenMRS API calls (requires test instance running)

**E2E Tests** (NO mocks, NO shims):
- Full workflow testing (Playwright + real browser)
- Real OpenMRS backend integration
- Real data persistence verification
- **MANDATORY for medical software**

**See**: [E2E_TESTING.md](./E2E_TESTING.md) - E2E protocol (no mocks, real services)

### Quality Gates

**Run before EVERY commit**:

```bash
# Unified quality check (zero tolerance for warnings)
./scripts/quality-gate.sh

# Individual checks (for debugging)
./scripts/check-types.sh    # TypeScript validation
./scripts/check-lint.sh     # ESLint + formatting
./scripts/test.sh           # All tests must pass
```

**Known Type Check Workaround**:
Due to OpenMRS 5.8.1 dependency issues, type checking may fail on node_modules. The quality gate script handles this by:
- Only checking types in `src/**/*.ts(x)` files
- Skipping node_modules validation
- This is acceptable as our source code is still type-safe

### Testing Infrastructure

**Test Script Standards** (`scripts/test.sh`):
```bash
#!/bin/bash
MODULE=${1:-all}
WATCH=${2}

if [ "$MODULE" = "all" ]; then
  CMD="yarn test"
else
  CMD="yarn test -- $MODULE"
fi

if [ "$WATCH" = "--watch" ]; then
  CMD="$CMD --watch"
fi

# Minimize output when GREEN, full details when RED
if $CMD 2>&1 | grep -qE "FAIL|Error|failed"; then
  $CMD --verbose
  exit 1
else
  echo "✅ GREEN: All tests pass for $MODULE"
  exit 0
fi
```

**Testing Rules**:
- ONLY use `./scripts/test.sh`, NEVER `yarn test` directly
- Write tests in `__tests__` directories or `*.test.tsx` files
- Medical validation tests are NON-NEGOTIABLE
- Mock OpenMRS API calls (never hit real API in tests)
- Test coverage minimum: 80% for medical logic, 60% for UI

### Multi-Agent Coordination

**Scope Boundaries**:
1. **PRIMARY**: Your locked task in `BACKLOG.md`
2. **SECONDARY**: Dependencies within the same work stream
3. **FOREIGN**: Other work streams - use conflict protocol

**Conflict Resolution**:
```
IF you need to modify a file locked by another agent:
  1. Check lock timestamp (>15min = stale, proceed)
  2. If fresh: Add "🚨 BLOCKING: {YOUR_ID} needs {change}" to BACKLOG.md
  3. Wait 5 minutes for acknowledgment
  4. If no response: Implement minimal change, document in both contexts
```

**Local Context** (for complex tasks):
```bash
mkdir -p .agent/$AGENT_ID
echo "# Agent $AGENT_ID Context" > .agent/$AGENT_ID/BACKLOG.md
# Track sub-tasks, decisions, blockers here
```

### Pre-Commit Protocol (MANDATORY)

**Before ANY commit**:

```bash
# 1. Run quality gate
./scripts/quality-gate.sh
# Must see: ✅ All checks passed

# 2. Cleanup ephemeral files
./scripts/agent-cleanup.sh --dry-run  # Preview
./scripts/agent-cleanup.sh            # Execute

# 3. Security scan
./scripts/pre-commit-check.sh
# Checks for: passwords, API keys, tokens, PHI/PII data

# 4. Commit with value-focused message
git commit -m "Add bilateral data capture to enable pre-surgery assessments"
```

**Commit Message Format**:
```bash
# GOOD (describes value/outcome):
"Add BCVA input validation to prevent data entry errors"
"Implement workflow state machine to track patient journey"
"Create bilateral form component to simplify eye data capture"

# BAD (describes activity without value):
"WIP"
"Fixed stuff"
"AGENT-123: Updated files"
"Changes to form component"
```

**Formula**: `{Action} {what} to {achieve value}`

### OpenMRS Medical Data Patterns

**Bilateral Data Capture**:
```typescript
// Pattern: Symmetric data structure for left/right eyes
interface BilateralData<T> {
  left: T;
  right: T;
}

// Example: Cataract assessment
interface CataractAssessment {
  bcva: number;           // Best Corrected Visual Acuity (decimal)
  types: CataractType[];  // Multiple types possible
  pseudophakie: boolean;
}

const assessment: BilateralData<CataractAssessment> = {
  left: { bcva: 0.8, types: ['Incipiens'], pseudophakie: false },
  right: { bcva: 0.6, types: ['Brunescens', 'Corticalis'], pseudophakie: false }
};
```

**OpenMRS Encounter Pattern**:
```typescript
// Save form data as OpenMRS encounter
import { saveEncounter, useSession } from '@openmrs/esm-framework';

const savePreSurgeryAssessment = async (data: PreSurgeryForm) => {
  const session = useSession();

  const encounter = {
    patient: session.currentPatient.uuid,
    encounterType: PRESURGERY_ENCOUNTER_TYPE_UUID,
    encounterDatetime: new Date().toISOString(),
    obs: [
      // Map form fields to OpenMRS observations
      { concept: BCVA_RIGHT_CONCEPT_UUID, value: data.right.bcva },
      { concept: BCVA_LEFT_CONCEPT_UUID, value: data.left.bcva },
      // ... more observations
    ]
  };

  await saveEncounter(encounter);
};
```

**Validation Pattern** (TDD-first):
```typescript
// 1. Write test FIRST
describe('BCVA Validation', () => {
  it('should reject BCVA values outside 0.0-1.0 range', () => {
    expect(validateBCVA(-0.1)).toHaveError('BCVA must be between 0.0 and 1.0');
    expect(validateBCVA(1.5)).toHaveError('BCVA must be between 0.0 and 1.0');
  });

  it('should accept valid BCVA values', () => {
    expect(validateBCVA(0.5)).toBeValid();
    expect(validateBCVA(1.0)).toBeValid();
  });
});

// 2. Then implement
const validateBCVA = (value: number): ValidationResult => {
  if (value < 0.0 || value > 1.0) {
    return { valid: false, error: 'BCVA must be between 0.0 and 1.0' };
  }
  return { valid: true };
};
```

### Performance Optimization

**CLI-First for Large Refactoring**:

```typescript
// For renaming/moving 10+ files, use ts-morph instead of manual edits
import { Project } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });

// Rename component across entire codebase
const sourceFile = project.getSourceFileOrThrow('src/components/OldName.tsx');
sourceFile.move('src/components/NewName.tsx');

// Update all imports automatically
project.getSourceFiles().forEach(file => {
  file.getImportDeclarations()
    .filter(imp => imp.getModuleSpecifierValue().includes('OldName'))
    .forEach(imp => {
      imp.setModuleSpecifier(
        imp.getModuleSpecifierValue().replace('OldName', 'NewName')
      );
    });
});

await project.save();
console.log('✅ Renamed component and updated all imports');
```

### Agent Handoff Protocol

**When transferring work**:

```markdown
## HANDOFF from AGENT-1234567890

**Stream**: STREAM 7: FORMS
**Context**: Completed BilateralInput and CheckboxGroup components
**Progress**: 3/7 form components done
**Remaining**:
  - MeasurementInput (in progress, 60% complete)
  - BCVAInput (not started)
  - RadioGroup (not started)
  - Form validation integration (not started)

**Blockers**:
  - Waiting for DATA stream to finalize BCVA concept UUID
  - CheckboxGroup needs design review (pending Slack feedback)

**Key Files**:
  - `src/components/Forms/BilateralInput.tsx` (complete, tested)
  - `src/components/Forms/CheckboxGroup.tsx` (complete, tested)
  - `src/components/Forms/MeasurementInput.tsx` (WIP, tests passing)
  - `src/components/Forms/__tests__/` (all test files)

**Next Steps**:
  1. Complete MeasurementInput validation
  2. Start BCVAInput (use MeasurementInput as template)
  3. Integrate with React Hook Form once all components ready
```

### Decision Hierarchy

1. **Autonomous**: Decide and execute within your work stream
2. **Document**: Record decisions in `BACKLOG.md` or local context
3. **No confirmation**: Never ask "should I?" - just do and document
4. **Fail fast**: Quality gate failures → fix immediately (don't accumulate)

### Error Recovery

```
ON test failure:
  1. Document error in local context (.agent/{ID}/BACKLOG.md)
  2. Attempt fix (max 3 iterations within 30 minutes)
  3. If blocked: Mark task "🔴 BLOCKED: {reason}" in BACKLOG.md
  4. Move to next task in your stream (don't block on one issue)

ON merge conflict:
  1. Pull latest: git pull origin distributed-main
  2. Resolve conflicts favoring medical data integrity
  3. Re-run full quality gate: ./scripts/quality-gate.sh
  4. If tests fail: revert and analyze
```

### Performance Metrics

Track in `.agent/{ID}/metrics.md`:
- Tasks completed per session
- Quality gate first-pass rate (target: >80%)
- Test coverage improvement
- Blockers encountered/resolved

---

## Medical Data Considerations

**This is healthcare software. Special considerations apply:**

1. **Data Integrity**: NEVER skip validation for medical measurements
2. **Audit Trail**: All form submissions must be logged with user + timestamp
3. **PHI/PII Protection**: No patient data in logs, console.log, or error messages
4. **Offline Support**: Forms must save locally if network unavailable
5. **Bilateral Symmetry**: Offer but don't enforce copy left↔right (clinicians decide)
6. **Undo/Revision**: Support form draft revisions before final submission
7. **Regulatory**: Follow HL7 FHIR standards for concept mappings where applicable

### Required Validation Tests

Every medical input component MUST have tests for:
- ✅ Valid input accepted
- ✅ Invalid input rejected with clear error message
- ✅ Boundary values (min, max, zero, negative)
- ✅ Empty/null values handled gracefully
- ✅ Data type validation (string→number coercion)
- ✅ Accessibility (keyboard navigation, screen reader support)

---

## Quick Reference Card

```bash
# Start work
git pull && cat BACKLOG.md | grep "- \[ \]"

# Start sync daemon (auto-pulls every 5 min)
./scripts/start-agent-sync.sh

# TDD cycle
./scripts/test.sh <module> --watch  # RED → GREEN → REFACTOR

# Quality check
./scripts/quality-gate.sh           # Must be GREEN

# Before commit
./scripts/agent-cleanup.sh
./scripts/pre-commit-check.sh
git commit -m "Add <feature> to <achieve value>"

# Handoff
# Update BACKLOG.md with progress + next steps

# Stop sync daemon
./scripts/stop-agent-sync.sh
```

---

## 🔄 Multi-Agent Sync Protocol

**This project supports distributed development with multiple agents/developers working simultaneously.**

### Automatic Synchronization

The sync daemon (`./scripts/sync-upstream.sh`) provides automatic coordination:

**Start Sync Daemon**:
```bash
./scripts/start-agent-sync.sh
# Daemon runs in background, syncing every 5 minutes
```

**What the Sync Does**:
1. **Fetches** all remote changes from origin
2. **Pulls** new commits automatically (if no local uncommitted changes)
3. **Alerts** when `BACKLOG.md` is updated by other agents
4. **Shows** recent activity from the distributed team
5. **Detects** stale locks (tasks locked >15 minutes)

**Manual Sync** (run once):
```bash
./scripts/sync-upstream.sh
```

**Stop Daemon**:
```bash
./scripts/stop-agent-sync.sh
```

### Sync Logs

Monitor sync activity:
```bash
# View sync logs in real-time
tail -f .agent_sync.log

# Check if daemon is running
ps aux | grep sync-upstream
```

### Conflict Resolution with Sync

**Scenario 1: Upstream has new commits**
```bash
# Sync daemon automatically pulls if you have no uncommitted changes
# Check logs: tail -f .agent_sync.log
```

**Scenario 2: You have uncommitted changes + upstream updates**
```bash
# Sync daemon will warn but NOT pull
# You must manually stash, pull, and pop:
git stash
git pull origin distributed-main --rebase
git stash pop
# Resolve any conflicts, then continue
```

**Scenario 3: BACKLOG.md conflict**
```bash
# Two agents claimed the same task
# 1. Pull latest BACKLOG.md
git pull origin distributed-main

# 2. Check for duplicate locks
grep "🔒" BACKLOG.md

# 3. Resolution:
#    - First lock (older timestamp) keeps the task
#    - Second agent finds a different unclaimed task
#    - Update BACKLOG.md and commit
```

### Best Practices for Distributed Work

1. **Start sync daemon at session start**: `./scripts/start-agent-sync.sh`
2. **Commit frequently**: Small, atomic commits avoid large merge conflicts
3. **Pull before claiming tasks**: Ensure BACKLOG.md is current
4. **Lock tasks immediately**: Edit BACKLOG.md as first action after claiming
5. **Push completed work promptly**: Don't hoard commits locally
6. **Watch sync logs**: `tail -f .agent_sync.log` in separate terminal
7. **Stop daemon at session end**: `./scripts/stop-agent-sync.sh`

### Sync Daemon Architecture

```
┌─────────────────────────────────────────────────────┐
│  Local Agent Workspace                              │
│  ┌───────────────────────────────────────────────┐  │
│  │ Agent Working (TDD, coding, testing)          │  │
│  └───────────────────────────────────────────────┘  │
│                     ↓                               │
│  ┌───────────────────────────────────────────────┐  │
│  │ Sync Daemon (background process)              │  │
│  │ • Runs every 5 minutes                        │  │
│  │ • git fetch origin                            │  │
│  │ • git pull (if clean working tree)            │  │
│  │ • Alert on BACKLOG.md changes                 │  │
│  └───────────────────────────────────────────────┘  │
│                     ↕                               │
└─────────────────────────────────────────────────────┘
                      ↕
        ┌─────────────────────────┐
        │   GitHub Remote         │
        │   (origin/distributed-main)         │
        └─────────────────────────┘
                      ↕
        ┌─────────────────────────┐
        │  Other Agents'          │
        │  Workspaces             │
        │  (also syncing)         │
        └─────────────────────────┘
```

### Troubleshooting Sync Issues

**Sync daemon won't start**:
```bash
# Check if already running
cat .agent_sync.pid
ps -p $(cat .agent_sync.pid)

# Force stop and restart
./scripts/stop-agent-sync.sh
./scripts/start-agent-sync.sh
```

**Sync is stuck**:
```bash
# Check logs for errors
tail -n 50 .agent_sync.log

# Common issue: uncommitted changes
git status
git stash  # Stash changes
# Wait for next sync (5 min) or run manually
./scripts/sync-upstream.sh
git stash pop  # Restore changes
```

**Frequent merge conflicts**:
```bash
# Strategy 1: Smaller, more frequent commits
git commit -m "..." && git push

# Strategy 2: Work in isolated modules (see BACKLOG work streams)
# Choose tasks in different streams to avoid conflicts

# Strategy 3: Communicate via BACKLOG.md
# Add "🚨 BLOCKING: AGENT-X needs Y" comments
```

---

**PROTOCOL VERSION**: Agent Protocol v1.1
**PROJECT VERSION**: 1.0.0
**LAST UPDATED**: 2025-10-10
**ENFORCEMENT**: TDD Mandatory | Quality Gate Zero-Tolerance | Medical Data Validation Non-Negotiable
