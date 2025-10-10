# Augmented Coding Procedures - OpenMRS Medical Software

**Version**: 1.0.0
**Last Updated**: 2025-10-10
**Purpose**: Medical software development with Agent Protocol v1.1
**Plugin**: augen-auf-openmrs (Claude Code)

STARTER_SYMBOL=🏥

---

## 🔌 Claude Code Plugin Architecture

This project implements **idiomatic Claude Code plugin structure** optimized for OpenMRS medical software development:

**📜 Slash Commands** (`.claude/commands/`):
- `/quality-gate` - Zero-tolerance quality checks
- `/parallel-stream` - Execute work stream tasks in parallel
- `/tdd-red` - Write failing test (RED phase)
- `/tdd-green` - Implement minimal code (GREEN phase)
- `/sync-team` - Multi-agent coordination and sync
- `/claim-task` - Safe task claiming with lock

**🤖 Subagents** (`.claude/agents/`):
- `parallel-coordinator` - Orchestrate parallel execution
- `tdd-enforcer` - Enforce strict TDD discipline
- `medical-validator` - Review medical validation logic
- `quality-guardian` - Zero-tolerance quality enforcement

**🪝 Hooks** (`.claude/hooks/*.json`):
- `pre-commit-quality` - Quality gate before commits (blocking)
- `prevent-ephemeral` - Block ephemeral file commits (blocking)
- `security-check` - Scan for secrets/PHI (blocking)
- `backlog-sync` - Sync before BACKLOG.md edits (blocking)
- `tdd-enforcement` - Require tests before code (blocking)
- `medical-validation-coverage` - 100% coverage (blocking)
- `post-edit-test-reminder` - Test reminders (non-blocking)

**💾 Cross-Context Memory** (`templates/memory/`):
- `PARALLEL_STATUS.md` - Track parallel agent progress
- `TDD_LOG.md` - Record RED-GREEN-REFACTOR cycles
- `STREAM_STATUS.md` - Monitor 9 work stream progress
- `INTEGRATION_STATUS.md` - Track OpenMRS integration

---

## 🧪 E2E Testing Principle (CRITICAL)

**No mocks, no shims - Real production integration across all layers**

**Test Layers**:
1. **Unit**: Fast, isolated (mocks OK)
2. **Integration**: Service contracts (NO mocks)
3. **E2E**: Full workflow (NO mocks, NO shims, real OpenMRS, real browser)

**Commands**:
```bash
./scripts/test.sh unit         # Unit only
./scripts/test.sh integration  # Integration (requires OpenMRS)
./scripts/test.sh e2e          # E2E (Playwright + real OpenMRS)
./scripts/test.sh all          # All layers
```

**For medical software**: E2E tests MANDATORY - catch issues unit tests miss

**See**: [E2E_TESTING.md](./E2E_TESTING.md) for full protocol

---

## 🔀 PARALLEL Pattern (Multi-Agent Coordination)

**Pattern**: Execute multiple independent tasks simultaneously

### Syntax

```markdown
🔀 PARALLEL [agent-count] {
  - Task 1 → Agent-A1 (tdd-enforcer)
  - Task 2 → Agent-A2 (tdd-enforcer)
  - Task 3 → Agent-A3 (medical-validator)
}
WAIT_ALL → Aggregate → Continue
```

### When to Use

- ✅ **Independent tasks** (FORMS stream: 7 components, no dependencies)
- ✅ **Repetitive operations** (DATA stream: concept definitions)
- ✅ **Time-critical work** (2-3x speedup with 5-7 agents)
- ❌ **Sequential dependencies** (PRESURGERY depends on FORMS)
- ❌ **Single complex task** (WORKFLOW state machine)

### OpenMRS Work Streams (from BACKLOG.md)

**Highly Parallelizable**:
- STREAM 7: FORMS (7 components, all independent)
- STREAM 2: DATA (concept definitions, all independent)
- STREAM 3: LAYOUT + STREAM 4: SIDEBAR (can run together)

**Sequential or Single-Agent**:
- STREAM 6: WORKFLOW (single state machine)
- STREAM 8: PRESURGERY (depends on FORMS completion)
- STREAM 1: INFRA (must complete first)

### Example: Parallel FORMS Stream

```bash
/parallel-stream FORMS

# Spawns agents for:
# - BilateralInput component
# - CheckboxGroup component
# - MeasurementInput component
# - BCVAInput component
# - RadioGroup component
# - Form validation integration
```

---

