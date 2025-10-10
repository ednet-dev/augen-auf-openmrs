---
description: Scaffold bilateral medical form component with TDD
scope: project
arguments:
  - name: componentName
    description: Name of the form component (e.g., "BCVAInput", "AstigmatismInput")
    required: true
---

# Medical Form Scaffolder

Generate bilateral form component for medical data capture with tests, validation, and OpenMRS integration.

## Usage

```bash
/medical-form "{{componentName}}"
```

## Steps

1. **TDD RED: Create failing test**
   - File: `src/components/Forms/__tests__/{{componentName}}.test.tsx`
   - Tests: Rendering, left/right inputs, validation, copy operations
   - Uses: `@testing-library/react`, `@openmrs/esm-framework/mock`

2. **Generate component structure**
   - File: `src/components/Forms/{{componentName}}.tsx`
   - Props: `BilateralInputProps<T>` (left, right, onChange, validation)
   - Includes: Left/right inputs, copy buttons, error display

3. **Add validation**
   - File: `src/utils/validation/{{componentName}}Validator.ts`
   - Tests: Range checks, required fields, type coercion

4. **TDD GREEN: Run tests**
   ```bash
   ./scripts/test.sh Forms/{{componentName}} --watch
   ```

5. **Integration**
   - Export from `src/components/Forms/index.ts`
   - Add Storybook story (optional)
   - Document in component README

## Template Structure

```typescript
// Component Interface
interface {{componentName}}Props {
  left: MedicalValue;
  right: MedicalValue;
  onChange: (side: 'left' | 'right', value: MedicalValue) => void;
  validation?: ValidationRules;
  onCopy?: (from: 'left' | 'right') => void;
}

// Validation Rules
interface ValidationRules {
  min?: number;
  max?: number;
  required?: boolean;
  precision?: number;
}
```

## Medical Data Patterns

- **Bilateral Symmetry**: Left/right mirror structure
- **Copy Operations**: Copy left→right, right→left
- **Visual Feedback**: Highlight asymmetry when values differ
- **Validation**: Boundary checks, unit conversion, required fields
- **Accessibility**: ARIA labels, keyboard navigation

## Output Format

Returns summary:

```
✅ Generated {{componentName}} component

Files created:
- src/components/Forms/{{componentName}}.tsx
- src/components/Forms/__tests__/{{componentName}}.test.tsx
- src/utils/validation/{{componentName}}Validator.ts

Next steps:
1. Run tests: ./scripts/test.sh Forms/{{componentName}} --watch
2. Implement validation rules
3. Add to parent form
4. Quality gate: ./scripts/quality-gate.sh
```

## Example

```bash
/medical-form "BCVAInput"
# Generates BCVA (Best Corrected Visual Acuity) input component
# Range: 0.0-1.0, decimal format, bilateral
```
