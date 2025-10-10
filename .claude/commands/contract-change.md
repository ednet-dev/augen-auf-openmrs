---
description: Propose change to existing contract (requires negotiation)
argument-hint: <contract-path>
allowed-tools: Read, Write, Edit, Bash(git*)
model: sonnet
---

# Contract Change

**Purpose**: Propose change to existing contract (human negotiation required)

**Arguments**: `$1` - Contract path (e.g., contracts/foundation/validation.ts)

STARTER_SYMBOL=🔄

---

## Process

### 1. Verify Contract Exists

```bash
if [ ! -f "$1" ]; then
  echo "❌ Contract not found: $1"
  exit 1
fi
```

### 2. Generate Change ID

```bash
CHANGE_ID=$(cat contracts/CHANGES.md 2>/dev/null | grep -c "^## CHANGE-" || echo "0")
CHANGE_ID="CHANGE-$(printf "%03d" $((CHANGE_ID + 1)))"
```

### 3. Create CHANGES.md Entry

**File**: `contracts/CHANGES.md`

**Append**:
```markdown
## $CHANGE_ID: [Brief description]

**Proposed**: $(date -Iseconds)
**Proposed by**: [Your Name] (Stream X)
**Contract**: $1
**Type**: 🟡 Pending Classification (Additive/Breaking/Refactor)
**Status**: 🟡 Pending Review

**Reason**:
[Why this change is needed]

**Affected Streams**:
[List streams that use this contract]

**Proposed Change**:
\`\`\`diff
[Show diff or describe change]
\`\`\`

**Migration Path**:
[How existing code will adapt]

**Reviews**:
- [ ] Contract Owner
- [ ] Consumer Stream 1
- [ ] Consumer Stream 2

---

```

### 4. Notify in BACKLOG.md

Add comment:
```markdown
🚨 CONTRACT CHANGE $CHANGE_ID: $1

**Proposed by**: [Your Name]
**Type**: [Additive/Breaking/Refactor]
**Reason**: [Brief reason]
**Affects**: [List affected streams]

**Action Required**:
- Contract owner: Review and accept/reject
- Consumers: Provide feedback

**See**: contracts/CHANGES.md#$CHANGE_ID
```

### 5. Commit Proposal

```bash
git add contracts/CHANGES.md BACKLOG.md
git commit -m "Propose contract change: $CHANGE_ID

Contract: $1
Type: [Additive/Breaking]
Reason: [Brief reason]

Requires review from contract owner and affected streams.

See: contracts/CHANGES.md#$CHANGE_ID

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

---

## Next Steps

**Human negotiation required**:
1. Contract owner reviews CHANGE-$CHANGE_ID
2. Affected streams provide feedback
3. Discussion via BACKLOG.md comments or Slack
4. Owner runs `/contract-accept $CHANGE_ID` or `/contract-reject $CHANGE_ID`

---

## Output

Created: CHANGE-$CHANGE_ID in contracts/CHANGES.md
Status: 🟡 Pending Review
Notification: Added to BACKLOG.md
