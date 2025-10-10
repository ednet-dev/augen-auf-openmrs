# Quick Start - 4 Developers in Parallel

**Goal**: 2-3x faster development using 4 Claude Code instances on `distributed-main` branch

---

## Setup (5 minutes)

```bash
# Clone repo 4 times on distributed-main branch
cd ~/projects/playground
git clone -b distributed-main augen-auf-openmrs augen-auf-openmrs-A
git clone -b distributed-main augen-auf-openmrs augen-auf-openmrs-B
git clone -b distributed-main augen-auf-openmrs augen-auf-openmrs-C
git clone -b distributed-main augen-auf-openmrs augen-auf-openmrs-D

# Open 4 terminals
# Terminal 1: cd augen-auf-openmrs-A  (Stream A: Foundation)
# Terminal 2: cd augen-auf-openmrs-B  (Stream B: Layout & Nav)
# Terminal 3: cd augen-auf-openmrs-C  (Stream C: Forms & Patients)
# Terminal 4: cd augen-auf-openmrs-D  (Stream D: Workflows)
```

---

## Daily Routine

### Morning (All Agents)

```bash
git pull origin distributed-main
cat BACKLOG.md | grep "- \[ \]" | head -20
```

### Assign Streams (Contract-First)

```
Dev 1 (A) → Stream A: Foundation (INFRA + DATA) - Week 1
Dev 2 (B) → Stream B: Layout & Nav (LAYOUT + SIDEBAR) - Week 2-3
Dev 3 (C) → Stream C: Forms & Patients (FORMS + PATIENT-MGT) - Week 2-4
Dev 4 (D) → Stream D: Workflows (WORKFLOW + PRESURGERY + ACTIONS) - Week 3-6
```

**See**: [STREAM_PARTITIONING.md](./STREAM_PARTITIONING.md) for dependencies

### Work Loop (Each Agent)

```bash
# 1. Claim
/claim-task "task description"

# 2. TDD
/tdd-red feature
/tdd-green feature

# 3. Quality
/quality-gate

# 4. Push
./scripts/agent-cleanup.sh
git add . && git commit -m "Add X to Y"
git push origin distributed-main

# 5. Sync others
# (Switch to other terminals)
git pull origin distributed-main --rebase

# 6. Repeat
```

---

## Rules

✅ **DO**
- Sync before claiming
- Push after completing
- Choose independent streams
- Run quality gate

❌ **DON'T**
- Edit same files
- Hoard commits locally
- Skip quality gate
- Commit ephemeral files

---

## Conflict? (Rare)

```bash
git pull origin distributed-main --rebase
# Resolve conflicts
git push origin distributed-main
```

---

## Example (2 hours)

| Time  | Agent A      | Agent B       | Agent C        |
|-------|--------------|---------------|----------------|
| 10:00 | Claim task 1 | Claim task 1  | Claim task 1   |
| 10:30 | Push ✅      | Push ✅       | Push ✅        |
| 10:32 | Pull, task 2 | Pull, task 2  | Pull, task 2   |
| 11:00 | Push ✅      | Push ✅       | Push ✅        |
| 11:02 | Pull, task 3 | Pull, task 3  | Pull, task 3   |
| 11:30 | Push ✅      | Push ✅       | Push ✅        |
| 12:00 | **9 tasks done in 2 hours** (vs 3 tasks with 1 agent) |

---

**Speedup**: 2-3x faster

**See**: [DISTRIBUTED_WORKFLOW.md](./DISTRIBUTED_WORKFLOW.md) for full guide
