# Parallel Execution Status

**Started**: {{START_TIME}}
**Stream**: {{STREAM_NAME}}
**Total Tasks**: {{TASK_COUNT}}

---

## Tasks

{{#TASKS}}
- [{{STATUS_EMOJI}}] {{TASK_DESCRIPTION}} → Agent-{{AGENT_ID}} [{{STATUS}}] {{PROGRESS}}
{{/TASKS}}

**Status Legend**:
- [⏳] PENDING - Not started yet
- [🔄] IN_PROGRESS - Currently working
- [✅] COMPLETE - Successfully finished
- [🔴] BLOCKED - Cannot proceed (dependency/error)

---

## Statistics

- **Total**: {{TASK_COUNT}}
- **Complete**: {{COMPLETE_COUNT}}/{{TASK_COUNT}} ({{COMPLETE_PERCENT}}%)
- **In Progress**: {{IN_PROGRESS_COUNT}}/{{TASK_COUNT}} ({{IN_PROGRESS_PERCENT}}%)
- **Blocked**: {{BLOCKED_COUNT}}/{{TASK_COUNT}} ({{BLOCKED_PERCENT}}%)
- **Pending**: {{PENDING_COUNT}}/{{TASK_COUNT}} ({{PENDING_PERCENT}}%)

---

## Performance

- **Started**: {{START_TIME}}
- **Elapsed**: {{ELAPSED_TIME}}
- **Estimated Completion**: {{ETA}}
- **Speedup**: {{SPEEDUP}}x (parallel vs serial)

---

## Blockers

{{#BLOCKERS}}
- **Agent-{{AGENT_ID}}**: {{BLOCKER_REASON}}
{{/BLOCKERS}}

---

## Next Actions

{{#NEXT_ACTIONS}}
- {{ACTION}}
{{/NEXT_ACTIONS}}

---

**Note**: This file is ephemeral and will be auto-deleted after commit.
