# Augen Auf OpenMRS - BACKLOG (Contract-First, 4 Parallel Streams)

**Project**: Ophthalmology Patient Management System
**Status**: MVP Foundation (60%) → 4 Parallel Streams Ready
**Last Updated**: 2025-10-10

---

## 🎯 Current State (What Exists Today)

### ✅ Working MVP (60%)
- **URL**: http://localhost:8080/openmrs/spa/surgery-workflow
- **Layout**: Three-column (filter bar, sidebar, main content)
- **Components**: FilterBar, WorkflowStageFilter, PatientList (4 components)
- **Patient List**: Shows mock patients (002, 003, 005, 001, 004)
- **Selection**: Click patient → Shows placeholder "Form engine will render here"
- **Protocol Tabs**: Protocol 1, 2, 3 (switchable)
- **Buttons**: "Add new patient", "Print", "Link to Database" (not wired)
- **Filters**: Date dropdown + search input (UI only, not wired to real API)

### ❌ Critical Gaps (40%)
1. **No tests** - Zero test files in `src/`
2. **Mock data only** - `getMockPatients()` in patient.service.ts, all real API calls are TODOs
3. **Form placeholder** - No real form rendering
4. **No ophthalmology components** - No bilateral inputs, BCVA, cataract selectors
5. **No tab navigation** - Missing Form, Visits, Conditions, Therapies tabs
6. **No active visit management** - Forms don't check for active visit
7. **Buttons don't work** - Registration, print, export not wired

---

## 🔗 Stream Integration Contracts (Define Upfront)

**Contract-First Rule**: Define all interfaces NOW so 4 devs can work independently for 4+ weeks.

### CONTRACT A→B: Forms provide components to Navigation
**Owner**: Stream A exports, Stream B imports

```typescript
// Stream A exports: src/components/Forms/index.ts
export { BilateralInput } from './BilateralInput';
export { BCVAInput } from './BCVAInput';
export { CataractTypeSelector } from './CataractTypeSelector';
export { MeasurementInput } from './MeasurementInput';
export { PterygiumAssessment } from './PterygiumAssessment';
export { AnesthesiaSelector } from './AnesthesiaSelector';

export type { BilateralInputProps } from './BilateralInput';
export type { BCVAInputProps } from './BCVAInput';
// ... all component prop types

// Stream B imports these components in FormTab.tsx
import { BilateralInput, BCVAInput } from '@/components/Forms';
```

**Interface Definition**:
```typescript
// src/types/form-components.ts (Stream A creates, Stream B uses)

export interface BilateralInputProps {
  label: string;
  leftValue: number | string;
  rightValue: number | string;
  onLeftChange: (value: number | string) => void;
  onRightChange: (value: number | string) => void;
  onCopyLeftToRight?: () => void;
  onCopyRightToLeft?: () => void;
  unit?: string;
  validation?: (value: number | string) => string | null;
  disabled?: boolean;
}

export interface BCVAInputProps {
  value: number; // 0.0 to 1.0
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export interface CataractTypeSelectorProps {
  selectedTypes: string[]; // Array of: 'Incipiens', 'Brunescens', etc.
  onChange: (types: string[]) => void;
  disabled?: boolean;
}

export interface MeasurementInputProps {
  value: number;
  onChange: (value: number) => void;
  unit: 'dpt' | 'mm' | 'decimal';
  label: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  disabled?: boolean;
}

export interface PterygiumAssessmentProps {
  classification: string | null;
  needsSurgery: boolean;
  onChange: (data: { classification: string | null; needsSurgery: boolean }) => void;
  disabled?: boolean;
}

export interface AnesthesiaSelectorProps {
  value: 'ic' | 'st/pb' | 'AN' | null;
  onChange: (value: 'ic' | 'st/pb' | 'AN') => void;
  disabled?: boolean;
}
```

**Acceptance**:
- Stream A: All components export these exact prop types
- Stream B: Imports and uses without modification
- **Renegotiation protocol**: If props need changes, create `CONTRACTS.md` entry, get approval from both streams

---

### CONTRACT A→C: Forms submit via Encounter Service
**Owner**: Stream A calls, Stream C implements

