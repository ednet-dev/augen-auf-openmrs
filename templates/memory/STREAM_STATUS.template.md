# Work Stream Status

**Updated**: {{TIMESTAMP}}
**Agent**: {{AGENT_ID}}

---

## Stream Progress Overview

| Stream | Tasks | Complete | In Progress | Blocked | Pending |
|--------|-------|----------|-------------|---------|---------|
| STREAM 1: INFRA | {{INFRA_TOTAL}} | {{INFRA_COMPLETE}} | {{INFRA_IN_PROGRESS}} | {{INFRA_BLOCKED}} | {{INFRA_PENDING}} |
| STREAM 2: DATA | {{DATA_TOTAL}} | {{DATA_COMPLETE}} | {{DATA_IN_PROGRESS}} | {{DATA_BLOCKED}} | {{DATA_PENDING}} |
| STREAM 3: LAYOUT | {{LAYOUT_TOTAL}} | {{LAYOUT_COMPLETE}} | {{LAYOUT_IN_PROGRESS}} | {{LAYOUT_BLOCKED}} | {{LAYOUT_PENDING}} |
| STREAM 4: SIDEBAR | {{SIDEBAR_TOTAL}} | {{SIDEBAR_COMPLETE}} | {{SIDEBAR_IN_PROGRESS}} | {{SIDEBAR_BLOCKED}} | {{SIDEBAR_PENDING}} |
| STREAM 5: PATIENT-MGT | {{PATIENT_TOTAL}} | {{PATIENT_COMPLETE}} | {{PATIENT_IN_PROGRESS}} | {{PATIENT_BLOCKED}} | {{PATIENT_PENDING}} |
| STREAM 6: WORKFLOW | {{WORKFLOW_TOTAL}} | {{WORKFLOW_COMPLETE}} | {{WORKFLOW_IN_PROGRESS}} | {{WORKFLOW_BLOCKED}} | {{WORKFLOW_PENDING}} |
| STREAM 7: FORMS | {{FORMS_TOTAL}} | {{FORMS_COMPLETE}} | {{FORMS_IN_PROGRESS}} | {{FORMS_BLOCKED}} | {{FORMS_PENDING}} |
| STREAM 8: PRESURGERY | {{PRESURGERY_TOTAL}} | {{PRESURGERY_COMPLETE}} | {{PRESURGERY_IN_PROGRESS}} | {{PRESURGERY_BLOCKED}} | {{PRESURGERY_PENDING}} |
| STREAM 9: ACTIONS | {{ACTIONS_TOTAL}} | {{ACTIONS_COMPLETE}} | {{ACTIONS_IN_PROGRESS}} | {{ACTIONS_BLOCKED}} | {{ACTIONS_PENDING}} |

---

## Overall Progress

**Total Tasks**: {{TOTAL_TASKS}}
**Completed**: {{COMPLETED_TASKS}}/{{TOTAL_TASKS}} ({{COMPLETION_PERCENT}}%)
**In Progress**: {{IN_PROGRESS_TASKS}}
**Blocked**: {{BLOCKED_TASKS}}
**Remaining**: {{REMAINING_TASKS}}

---

## Active Agents

{{#ACTIVE_AGENTS}}
- **Agent-{{AGENT_ID}}**: {{STREAM_NAME}} - {{TASK_DESCRIPTION}} ({{PROGRESS}}%)
{{/ACTIVE_AGENTS}}

---

## Recently Completed Tasks (Last 10)

{{#RECENT_COMPLETIONS}}
{{COMPLETION_NUMBER}}. {{TASK_DESCRIPTION}} - Agent-{{AGENT_ID}} - {{COMPLETION_TIME}}
{{/RECENT_COMPLETIONS}}

---

## Blocked Tasks Requiring Attention

{{#BLOCKED_TASKS}}
- **Stream {{STREAM_NAME}}**: {{TASK_DESCRIPTION}}
  - **Blocker**: {{BLOCKER_REASON}}
  - **Agent**: Agent-{{AGENT_ID}}
  - **Since**: {{BLOCKED_SINCE}}
{{/BLOCKED_TASKS}}

---

## Dependency Status

**Ready to Start** (dependencies met):
{{#READY_STREAMS}}
- {{STREAM_NAME}}: {{TASK_COUNT}} tasks available
{{/READY_STREAMS}}

**Waiting on Dependencies**:
{{#WAITING_STREAMS}}
- {{STREAM_NAME}}: Waiting for {{DEPENDENCY_STREAM}} to complete
{{/WAITING_STREAMS}}

---

## Recommended Next Actions

{{#RECOMMENDATIONS}}
{{RECOMMENDATION_NUMBER}}. {{RECOMMENDATION_TEXT}}
{{/RECOMMENDATIONS}}

---

## Quality Gate Status

| Check | Status |
|-------|--------|
| Tests | {{#TESTS_PASS}}✅ All passing{{/TESTS_PASS}}{{^TESTS_PASS}}❌ {{FAILING_TEST_COUNT}} failing{{/TESTS_PASS}} |
| Types | {{#TYPES_CLEAN}}✅ 0 errors{{/TYPES_CLEAN}}{{^TYPES_CLEAN}}❌ {{TYPE_ERROR_COUNT}} errors{{/TYPES_CLEAN}} |
| Lint | {{#LINT_CLEAN}}✅ 0 issues{{/LINT_CLEAN}}{{^LINT_CLEAN}}❌ {{LINT_ISSUE_COUNT}} issues{{/LINT_CLEAN}} |
| Medical Coverage | {{#MEDICAL_COVERAGE_COMPLETE}}✅ 100%{{/MEDICAL_COVERAGE_COMPLETE}}{{^MEDICAL_COVERAGE_COMPLETE}}❌ {{MEDICAL_COVERAGE_PERCENT}}%{{/MEDICAL_COVERAGE_COMPLETE}} |

---

**Note**: This file is ephemeral and will be auto-deleted after commit.
