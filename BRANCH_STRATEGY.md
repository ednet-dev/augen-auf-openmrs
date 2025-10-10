# Branch Strategy - Distributed Agents

**Default branch for agentic protocol**: `distributed-main`

---

## Branch Structure

```
main                    # Human-reviewed, production-ready
  ↑
  | (merge after review)
  |
distributed-main        # Agent coordination, distributed work
  ↑
  | (push/pull by agents)
  |
local-agent-1          # Dev 1 workspace
local-agent-2          # Dev 2 workspace
local-agent-3          # Dev 3 workspace
local-agent-4          # Dev 4 workspace
```

---

## Rules

**Agents work on**: `distributed-main`
- Push after quality gate passes
- Pull before claiming tasks
- All distributed coordination happens here

**Humans review**: `main`
- Merge `distributed-main` → `main` after review
- Production deployments from `main`

---

## Setup

```bash
# Create distributed-main
git checkout -b distributed-main
git push -u origin distributed-main

# Set as default for agents
git config branch.distributed-main.remote origin
git config branch.distributed-main.merge refs/heads/distributed-main
```

---

## Agent Workflow

```bash
# Always work on distributed-main
git checkout distributed-main
git pull origin distributed-main --rebase

# Work, commit, push
/claim-task "task"
/tdd-red feature
/tdd-green feature
/quality-gate
git commit -m "..."
git push origin distributed-main

# Other agents sync from distributed-main
git pull origin distributed-main --rebase
```

---

## Human Review Workflow

```bash
# Periodically review distributed-main
git checkout distributed-main
git pull

# Review changes
git log main..distributed-main

# If approved, merge to main
git checkout main
git merge distributed-main --no-ff
git push origin distributed-main
```

---

## Why distributed-main?

**Benefits**:
- Clear separation: agent work vs human-reviewed
- Agents can push freely (after quality gate)
- Humans review before production
- Easy to revert agent work if needed
- CI/CD can run on both branches

**Alternative**: All agents push to main directly
- Faster
- But requires more trust in quality gates
- Less human oversight

---

## Quick Reference

**Agents**:
- Branch: `distributed-main`
- Push: After quality gate
- Pull: Before claiming tasks

**Humans**:
- Review: `distributed-main` → `main`
- Deploy: From `main`

---

## Initial Setup

```bash
# In main repo
git checkout -b distributed-main
git push -u origin distributed-main

# All agent clones/worktrees start from distributed-main
git clone -b distributed-main <repo-url> ~/augen-auf-openmrs-B
git worktree add -b distributed-main ../augen-auf-openmrs-C distributed-main
```

---

## Hook Enforcement

`enforce-distributed-main-branch.json` blocks pushes to wrong branch:

```bash
# Agent tries to push to main
git push origin main
# ❌ BLOCKED: Agents must work on distributed-main

# Agent on correct branch
git checkout distributed-main
git push origin distributed-main
# ✅ Allowed
```

---

## Contract Storage

**Contracts live on**: `distributed-main`

**Why**: Contracts are agent-defined, human-reviewed

**Flow**:
1. Agent defines contract on `distributed-main`
2. Human reviews on `distributed-main`
3. Once approved, contract frozen
4. Eventually merged to `main` with rest of code
