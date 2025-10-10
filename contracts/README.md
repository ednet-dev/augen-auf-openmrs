# Contracts Directory

**Contract-first development: Define interfaces upfront, implement in parallel**

---

## Structure

```
contracts/
├── foundation/      # Stream A (Dev 1)
│   ├── types.ts
│   ├── validation.ts
│   ├── concepts.ts
│   └── test-utils.ts
├── layout/          # Stream B (Dev 2)
│   ├── navigation-api.ts
│   ├── layout-slots.ts
│   └── filter-state.ts
├── forms/           # Stream C (Dev 3)
│   ├── form-api.ts
│   ├── validation-hooks.ts
│   └── patient-selection.ts
├── workflows/       # Stream D (Dev 4)
│   ├── state-machine.ts
│   ├── encounter-api.ts
│   └── export-api.ts
└── CHANGES.md       # Contract change proposals
```

---

## Contract Status

| Stream | Contract | Version | Status | Consumers |
|--------|----------|---------|--------|-----------|
| foundation | types.ts | - | ⏳ Not started | B, C, D (all) |
| foundation | validation.ts | - | ⏳ Not started | C, D |
| foundation | concepts.ts | - | ⏳ Not started | B, C, D |
| foundation | test-utils.ts | - | ⏳ Not started | B, C, D |
| layout | navigation-api.ts | - | ⏳ Not started | C, D |
| layout | layout-slots.ts | - | ⏳ Not started | D |
| layout | filter-state.ts | - | ⏳ Not started | C |
| forms | form-api.ts | - | ⏳ Not started | D |
| forms | validation-hooks.ts | - | ⏳ Not started | D |
| forms | patient-selection.ts | - | ⏳ Not started | D |
| workflows | state-machine.ts | - | ⏳ Not started | None |
| workflows | encounter-api.ts | - | ⏳ Not started | None |
| workflows | export-api.ts | - | ⏳ Not started | None |

**Status Legend**:
- ⏳ Not started
- 🟡 DRAFT (under review)
- ✅ FROZEN (ready for use)
- 🔄 CHANGING (proposal pending)

---

## Workflow

### 1. Define Contract

```bash
/contract-define foundation validation
# Creates: contracts/foundation/validation.ts (DRAFT)
```

### 2. Review

```markdown
Consumers review via BACKLOG.md comments.
Owner marks FROZEN when approved.
```

### 3. Implement

```bash
Dependent streams import and use contracts.
Hooks validate compliance before commit.
```

### 4. Change (If Needed)

```bash
/contract-change contracts/foundation/validation.ts
# Creates: CHANGES.md entry
# Humans negotiate
# Owner accepts/rejects
```

---

**See**: 
- [CONTRACTS.md](../CONTRACTS.md) - Full protocol
- [STREAM_PARTITIONING.md](../STREAM_PARTITIONING.md) - Stream dependencies
