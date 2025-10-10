---
description: Generate OpenMRS concept mapping boilerplate
scope: project
arguments:
  - name: conceptName
    description: Name of the medical concept (e.g., "Astigmatism", "CataractType")
    required: true
---

# OpenMRS Concept Mapper

Generate TypeScript types, constants, and API integration for OpenMRS concepts.

## Usage

```bash
/openmrs-concept "{{conceptName}}"
```

## Steps

1. **Create concept constants**
   - File: `src/constants/concepts/{{conceptName}}.ts`
   - UUID placeholders (to be filled from OpenMRS instance)
   - Concept metadata (name, datatype, class)

2. **Generate TypeScript types**
   - File: `src/types/{{conceptName}}.ts`
   - Interface for concept data
   - Validation types

3. **Create API service**
   - File: `src/services/{{conceptName}}Service.ts`
   - Fetch concept from OpenMRS
   - Save observation to encounter
   - Update observation

4. **Write tests**
   - File: `src/services/__tests__/{{conceptName}}Service.test.ts`
   - Mock OpenMRS API responses
   - Test CRUD operations

5. **Document mapping**
   - Update: `docs/openmrs-concepts.md`
   - Add concept to table with UUID, datatype, class

## Template Structure

```typescript
// Concept Constants
export const {{conceptName}}_CONCEPT_UUID = 'TODO: Get from OpenMRS';
export const {{conceptName}}_CONCEPT_NAME = '{{conceptName}}';
export const {{conceptName}}_DATATYPE = 'Numeric' | 'Text' | 'Coded';

// Type Interface
export interface {{conceptName}}Concept {
  uuid: string;
  value: number | string;
  obsDatetime: string;
  encounter?: string;
}

// API Service
export async function save{{conceptName}}(
  patientUuid: string,
  encounterUuid: string,
  value: number | string
): Promise<{{conceptName}}Concept> {
  // Implementation
}
```

## OpenMRS Datatypes

- **Numeric**: Measurements (BCVA, astigmatism, axial length)
- **Coded**: Select from predefined values (cataract types, anesthesia)
- **Text**: Free text (notes, comments)
- **Boolean**: Yes/No (pseudophakie, surgery needed)
- **Date**: Date values (surgery date)

## Validation

Each concept includes:
- **Range validation** (min/max for Numeric)
- **Required field check**
- **Unit conversion** (if applicable)
- **Type coercion** (string→number)

## Output Format

```
✅ Generated OpenMRS concept mapping for {{conceptName}}

Files created:
- src/constants/concepts/{{conceptName}}.ts
- src/types/{{conceptName}}.ts
- src/services/{{conceptName}}Service.ts
- src/services/__tests__/{{conceptName}}Service.test.ts

Updated:
- docs/openmrs-concepts.md

Next steps:
1. Get concept UUID from OpenMRS instance
2. Update UUID in constants file
3. Run tests: ./scripts/test.sh services/{{conceptName}}
4. Integrate with form component
```

## Example

```bash
/openmrs-concept "Astigmatism"
# Generates:
# - AstigmatismConcept type
# - ASTIGMATISM_CONCEPT_UUID constant
# - saveAstigmatism() service
# - Tests with MSW mocks
```