```typescript
// Stream C exports: src/services/encounter.service.ts

export interface FormSubmissionData {
  patientUuid: string;
  encounterTypeUuid: string;
  formUuid: string;
  obs: Array<{
    concept: string; // Concept UUID
    value: string | number | boolean;
  }>;
}

export async function submitForm(data: FormSubmissionData): Promise<{ encounterUuid: string }>;

// Stream A calls this when form is submitted
import { submitForm } from '@/services/encounter.service';

const handleSubmit = async (formData) => {
  const { encounterUuid } = await submitForm({
    patientUuid: selectedPatient,
    encounterTypeUuid: protocol.encounterTypeUuid,
    formUuid: protocol.formUuid,
    obs: convertFormDataToObs(formData),
  });
};
```

**Acceptance**:
- Stream C: Implements `submitForm` by Week 4
- Stream A: Calls `submitForm` when integrating form engine (Week 4)
- **Before Week 4**: Stream A can use mock implementation

---

### CONTRACT B→C: Active Visit Hook
**Owner**: Stream B exports, Stream C provides data

```typescript
// Stream C exports: src/hooks/useActiveVisit.ts

export interface ActiveVisit {
  uuid: string;
  visitType: string;
  startDatetime: string;
  location: string;
}

export interface UseActiveVisitResult {
  activeVisit: ActiveVisit | null;
  isLoading: boolean;
  error: Error | null;
  startVisit: (visitType: string, location: string) => Promise<ActiveVisit>;
  endVisit: (visitUuid: string) => Promise<void>;
}

export function useActiveVisit(patientUuid: string): UseActiveVisitResult;

// Stream B uses this in NoActiveVisitDialog.tsx
import { useActiveVisit } from '@/hooks/useActiveVisit';

const { activeVisit, startVisit } = useActiveVisit(patientUuid);

const handleStartVisit = async () => {
  await startVisit('Facility Visit', currentLocation);
};
```

**Acceptance**:
- Stream C: Implements `useActiveVisit` by Week 2
- Stream B: Uses hook in NoActiveVisitDialog (Week 2)
- **Before Week 2**: Stream B can use mock hook returning `{ activeVisit: { uuid: 'mock' }, startVisit: async () => ({}) }`

---

### CONTRACT C→A: Workflow State Machine
**Owner**: Stream C exports, Stream A uses for form state

```typescript
// Stream C exports: src/state/workflowMachine.ts

export type WorkflowStage =
  | 'registration'
  | 'refraction'
  | 'eye-exam'
  | 'therapy'
  | 'pre-surgery'
  | 'finished';

export interface WorkflowState {
  patientUuid: string;
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
  needsSurgery: boolean;
  canTransitionTo: (stage: WorkflowStage) => boolean;
}

export interface UseWorkflowMachineResult {
  state: WorkflowState | null;
  isLoading: boolean;
  transitionTo: (stage: WorkflowStage) => Promise<void>;
  markStageComplete: (stage: WorkflowStage) => Promise<void>;
}

export function useWorkflowMachine(patientUuid: string): UseWorkflowMachineResult;

// Stream A uses this to enable/disable forms based on workflow state
import { useWorkflowMachine } from '@/state/workflowMachine';

const { state, markStageComplete } = useWorkflowMachine(patientUuid);
const canEditForm = state?.currentStage === 'pre-surgery';

// After form submit:
await markStageComplete('pre-surgery');
```

**Acceptance**:
- Stream C: Implements `useWorkflowMachine` by Week 3
- Stream A: Uses hook in PreSurgeryForm (Week 5)
- **Before Week 3**: Stream A can use mock hook

---

### CONTRACT B→D: Tab Navigation Context
**Owner**: Stream B exports, Stream D uses

```typescript
// Stream B exports: src/components/Tabs/TabContext.tsx

export type TabId = 'registration' | 'form' | 'visits' | 'conditions' | 'therapies';

export interface TabContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const TabContext = React.createContext<TabContextValue | null>(null);
export const useTabNavigation = () => useContext(TabContext);

// Stream D uses this in Registration tab
import { useTabNavigation } from '@/components/Tabs/TabContext';

const { setActiveTab } = useTabNavigation();

// After patient registration:
setActiveTab('form'); // Switch to Form tab
```

