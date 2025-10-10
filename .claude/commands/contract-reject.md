---
description: Reject contract change proposal with reason
argument-hint: <change-id> <reason>
allowed-tools: Edit(contracts/CHANGES.md), Edit(BACKLOG.md), Bash(git*)
model: sonnet
---

# Contract Reject

**Purpose**: Reject proposed contract change with documented reason

**Arguments**: 
- `$1` - Change ID (e.g., CHANGE-001)
- `$ARGUMENTS` - Rejection reason

STARTER_SYMBOL=❌

---

## Process

### 1. Verify Change Exists

```bash
if ! grep -q "## $1:" contracts/CHANGES.md; then
  echo "❌ Change not found: $1"
  exit 1
fi
```

### 2. Update CHANGES.md

```markdown
## $1: ...
**Status**: 🟡 Pending Review → ❌ Rejected

**Rejected**: $(date -Iseconds)
**Rejected by**: Contract Owner
**Reason**: $ARGUMENTS

**Alternative Approaches**:
[Suggest alternatives if applicable]
```

### 3. Update BACKLOG.md

```markdown
❌ CONTRACT CHANGE $1: REJECTED

**Reason**: $ARGUMENTS

**Proposed by**: [Name]
**Rejected by**: Contract Owner

**Next Steps**:
- Proposer can revise and resubmit
- Or use alternative approach
- Or keep existing contract
```

### 4. Commit

```bash
git add contracts/CHANGES.md BACKLOG.md
git commit -m "Reject contract change: $1

Reason: $ARGUMENTS

No code changes. Contract remains at current version.

See: contracts/CHANGES.md#$1

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

---

## Output

Status: ❌ Rejected
Reason: Documented
Proposer: Notified
Contract: Unchanged
