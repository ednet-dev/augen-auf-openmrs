---
description: Accept contract change and migrate all affected code
argument-hint: <change-id>
allowed-tools: Read, Write, Edit, Bash(./scripts/contract-migrate.sh*), Bash(git*)
model: sonnet
---

# Contract Accept

**Purpose**: Accept proposed contract change and update all affected code

**Arguments**: `$1` - Change ID (e.g., CHANGE-001)

STARTER_SYMBOL=✅

---

## Process

### 1. Verify Change Exists

```bash
if ! grep -q "## $1:" contracts/CHANGES.md; then
  echo "❌ Change not found: $1"
  exit 1
fi
```

### 2. Apply Contract Change

Extract change from CHANGES.md and apply to contract file.

### 3. Bump Version

```typescript
// contracts/foundation/validation.ts
/**
 * @version 1.0.0 → 1.1.0 (additive)
 * @version 1.0.0 → 2.0.0 (breaking)
 */
```

### 4. Migrate Affected Code

```bash
./scripts/contract-migrate.sh $1
```

**Agent updates**:
- All files importing changed contract
- Update type annotations
- Update function signatures
- Add TODO for deprecated methods (if breaking)

### 5. Run Tests

```bash
./scripts/test.sh all
```

**Must pass**: All tests after migration

### 6. Update CHANGES.md

```markdown
## $1: ...
**Status**: 🟡 Pending Review → ✅ Accepted → ✅ Complete

**Accepted**: $(date -Iseconds)
**Accepted by**: Contract Owner
**Migrated**: All affected code updated
**Tests**: ✅ All passing
**Version**: Old → New
```

### 7. Commit

```bash
git add contracts/ src/
git commit -m "Accept contract change: $1

Updated contract and migrated all affected code.

Changes:
- Contract: [version change]
- Affected files: [count] files updated
- Tests: All passing

See: contracts/CHANGES.md#$1

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

### 8. Notify Consumers

Update BACKLOG.md:
```markdown
✅ CONTRACT CHANGE $1: ACCEPTED

Contract: [path]
Version: Old → New
Migration: Complete
Tests: Passing

**Action for consumers**:
git pull origin main
# Code already migrated by agents
# Review and test locally
```

---

## Output

Status: ✅ Accepted
Migration: Complete
Tests: ✅ Passing
Version: Bumped
Consumers: Notified
