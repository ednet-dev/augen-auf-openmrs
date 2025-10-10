---
description: Add medical validation rules with unit tests
scope: project
arguments:
  - name: fieldName
    description: Medical field to validate (e.g., "BCVA", "Astigmatism", "AxialLength")
    required: true
---

# Medical Validation Generator

Generate validation rules and exhaustive tests for medical measurements.

## Usage

```bash
/validate-medical "{{fieldName}}"
```

## Validation Categories

### 1. Range Validation
- Minimum value
- Maximum value
- Inclusive/exclusive bounds
- Negative values (if applicable)

### 2. Precision Validation
- Decimal places allowed
- Rounding rules
- Scientific notation (if applicable)

### 3. Required Field Validation
- Field required/optional
- Conditional requirements (e.g., if surgery needed)
- Bilateral requirements (both eyes or one eye)

### 4. Type Validation
- Expected datatype (number, string, coded)
- Type coercion (string→number)
- Null/undefined handling

### 5. Medical Logic Validation
- Physiological constraints (e.g., BCVA can't improve with cataracts)
- Correlation checks (e.g., severe cataract → low BCVA expected)
- Impossibility checks (e.g., axial length >35mm extremely rare)

## Medical Field Standards

### BCVA (Best Corrected Visual Acuity)
- **Range**: 0.0 - 1.0 (decimal format)
- **Precision**: 1 decimal place
- **Conversions**: Snellen (20/20), LogMAR
- **Clinical Note**: 1.0 = perfect vision, 0.0 = blind

### Astigmatism
- **Range**: -10.0 to +10.0 diopters
- **Precision**: 2 decimal places
- **Sign**: Negative (myopic), Positive (hyperopic)
- **Clinical Note**: >3.0 dpt = significant astigmatism

### Axial Length
- **Range**: 15.0 - 35.0 mm (from limbus)
- **Precision**: 2 decimal places
- **Typical**: 22-24 mm (adult eye)
- **Clinical Note**: <20 mm or >28 mm requires verification

### Pterygium Grade
- **Range**: 0-3 (integer)
- **0**: None
- **1**: Mild (not reaching pupil)
- **2**: Moderate (reaching pupil margin)
- **3**: Severe (covering pupil)

## Validation Template

```typescript
// Validator Function
export function validate{{fieldName}}(value: number): ValidationResult {
  // Range check
  if (value < MIN_{{fieldName}} || value > MAX_{{fieldName}}) {
    return {
      valid: false,
      error: `{{fieldName}} must be between ${MIN_{{fieldName}}} and ${MAX_{{fieldName}}}`
    };
  }

  // Precision check
  const decimals = countDecimals(value);
  if (decimals > MAX_DECIMALS_{{fieldName}}) {
    return {
      valid: false,
      error: `{{fieldName}} allows max ${MAX_DECIMALS_{{fieldName}}} decimal places`
    };
  }

  // Medical logic check
  if (isMedicallyImprobable{{fieldName}}(value)) {
    return {
      valid: false,
      warning: `{{fieldName}} value is clinically unusual. Please verify.`
    };
  }

  return { valid: true };
}

// Test Suite
describe('{{fieldName}} Validation', () => {
  describe('Range Validation', () => {
    it('should accept minimum value', () => {
      expect(validate{{fieldName}}(MIN_{{fieldName}})).toBeValid();
    });

    it('should accept maximum value', () => {
      expect(validate{{fieldName}}(MAX_{{fieldName}})).toBeValid();
    });

    it('should reject below minimum', () => {
      expect(validate{{fieldName}}(MIN_{{fieldName}} - 0.1)).toHaveError();
    });

    it('should reject above maximum', () => {
      expect(validate{{fieldName}}(MAX_{{fieldName}} + 0.1)).toHaveError();
    });
  });

  describe('Precision Validation', () => {
    it('should accept valid precision', () => {
      expect(validate{{fieldName}}(0.12)).toBeValid();
    });

    it('should reject excessive precision', () => {
      expect(validate{{fieldName}}(0.12345)).toHaveError();
    });
  });

  describe('Medical Logic Validation', () => {
    it('should warn on improbable values', () => {
      expect(validate{{fieldName}}(IMPROBABLE_VALUE)).toHaveWarning();
    });
  });
});
```

## Boundary Value Testing

For range [min, max]:
- Test: min - 1 (❌ invalid)
- Test: min (✅ valid)
- Test: min + 1 (✅ valid)
- Test: (min + max) / 2 (✅ valid)
- Test: max - 1 (✅ valid)
- Test: max (✅ valid)
- Test: max + 1 (❌ invalid)

## Output Format

```
✅ Generated validation for {{fieldName}}

Files created:
- src/utils/validation/{{fieldName}}Validator.ts
- src/utils/validation/__tests__/{{fieldName}}Validator.test.ts

Constants defined:
- MIN_{{fieldName}}: <value>
- MAX_{{fieldName}}: <value>
- MAX_DECIMALS_{{fieldName}}: <value>

Test coverage:
- Range validation: 7 tests
- Precision validation: 3 tests
- Medical logic: 4 tests
- Edge cases: 5 tests

Total: 19 tests

Next steps:
1. Run tests: ./scripts/test.sh validation/{{fieldName}} --watch
2. Integrate validator into form component
3. Add inline error display
4. Quality gate: ./scripts/quality-gate.sh
```

## Example

```bash
/validate-medical "BCVA"
# Generates:
# - Range: 0.0-1.0
# - Precision: 1 decimal
# - Warnings: <0.1 with no cataract (unusual)
# - Tests: 19 test cases
```
