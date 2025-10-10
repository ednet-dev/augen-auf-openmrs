---
description: Generate OpenMRS encounter save logic with error handling
scope: project
arguments:
  - name: encounterType
    description: Type of encounter (e.g., "PreSurgeryAssessment", "PostOpFollowUp")
    required: true
---

# OpenMRS Encounter Save Generator

Generate service to save form data as OpenMRS encounter with observations, error handling, and tests.

## Usage

```bash
/encounter-save "{{encounterType}}"
```

## Steps

1. **Define encounter type**
   - File: `src/constants/encounters/{{encounterType}}.ts`
   - UUID for encounter type
   - Associated concepts (observations)

2. **Create save service**
   - File: `src/services/{{encounterType}}Service.ts`
   - Map form data to observations
   - Create encounter payload
   - Handle save errors
   - Offline support (queue if offline)

3. **Write tests**
   - File: `src/services/__tests__/{{encounterType}}Service.test.ts`
   - Mock OpenMRS API
   - Test success scenarios
   - Test error scenarios
   - Test offline queue

4. **Add retry logic**
   - Exponential backoff
   - Network error handling
   - Conflict resolution

## Encounter Structure

```typescript
interface {{encounterType}}Encounter {
  encounterType: string;           // UUID
  patient: string;                 // UUID
  location: string;                // UUID
  encounterDatetime: string;       // ISO 8601
  encounterProviders: Array<{      // Clinician(s)
    provider: string;
    encounterRole: string;
  }>;
  obs: Array<{                     // Observations
    concept: string;               // UUID
    value: number | string | boolean;
    obsDatetime: string;
  }>;
}
```

## Service Template

```typescript
import { openmrsFetch, showNotification } from '@openmrs/esm-framework';

export async function save{{encounterType}}(
  patientUuid: string,
  formData: {{encounterType}}FormData
): Promise<SaveResult> {
  try {
    // 1. Build observations from form data
    const obs = mapFormDataToObservations(formData);

    // 2. Create encounter payload
    const encounterPayload = {
      encounterType: {{encounterType}}_ENCOUNTER_TYPE_UUID,
      patient: patientUuid,
      location: getCurrentLocation(),
      encounterDatetime: new Date().toISOString(),
      encounterProviders: [{
        provider: getCurrentProvider(),
        encounterRole: CLINICIAN_ROLE_UUID
      }],
      obs
    };

    // 3. Save to OpenMRS
    const response = await openmrsFetch('/ws/rest/v1/encounter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encounterPayload)
    });

    // 4. Success notification
    showNotification({
      title: '{{encounterType}} saved',
      kind: 'success',
      description: 'Data saved successfully'
    });

    return { success: true, encounterUuid: response.data.uuid };

  } catch (error) {
    // 5. Error handling
    console.error('Failed to save {{encounterType}}:', error);

    // 6. Queue for offline sync (if network error)
    if (isNetworkError(error)) {
      await queueForOfflineSync(patientUuid, formData);
      showNotification({
        title: 'Saved locally',
        kind: 'warning',
        description: 'Will sync when online'
      });
      return { success: true, offline: true };
    }

    // 7. Show error to user
    showNotification({
      title: 'Save failed',
      kind: 'error',
      description: error.message
    });

    return { success: false, error: error.message };
  }
}

function mapFormDataToObservations(formData: {{encounterType}}FormData): Observation[] {
  const obs: Observation[] = [];

  // Map each form field to OpenMRS observation
  if (formData.leftEye.bcva !== null) {
    obs.push({
      concept: BCVA_LEFT_CONCEPT_UUID,
      value: formData.leftEye.bcva,
      obsDatetime: new Date().toISOString()
    });
  }

  // ... more mappings

  return obs;
}
```

## Error Handling Patterns

### Network Errors
```typescript
if (error.name === 'NetworkError' || error.status === 0) {
  // Queue for offline sync
  await offlineQueue.add(encounterPayload);
  return { success: true, offline: true };
}
```

### Validation Errors (HTTP 400)
```typescript
if (error.status === 400) {
  const validationErrors = parseValidationErrors(error.data);
  return { success: false, validationErrors };
}
```

