---
description: Define new contract interface for stream boundary
argument-hint: <stream> <contract-name>
allowed-tools: Write, Bash(git*)
model: sonnet
---

# Contract Define

**Purpose**: Generate contract template for stream interface

**Arguments**: 
- `$1` - Stream name (foundation, layout, forms, workflows)
- `$2` - Contract name (validation, navigation-api, form-api, etc.)

STARTER_SYMBOL=📝

---

## Process

### 1. Create Contract File

```bash
mkdir -p contracts/$1
```

**File**: `contracts/$1/$2.ts`

**Template**:
```typescript
/**
 * $2 Contract
 * 
 * @description [Purpose of this contract]
 * @version 1.0.0
 * @status DRAFT
 * @owner Dev X (Stream $1)
 * @consumers [List consuming streams]
 */

export interface $2Interface {
  /**
   * [Method description]
   * 
   * @param arg1 - Description
   * @returns Description
   * @example
   * ```typescript
   * // Usage example
   * ```
   */
  methodName(arg1: Type): ReturnType;
}

// Add types, constants, helpers as needed
```

### 2. Add to Git

```bash
git add contracts/$1/$2.ts
git commit -m "Define $2 contract for stream $1

Contract defines interfaces for downstream consumers.
Status: DRAFT (pending review)

See: CONTRACTS.md for review protocol

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

### 3. Notify Consumers

Add to BACKLOG.md:
```markdown
🔍 REVIEW NEEDED: contracts/$1/$2.ts

**Owner**: Dev X (Stream $1)
**Consumers**: [List streams]
**Deadline**: [Date]

Review and provide feedback via BACKLOG.md comments.
```

---

## Output

Created: `contracts/$1/$2.ts`
Status: DRAFT (needs review)
Next: Wait for consumer reviews, then mark FROZEN
