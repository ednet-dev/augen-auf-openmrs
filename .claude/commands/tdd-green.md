---
description: Implement minimal code to pass test (TDD GREEN phase)
argument-hint: <feature-name>
allowed-tools: Write, Edit, Bash(./scripts/test.sh*)
model: sonnet
---

# TDD GREEN Phase - Make Test Pass

**Purpose**: Implement minimal code to make the failing test pass (no more, no less)

**Arguments**: `$1` - Feature/function name (same as used in RED phase)

STARTER_SYMBOL=🟢

---

## GREEN Phase Protocol

### 1. Verify RED State

Before implementing, confirm:
- [ ] Test exists and is failing
- [ ] Error message is clear
- [ ] Test covers medical validation requirements

```bash
./scripts/test.sh $1 --watch
# Should show: ❌ Tests failing
```

---

### 2. Implement Minimal Code

**Principle**: Write **just enough code** to make the test pass.

**Don't**:
- ❌ Add features not tested
- ❌ Optimize prematurely
- ❌ Handle edge cases not in tests
- ❌ Write "future-proof" abstractions

**Do**:
- ✅ Make the test pass
- ✅ Keep it simple
- ✅ Handle only tested cases
- ✅ Use explicit validation for medical logic

**Example Implementation**:
```typescript
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validate$1(value: unknown): ValidationResult {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return { valid: false, error: '$1 is required' };
  }

  // Handle empty
  if (value === '') {
    return { valid: false, error: '$1 cannot be empty' };
  }

  // Convert to number if needed
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check type
  if (typeof numValue !== 'number' || isNaN(numValue)) {
    return { valid: false, error: '$1 must be a valid number' };
  }

  // Check range (example: BCVA is 0.0-1.0)
  if (numValue < MIN_$1 || numValue > MAX_$1) {
    return {
      valid: false,
      error: `$1 must be between ${MIN_$1} and ${MAX_$1}`
    };
  }

  // All checks passed
  return { valid: true };
}
```

---

### 3. Run Test (Must PASS)

```bash
./scripts/test.sh $1 --watch
```

**Expected output**:
```
✅ Tests passing
All X tests passed
```

---

### 4. Verify GREEN State

**Checklist**:
- [ ] All tests passing
- [ ] No test skipped
- [ ] Implementation is minimal (no extra features)
- [ ] Code is readable
- [ ] Medical validation is explicit (no implicit assumptions)

**If tests still FAIL**:
> 🔄 Iterate: Add more code incrementally
> Run tests after each small change
> Stop when GREEN

**If tests PASS but code seems too complex**:
> ⏸️  STOP: Move to REFACTOR phase
> Don't refactor in GREEN phase

---

### 5. Document in TDD_LOG.md

```markdown
## GREEN Phase - $(date -Iseconds)

**Feature**: $1
**Iterations**: $ITERATION_COUNT
**Result**: ✅ All tests passing
**Tests**: $TEST_COUNT/$TEST_COUNT passing
**Duration**: $DURATION
**Implementation**: $FILE_PATH:$LINE_NUMBER
**Medical validation**: Explicit range/type/null checks
```

---

## Medical Software Requirements

**For medical validation, implementation MUST**:
1. ✅ Explicitly validate types
2. ✅ Explicitly validate ranges
3. ✅ Handle null/undefined with clear errors
4. ✅ Handle empty values with clear errors
5. ✅ Return clear, actionable error messages
6. ✅ Never silently coerce or assume values
7. ✅ Use constants for medical ranges (no magic numbers)
8. ✅ Document medical constraints in code comments

**Example Constants**:
```typescript
/**
 * BCVA (Best Corrected Visual Acuity) Range
 * Based on decimal notation: 0.0 (no vision) to 1.0 (perfect vision)
 * Source: Ophthalmology standards
 */
export const BCVA_MIN = 0.0;
export const BCVA_MAX = 1.0;
```

---

## GREEN Phase Iterations

**If tests still fail after first implementation**:

**Iteration 1**: Add basic structure
```bash
./scripts/test.sh $1
# Result: Some tests pass, some fail
```

**Iteration 2**: Add validation logic
```bash
./scripts/test.sh $1
# Result: More tests pass
```

**Iteration 3**: Handle edge cases
```bash
./scripts/test.sh $1
# Result: All tests pass ✅
```

**Keep iterating until GREEN**

---

## Stop Conditions

- ❌ Can't make tests pass after 3 iterations → Test might be wrong
- ❌ Code becomes complex → Need to simplify tests first
- ❌ Need to change test to make code simpler → RED phase was wrong

---

## Next Step

After successful GREEN phase:

```bash
/tdd-refactor $1
```

Or if code is already clean:

```bash
/quality-gate
# If GREEN, ready to commit
```

---

## Remember

**Minimal implementation only!**

If you're tempted to add "what if" code, STOP:
1. Write a test for that "what if"
2. See it fail (RED)
3. Then implement (GREEN)

**This is medical software** - every line of code must be tested.
