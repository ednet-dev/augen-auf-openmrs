---
description: Write failing test first (TDD RED phase for medical software)
argument-hint: <feature-name>
allowed-tools: Write, Edit, Bash(./scripts/test.sh*)
model: sonnet
---

# TDD RED Phase - Write Failing Test

**Purpose**: Write a failing test before any production code (mandatory for medical software)

**Arguments**: `$1` - Feature/function name to test

STARTER_SYMBOL=🔴

---

## RED Phase Protocol (Medical Software)

### 1. State Hypothesis

Before writing test, state explicitly:

> "I expect this test to FAIL with error: '$EXPECTED_ERROR' because $REASON"

Example:
> "I expect this test to FAIL with error: 'validateBCVA is not defined' because the validation function doesn't exist yet"

---

### 2. Write Failing Test

**Test file**: `src/**/__tests__/$1.test.tsx` or `src/**/$1.spec.ts`

**Medical validation test structure**:
```typescript
describe('$1', () => {
  describe('valid inputs', () => {
    it('should accept valid $1 values', () => {
      // Arrange
      const validInput = /* valid test case */;

      // Act
      const result = validate$1(validInput);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('invalid inputs', () => {
    it('should reject values outside valid range', () => {
      // Arrange
      const invalidInput = /* out of range */;

      // Act
      const result = validate$1(invalidInput);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('range');
    });

    it('should handle null/undefined gracefully', () => {
      expect(validate$1(null).valid).toBe(false);
      expect(validate$1(undefined).valid).toBe(false);
    });

    it('should handle empty values', () => {
      expect(validate$1('').valid).toBe(false);
    });
  });

  describe('boundary values', () => {
    it('should handle minimum boundary', () => {
      // Test exact minimum value
    });

    it('should handle maximum boundary', () => {
      // Test exact maximum value
    });

    it('should reject values just outside boundaries', () => {
      // Test min - epsilon, max + epsilon
    });
  });
});
```

**Principles**:
- Test ONE behavior per test
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- **For medical code**: Test ALL boundary conditions
- **For medical code**: Test ALL error cases
- Keep tests simple and readable

---

### 3. Run Test (Must FAIL)

```bash
./scripts/test.sh $1 --watch
```

**Expected output**:
```
❌ Tests failing
Error: $EXPECTED_ERROR
```

---

### 4. Verify RED State

**Checklist**:
- [ ] Test is running (not skipped)
- [ ] Test is failing (not passing)
- [ ] Error matches hypothesis
- [ ] Error is clear and actionable
- [ ] Test covers boundary values (medical requirement)
- [ ] Test handles null/undefined/empty

**If test PASSES**:
> ❌ STOP! Investigate why test passes without implementation
> This indicates: test is wrong, or implementation already exists

**If error doesn't match hypothesis**:
> ⚠️  Review: Test might be incorrect or hypothesis wrong

---

### 5. Document in TDD_LOG.md

```markdown
## RED Phase - $(date -Iseconds)

**Feature**: $1
**Hypothesis**: $HYPOTHESIS
**Result**: ✅ Failed as expected
**Error**: $ACTUAL_ERROR
**Test file**: $TEST_FILE
**Duration**: $DURATION
**Medical validation**: $BOUNDARY_TESTS_ADDED
```

---

## Medical Software Requirements

**For medical validation functions, MUST test**:
1. ✅ Valid inputs (happy path)
2. ✅ Invalid inputs (rejection with clear errors)
3. ✅ Boundary values (min, max, edges)
4. ✅ Null/undefined handling
5. ✅ Empty values
6. ✅ Type coercion (string→number, etc.)
7. ✅ Range validation
8. ✅ Format validation

**Example: BCVA (Best Corrected Visual Acuity)**
- Range: 0.0 to 1.0 (decimal)
- Must test: -0.1, 0.0, 0.5, 1.0, 1.1, null, undefined, '', 'abc', NaN

---

## Stop Conditions

- ❌ Test passes unexpectedly
- ❌ Test doesn't run (syntax error)
- ❌ Wrong error message
- ❌ Can't make test fail
- ❌ Boundary tests missing (for medical code)

---

## Next Step

After successful RED phase:

```bash
/tdd-green $1
```

---

## Remember

**No production code yet!** Only tests in RED phase.

The test must fail. If it passes, something is wrong.

**This is medical software** - incomplete tests put patients at risk.
