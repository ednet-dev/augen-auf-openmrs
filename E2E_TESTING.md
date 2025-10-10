# E2E Testing Protocol

**No mocks, no shims - Real production integration across all layers**

---

## Core Principle

**E2E tests must use real services, real data flow, real integration**

❌ **NO**:
- Mocked OpenMRS API calls
- Shims for database
- Fake validation responses
- Stubbed workflows

✅ **YES**:
- Real OpenMRS backend (local or test instance)
- Real concept dictionary
- Real encounter creation
- Real data persistence
- Real browser automation (Playwright)

---

## Test Layers

### Layer 1: Unit Tests (Isolated)

**Purpose**: Test single function/component
**Mocking**: Allowed for dependencies
**Example**: `validateBCVA(0.5)` → `{ valid: true }`

```typescript
// Unit test: Mock allowed
describe('validateBCVA', () => {
  it('should validate range', () => {
    expect(validateBCVA(0.5).valid).toBe(true);
    expect(validateBCVA(1.5).valid).toBe(false);
  });
});
```

---

### Layer 2: Integration Tests (Real Services)

**Purpose**: Test multiple components working together
**Mocking**: NO - Use real services
**Example**: Form → Validation → OpenMRS API → Database

```typescript
// Integration test: NO mocks
describe('BilateralInput Integration', () => {
  it('should save bilateral BCVA to OpenMRS', async () => {
    // Real component
    const { getByLabelText, getByText } = render(<BilateralInput />);
    
    // Real user interaction
    fireEvent.change(getByLabelText('Left Eye BCVA'), { target: { value: '0.8' } });
    fireEvent.change(getByLabelText('Right Eye BCVA'), { target: { value: '0.6' } });
    fireEvent.click(getByText('Save'));
    
    // Real OpenMRS API call (test instance)
    await waitFor(() => {
      // Verify real encounter created in OpenMRS test database
      const encounter = getEncounterByPatient(testPatient.uuid);
      expect(encounter.obs).toContainEqual({
        concept: BCVA_LEFT_CONCEPT_UUID,
        value: 0.8
      });
    });
  });
});
```

---

### Layer 3: E2E Tests (Full Stack)

**Purpose**: Test complete user workflow
**Mocking**: NO - Real browser, real OpenMRS, real data
**Example**: Registration → Eye Exam → Pre-Surgery → Save → Verify in DB

```typescript
// E2E test: Playwright with real OpenMRS
test('Complete pre-surgery workflow', async ({ page }) => {
  // Real OpenMRS login
  await page.goto('http://localhost:8080/openmrs/spa');
  await page.fill('[name="username"]', 'admin');
  await page.fill('[name="password"]', 'Admin123');
  await page.click('button[type="submit"]');
  
  // Real patient selection
  await page.goto('http://localhost:8080/openmrs/spa/augen-auf');
  await page.click('text=James');  // Today's patient
  
  // Real workflow progression
  await page.click('[data-testid="workflow-stage-refraction"]');
  await page.fill('[name="bcva-left"]', '0.8');
  await page.click('button:has-text("Save")');
  
  // Real data verification (query actual OpenMRS database)
  const encounter = await getLatestEncounter(testPatient.uuid);
  expect(encounter.obs.find(o => o.concept === BCVA_LEFT_UUID).value).toBe(0.8);
});
```

---

## Medical Software Requirements

**For medical code, E2E tests are MANDATORY**

**Why**: Unit tests don't catch:
- Integration failures (API contract mismatches)
- Data persistence bugs (wrong concept UUIDs)
- Workflow violations (invalid state transitions)
- UI/UX issues (form doesn't submit)

**Example Failure Caught Only by E2E**:
```typescript
// Unit test: Passes ✅
expect(validateBCVA(0.5)).toEqual({ valid: true });

// E2E test: Fails ❌
// Reason: BCVA_LEFT_UUID wrong in OpenMRS, data not saved
```

---

## Test Environment Setup

### OpenMRS Test Instance

**Required**:
- Local OpenMRS 3.x instance
- Test database (separate from production)
- Concept dictionary loaded
- Test patient data

**Setup**:
```bash
# Run OpenMRS test instance (Docker)
docker run -d -p 8080:8080 \
  -e OMRS_CONFIG_MODULE_WEB_ADMIN=true \
  -e OMRS_DEV_DEBUG_PORT=1044 \
  openmrs/openmrs-reference-application:latest

# Wait for startup
./scripts/wait-for-openmrs.sh

# Load test data
./scripts/load-test-data.sh
```

---

## E2E Test Structure

### File Organization

```
src/
├── components/
│   ├── Forms/
│   │   ├── BilateralInput.tsx
│   │   ├── __tests__/
│   │   │   ├── BilateralInput.test.tsx        # Unit tests (mocks OK)
│   │   │   └── BilateralInput.integration.test.tsx  # Integration (NO mocks)
│   └── ...
└── e2e/
    ├── workflows/
    │   ├── registration.spec.ts
    │   ├── pre-surgery.spec.ts
    │   └── complete-patient-journey.spec.ts
    └── utils/
        ├── openmrs-helpers.ts  # Real API calls
        └── test-data.ts        # Real test patients
```

---

## Testing Commands

### Unit Tests (Fast, Isolated)

```bash
./scripts/test.sh unit
# Uses mocks, runs quickly
```

### Integration Tests (Real Services)

```bash
./scripts/test.sh integration
# NO mocks, requires OpenMRS running
# Slower, but catches integration bugs
```

### E2E Tests (Full Stack)

```bash
./scripts/test.sh e2e
# Playwright with real browser
# Real OpenMRS backend
# Slowest, but highest confidence
```

### All Tests (CI/CD)

```bash
./scripts/test.sh all
# Unit → Integration → E2E
# Must all pass before merge
```

---

## Quality Gate Integration

**Quality gate runs**:
1. Unit tests (fast feedback)
2. Integration tests (service contracts)
3. E2E tests (full workflows)

**All must pass** - No mocks in E2E means higher confidence.

---

## Examples

### Bad: E2E with Mocks ❌

```typescript
// This is NOT E2E - it's a unit test
test('Save form', async () => {
  vi.mock('@openmrs/esm-framework', () => ({
    saveEncounter: vi.fn().mockResolvedValue({ uuid: 'fake-uuid' })
  }));
  
  // Using mock, not testing real integration
});
```

### Good: E2E Real Integration ✅

```typescript
// Real E2E - tests actual OpenMRS integration
test('Save form to real OpenMRS', async ({ page }) => {
  // Real browser
  await page.goto('http://localhost:8080/openmrs/spa/augen-auf');
  
  // Real user actions
  await page.fill('[name="bcva-left"]', '0.8');
  await page.click('button:has-text("Save")');
  
  // Wait for real API call
  await page.waitForSelector('text=Saved successfully');
  
  // Verify in real database
  const encounter = await fetchFromOpenMRS(`/ws/rest/v1/encounter?patient=${patientUuid}`);
  expect(encounter.obs[0].value).toBe(0.8);
});
```

---

## Communication to Agents

**All agents must know**:
- Unit tests: Mocks OK (fast feedback)
- Integration tests: NO mocks (service contracts)
- E2E tests: NO mocks, NO shims (real production flow)

**Updated in**:
- ✅ All agent definitions (.claude/agents/*.md)
- ✅ All slash commands (.claude/commands/*.md)
- ✅ PROCEDURE.md
- ✅ CLAUDE.md
- ✅ Quality gate scripts

---

**Critical**: E2E tests are NON-NEGOTIABLE for medical software. They catch issues unit tests miss.
