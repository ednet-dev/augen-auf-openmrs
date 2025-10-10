# Stream Partitioning - 4 Parallel Developers

**4 streams, minimal dependencies, contract-first development**

---

## Stream Overview

| Stream | Developer | Work Streams | Duration | Dependencies |
|--------|-----------|--------------|----------|--------------|
| **A: Foundation** | Dev 1 | INFRA + DATA | Week 1 | None (start first) |
| **B: Layout & Nav** | Dev 2 | LAYOUT + SIDEBAR | Week 2-3 | Stream A contracts |
| **C: Forms & Patients** | Dev 3 | FORMS + PATIENT-MGT | Week 2-4 | Stream A contracts |
| **D: Workflows** | Dev 4 | WORKFLOW + PRESURGERY + ACTIONS | Week 3-6 | Streams A, B, C contracts |

---

## Stream A: Foundation (Dev 1)

### Work Streams
- **STREAM 1: INFRA** - Testing & quality infrastructure
- **STREAM 2: DATA** - OpenMRS concepts & data model

### Tasks (from BACKLOG.md)
- [ ] Create `scripts/test.sh`, `quality-gate.sh`, `check-types.sh`, `check-lint.sh`
- [ ] Configure Jest + React Testing Library
- [ ] Define OpenMRS concepts (cataract types, BCVA, astigmatism, etc.)
- [ ] Create TypeScript types for medical data
- [ ] Define validation rules
- [ ] Create mock data generator

### Output Contracts

**`contracts/foundation/types.ts`**
```typescript
// Medical data types
export interface BilateralData<T> { left: T; right: T; }
export interface CataractAssessment { bcva: number; types: CataractType[]; }
export type CataractType = 'Incipiens' | 'Corticalis et nucl' | ...;
```

**`contracts/foundation/validation.ts`**
```typescript
// Validation interface
export interface ValidationResult { valid: boolean; error?: string; }
export type Validator<T> = (value: T) => ValidationResult;
export function validateBCVA(value: number): ValidationResult;
```

**`contracts/foundation/test-utils.ts`**
```typescript
// Test utilities
export function renderWithProviders(component: ReactElement): RenderResult;
export function mockOpenMRSSession(): Session;
```

**`contracts/foundation/concepts.ts`**
```typescript
// OpenMRS concept UUIDs
export const CONCEPTS = {
  BCVA_RIGHT: 'uuid-bcva-right',
  BCVA_LEFT: 'uuid-bcva-left',
  ...
};
```

### Contract Consumers
- **Stream B**: Types, concepts
- **Stream C**: Types, validation, concepts
- **Stream D**: Types, validation, concepts

### Timeline
- **Week 1 Day 1-2**: Define contracts, push to `contracts/foundation/`
- **Week 1 Day 3-5**: Implement INFRA + DATA
- **Week 1 Day 5**: Contract freeze, other streams can start

---

## Stream B: Layout & Navigation (Dev 2)

### Work Streams
- **STREAM 3: LAYOUT** - Application shell & navigation
- **STREAM 4: SIDEBAR** - Workflow navigation & filtering

### Tasks (from BACKLOG.md)
- [ ] Implement app shell (header/sidebar/content)
- [ ] Create responsive grid system
- [ ] Top navigation bar with OpenMRS branding
- [ ] Sidebar with workflow stage navigation
- [ ] Date filter (Today, Interval)
- [ ] Patient search input
- [ ] "Needs surgery>" filter
- [ ] Keyboard navigation support

### Dependencies
- **Stream A**: Types (`BilateralData`, etc.), concepts

### Output Contracts

**`contracts/layout/navigation-api.ts`**
```typescript
// Navigation interface
export interface NavigationAPI {
  navigateTo(route: Route): void;
  getCurrentRoute(): Route;
  registerExtension(slot: string, component: ReactElement): void;
}
export type Route = '/registration' | '/refraction' | '/eye-exam' | ...;
```

**`contracts/layout/layout-slots.ts`**
```typescript
// Layout extension points
export type LayoutSlot = 'header-right' | 'sidebar-bottom' | 'content-top';
export interface SlotConfig { slot: LayoutSlot; priority: number; }
```

**`contracts/layout/filter-state.ts`**
```typescript
// Filter state management
export interface FilterState {
  dateRange: { start: Date; end: Date; };
  search: string;
  workflowStage: WorkflowStage;
  needsSurgery: boolean;
}
```

### Contract Consumers
- **Stream C**: Navigation API, filter state
- **Stream D**: Navigation API, layout slots