**Acceptance**:
- Stream B: Creates `TabContext` and `TabNavigation` component Week 1
- Stream D: Uses `setActiveTab` in patient registration flow (Week 1)
- **No mocks needed** - Stream D can build RegistrationTab.tsx assuming TabContext exists

---

### CONTRACT D→C: Patient Service
**Owner**: Stream C exports, Stream D uses

```typescript
// Stream C exports: src/services/patient.service.ts (MUST BE REAL API, NO MOCKS)

export async function searchPatients(query: string): Promise<PatientListItem[]>;
export async function fetchRecentPatients(limit?: number): Promise<PatientListItem[]>;
export async function fetchPatientsByWorkflowStage(
  stage: WorkflowStage,
  workflowConceptUuid: string
): Promise<PatientListItem[]>;

// Stream D uses this in PatientSearchBox.tsx
import { searchPatients } from '@/services/patient.service';

const handleSearch = async (query: string) => {
  const results = await searchPatients(query);
  setSearchResults(results);
};
```

**Acceptance**:
- Stream C: Removes all `getMockPatients()` code, implements real API calls Week 1
- Stream D: Uses real API for patient search (Week 2)
- **No mocks allowed** - Stream D must wait for Stream C Week 1 completion

---

### CONTRACT A→A: Form Engine Integration (Internal)
**Owner**: Stream A (no external dependency)

```typescript
// Stream A creates: src/services/form-engine.service.ts

export interface FormEngineProps {
  formUuid: string;
  patientUuid: string;
  encounterUuid?: string; // For editing existing encounter
  onSubmit: (data: FormSubmissionData) => Promise<void>;
  onCancel?: () => void;
}

export const FormEngineRenderer: React.FC<FormEngineProps>;

// Stream A uses this to replace placeholder in surgery-workflow.component.tsx
import { FormEngineRenderer } from '@/services/form-engine.service';

<FormEngineRenderer
  formUuid={protocol.formUuid}
  patientUuid={selectedPatient}
  onSubmit={handleFormSubmit}
/>
```

**Acceptance**:
- Stream A: Integrates `@openmrs/openmrs-form-engine-lib` Week 4
- Stream A: Replaces placeholder `<Tile>Form engine will render here</Tile>` with `<FormEngineRenderer>`

---

## 🚀 4-STREAM WORK PLAN (Contract-First)

### 🔵 STREAM A: Forms + Testing
**Files**: `src/components/Forms/*`, `src/__tests__/*`, `src/services/form-engine.service.ts`
**Exports**: Form components (BilateralInput, BCVAInput, etc.), FormEngineRenderer
**Imports**: EncounterService (from C), WorkflowMachine (from C)

#### Week 1: Testing Infrastructure
- [x] ✅ Configure Vitest + React Testing Library (COMPLETED - AGENT-1760124496)
- [x] ✅ Write tests for existing components (COMPLETED - AGENT-1760124496)
  - [x] ✅ `FilterBar.test.tsx` - 4 tests
  - [x] ✅ `PatientList.test.tsx` - 7 tests
  - [x] ✅ `WorkflowStageFilter.test.tsx` - 10 tests
- [x] ✅ Create test utilities: `src/__tests__/test-utils.tsx` (COMPLETED - AGENT-1760124496)
- [x] ✅ Achieve 80%+ coverage on existing components (COMPLETED - 99.09% component coverage)

#### Week 2-3: Ophthalmology Components (TDD: RED→GREEN→REFACTOR)
- [ ] `BilateralInput.tsx` + tests - Left/right eye input with copy buttons
- [ ] `BCVAInput.tsx` + tests - BCVA validation (0.0-1.0, display errors)
- [ ] `CataractTypeSelector.tsx` + tests - 7-type multi-select (Incipiens, Brunescens, Corticalis, Subcaps, Polaris, Matura, Intumescens)
- [ ] `MeasurementInput.tsx` + tests - Numeric with units (dpt, mm, decimal)
- [ ] `PterygiumAssessment.tsx` + tests - Classification + "needs surgery" checkbox
- [ ] `AnesthesiaSelector.tsx` + tests - Radio buttons (ic, st/pb, AN)
- [ ] Export all components via `src/components/Forms/index.ts`

