---
description: Run comprehensive quality checks (zero tolerance for medical software)
argument-hint: (none - runs on entire project)
allowed-tools: Bash(./scripts/*), Bash(yarn test*), Bash(git status)
model: sonnet
---

# Quality Gate - Zero Tolerance for Medical Software

**Purpose**: Comprehensive quality check before committing changes to OpenMRS medical module

**Arguments**: None (runs on entire project)

STARTER_SYMBOL=🛡️

---

## Zero Tolerance Policy

**ALL checks must pass**. If ANY check fails, DO NOT commit.

This is **medical software** - patient safety depends on code quality.

---

## Phase 1: Tests

STARTER_SYMBOL=🧪

1. **Run full test suite**:
   ```bash
   ./scripts/test.sh all
   ```

2. **Verify all tests pass**:
   Expected: `✅ All tests passed`

3. **Check coverage** (must be >80% for medical logic, >60% for UI):
   ```bash
   ./scripts/test.sh all --coverage
   ```

4. **Stop if tests fail**:
   > ❌ STOP: Fix failing tests before continuing

---

## Phase 2: Type Safety

STARTER_SYMBOL=🔍

1. **Run type checker**:
   ```bash
   ./scripts/check-types.sh
   ```

2. **Verify zero errors**:
   Expected: `✅ Found 0 errors in src/**`

   Note: OpenMRS 5.8.1 dependency type errors in node_modules are acceptable

3. **Stop if errors found**:
   > ❌ STOP: Fix type errors before continuing

---

## Phase 3: Linting

STARTER_SYMBOL=📏

1. **Run linter**:
   ```bash
   ./scripts/check-lint.sh
   ```

2. **Verify zero issues**:
   Expected: `✅ No linting errors`

3. **Stop if issues found**:
   > ❌ STOP: Fix linting issues before continuing

---

## Phase 4: Medical Validation Check

STARTER_SYMBOL=🏥

1. **Verify medical validation coverage**:
   ```bash
   ./scripts/check-medical-coverage.sh
   ```

2. **Verify boundary tests exist**:
   - BCVA range: 0.0-1.0
   - Astigmatism range: valid diopters
   - Bilateral data: null handling
   - Empty/invalid inputs: rejection

3. **Stop if coverage insufficient**:
   > ❌ STOP: Medical logic requires exhaustive validation tests

---

## Output Format

**If ALL checks pass**:
```markdown
🟢 QUALITY GATE: PASSED ✅

All checks passed:
✅ Tests: X/X passing (Y% coverage)
✅ Types: 0 errors in src/**
✅ Lint: 0 issues
✅ Medical Validation: All boundary tests present

Ready to commit.
```

**If ANY check fails**:
```markdown
🔴 QUALITY GATE: FAILED ❌

Failed checks:
❌ Tests: X failing
✅ Types: 0 errors
⚠️  Lint: Y warnings
❌ Medical Validation: Missing boundary tests

DO NOT COMMIT. Fix issues above.
```

---

## Success Criteria

- [✅] All tests passing
- [✅] Zero type errors in src/**
- [✅] Zero lint issues
- [✅] Medical validation coverage complete
- [✅] No PHI/PII in logs or errors