### Timeline
- **Week 2 Day 1**: Pull Stream A contracts, define own contracts
- **Week 2 Day 2-5, Week 3**: Implement LAYOUT + SIDEBAR
- **Week 3 End**: Contract freeze

---

## Stream C: Forms & Patients (Dev 3)

### Work Streams
- **STREAM 7: FORMS** - Reusable form components (7 components)
- **STREAM 5: PATIENT-MGT** - Patient list & selection

### Tasks (from BACKLOG.md)
- [ ] BilateralInput component
- [ ] CheckboxGroup component (cataract types)
- [ ] MeasurementInput component (units: dpt, mm)
- [ ] BCVAInput component (decimal 0.0-1.0)
- [ ] RadioGroup component (anesthesia)
- [ ] Form validation integration (React Hook Form)
- [ ] Patient list with active/completed styling
- [ ] Click-to-select interaction
- [ ] OpenMRS patient search API integration

### Dependencies
- **Stream A**: Types, validation interfaces, concepts
- **Stream B**: Navigation API, filter state

### Output Contracts

**`contracts/forms/form-api.ts`**
```typescript
// Form component API
export interface FormComponentProps<T> {
  value: T;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
}
export interface BilateralFormProps<T> {
  leftValue: T;
  rightValue: T;
  onLeftChange: (value: T) => void;
  onRightChange: (value: T) => void;
  allowCopy: boolean;
}
```

**`contracts/forms/validation-hooks.ts`**
```typescript
// Validation hooks
export function useValidation<T>(
  validator: Validator<T>,
  value: T
): ValidationResult;
export function useBilateralValidation<T>(
  validator: Validator<T>,
  left: T,
  right: T
): { left: ValidationResult; right: ValidationResult; };
```

**`contracts/forms/patient-selection.ts`**
```typescript
// Patient selection interface
export interface Patient {
  uuid: string;
  name: string;
  identifier: string;
  age: number;
}
export interface PatientSelectionAPI {
  selectedPatient: Patient | null;
  selectPatient(uuid: string): void;
  clearSelection(): void;
}
```

### Contract Consumers
- **Stream D**: Form API, patient selection

### Timeline
- **Week 2 Day 1**: Pull Stream A contracts, define own contracts
- **Week 2-4**: Implement FORMS + PATIENT-MGT (7 components in parallel)
- **Week 4 End**: Contract freeze

---

## Stream D: Workflows & Integration (Dev 4)

### Work Streams
- **STREAM 6: WORKFLOW** - State machine for patient journey
- **STREAM 8: PRESURGERY** - Pre-surgery assessment form
- **STREAM 9: ACTIONS** - Protocol management & export

### Tasks (from BACKLOG.md)
- [ ] Design workflow state machine (Registration → ... → Finished)
- [ ] Implement state transitions with validation
- [ ] Persist workflow state to OpenMRS
- [ ] Pre-surgery form layout (bilateral)
- [ ] Right/left eye sections (BCVA, cataract, pterygium, astigmatism, etc.)
- [ ] Form submission to OpenMRS encounters
- [ ] Auto-save every 30 seconds
- [ ] Protocol tabs (Protocol 1, 2, 3)
- [ ] PRINT functionality (PDF generation)
- [ ] "Link to Database" export (CSV/JSON)

### Dependencies
- **Stream A**: Types, validation, concepts
- **Stream B**: Navigation API, layout slots
- **Stream C**: Form API, patient selection

### Output Contracts

**`contracts/workflows/state-machine.ts`**
```typescript
// Workflow state machine
export type WorkflowState =
  | 'registration'
  | 'refraction'
  | 'eye-exam'
  | 'pre-surgery'
  | 'therapy'
  | 'finished';

export interface WorkflowMachine {
  currentState: WorkflowState;
  transition(to: WorkflowState): Promise<void>;
  canTransition(to: WorkflowState): boolean;
}
```

**`contracts/workflows/encounter-api.ts`**
```typescript
// OpenMRS encounter API
export interface EncounterData {
  patient: string;
  encounterType: string;
  observations: Observation[];
}
export function saveEncounter(data: EncounterData): Promise<void>;
```

**`contracts/workflows/export-api.ts`**
```typescript
// Export/print API
export interface ExportOptions { format: 'pdf' | 'csv' | 'json'; }
export function exportData(data: any, options: ExportOptions): Promise<Blob>;
```

### Contract Consumers
- None (Stream D is the final integration layer)

### Timeline
- **Week 3 Day 1**: Pull all contracts (A, B, C)
- **Week 3-6**: Implement WORKFLOW + PRESURGERY + ACTIONS
- **Week 6**: Integration tests, E2E tests

---

## Dependency Graph

