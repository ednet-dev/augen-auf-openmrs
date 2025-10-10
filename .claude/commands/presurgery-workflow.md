---
description: Complete pre-surgery assessment workflow end-to-end
scope: project
---

# Pre-Surgery Workflow Orchestrator

Complete implementation of STREAM 8 (Pre-Surgery Assessment) from BACKLOG.md. Coordinates TDD, component creation, validation, and OpenMRS integration.

## Usage

```bash
/presurgery-workflow
```

## Workflow Overview

This command orchestrates the complete implementation of the pre-surgery assessment form, following TDD and Agent Protocol v1.1.

## Steps (Auto-Executed)

### Phase 1: Analysis (5 min)
1. Read BACKLOG.md STREAM 8 tasks
2. Check dependencies (STREAM 7: FORMS must be complete)
3. Identify 8 sub-components needed
4. Create parallelization plan

### Phase 2: TDD RED - Failing Tests (20 min)
Spawn parallel agents to write tests:
1. PreSurgeryForm integration tests
2. Bilateral layout tests
3. Right eye section tests (6 fields)
4. Left eye section tests (6 fields)
5. Form validation tests
6. Auto-save tests
7. Copy operations tests
8. OpenMRS encounter save tests

### Phase 3: TDD GREEN - Implementation (60 min)
Spawn parallel agents to implement:
1. PreSurgeryForm component
2. EyeAssessment sub-component
3. Bilateral layout
4. Integration with FORMS components (from STREAM 7)
5. Form state management (React Hook Form or Formik)
6. Auto-save every 30 seconds
7. OpenMRS encounter save service

### Phase 4: TDD REFACTOR - Cleanup (20 min)
1. Extract reusable logic
2. Improve naming
3. Add comments for medical logic
4. Optimize re-renders

### Phase 5: Integration Tests (15 min)
1. E2E test: Fill form → Save → Verify in OpenMRS
2. E2E test: Auto-save draft → Refresh → Resume
3. E2E test: Copy left→right → Verify asymmetry
4. E2E test: Validation errors → Fix → Submit

### Phase 6: Quality Gate (10 min)
1. Run quality gate: `./scripts/quality-gate.sh`
2. Coverage check (must be ≥80% for medical logic)
3. Type check (zero errors)
4. Lint check (zero issues)

## Sub-Components Structure

```
src/components/PreSurgery/
├── PreSurgeryForm.tsx           # Main form container
├── EyeAssessment.tsx            # Single eye assessment
├── CataractSection.tsx          # BCVA + types + pseudophakie
├── PterygiumSection.tsx         # Pterygium + surgery flag
├── AstigmatismInput.tsx         # Astigmatism measurement
├── AxialLengthInput.tsx         # Axial length from limbus
├── AnesthesiaSelector.tsx       # Anesthesia options (radio)
└── __tests__/
    ├── PreSurgeryForm.test.tsx
    ├── EyeAssessment.test.tsx
    ├── CataractSection.test.tsx
    └── ... (8 test files)
```

## Form Data Schema

```typescript
interface PreSurgeryFormData {
  patientUuid: string;
  encounterDatetime: string;
  leftEye: EyeAssessment;
  rightEye: EyeAssessment;
}

interface EyeAssessment {
  cataract: {
    bcva: number;                      // 0.0-1.0
    types: CataractType[];             // Multi-select
    pseudophakie: boolean;
  };
  pterygium: {
    present: boolean;
    necessaryBeforeSurgery: boolean;
  };
  astigmatism: number;                 // -10.0 to +10.0 dpt
  axialLength: number;                 // 15.0-35.0 mm
  anesthesia: AnesthesiaType;          // 'ic' | 'st-pb' | 'AN'
}
```

## OpenMRS Concept Mappings

| Form Field | Concept UUID | Datatype |
|------------|--------------|----------|
| BCVA Left | `TODO_BCVA_LEFT_UUID` | Numeric |
| BCVA Right | `TODO_BCVA_RIGHT_UUID` | Numeric |
| Cataract Types Left | `TODO_CATARACT_LEFT_UUID` | Coded |
| Cataract Types Right | `TODO_CATARACT_RIGHT_UUID` | Coded |
| Pseudophakie Left | `TODO_PSEUDOPHAKIE_LEFT_UUID` | Boolean |
| Pseudophakie Right | `TODO_PSEUDOPHAKIE_RIGHT_UUID` | Boolean |
| ... | ... | ... |

