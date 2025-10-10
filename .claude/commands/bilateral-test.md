---
description: Write comprehensive tests for bilateral (left/right) medical data
scope: project
arguments:
  - name: module
    description: Module name (e.g., "PreSurgeryForm", "EyeAssessment")
    required: true
---

# Bilateral Test Generator

Write exhaustive tests for left/right eye symmetry, asymmetry detection, and copy operations.

## Usage

```bash
/bilateral-test "{{module}}"
```

## Test Categories

### 1. Rendering Tests
- Left eye inputs render
- Right eye inputs render
- Labels are correctly associated
- Copy buttons are present

### 2. Data Symmetry Tests
- Independent data entry (left ≠ right)
- Symmetric data entry (left = right)
- Asymmetry detection (visual indicator when left ≠ right)
- Empty state handling (one eye empty, both empty)

### 3. Copy Operation Tests
- Copy left→right
- Copy right→left
- Copy with validation errors
- Copy clears errors on target side
- Copy triggers onChange callback

### 4. Validation Tests
- Range validation (min/max for each eye)
- Required field validation (left required, right optional scenarios)
- Type validation (string→number coercion)
- Custom validation rules
- Error display (inline errors per eye)

### 5. Edge Cases
- Both eyes empty
- One eye filled, one empty
- Invalid data on one side
- Copy from invalid to valid
- Rapid copy operations

### 6. Accessibility Tests
- Keyboard navigation (Tab order)
- Screen reader labels (ARIA)
- Focus management
- Error announcements

## Test Template

```typescript
describe('{{module}} - Bilateral Functionality', () => {
  describe('Rendering', () => {
    it('should render left eye inputs', () => {});
    it('should render right eye inputs', () => {});
    it('should render copy buttons', () => {});
  });

  describe('Data Symmetry', () => {
    it('should allow independent left/right values', () => {});
    it('should detect asymmetry', () => {});
    it('should handle empty states', () => {});
  });

  describe('Copy Operations', () => {
    it('should copy left→right', () => {});
    it('should copy right→left', () => {});
    it('should validate after copy', () => {});
  });

  describe('Validation', () => {
    it('should validate range for each eye', () => {});
    it('should show errors inline', () => {});
    it('should prevent submission with errors', () => {});
  });

  describe('Edge Cases', () => {
    it('should handle both eyes empty', () => {});
    it('should handle mixed valid/invalid', () => {});
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {});
    it('should support keyboard navigation', () => {});
  });
});
```

## Medical Test Patterns

### BCVA Pattern (0.0-1.0 range)
```typescript
it('should accept valid BCVA values', () => {
  render(<BCVAInput left={0.5} right={0.8} />);
  expect(screen.getByLabelText('Left Eye BCVA')).toHaveValue(0.5);
  expect(screen.getByLabelText('Right Eye BCVA')).toHaveValue(0.8);
});

it('should reject BCVA values outside range', () => {
  const { rerender } = render(<BCVAInput left={-0.1} right={1.5} />);
  expect(screen.getByText(/must be between 0.0 and 1.0/i)).toBeInTheDocument();
});
```

### Astigmatism Pattern (-10.0 to +10.0 dpt)
```typescript
it('should accept negative astigmatism values', () => {
  render(<AstigmatismInput left={-2.5} right={3.0} />);
  expect(screen.getByLabelText('Left Eye Astigmatism')).toHaveValue(-2.5);
});
```

### Cataract Type Pattern (multi-select)
```typescript
it('should allow multiple cataract types per eye', () => {
  render(<CataractTypeInput left={['Incipiens', 'Corticalis']} right={['Brunescens']} />);
  expect(screen.getByLabelText('Incipiens - Left')).toBeChecked();
  expect(screen.getByLabelText('Corticalis - Left')).toBeChecked();
});
```

## Mocking OpenMRS

```typescript
import { usePatient } from '@openmrs/esm-framework';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  usePatient: jest.fn(),
  saveEncounter: jest.fn()
}));

beforeEach(() => {
  (usePatient as jest.Mock).mockReturnValue({
    patient: mockPatient,
    isLoading: false,
    error: null
  });
});
```

## Output Format

```
✅ Generated bilateral tests for {{module}}

Test file: src/components/{{module}}/__tests__/{{module}}.bilateral.test.tsx

Test coverage:
- Rendering: 6 tests
- Data Symmetry: 4 tests
- Copy Operations: 5 tests
- Validation: 7 tests
- Edge Cases: 5 tests
- Accessibility: 4 tests

Total: 31 tests

Next steps:
1. Run tests: ./scripts/test.sh {{module}} --watch
2. Implement copy logic to make tests pass
3. Add asymmetry visual indicator
4. Quality gate: ./scripts/quality-gate.sh
```

## Example

```bash
/bilateral-test "PreSurgeryForm"
# Generates comprehensive bilateral tests for pre-surgery assessment
# Covers: BCVA, cataract types, astigmatism, axial length
# Total: ~50 test cases
```
