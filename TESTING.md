# Testing Guide - OpenMRS Development Environment

This guide explains how to test the Augen Auf module in an OpenMRS development environment.

## Prerequisites

- Node.js 18+ and Yarn installed
- Docker and Docker Compose (for running OpenMRS backend)
- Git

## Option 1: Using OpenMRS Dev3 (Recommended for Development)

### Step 1: Set Up OpenMRS Backend

The easiest way is to use the OpenMRS SDK or Docker:

#### Using Docker

```bash
# Clone the OpenMRS reference application
git clone https://github.com/openmrs/openmrs-distro-referenceapplication.git
cd openmrs-distro-referenceapplication

# Start OpenMRS with Docker
docker-compose up -d

# Wait for OpenMRS to start (check logs)
docker-compose logs -f
```

OpenMRS will be available at: `http://localhost:8080/openmrs`

Default credentials:
- Username: `admin`
- Password: `Admin123`

#### Using OpenMRS SDK

```bash
# Install OpenMRS SDK
npm install -g openmrs

# Setup a server
openmrs-sdk setup

# Start the server
openmrs-sdk run
```

### Step 2: Set Up the Frontend Development Environment

```bash
# Navigate to your project directory
cd augen-auf-openmrs

# Install dependencies
yarn install

# Configure the backend URL
# Create or edit .env file
echo "OPENMRS_API_URL=http://localhost:8080/openmrs" > .env
```

### Step 3: Run the Module in Dev Mode

```bash
# Start the development server
npx openmrs develop

# The module will be available at http://localhost:8080/
```

When prompted, select your module from the list.

### Step 4: Access the Module

1. Navigate to: `http://localhost:8080/openmrs/spa`
2. Log in with admin credentials
3. Access the Surgery Workflow page at: `http://localhost:8080/openmrs/spa/surgery-workflow`

## Option 2: Using O3 Dev Environment

### Step 1: Clone the O3 Reference Application

```bash
git clone https://github.com/openmrs/openmrs-esm-core.git
cd openmrs-esm-core
```

### Step 2: Install Dependencies

```bash
yarn install
yarn setup
```

### Step 3: Link Your Module

```bash
# From your module directory
cd /path/to/augen-auf-openmrs

# Build the module
yarn build

# Link it to the O3 environment
cd /path/to/openmrs-esm-core
yarn workspace @openmrs/esm-app-shell add file:/path/to/augen-auf-openmrs
```

### Step 4: Run the Dev Server

```bash
yarn run:omrs develop
```

## Setting Up Test Data

### Quick Setup (Recommended)

The module comes with hardcoded UUIDs and a seeding script. Run it to set up everything:

```bash
# Seed data into your OpenMRS instance
./scripts/seed-openmrs-data.sh

# For dev3.openmrs.org (default)
OPENMRS_API_URL=https://dev3.openmrs.org/openmrs ./scripts/seed-openmrs-data.sh

# For local OpenMRS
OPENMRS_API_URL=http://localhost:8080/openmrs \
OPENMRS_USERNAME=admin \
OPENMRS_PASSWORD=Admin123 \
./scripts/seed-openmrs-data.sh
```

This creates:
- 5 workflow stage encounter types (with predefined UUIDs)
- 1 "Needs Surgery" concept
- 3 protocol encounter types

**The module will work immediately after seeding!**

### Manual Setup (Alternative)

If the seeding script doesn't work or you prefer manual setup, see [CONFIGURATION.md](./CONFIGURATION.md) for detailed instructions.

### Create Test Patients

Via REST API:

```bash
curl -X POST "http://localhost:8080/openmrs/ws/rest/v1/patient" \
  -H "Content-Type: application/json" \
  -u admin:Admin123 \
  -d '{
    "person": {
      "names": [
        {
          "givenName": "Test",
          "familyName": "Patient"
        }
      ],
      "gender": "M",
      "birthdate": "1980-01-01"
    },
    "identifiers": [
      {
        "identifier": "TEST001",
        "identifierType": "05a29f94-c0ed-11e2-94be-8c13b969e334",
        "location": "8d6c993e-c2cc-11de-8d13-0010c6dffd0f"
      }
    ]
  }'
```

Or use the OpenMRS UI:
1. Go to: Register Patient
2. Fill in patient details
3. Save

### Create Test Encounters

```bash
# Create a registration encounter for the test patient
curl -X POST "http://localhost:8080/openmrs/ws/rest/v1/encounter" \
  -H "Content-Type: application/json" \
  -u admin:Admin123 \
  -d '{
    "patient": "PATIENT-UUID-HERE",
    "encounterType": "REGISTRATION-ENCOUNTER-TYPE-UUID-HERE",
    "location": "8d6c993e-c2cc-11de-8d13-0010c6dffd0f",
    "encounterDatetime": "2025-01-15T10:00:00.000+0000"
  }'
```

## Testing Workflow Transitions

### Manual Testing Steps

1. **Test Patient Search**
   - Enter a patient name in the search box
   - Verify patients appear in the list

2. **Test Workflow Stage Filtering**
   - Click on different workflow stages
   - Verify only patients in that stage appear

3. **Test Moving Patients Between Stages**
   - Select a patient
   - Click the overflow menu (three dots)
   - Select a different stage
   - Verify the encounter is created:
     ```bash
     curl "http://localhost:8080/openmrs/ws/rest/v1/encounter?patient=PATIENT-UUID&v=full" \
       -u admin:Admin123
     ```

4. **Test "Move to Next Stage" Button**
   - Select a patient
   - Click the "Move to [Stage]" button in the action bar
   - Verify the patient moves to the next stage