#### Week 4: Form Engine Integration
- [ ] Install `@openmrs/openmrs-form-engine-lib`
- [ ] Create `FormEngineRenderer` component
- [ ] Replace placeholder in `surgery-workflow.component.tsx:138-150`
- [ ] Wire `onSubmit` → calls `submitForm` from Stream C (CONTRACT A→C)
- [ ] Test form rendering with real OpenMRS forms from Azure

#### Week 5-6: Pre-Surgery Bilateral Form
- [ ] Create `PreSurgeryForm.tsx` - Uses BilateralInput for all eye data
- [ ] Layout: Two columns (Right Eye | Left Eye)
- [ ] Fields per eye: BCVA, Cataract types, Pseudophakie, Pterygium, Astigmatism, Axial length, Anesthesia
- [ ] Auto-save every 30 seconds
- [ ] Draft persistence to localStorage
- [ ] 100% test coverage for medical validation logic

**Deliverables**:
- 6 form components (all tested, exported via index.ts)
- FormEngineRenderer integrated
- Pre-surgery bilateral form functional
- Test coverage: 80%+ overall, 100% medical logic

**Integration Points**:
- Week 4: Import `submitForm` from Stream C (CONTRACT A→C)
- Week 5: Import `useWorkflowMachine` from Stream C (CONTRACT C→A)
- Week 6: Forms appear in "Form" tab from Stream B (CONTRACT A→B)

---

### 🟢 STREAM B: Navigation + Visits
**Files**: `src/components/Tabs/*`, `src/components/ActiveVisit/*`, `src/components/Visits/*`, `src/components/Conditions/*`
**Exports**: TabNavigation, TabContext, useTabNavigation, NoActiveVisitDialog
**Imports**: useActiveVisit (from C), Form components (from A)

#### Week 1: Top Tab Navigation
- [x] ✅ Create `TabNavigation.tsx` - Top tab bar with 5 tabs (COMPLETED - AGENT-1760124525)
  - [x] ✅ Registration, Form, Visits, Conditions, Therapies tabs
  - [x] ✅ React Context API (TabContext.tsx) for active tab state
  - [x] ✅ Export `useTabNavigation` hook
  - [x] ✅ Wire tab routing with URL params (?tab=registration)
  - [x] ✅ Test keyboard navigation (Arrow Left/Right, Home, End)
  - [x] ✅ **CONTRACT B→D**: Exported TabContext for Registration tab integration

#### Week 2: Active Visit Management
- [ ] Create `NoActiveVisitDialog.tsx` - Modal with "Start new visit" button
- [ ] Create `useRequireActiveVisit.ts` - Guard hook for forms
- [ ] Implement visit type selection dropdown (Home Visit, Facility Visit, OPD)
- [ ] Add active visit indicator badge in patient list
- [ ] **CONTRACT B→C**: Import `useActiveVisit` hook from Stream C

#### Week 3: Visits Tab (OpenMRS Integration)
- [ ] Create `VisitsTab.tsx` - Wrapper component
- [ ] Integrate `@openmrs/esm-patient-chart` widgets
- [ ] Implement "Visits" and "All encounters" sub-tabs
- [ ] Show encounter list (date, type, provider, Edit/Delete buttons)
- [ ] Empty state: "No visits found"
- [ ] Test with real patient data from Azure

#### Week 4: Conditions Tab
- [ ] Create `ConditionsTab.tsx` - Wrapper component
- [ ] Integrate standard OpenMRS conditions widget
- [ ] Display active/inactive conditions with symptoms
- [ ] Test read-only mode (no active visit)

**Deliverables**:
- 5-tab navigation system (Registration, Form, Visits, Conditions, Therapies)
- Active visit management (modal + guards)
- Visits tab integrated with OpenMRS widgets
- Conditions tab integrated

**Integration Points**:
- Week 1: Export TabContext for Stream D (CONTRACT B→D)
- Week 2: Import `useActiveVisit` from Stream C (CONTRACT B→C)
- Week 4+: Import Form components from Stream A to display in Form tab (CONTRACT A→B)