```
┌─────────────────────────────────────────┐
│  Week 1: Stream A (Foundation)          │
│  ├─ INFRA (scripts, tests)              │
│  └─ DATA (types, validation, concepts)  │
└────────────┬────────────────────────────┘
             │ Contracts: types, validation, concepts
             ├──────────────┬──────────────┐
             │              │              │
    ┌────────▼──────┐  ┌───▼─────────┐   │
    │ Week 2-3:     │  │ Week 2-4:   │   │
    │ Stream B      │  │ Stream C    │   │
    │ (Layout+Nav)  │  │ (Forms)     │   │
    └────────┬──────┘  └───┬─────────┘   │
             │             │              │
             │ Contracts:  │ Contracts:   │
             │ navigation  │ forms,       │
             │ layout      │ patients     │
             │             │              │
             └─────────────┴──────────────┤
                                          │
                                ┌─────────▼──────────┐
                                │ Week 3-6:          │
                                │ Stream D           │
                                │ (Workflows+Actions)│
                                └────────────────────┘
```

---

## Contract-First Workflow

### Week 1 (Stream A Only)

```bash
# Dev 1: Define foundation contracts
/contract-define foundation types
/contract-define foundation validation
/contract-define foundation concepts
git add contracts/foundation/
git commit -m "Define foundation contracts for all streams"
git push

# Dev 2-4: Pull and review
git pull
# Review contracts/foundation/*.ts
# Provide feedback via BACKLOG.md comments
# Once agreed, Dev 1 marks contracts as FROZEN
```

### Week 2 (Streams B & C Start)

```bash
# Dev 2: Define layout contracts
git pull  # Get Stream A contracts
/contract-define layout navigation-api
/contract-define layout layout-slots
git push

# Dev 3: Define forms contracts
git pull  # Get Stream A contracts
/contract-define forms form-api
/contract-define forms validation-hooks
git push

# Dev 4: Review all contracts, prepare for Week 3
git pull
# Study contracts from A, B, C
```

### Week 3-6 (Stream D Implementation)

```bash
# Dev 4: Pull all contracts
git pull
/contract-validate foundation
/contract-validate layout
/contract-validate forms

# Implement using contracts
# If contract change needed:
/contract-change contracts/forms/form-api.ts
# → Negotiation with Dev 3 happens
# → If accepted, both update code
```

---

## Contract Change Protocol

### Scenario: Dev 4 needs `asyncValidate` in validation interface

```bash
# Dev 4: Propose change
/contract-change contracts/foundation/validation.ts
# Opens editor with change proposal template

# CONTRACTS/CHANGES.md entry created:
## CHANGE-001: Add asyncValidate to Validator interface
- **Proposed by**: Dev 4 (Stream D)
- **Affects**: Stream C (forms using validation)
- **Reason**: Need server-side validation for BCVA conflicts
- **Breaking**: No (additive change)
- **Proposed change**:
  ```typescript
  export interface Validator<T> {
    validate(value: T): ValidationResult;
    asyncValidate?(value: T): Promise<ValidationResult>; // New
  }
  ```

# Dev 4: Notify affected stream
# Via BACKLOG.md: "🚨 CONTRACT CHANGE: CHANGE-001 affects Stream C"

# Dev 1 (contract owner): Review
/contract-accept CHANGE-001
# → Commits new contract
# → Agents update all affected code
# → CI/CD validates no breaking changes

# Dev 3: Pull new contract
git pull
# Agents already migrated code to new contract
# Review and test
```

---

## Stream Independence Rules

✅ **Allowed (No Negotiation)**:
- Stream working on own code
- Stream using published contracts
- Internal refactoring (no contract changes)

❌ **Requires Negotiation**:
- Changing published contract
- Modifying interface used by other streams
- Adding breaking changes

⚠️  **Requires Coordination** (Not Blocking):
- Shared test utilities
- Shared components (if cross-stream)
- Documentation

---

## Quick Reference

**Check dependencies**:
```bash
/stream-status
# Shows: 4 streams, contract status, blockers
```

**Define contract**:
```bash
/contract-define <stream> <contract-name>
```

**Validate compliance**:
```bash
/contract-validate <stream>
```

**Propose change**:
```bash
/contract-change <contract-path>
```

**Accept change**:
```bash
/contract-accept <change-id>
```

---

## Success Metrics

- **Stream A**: Week 1 complete, contracts frozen, 0 changes needed
- **Streams B+C**: Week 2-4 parallel, <2 contract conflicts
- **Stream D**: Week 3-6, uses all contracts, 100% compliance
- **Overall**: 4 devs working in parallel, minimal blocking, clear interfaces