## Validation Rules

### BCVA
- Range: 0.0-1.0 (decimal)
- Required: Yes (both eyes)
- Precision: 1 decimal place
- Warning: <0.1 with cataract type "Incipiens" (unusual)

### Cataract Types
- Options: Incipiens, Corticalis et nucl, Subcaps post, Polaris posterior, Brunescens, Matura, Intumescens
- Multi-select: Yes
- Required: At least one type if BCVA <0.8

### Astigmatism
- Range: -10.0 to +10.0 diopters
- Required: No (optional)
- Precision: 2 decimal places
- Warning: >5.0 dpt (very high, verify)

### Axial Length
- Range: 15.0-35.0 mm
- Required: Yes (both eyes)
- Precision: 2 decimal places
- Warning: <20 mm or >28 mm (unusual, verify)

## Auto-Save Logic

```typescript
useEffect(() => {
  const autosaveTimer = setInterval(async () => {
    if (formIsDirty) {
      await saveDraft(formData);
      showNotification({
        title: 'Draft saved',
        kind: 'info',
        description: new Date().toLocaleTimeString()
      });
    }
  }, 30000); // Every 30 seconds

  return () => clearInterval(autosaveTimer);
}, [formData, formIsDirty]);
```

## Parallelization Strategy

### Wave 1: Tests (4 agents, parallel)
- Agent A: PreSurgeryForm tests
- Agent B: EyeAssessment tests
- Agent C: Sub-component tests (1-4)
- Agent D: Sub-component tests (5-8)

### Wave 2: Implementation (4 agents, parallel)
- Agent A: PreSurgeryForm + state management
- Agent B: EyeAssessment + bilateral layout
- Agent C: Sub-components (1-4)
- Agent D: Sub-components (5-8)

### Wave 3: Integration (1 agent)
- Agent E: E2E tests + OpenMRS integration

## Output Format

```
✅ Pre-Surgery Workflow Complete

Components created:
- PreSurgeryForm.tsx (main form)
- EyeAssessment.tsx (bilateral sub-form)
- 6 sub-components (cataract, pterygium, astigmatism, etc.)

Tests created:
- 8 component test files
- 4 integration test files
- Total: ~120 test cases

Services created:
- savePreSurgeryEncounter(patientUuid, formData)
- saveDraft(formData)
- loadDraft(patientUuid)

Quality metrics:
- Test coverage: 87% (medical logic: 95%)
- TypeScript errors: 0
- Lint issues: 0
- Quality gate: ✅ GREEN

Next steps:
1. Get OpenMRS concept UUIDs for production
2. Update constants with real UUIDs
3. Deploy to test instance
4. User acceptance testing
5. Mark STREAM 8 complete in BACKLOG.md
```

## Estimated Time

- **With parallelization (4 agents)**: 2-3 hours
- **Sequential (1 agent)**: 8-10 hours
- **Speedup**: ~3x faster

## Example

```bash
/presurgery-workflow
# Orchestrator spawns 4 agents in Wave 1 (tests)
# [Agent-A] Writing PreSurgeryForm tests...
# [Agent-B] Writing EyeAssessment tests...
# [Agent-C] Writing sub-component tests (1-4)...
# [Agent-D] Writing sub-component tests (5-8)...
# Wave 1 complete: All tests RED ✅
#
# Orchestrator spawns 4 agents in Wave 2 (implementation)
# [Agent-A] Implementing PreSurgeryForm...
# [Agent-B] Implementing EyeAssessment...
# [Agent-C] Implementing sub-components (1-4)...
# [Agent-D] Implementing sub-components (5-8)...
# Wave 2 complete: All tests GREEN ✅
#
# Orchestrator spawns 1 agent in Wave 3 (integration)
# [Agent-E] Running E2E tests...
# [Agent-E] OpenMRS integration verified ✅
#
# Quality gate: ./scripts/quality-gate.sh
# ✅ All checks passed
#
# STREAM 8: Pre-Surgery Assessment COMPLETE
```
