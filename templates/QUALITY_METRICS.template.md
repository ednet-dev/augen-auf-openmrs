# Quality Metrics Dashboard

**Project**: Augen Auf OpenMRS
**Updated**: {timestamp}
**Agent**: AGENT-{agent_id}

---

## Overall Health

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| TypeScript Errors | {ts_errors} | 0 | {status_icon} |
| ESLint Issues | {lint_issues} | 0 | {status_icon} |
| Test Pass Rate | {test_pass_rate}% | 100% | {status_icon} |
| Test Coverage (Overall) | {overall_coverage}% | 80% | {status_icon} |
| Test Coverage (Medical) | {medical_coverage}% | 90% | {status_icon} |

**Overall Status**: {GREEN / YELLOW / RED}

---

## TypeScript Type Check

**Command**: `./scripts/check-types.sh`

**Result**:
```
{ts_check_output}
```

**Errors by Category**:
- Type mismatches: {count}
- Missing types: {count}
- Any types: {count}
- Implicit any: {count}

**Files with Errors**:
- {file_path}: {error_count} errors
- {file_path}: {error_count} errors

---

## ESLint Issues

**Command**: `./scripts/check-lint.sh`

**Result**:
```
{lint_check_output}
```

**Issues by Severity**:
- Errors: {error_count}
- Warnings: {warning_count}

**Issues by Category**:
- Unused variables: {count}
- Missing imports: {count}
- Naming conventions: {count}
- Complexity: {count}

---

## Test Results

**Command**: `./scripts/test.sh all`

**Result**:
```
{test_output}
```

**Test Suites**:
- Passing: {passing_suites} / {total_suites}
- Failing: {failing_suites} / {total_suites}

**Test Cases**:
- Passing: {passing_tests} / {total_tests}
- Failing: {failing_tests} / {total_tests}

**Failing Tests**:
1. {test_suite}: {test_name}
   - Error: {error_message}
   - Fix: {suggested_fix}

---

## Code Coverage

**Overall Coverage**: {overall_coverage}%

| Category | Coverage | Target | Status |
|----------|----------|--------|--------|
| Medical Logic | {medical_coverage}% | 90% | {status_icon} |
| UI Components | {ui_coverage}% | 80% | {status_icon} |
| Services | {services_coverage}% | 85% | {status_icon} |
| Utilities | {utils_coverage}% | 80% | {status_icon} |

### Coverage by File

**Medical Logic** (Target: 90%):
- `src/utils/validation/bcvaValidator.ts`: 95% ✅
- `src/utils/validation/astigmatismValidator.ts`: 92% ✅
- `src/utils/validation/axialLengthValidator.ts`: 88% ⚠️ BELOW TARGET
- `src/services/preSurgeryService.ts`: 90% ✅

**UI Components** (Target: 80%):
- `src/components/Forms/BilateralInput.tsx`: 85% ✅
- `src/components/Forms/BCVAInput.tsx`: 82% ✅
- `src/components/PreSurgery/PreSurgeryForm.tsx`: 80% ✅

**Services** (Target: 85%):
- `src/services/offlineQueue.ts`: 87% ✅
- `src/services/conceptMapper.ts`: 84% ⚠️ BELOW TARGET

### Uncovered Lines

**Priority: High**
- `src/utils/validation/axialLengthValidator.ts`: Lines 45-52 (error handling)
- `src/services/conceptMapper.ts`: Lines 67-70 (edge case)

---

## Medical Validation Compliance

**BCVA Validation**:
- ✅ Range check (0.0-1.0)
- ✅ Precision check (1 decimal)
- ✅ Boundary value tests (7 tests)
- ✅ Medical correlation (cataract severity)

**Astigmatism Validation**:
- ✅ Range check (-10.0 to +10.0)
- ✅ Precision check (2 decimals)
- ✅ Boundary value tests (7 tests)
- ✅ Bilateral asymmetry detection

**Axial Length Validation**:
- ✅ Range check (15.0-35.0)
- ✅ Precision check (2 decimals)
- ⚠️ Boundary value tests incomplete (5/7)
- ⚠️ Medical warnings not implemented

---

## PHI Protection

**Scan Results**: `./scripts/pre-commit-check.sh`

**PHI Violations**:
- None detected ✅

**Checked Patterns**:
- ✅ No patient names in code
- ✅ No dates of birth in logs
- ✅ No MRNs in error messages
- ✅ No identifiable data in commits

---

## Dependency Health

**Command**: `yarn audit`

**Result**:
- Critical vulnerabilities: {critical_count}
- High vulnerabilities: {high_count}
- Moderate vulnerabilities: {moderate_count}
- Low vulnerabilities: {low_count}

**Action Required**: {YES / NO}

---

## Build Status

**Command**: `yarn build`

**Result**:
```
{build_output}
```

**Build Time**: {duration_seconds}s
**Bundle Size**: {bundle_size_kb} KB
**Status**: {SUCCESS / FAILED}

---

## Recent Commits

| Commit | Author | Message | Quality Gate |
|--------|--------|---------|--------------|
| abc123 | AGENT-XXX | Add BCVA validation | ✅ GREEN |
| def456 | AGENT-YYY | Implement bilateral input | ✅ GREEN |
| ghi789 | AGENT-ZZZ | Create pre-surgery form | ✅ GREEN |

---

## Recommendations

### Priority: Critical
- Fix TypeScript errors in {file_path}
- Add missing tests for {module}
- Increase coverage for {file_path} to ≥90%

### Priority: High
- Refactor {file_path} to reduce complexity
- Add boundary value tests for {validator}
- Implement medical warnings for {field}

### Priority: Medium
- Update dependencies with vulnerabilities
- Improve test suite performance
- Add integration tests for {feature}

---

## Trend Analysis

### Last 7 Days

| Date | TS Errors | Lint Issues | Coverage | Tests Passing |
|------|-----------|-------------|----------|---------------|
| 10-10 | 0 | 0 | 85% | 100% |
| 10-09 | 2 | 1 | 83% | 98% |
| 10-08 | 5 | 3 | 80% | 95% |
| 10-07 | 8 | 5 | 78% | 92% |
| 10-06 | 10 | 7 | 75% | 90% |
| 10-05 | 12 | 10 | 72% | 88% |
| 10-04 | 15 | 12 | 70% | 85% |

**Trend**: ⬆️ Improving (quality metrics increasing)

---

## Next Actions

1. Fix TypeScript errors (0 errors required)
2. Add missing boundary tests (axialLength)
3. Increase medical logic coverage to ≥90%
4. Run full quality gate: `./scripts/quality-gate.sh`
5. Clean up ephemeral files: `./scripts/agent-cleanup.sh`
6. Ready for commit when all GREEN ✅

---

**NOTE**: This file is auto-generated and ephemeral. Do not commit to Git.
**Cleanup**: Run `./scripts/agent-cleanup.sh` before committing.