---

### 🟡 STREAM C: API + Workflow
**Files**: `src/services/*`, `src/state/*`, `src/hooks/useActiveVisit.ts`
**Exports**: patient.service (real API), encounter.service, useActiveVisit, useWorkflowMachine
**Imports**: None (foundational stream, no dependencies)

#### Week 1: Real API Integration (NO MOCKS)
- [ ] **DELETE** `getMockPatients()` function from `patient.service.ts:177-245`
- [ ] Implement real `searchPatients`:
  ```typescript
  export async function searchPatients(query: string): Promise<PatientListItem[]> {
    const url = `${restBaseUrl}/patient?q=${encodeURIComponent(query)}&v=full`;
    const response = await openmrsFetch(url);
    const data = await response.json();
    return data.results.map(transformPatient);
  }
  ```
- [ ] Implement real `fetchRecentPatients` (use `/patient?v=full&limit=50`)
- [ ] Implement real `fetchPatientsByWorkflowStage` (query obs for workflow concept)
- [ ] Test with Azure OpenMRS instance (`yarn start:azure`)
- [ ] Error handling: retry logic, timeout handling
- [ ] **CONTRACT C→D**: Export `searchPatients` for Stream D

#### Week 2: Active Visit Service
- [ ] Create `visit.service.ts`:
  ```typescript
  export async function getActiveVisit(patientUuid: string): Promise<ActiveVisit | null>;
  export async function startVisit(patientUuid: string, visitType: string, location: string): Promise<ActiveVisit>;
  export async function endVisit(visitUuid: string): Promise<void>;
  ```
- [ ] Create `useActiveVisit.ts` hook (wraps visit.service)
- [ ] Test visit creation with real API
- [ ] **CONTRACT B→C**: Export `useActiveVisit` for Stream B

#### Week 3: Workflow State Machine
- [ ] Create `workflowMachine.ts` - State machine implementation
- [ ] States: `registration → refraction → eye-exam → [decision] → therapy | pre-surgery → finished`
- [ ] Create `useWorkflowMachine` hook
- [ ] Implement `transitionTo(stage)` - Validates transitions, persists to obs
- [ ] Create custom workflow concept in OpenMRS (or use existing from Azure)
- [ ] **CONTRACT C→A**: Export `useWorkflowMachine` for Stream A

#### Week 4: Encounter Service
- [ ] Create `encounter.service.ts`:
  ```typescript
  export async function submitForm(data: FormSubmissionData): Promise<{ encounterUuid: string }>;
  export async function updateEncounter(encounterUuid: string, data: Partial<FormSubmissionData>): Promise<void>;
  export async function deleteEncounter(encounterUuid: string): Promise<void>;
  ```
- [ ] Test encounter creation with real API
- [ ] **CONTRACT A→C**: Export `submitForm` for Stream A

#### Week 5: Performance + Caching
- [ ] Implement SWR for patient data caching
- [ ] Debounce patient search (300ms)
- [ ] Pagination for large patient lists (>50 patients)
- [ ] Optimize workflow obs queries

**Deliverables**:
- All services use real OpenMRS REST API (zero mocks)
- Active visit hook working
- Workflow state machine persisting to obs
- Encounter creation functional

**Integration Points**:
- Week 1: Provide `searchPatients` to Stream D (CONTRACT C→D)
- Week 2: Provide `useActiveVisit` to Stream B (CONTRACT B→C)
- Week 3: Provide `useWorkflowMachine` to Stream A (CONTRACT C→A)
- Week 4: Provide `submitForm` to Stream A (CONTRACT A→C)

---

### 🟠 STREAM D: Actions + UX
**Files**: `src/components/Registration/*`, `src/services/print.service.ts`, `src/services/export.service.ts`
**Exports**: RegistrationTab, print.service, export.service
**Imports**: TabContext (from B), searchPatients (from C)