## 🔴🟢🧹 TDD Workflow (Mandatory for Medical Software)

### Phase 1: RED 🔴

**Command**: `/tdd-red <feature-name>`

**Process**:
1. State hypothesis: "Test will fail with error X because Y"
2. Write test for ONE behavior
3. Run test: `./scripts/test.sh <module> --watch`
4. Verify test FAILS with expected error

**Medical Requirements**:
- ✅ Test boundary values (BCVA: 0.0, 1.0, -0.1, 1.5)
- ✅ Test null/undefined handling
- ✅ Test invalid inputs with clear errors
- ✅ Document in TDD_LOG.md

**Stop Conditions**:
- ❌ Test passes without implementation (test is wrong)
- ❌ Error doesn't match hypothesis

---

### Phase 2: GREEN 🟢

**Command**: `/tdd-green <feature-name>`

**Process**:
1. Verify test is failing (RED)
2. Write **minimal** code to pass test
3. Run test: `./scripts/test.sh <module>`
4. Iterate until GREEN

**Medical Requirements**:
- ✅ Explicit validation (no implicit coercion)
- ✅ Clear error messages
- ✅ Use medical constants (no magic numbers)
- ✅ Document medical constraints

**Example**:
```typescript
// ✅ GOOD: Explicit medical validation
const BCVA_MIN = 0.0; // No vision
const BCVA_MAX = 1.0; // Perfect 20/20

if (value < BCVA_MIN || value > BCVA_MAX) {
  return {
    valid: false,
    error: `BCVA must be between ${BCVA_MIN} and ${BCVA_MAX}`
  };
}

// ❌ BAD: Magic numbers and implicit validation
if (value < 0 || value > 1) {
  return { valid: false };
}
```

---

### Phase 3: REFACTOR 🧹

**Process**:
1. Tests are GREEN
2. Make ONE small improvement
3. Run tests after EVERY change
4. If GREEN, commit; if RED, revert
5. Repeat until code is clean

**Refactoring Targets**:
- Extract medical constants
- Extract validation functions
- Improve readability
- Remove duplication

**Never Refactor**:
- ❌ Behavior changes
- ❌ Adding untested features

---

## 🛡️ Quality Gate (Zero Tolerance)

**Command**: `/quality-gate`

