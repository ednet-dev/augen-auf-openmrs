# Contract-First Development Protocol

**Interface negotiation, change management, distributed coordination**

---

## Core Principle

**Negotiate interfaces upfront → Implement in parallel → Renegotiate when needed**

Contracts = TypeScript interfaces defining boundaries between streams

---

## Contract Lifecycle

### 1. Definition Phase (Upfront)

**Who**: Stream owner
**When**: Before implementation begins
**Tool**: `/contract-define <stream> <contract-name>`

```bash
# Example: Stream A defines validation interface
/contract-define foundation validation

# Creates: contracts/foundation/validation.ts
# Contains: TypeScript interface + JSDoc + examples
```

**Output**: `contracts/<stream>/<contract>.ts`

**Requirements**:
- TypeScript interface
- JSDoc documentation
- Usage examples
- Version number (starts at 1.0.0)

---

### 2. Review Phase (Human Negotiation)

**Who**: All affected developers
**When**: After contract definition
**Where**: BACKLOG.md comments or Slack

**Process**:
1. Contract owner pushes to `contracts/<stream>/`
2. Dependent streams pull and review
3. Feedback via BACKLOG.md: "🔍 REVIEW: contracts/foundation/validation.ts"
4. Discussion happens between humans
5. Once agreed, owner marks `STATUS: FROZEN` in contract file

**Template for Feedback**:
```markdown
## Contract Review: contracts/foundation/validation.ts

**Reviewer**: Dev 3 (Stream C)
**Status**: ✅ Approved | ⚠️ Concerns | ❌ Blocked

**Comments**:
- Need `asyncValidate` method for server-side validation
- Consider adding `validateBatch` for multiple values

**Proposed Change**:
[Diff or code snippet]
```

---

### 3. Freeze Phase (Commitment)

**Who**: Contract owner
**When**: After all reviews approved
**Tool**: Manual edit

**Action**: Add to contract file:
```typescript
/**
 * Validation Interface
 * 
 * @version 1.0.0
 * @status FROZEN
 * @frozen-date 2025-10-10
 * @consumers Stream C (forms), Stream D (workflows)
 */
```

**After freeze**:
- ✅ Dependent streams can start implementation
- ❌ No changes allowed without renegotiation

---

### 4. Implementation Phase (Parallel Work)

**Who**: All streams
**When**: After contract freeze
**Tool**: `/contract-validate <stream>`

```bash
# Before each commit
/contract-validate foundation

# Checks:
# - Implementation matches contract
# - All exports present
# - Types compatible
# - No breaking changes
```

**Hooks validate automatically**:
- `validate-contract-compliance.json` runs before commits
- Blocks if implementation diverges from contract

---

### 5. Change Phase (Renegotiation)

**Who**: Any stream needing change
**When**: Contract insufficient during implementation
**Tool**: `/contract-change <contract-path>`

```bash
# Stream D discovers need for async validation
/contract-change contracts/foundation/validation.ts
```

**Process**:
1. **Propose**: Create `CHANGES.md` entry
2. **Notify**: Add "🚨 CONTRACT CHANGE" to BACKLOG.md
3. **Negotiate**: Humans discuss (owner + affected streams)
4. **Decide**: Owner accepts or rejects
5. **Migrate**: If accepted, agents update all code

**Change Types**:
- **Additive** (non-breaking): Add optional method/property
- **Breaking**: Change existing signature, remove method
- **Refactor**: Internal changes, same public API

**Approval Requirements**:
- Additive: Owner approval
- Breaking: Owner + ALL consumers approval
- Refactor: Owner only

---

## Contract Change Management

### CHANGES.md Structure

```markdown
# Contract Changes

## CHANGE-001: Add asyncValidate to Validator

**Proposed**: 2025-10-12 10:30
**Proposed by**: Dev 4 (Stream D)
**Contract**: contracts/foundation/validation.ts
**Type**: Additive (non-breaking)
**Status**: 🟡 Pending Review

**Reason**:
Need server-side validation for BCVA conflicts with existing patient data.

**Affected Streams**:
- Stream C (forms) - uses Validator interface

**Proposed Change**:
\`\`\`diff
export interface Validator<T> {
  validate(value: T): ValidationResult;
+ asyncValidate?(value: T): Promise<ValidationResult>;
}
\`\`\`

**Migration Path**:
Existing code continues to work (optional method).

**Reviews**:
- [ ] Dev 1 (Stream A - owner)
- [ ] Dev 3 (Stream C - consumer)

---

## CHANGE-002: ...
```

### Change Status Flow

```
🟡 Pending Review
  ↓ (all reviews approved)
✅ Accepted
  ↓ (owner commits new contract)
🔄 Migrating (agents update code)
  ↓ (migration complete)
✅ Complete

Or:

🟡 Pending Review
  ↓ (any review rejected)
❌ Rejected
  ↓ (proposer revises)
🟡 Pending Review (revised)
```

---

## Negotiation Protocol

### Scenario 1: Simple Additive Change

```bash
# Day 5: Dev 4 needs async validation
Dev 4: /contract-change contracts/foundation/validation.ts
# CHANGE-001 created in CHANGES.md

Dev 4: (BACKLOG.md comment)
"🚨 CONTRACT CHANGE-001: Need asyncValidate for server-side checks"

Dev 1: (Reviews CHANGE-001)
Dev 1: "✅ Approved - optional method, non-breaking"
Dev 1: /contract-accept CHANGE-001

# Git log:
# - contracts/foundation/validation.ts updated (v1.1.0)
# - Agents migrated Stream C and D code
# - All tests still pass

Dev 3: git pull
Dev 3: (Reviews migrated code)
Dev 3: "✅ Looks good, tests pass"
```