#### Week 1: Patient Registration
- [x] ✅ Wire "Add new patient" button in `surgery-workflow.component.tsx:114` (COMPLETED - AGENT-1760124509)
- [ ] Integrate `@openmrs/esm-patient-registration-app`:
  ```typescript
  import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

  const handleAddPatient = () => {
    launchPatientWorkspace('patient-registration');
  };
  ```
- [ ] Listen for patient creation event
- [ ] Add new patient to "Today's Patients" list
- [ ] Test registration flow with Azure backend

#### Week 2: Registration Tab (Patient Search)
- [ ] Create `RegistrationTab.tsx` - Top-level tab component
- [ ] Create `PatientSearchBox.tsx` - Autocomplete with debounce
- [ ] Create `PatientSearchResults.tsx` - Results list with cards
- [ ] Create `PatientCard.tsx` - Display name, age, gender, OpenMRS ID, active visit badge
- [ ] "Add to Today's Patients" button on each card
- [ ] Empty state: "No patients found"
- [ ] **CONTRACT D→C**: Import `searchPatients` from Stream C
- [ ] **CONTRACT B→D**: Import `useTabNavigation` from Stream B

#### Week 3: Print Service
- [ ] Create `print.service.ts`:
  ```typescript
  export interface PrintData {
    patientUuid: string;
    formData: any;
    encounterUuid: string;
  }
  export async function printFormToPDF(data: PrintData): Promise<void>;
  ```
- [ ] Generate PDF with patient demographics + form data
- [ ] Clinical format (letterhead, signatures, date)
- [ ] Wire Print button in `surgery-workflow.component.tsx:158-164`
- [ ] Test PDF generation with real patient data

#### Week 4: Export Service
- [ ] Create `export.service.ts`:
  ```typescript
  export async function exportToCSV(patients: PatientListItem[]): Promise<void>;
  export async function exportToDatabase(data: any): Promise<void>;
  ```
- [ ] Wire "Link to Database" button
- [ ] CSV export: all patients + workflow data + form submissions
- [ ] Audit log for exports (who, when, what)
- [ ] Test export with 100+ patient records

**Deliverables**:
- Patient registration integrated
- Registration tab with search
- Print to PDF working
- Export to CSV/Database working

**Integration Points**:
- Week 1: Import `useTabNavigation` from Stream B (CONTRACT B→D)
- Week 2: Import `searchPatients` from Stream C (CONTRACT D→C)
- Week 3: Access form data from Stream A components (CONTRACT A→D, implicit)

---

## 📋 Contract Negotiation Protocol

**If a contract interface needs changes**:

1. **Propose change** in `CONTRACTS.md`:
   ```markdown
   ## CHANGE REQUEST: CONTRACT A→C (submitForm)

   **Proposer**: Stream A (Dev 1)
   **Date**: 2025-10-15
   **Reason**: Need to include provider UUID in form submission

   **Current**:
   \`\`\`typescript
   export interface FormSubmissionData {
     patientUuid: string;
     encounterTypeUuid: string;
     formUuid: string;
     obs: Array<{ concept: string; value: any }>;
   }
   \`\`\`

   **Proposed**:
   \`\`\`typescript
   export interface FormSubmissionData {
     patientUuid: string;
     encounterTypeUuid: string;
     formUuid: string;
     providerUuid: string; // NEW
     obs: Array<{ concept: string; value: any }>;
   }
   \`\`\`

   **Impact**: Stream C must update `submitForm` implementation
   **Approver**: Stream C (Dev 3)
   ```

2. **Get approval** from affected stream (within 24 hours)
3. **Update contract** in BACKLOG.md
4. **Both streams migrate** to new interface

**No breaking changes without approval.**

---

## 🔐 Task Locking (Agent Protocol v1.1)

**Format**: `🔒 [AGENT-{ID}] {task} - {timestamp}`

**Example**:
```markdown
- [ ] 🔒 [AGENT-1728561234] Create BilateralInput.tsx - 2025-10-10T14:30:00Z
```

**Rules**:
- Lock expires after 15 minutes of inactivity
- Check for stale locks: `./scripts/check-stale-locks.sh`
- If stale, claim task by replacing lock

---

## 📊 Progress Dashboard