### Conflict Errors (HTTP 409)
```typescript
if (error.status === 409) {
  // Encounter already exists, prompt for merge/overwrite
  return { success: false, conflict: true, existingUuid: error.data.uuid };
}
```

### Authentication Errors (HTTP 401)
```typescript
if (error.status === 401) {
  // Redirect to login
  redirectToLogin();
  return { success: false, error: 'Authentication required' };
}
```

## Test Template

```typescript
describe('{{encounterType}} Save Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save encounter successfully', async () => {
    const mockResponse = { data: { uuid: 'encounter-uuid' } };
    (openmrsFetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await save{{encounterType}}('patient-uuid', mockFormData);

    expect(result.success).toBe(true);
    expect(result.encounterUuid).toBe('encounter-uuid');
    expect(showNotification).toHaveBeenCalledWith(expect.objectContaining({
      kind: 'success'
    }));
  });

  it('should handle network errors with offline queue', async () => {
    const networkError = new Error('Network error');
    networkError.name = 'NetworkError';
    (openmrsFetch as jest.Mock).mockRejectedValue(networkError);

    const result = await save{{encounterType}}('patient-uuid', mockFormData);

    expect(result.success).toBe(true);
    expect(result.offline).toBe(true);
    expect(showNotification).toHaveBeenCalledWith(expect.objectContaining({
      kind: 'warning'
    }));
  });

  it('should handle validation errors', async () => {
    const validationError = { status: 400, data: { errors: [...] } };
    (openmrsFetch as jest.Mock).mockRejectedValue(validationError);

    const result = await save{{encounterType}}('patient-uuid', mockFormData);

    expect(result.success).toBe(false);
    expect(result.validationErrors).toBeDefined();
  });
});
```

## Offline Support

```typescript
// Queue structure
interface OfflineQueueItem {
  id: string;
  patientUuid: string;
  encounterType: string;
  data: any;
  timestamp: number;
  retries: number;
}

// Queue management
export async function queueForOfflineSync(
  patientUuid: string,
  formData: any
): Promise<void> {
  const queueItem: OfflineQueueItem = {
    id: generateUuid(),
    patientUuid,
    encounterType: '{{encounterType}}',
    data: formData,
    timestamp: Date.now(),
    retries: 0
  };

  await offlineStorage.add(queueItem);
}

// Sync when online
export async function syncOfflineQueue(): Promise<void> {
  const items = await offlineStorage.getAll();

  for (const item of items) {
    try {
      await save{{encounterType}}(item.patientUuid, item.data);
      await offlineStorage.remove(item.id);
    } catch (error) {
      item.retries++;
      if (item.retries < MAX_RETRIES) {
        await offlineStorage.update(item);
      } else {
        // Max retries reached, notify user
        showNotification({
          title: 'Sync failed',
          kind: 'error',
          description: `Failed to sync encounter for patient ${item.patientUuid}`
        });
      }
    }
  }
}
```

## Output Format

```
✅ Generated encounter save service for {{encounterType}}

Files created:
- src/constants/encounters/{{encounterType}}.ts
- src/services/{{encounterType}}Service.ts
- src/services/__tests__/{{encounterType}}Service.test.ts

Functions:
- save{{encounterType}}(patientUuid, formData)
- mapFormDataToObservations(formData)
- queueForOfflineSync(patientUuid, formData)
- syncOfflineQueue()

Error handling:
- Network errors → offline queue
- Validation errors → user feedback
- Conflict errors → merge prompt
- Auth errors → redirect to login

Tests:
- Success scenarios: 3 tests
- Error scenarios: 5 tests
- Offline queue: 4 tests

Total: 12 tests

Next steps:
1. Get encounter type UUID from OpenMRS
2. Run tests: ./scripts/test.sh services/{{encounterType}}
3. Integrate with form component
4. Test offline behavior
5. Quality gate: ./scripts/quality-gate.sh
```

## Example

```bash
/encounter-save "PreSurgeryAssessment"
# Generates:
# - Save service with bilateral data mapping
# - Error handling for all HTTP codes
# - Offline queue with sync logic
# - 12 test cases with MSW mocks
```