### Scenario 2: Breaking Change Negotiation

```bash
# Day 10: Dev 2 wants to change navigation signature
Dev 2: /contract-change contracts/layout/navigation-api.ts
# CHANGE-005 created (BREAKING)

Dev 2: (BACKLOG.md)
"🚨 BREAKING CHANGE-005: NavigateTo needs transition options"

Dev 3: "⚠️ This breaks my patient selection navigation"
Dev 4: "⚠️ This affects workflow transitions"

# Negotiation via Slack:
Dev 2: "What if we make options parameter optional?"
Dev 3: "That works - backward compatible"
Dev 4: "Agree, but need migration time (2 days)"

Dev 2: (Updates CHANGE-005 to make it additive)
Dev 1: (Reviews updated proposal)
Dev 1: "✅ Approved - now non-breaking"
Dev 2: /contract-accept CHANGE-005

# All code migrated, backward compatible
```

### Scenario 3: Change Rejected

```bash
# Day 15: Dev 3 wants major validation overhaul
Dev 3: /contract-change contracts/foundation/validation.ts
# CHANGE-008 created (BREAKING)

Dev 3: (BACKLOG.md)
"🚨 BREAKING CHANGE-008: Replace ValidationResult with Either monad"

Dev 1: "❌ Too disruptive, affects all streams"
Dev 2: "❌ Increases complexity"
Dev 4: "❌ Would need 3 days rework"

Dev 3: "Understood, will keep existing API"
Dev 1: /contract-reject CHANGE-008

# CHANGE-008 marked as REJECTED in CHANGES.md
# No code changes
```

---

## Tooling

### Slash Commands

**`/contract-define <stream> <contract-name>`**
- Generate contract template
- Output: `contracts/<stream>/<contract-name>.ts`

**`/contract-validate <stream>`**
- Validate implementation vs contracts
- Check: exports, types, breaking changes

**`/contract-change <contract-path>`**
- Propose change
- Output: CHANGES.md entry

**`/contract-accept <change-id>`**
- Accept change
- Migrate all affected code

**`/contract-reject <change-id>`**
- Reject change
- Document reason

### Hooks

**`validate-contract-compliance.json`**
- Event: Before commit
- Validate implementation matches contracts

**`detect-contract-breaking-changes.json`**
- Event: Before contract change
- Warn if breaking

### Scripts

**`scripts/contract-validate.sh <stream>`**
- TypeScript validation
- Export checking
- Version compatibility

**`scripts/contract-diff.sh <before> <after>`**
- Generate diff
- Classify changes (additive/breaking)

**`scripts/contract-migrate.sh <change-id>`**
- Update all code using changed contract
- Run tests
- Generate migration report

---

## Best Practices

### Contract Design

✅ **DO**:
- Small, focused contracts (one concern)
- Use TypeScript interfaces
- Document with JSDoc
- Provide examples
- Version contracts (semver)

❌ **DON'T**:
- Large, monolithic contracts
- Implementation details in contracts
- Vague documentation
- No examples

### Negotiation

✅ **DO**:
- Respond within 24 hours
- Provide constructive feedback
- Suggest alternatives
- Consider impact on all streams
- Document decisions

❌ **DON'T**:
- Ignore change proposals
- Reject without explanation
- Make unilateral breaking changes
- Skip migration path

### Change Management

✅ **DO**:
- Prefer additive changes
- Provide migration path
- Update all affected code
- Run full test suite
- Increment version

❌ **DON'T**:
- Break existing code
- Skip migration
- Forget version bump
- Ignore test failures

---

## Contract Templates

### Interface Contract

```typescript
/**
 * [Contract Name]
 * 
 * @description Brief description
 * @version 1.0.0
 * @status FROZEN | DRAFT
 * @frozen-date 2025-10-10 (if frozen)
 * @owner Dev 1 (Stream A)
 * @consumers Stream C, Stream D
 */

export interface MyContract {
  /**
   * Method description
   * @param arg1 - Description
   * @returns Description
   * @example
   * ```typescript
   * myMethod(value);
   * ```
   */
  myMethod(arg1: string): ReturnType;
}
```

### Type Contract

```typescript
/**
 * [Type Name]
 * 
 * @description Brief description
 * @version 1.0.0
 * @status FROZEN
 */

export type MyType = 'option1' | 'option2' | 'option3';

/**
 * Example usage:
 * ```typescript
 * const value: MyType = 'option1';
 * ```
 */
```

---

## Version Policy

**Semver (Semantic Versioning)**:

- **Major (x.0.0)**: Breaking changes
- **Minor (0.x.0)**: Additive changes (new methods/properties)
- **Patch (0.0.x)**: Bug fixes, documentation, refactoring

**Examples**:
- Add optional method: `1.0.0` → `1.1.0` (minor)
- Change method signature: `1.0.0` → `2.0.0` (major)
- Fix JSDoc typo: `1.0.0` → `1.0.1` (patch)

---

## Quick Reference

```bash
# Define contract
/contract-define foundation validation

# Validate implementation
/contract-validate foundation

# Propose change
/contract-change contracts/foundation/validation.ts
# → Edit CHANGES.md entry
# → Notify affected streams via BACKLOG.md

# Accept change (contract owner)
/contract-accept CHANGE-001
# → Agents migrate all code
# → Version bumped

# Reject change (contract owner)
/contract-reject CHANGE-001 "Too disruptive, alternative: ..."

# Check contract status
cat contracts/CHANGES.md | grep "🟡 Pending"
```

---

**Remember**: Contracts enable parallel work. Good contracts = less blocking, faster delivery.
