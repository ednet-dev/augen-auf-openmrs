# Contract: {{CONTRACT_NAME}}

**Stream**: {{STREAM_NAME}}
**Owner**: {{OWNER_NAME}} (Stream {{STREAM_ID}})
**Version**: {{VERSION}}
**Status**: {{STATUS}}

---

## Purpose

{{CONTRACT_PURPOSE}}

---

## Specification

**File**: `contracts/{{STREAM_NAME}}/{{CONTRACT_FILE}}.ts`

```typescript
{{CONTRACT_INTERFACE}}
```

---

## Consumers

{{#CONSUMERS}}
- **Stream {{CONSUMER_STREAM}}** ({{CONSUMER_NAME}})
  - Uses: {{USAGE_DESCRIPTION}}
  - Dependency: {{DEPENDENCY_TYPE}}
{{/CONSUMERS}}

---

## Examples

### Example 1: Basic Usage

```typescript
{{EXAMPLE_1_CODE}}
```

### Example 2: {{EXAMPLE_2_TITLE}}

```typescript
{{EXAMPLE_2_CODE}}
```

---

## Version History

### v{{VERSION}} - {{VERSION_DATE}}

{{#VERSION_CHANGES}}
- {{CHANGE_TYPE}}: {{CHANGE_DESCRIPTION}}
{{/VERSION_CHANGES}}

---

## Review Checklist

- [ ] Contract owner reviewed
- [ ] All consumers reviewed
- [ ] Examples provided
- [ ] JSDoc complete
- [ ] Breaking changes documented
- [ ] Migration path provided (if breaking)

---

## Status Transitions

- **DRAFT** → (all reviews approved) → **FROZEN**
- **FROZEN** → (change proposal) → **CHANGING**
- **CHANGING** → (change accepted) → **FROZEN v{{NEW_VERSION}}**

---

**Current Status**: {{STATUS}}
**Next Action**: {{NEXT_ACTION}}
