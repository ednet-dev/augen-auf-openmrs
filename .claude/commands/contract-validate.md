---
description: Validate implementation matches contract specification
argument-hint: <stream>
allowed-tools: Bash(./scripts/contract-validate.sh*), Read
model: sonnet
---

# Contract Validate

**Purpose**: Verify implementation adheres to published contracts

**Arguments**: `$1` - Stream name (foundation, layout, forms, workflows)

STARTER_SYMBOL=🔍

---

## Process

### 1. Run Validation Script

```bash
./scripts/contract-validate.sh $1
```

**Checks**:
- All contract exports implemented
- Types match exactly
- No breaking changes from contract
- Version compatibility

### 2. Display Results

**If compliant**:
```markdown
✅ CONTRACT COMPLIANCE: PASSED

Stream: $1
Contracts validated:
- contracts/$1/*.ts → All exports present
- Type compatibility → 100%
- Breaking changes → None

Ready to proceed.
```

**If violations**:
```markdown
❌ CONTRACT COMPLIANCE: FAILED

Stream: $1

Violations:
- Missing export: validateBCVA (required by contracts/foundation/validation.ts)
- Type mismatch: BilateralData<T> expects generic, got BilateralData<any>
- Breaking change: Removed optional property 'allowCopy'

Fix violations before committing.
```

---

## Use Cases

**Before commit**: Ensure implementation matches contracts
**After pull**: Verify new contracts don't break your code
**Before push**: Final compliance check

---

## Output

Compliance status: ✅ or ❌
Violations list (if any)