### Overall Progress
```
Infrastructure:  100% ✅ (9/9 scripts exist)
Layout:          100% ✅ (3-column layout working)
Components:       20% 🟡 (4/20 components, 0 tests)
Services:         13% 🔴 (1/8 services, all mocks)
API Integration:   0% 🔴 (getMockPatients only)
Forms:             0% 🔴 (placeholder only)
Tests:             0% 🔴 (zero test files)
Navigation:        0% 🔴 (only Protocol tabs)

MVP Status: DEMO-READY (layout works) but NOT USABLE (no data capture)
```

### Stream Status (Week 0)
```
Stream A (Forms+Testing):  Not started - Ready for Dev 1
Stream B (Nav+Visits):     Not started - Ready for Dev 2
Stream C (API+Workflow):   Not started - Ready for Dev 3
Stream D (Actions+UX):     Not started - Ready for Dev 4
```

---

## 🚦 Week 1 Priorities (All 4 Devs Start Here)

### Stream A (Dev 1): Testing First
**Priority 1**: Configure Vitest + React Testing Library
**Priority 2**: Write tests for FilterBar, PatientList, WorkflowStageFilter
**Priority 3**: Start BilateralInput component (TDD)

**Why**: Tests unblock safe refactoring for all streams. Medical software requires TDD.

### Stream B (Dev 2): Navigation Foundation
**Priority 1**: Create TabNavigation component (5 tabs)
**Priority 2**: Create TabContext and export for Stream D
**Priority 3**: Test tab switching

**Why**: Tab navigation is UI foundation. Stream D needs TabContext Week 1.

### Stream C (Dev 3): Remove Mocks
**Priority 1**: Delete `getMockPatients()` function
**Priority 2**: Implement real `searchPatients` API call
**Priority 3**: Test with Azure OpenMRS (`yarn start:azure`)

**Why**: Real API enables actual development. Stream D needs `searchPatients` Week 2.

### Stream D (Dev 4): Patient Registration
**Priority 1**: Wire "Add new patient" button to OpenMRS registration modal
**Priority 2**: Test patient creation flow
**Priority 3**: Add new patient to Today's list after registration

**Why**: Patient registration is most-used feature. Unlocks real testing workflows.

---

## 🎯 Definition of Done (Production Ready)

- [ ] All 4 streams merged and integrated (Week 6)
- [ ] Test coverage: 80%+ overall, 100% medical validation
- [ ] E2E tests pass: Registration → Refraction → Eye Exam → Pre-Surgery → Surgery
- [ ] All API calls use real OpenMRS (zero mocks)
- [ ] Active visit management enforced (forms disabled without visit)
- [ ] Ophthalmology components complete (bilateral, BCVA, cataract, etc.)
- [ ] Tab navigation: All 5 tabs functional
- [ ] Patient search + registration integrated
- [ ] Print to PDF works
- [ ] Export to CSV works
- [ ] Performance: 100+ patients load in <2 seconds
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] Security: No PII leaks, PHI protected, audit logs
- [ ] Documentation: User guide + developer docs

---

## 🚀 Quick Start (4 Parallel Devs)

### Setup (All Devs)
```bash
# Clone repo to separate directories
git clone <repo> dev1-forms && cd dev1-forms && git checkout -b stream-a-forms
git clone <repo> dev2-navigation && cd dev2-navigation && git checkout -b stream-b-navigation
git clone <repo> dev3-api && cd dev3-api && git checkout -b stream-c-api
git clone <repo> dev4-actions && cd dev4-actions && git checkout -b stream-d-actions

# Each dev: Install dependencies
yarn install

# Start dev server with Azure backend (QU01 location available)
yarn start:azure
# Access: http://localhost:8080/openmrs/spa/surgery-workflow
```

### Daily Workflow (All Devs)
```bash
# Morning: Sync with team
git pull origin distributed-main --rebase

# Claim task in BACKLOG.md
# Example: - [ ] 🔒 [AGENT-1728561234] Create BilateralInput - 2025-10-10T09:00:00Z

# TDD workflow
./scripts/test.sh <component> --watch  # RED
# Write minimal code to pass
./scripts/test.sh <component>           # GREEN
# Refactor while keeping tests green

# Before commit
./scripts/quality-gate.sh  # Must be 100% GREEN
./scripts/agent-cleanup.sh
git commit -m "Add <feature> to <achieve value>"
git push origin distributed-main

# Update BACKLOG.md (mark task complete, unlock)
```