**Checks** (ALL must pass):
1. ✅ Tests: 100% passing
2. ✅ Types: 0 errors in src/**
3. ✅ Lint: 0 issues
4. ✅ Medical Validation: 100% coverage
5. ✅ Security: No secrets/PHI

**OpenMRS Note**: Type errors in node_modules (OpenMRS 5.8.1 dependencies) are acceptable. Only src/** must be error-free.

---

## 🏥 Medical Software Standards

### Validation Requirements

**For Every Medical Validation Function**:

```typescript
describe('validateBCVA', () => {
  // 1. Valid inputs
  it('should accept valid BCVA values', () => {
    expect(validateBCVA(0.0).valid).toBe(true);
    expect(validateBCVA(0.5).valid).toBe(true);
    expect(validateBCVA(1.0).valid).toBe(true);
  });

  // 2. Boundary values
  it('should handle boundary values correctly', () => {
    expect(validateBCVA(0.0).valid).toBe(true);   // Min
    expect(validateBCVA(1.0).valid).toBe(true);   // Max
    expect(validateBCVA(-0.001).valid).toBe(false); // Below min
    expect(validateBCVA(1.001).valid).toBe(false);  // Above max
  });

  // 3. Null/undefined
  it('should handle null and undefined', () => {
    expect(validateBCVA(null).valid).toBe(false);
    expect(validateBCVA(undefined).valid).toBe(false);
  });

  // 4. Invalid types
  it('should reject invalid types', () => {
    expect(validateBCVA('abc').valid).toBe(false);
    expect(validateBCVA(NaN).valid).toBe(false);
  });

  // 5. Error messages
  it('should provide clear error messages', () => {
    const result = validateBCVA(-0.1);
    expect(result.error).toContain('between 0.0 and 1.0');
  });
});
```

---

### Bilateral Data Pattern

**OpenMRS Ophthalmology Requirement**: Left and right eye data are independent

```typescript
interface BilateralData<T> {
  left: T | null;
  right: T | null;
}

interface CataractAssessment {
  bcva: number;
  types: CataractType[];
  pseudophakie: boolean;
}

const assessment: BilateralData<CataractAssessment> = {
  left: { bcva: 0.8, types: ['Incipiens'], pseudophakie: false },
  right: { bcva: 0.6, types: ['Brunescens'], pseudophakie: false }
};

// ✅ Validate each side independently
const leftValid = validateCataractAssessment(assessment.left);
const rightValid = validateCataractAssessment(assessment.right);

// ❌ Don't force symmetry (clinician decides)
```

---

## 🔄 Multi-Agent Coordination

### Session Start Workflow

```bash
# 1. Sync with team
/sync-team

# 2. Review available tasks
grep "- \[ \]" BACKLOG.md | grep -v "🔒"

# 3. Claim task
/claim-task "Create BilateralInput component"

# 4. Start TDD cycle
/tdd-red BilateralInput
```

### Parallel Stream Execution

```bash
# Execute entire work stream in parallel
/parallel-stream FORMS

# Coordinator spawns 7 agents for 7 form components
# Each agent follows TDD (RED-GREEN-REFACTOR)
# Coordinator waits for ALL to complete
# Runs integration tests
# Commits all work together
```

---

## 📊 OpenMRS Integration Patterns

### Concept Mapping

```typescript
// Define OpenMRS concepts with UUIDs
const CONCEPTS = {
  BCVA_RIGHT: 'uuid-bcva-right',
  BCVA_LEFT: 'uuid-bcva-left',
  CATARACT_TYPES: 'uuid-cataract-types',
  // ... more concepts
};

// Map form data to OpenMRS observations
function mapToObservations(formData: PreSurgeryForm): Observation[] {
  return [
    {
      concept: CONCEPTS.BCVA_RIGHT,
      value: formData.right.bcva
    },
    {
      concept: CONCEPTS.BCVA_LEFT,
      value: formData.left.bcva
    },
    // ... more observations
  ];
}
```

### Encounter Creation

```typescript
import { saveEncounter, useSession } from '@openmrs/esm-framework';

async function savePreSurgeryAssessment(data: PreSurgeryForm) {
  const session = useSession();

  const encounter = {
    patient: session.currentPatient.uuid,
    encounterType: PRESURGERY_ENCOUNTER_TYPE_UUID,
    encounterDatetime: new Date().toISOString(),
    location: session.sessionLocation.uuid,
    obs: mapToObservations(data)
  };

  await saveEncounter(encounter);
}
```

---

## 🚨 Medical Data Safety Rules

1. **No PHI in logs/errors**: Never log patient_id, name, DOB
2. **No defaults**: null is explicit, defaults hide missing data
3. **Audit trail**: Log all data changes with user + timestamp
4. **Offline support**: Forms must save locally if network down
5. **Explicit validation**: No implicit coercion (0 is valid!)
6. **Bilateral independence**: Don't force left=right symmetry
7. **Clear errors**: "BCVA must be 0.0-1.0" not "Invalid value"

---

## 📋 Pre-Commit Checklist

**Before EVERY commit**:

```bash
# 1. Quality gate (must be GREEN)
/quality-gate

# 2. Cleanup ephemeral files
./scripts/agent-cleanup.sh --dry-run  # Preview
./scripts/agent-cleanup.sh            # Execute

# 3. Security check
./scripts/pre-commit-check.sh

# 4. Verify clean state
git status

# 5. Commit with value-focused message
git commit -m "Add BCVA validation to prevent invalid visual acuity data"
```

---

## 🔗 Related Documentation

- **[BACKLOG.md](./BACKLOG.md)** - 9 work streams, task management
- **[CLAUDE.md](./CLAUDE.md)** - Project-specific guidance
- **[.claude-plugin/README.md](./.claude-plugin/README.md)** - Plugin usage guide
- **[Agent Protocol](~/projects/playground/agent-protocol/)** - Framework source

---

## 🎯 Quick Reference

```bash
# Start work
/sync-team                        # Sync and see team activity
/claim-task "task description"    # Lock task

# TDD cycle
/tdd-red <feature>                # RED: Write failing test
/tdd-green <feature>              # GREEN: Minimal implementation
# REFACTOR: Clean code while tests pass

# Quality
/quality-gate                     # All checks must pass

# Parallel
/parallel-stream <STREAM>         # Execute stream in parallel

# Commit
./scripts/agent-cleanup.sh        # Remove ephemeral files
git commit -m "Add X to Y"        # Value-focused message
```

---

**VERSION**: 1.0.0
**PROTOCOL**: Agent Protocol v1.1 + Augmented Coding Framework v1.0
**ENFORCEMENT**: TDD Mandatory | Quality Gate Zero-Tolerance | Medical Validation 100% Coverage