5. **Test "Needs Surgery" Filter**
   - First, mark a patient as needing surgery:
     ```bash
     curl -X POST "http://localhost:8080/openmrs/ws/rest/v1/obs" \
       -H "Content-Type: application/json" \
       -u admin:Admin123 \
       -d '{
         "person": "PATIENT-UUID",
         "concept": "NEEDS-SURGERY-CONCEPT-UUID",
         "obsDatetime": "2025-01-15T10:00:00.000+0000",
         "value": true
       }'
     ```
   - Click "Needs Surgery" in the workflow filter
   - Verify only patients marked as needing surgery appear

## Configuration Validation

Check the browser console for validation messages when the module loads:

```
✓ Configuration validation passed
No issues found. All configuration values are set correctly.
```

Or if there are issues:

```
✗ Configuration validation failed

Errors:
  • Workflow stage 'registration' is missing 'encounterTypeUuid'
  • 'needsSurgeryConceptUuid' is not configured

Warnings:
  • Protocol 'protocol-1' is missing 'formUuid' - forms will not be displayed
```

### Get Configuration Summary

In the browser console, run:

```javascript
// Access the config validation utility
import { getConfigSummary, validateConfig } from './src/utils/config-validation';

// Get your config (from React DevTools or component state)
const config = /* your config */;

// Print summary
console.log(getConfigSummary(config));

// Get detailed validation
console.log(validateConfig(config));
```

## Debugging

### Enable Debug Logging

Add this to your browser console:

```javascript
localStorage.setItem('openmrs:devtools', 'true');
localStorage.setItem('openmrs:spa:debug', 'true');
```

Reload the page to see detailed debug information.

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "rest/v1"
4. Perform actions in the module
5. Inspect the API requests and responses

### Common API Endpoints to Check

- `GET /openmrs/ws/rest/v1/patient?q=test` - Patient search
- `GET /openmrs/ws/rest/v1/encounter?patient={uuid}` - Get patient encounters
- `POST /openmrs/ws/rest/v1/encounter` - Create encounter
- `GET /openmrs/ws/rest/v1/obs?patient={uuid}&concept={uuid}` - Get observations

### Verify Configuration

```bash
# Check current configuration
curl "http://localhost:8080/openmrs/spa/importmap.json" | jq '.imports["@augen-auf/openmrs-esm-augen-auf"]'
```

## Testing with Mock Data

If you can't connect to a real OpenMRS backend, the module will fall back to mock data (see `src/services/patient.service.ts`). The mock data includes 5 test patients with different workflow stages.

To test with mock data:
1. Don't configure any UUIDs
2. The service will catch errors and return mock patients
3. Patient list operations will work with mock data
4. Stage transitions won't persist (they'll fail gracefully)

## Performance Testing

### Test with Many Patients

Create multiple test patients:

```bash
# Script to create 50 test patients
for i in {1..50}; do
  curl -X POST "http://localhost:8080/openmrs/ws/rest/v1/patient" \
    -H "Content-Type: application/json" \
    -u admin:Admin123 \
    -d "{
      \"person\": {
        \"names\": [{\"givenName\": \"Patient\", \"familyName\": \"$i\"}],
        \"gender\": \"M\",
        \"birthdate\": \"1980-01-01\"
      },
      \"identifiers\": [{
        \"identifier\": \"TEST$(printf %03d $i)\",
        \"identifierType\": \"05a29f94-c0ed-11e2-94be-8c13b969e334\",
        \"location\": \"8d6c993e-c2cc-11de-8d13-0010c6dffd0f\"
      }]
    }"
  sleep 0.5
done
```

## Integration Tests

### Running Tests

```bash
# Run unit tests
yarn test

# Run integration tests (if configured)
yarn test:integration

# Run E2E tests (if configured)
yarn test:e2e
```

### Writing Tests

Create test files in `src/__tests__/`:

```typescript
import { validateConfig } from '../utils/config-validation';

describe('Config Validation', () => {
  it('should validate correct config', () => {
    const config = {
      workflowStages: [
        {
          id: 'registration',
          label: 'Registration',
          color: '#E0E0E0',
          encounterTypeUuid: '12345678-1234-1234-1234-123456789012'
        }
      ],
      needsSurgeryConceptUuid: '12345678-1234-1234-1234-123456789012',
      protocols: {},
      dateFilters: {}
    };

    const result = validateConfig(config);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

## Troubleshooting

### Module Not Loading

1. Check that the module is built: `ls dist/`
2. Verify importmap includes your module
3. Check browser console for errors
4. Ensure backend is running and accessible

### API Requests Failing

1. Check CORS settings in OpenMRS
2. Verify authentication cookies are set
3. Check backend logs: `docker-compose logs -f`
4. Try API requests directly with curl

### Configuration Not Working

1. Clear browser cache and localStorage
2. Check that config.json is being loaded
3. Verify UUID format (with hyphens)
4. Check configuration validation logs in console

### Forms Not Displaying

1. Verify Form Builder module is installed
2. Check form UUIDs are correct
3. Ensure form engine library is loaded
4. Check for console errors related to forms

## Next Steps

After successful testing:
1. Document any bugs or issues found
2. Set up automated tests
3. Prepare for deployment
4. Train end users

## Resources

- [OpenMRS REST API Documentation](https://rest.openmrs.org/)
- [OpenMRS 3.0 Frontend Developer Guide](https://openmrs.github.io/openmrs-esm-core/)
- [Form Builder Documentation](https://wiki.openmrs.org/display/projects/Form+Builder)
- [OpenMRS SDK Documentation](https://wiki.openmrs.org/display/docs/OpenMRS+SDK)