### Coordination
- **Push frequently**: Small commits avoid conflicts
- **Review contracts**: Check CONTRACTS.md for changes
- **Sync daily**: `git pull origin distributed-main --rebase`
- **Integration Week 6**: All streams merge, resolve conflicts, integration tests

---

## 📁 File Ownership (Conflict Avoidance)

### Stream A Owns
```
src/components/Forms/**
src/services/form-engine.service.ts
src/__tests__/**
src/types/form-components.ts (new)
```

### Stream B Owns
```
src/components/Tabs/**
src/components/ActiveVisit/**
src/components/Visits/**
src/components/Conditions/**
src/types/navigation.ts (new)
```

### Stream C Owns
```
src/services/patient.service.ts (modify existing, remove mocks)
src/services/encounter.service.ts (new)
src/services/visit.service.ts (new)
src/state/workflowMachine.ts (new)
src/hooks/useActiveVisit.ts (new)
src/hooks/useWorkflowMachine.ts (new)
```

### Stream D Owns
```
src/components/Registration/**
src/services/print.service.ts (new)
src/services/export.service.ts (new)
```

### Shared Files (Requires Coordination)
```
src/surgery-workflow/surgery-workflow.component.tsx - Main container
  - Week 1: Stream B adds TabNavigation
  - Week 4: Stream A replaces form placeholder
  - Week 1: Stream D wires "Add patient" button
  → Minimal conflicts if changes are in different sections

src/types/index.ts - Type definitions
  - Each stream adds their types
  - Merge conflicts unlikely (append-only)
```

---

## 🧪 Testing Strategy

### Stream A Responsibility (100% Test Coverage)
```
Unit Tests (Week 1):
  - FilterBar.test.tsx
  - PatientList.test.tsx
  - WorkflowStageFilter.test.tsx
  - BilateralInput.test.tsx (Week 2)
  - BCVAInput.test.tsx (Week 2)
  - ... all form components

Integration Tests (Week 4-5):
  - FormEngine.integration.test.tsx
  - PreSurgeryForm.integration.test.tsx

E2E Tests (Week 6):
  - Baseline tests already created: e2e/baseline.spec.ts
  - Add: form-submission.e2e.ts
  - Add: patient-workflow.e2e.ts
```

### Other Streams (Component Tests Only)
- Stream B: Test tab navigation, active visit dialog
- Stream C: Test API calls (mock HTTP responses)
- Stream D: Test registration integration, print/export services

**Enforcement**: `./scripts/quality-gate.sh` fails if coverage <80%

---

## 📅 6-Week Timeline

### Week 1: Foundation
- **A**: Testing setup + first tests
- **B**: Tab navigation created
- **C**: Real API replaces mocks
- **D**: Patient registration wired

**Output**: Tests running, tabs exist, real patients load, registration works

### Week 2-3: Core Features
- **A**: 6 form components (TDD)
- **B**: Active visit + Visits tab
- **C**: Workflow persistence + state machine
- **D**: Registration tab + search

**Output**: Form components done, visits working, workflow persists, search works

### Week 4: Integration Prep
- **A**: Form engine integration
- **B**: Conditions tab
- **C**: Encounter service
- **D**: Print service

**Output**: Forms render, all tabs done, encounters save, print works

### Week 5: Integration
- **A**: Pre-surgery bilateral form
- **B**: Polish + accessibility
- **C**: Performance + caching
- **D**: Export service

**Output**: Bilateral form functional, all streams code-complete

### Week 6: Polish + E2E
- **All**: Merge streams to `distributed-main`
- **All**: Resolve integration conflicts
- **All**: E2E tests for full workflow
- **All**: Bug fixes + performance tuning

**Output**: Production-ready module

---

**VERSION**: 2.0.0 (Contract-First, Real State)
**PROTOCOL**: Agent Protocol v1.1
**ENFORCEMENT**: TDD Mandatory | Quality Gate Zero-Tolerance | Real API Only
