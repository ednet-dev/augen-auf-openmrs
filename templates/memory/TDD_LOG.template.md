# TDD Log: {{FEATURE_NAME}}

**Agent**: {{AGENT_ID}}
**Started**: {{START_TIME}}
**Stream**: {{STREAM_NAME}}

---

## RED Phase - {{RED_TIMESTAMP}}

**Hypothesis**: {{HYPOTHESIS}}

**Test File**: {{TEST_FILE}}

**Expected Error**: {{EXPECTED_ERROR}}

**Result**: {{#RED_SUCCESS}}✅ Failed as expected{{/RED_SUCCESS}}{{#RED_FAIL}}❌ Unexpected outcome{{/RED_FAIL}}

**Actual Error**:
```
{{ACTUAL_ERROR}}
```

**Duration**: {{RED_DURATION}}

---

## GREEN Phase

{{#GREEN_ITERATIONS}}
### Iteration {{ITERATION_NUMBER}} - {{ITERATION_TIMESTAMP}}

**Change Made**: {{CHANGE_DESCRIPTION}}

**Test Result**: {{#TESTS_PASS}}✅ {{PASS_COUNT}}/{{TOTAL_TESTS}} passing{{/TESTS_PASS}}{{#TESTS_FAIL}}❌ {{FAIL_COUNT}}/{{TOTAL_TESTS}} failing{{/TESTS_FAIL}}

**Duration**: {{ITERATION_DURATION}}

{{#TESTS_PASS}}
**Status**: ✅ GREEN - Ready for REFACTOR
{{/TESTS_PASS}}
{{#TESTS_FAIL}}
**Status**: 🔄 Continue iterating
{{/TESTS_FAIL}}

---

{{/GREEN_ITERATIONS}}

## REFACTOR Phase

{{#REFACTOR_PASSES}}
### Pass {{PASS_NUMBER}} - {{PASS_TIMESTAMP}}

**Refactoring**: {{REFACTORING_DESCRIPTION}}

**Type**:
- [ ] Extract function
- [ ] Extract constant
- [ ] Rename variable
- [ ] Simplify logic
- [ ] Remove duplication
- [ ] Improve readability

**Test Result**: {{#TESTS_STILL_PASS}}✅ Tests still passing{{/TESTS_STILL_PASS}}{{#TESTS_BREAK}}❌ Tests broke - REVERT{{/TESTS_BREAK}}

{{#TESTS_STILL_PASS}}
**Commit**: {{COMMIT_SHA}}
{{/TESTS_STILL_PASS}}

**Duration**: {{PASS_DURATION}}

---

{{/REFACTOR_PASSES}}

## Summary

**Total Duration**: {{TOTAL_DURATION}}

**Phases**:
- RED: {{RED_DURATION}}
- GREEN: {{GREEN_DURATION}} ({{GREEN_ITERATION_COUNT}} iterations)
- REFACTOR: {{REFACTOR_DURATION}} ({{REFACTOR_PASS_COUNT}} passes)

**Final Tests**: {{FINAL_TEST_COUNT}} passing

**Commits**: {{COMMIT_COUNT}}

**Medical Validation Coverage**: {{#IS_MEDICAL}}{{COVERAGE_PERCENT}}% (must be 100%){{/IS_MEDICAL}}{{^IS_MEDICAL}}N/A{{/IS_MEDICAL}}

---

## Quality Checklist

- [✅] Test written before code (RED)
- [✅] Test failed with expected error
- [✅] Minimal code made test pass (GREEN)
- [✅] Code refactored while tests stayed green (REFACTOR)
- {{#IS_MEDICAL}}[✅] Boundary values tested{{/IS_MEDICAL}}
- {{#IS_MEDICAL}}[✅] Null/undefined handling tested{{/IS_MEDICAL}}
- {{#IS_MEDICAL}}[✅] Error messages are clear{{/IS_MEDICAL}}
- {{#IS_MEDICAL}}[✅] Medical validation 100% covered{{/IS_MEDICAL}}

---

**Note**: This file is ephemeral and will be auto-deleted after commit.
