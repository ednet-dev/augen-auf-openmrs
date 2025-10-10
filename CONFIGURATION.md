# Configuration Guide

This guide explains how to configure the Augen Auf OpenMRS module to work with your OpenMRS instance.

## Quick Start (Recommended)

The module comes with **hardcoded default UUIDs** that are ready to use. To set up a new OpenMRS instance:

```bash
# Run the seeding script to create all required data
./scripts/seed-openmrs-data.sh

# Or with custom API URL
OPENMRS_API_URL=https://your-server.com/openmrs ./scripts/seed-openmrs-data.sh
```

This will create:
- 5 workflow stage encounter types
- 1 "Needs Surgery" concept
- 3 protocol encounter types

The module will work immediately after seeding!

## Prerequisites

- OpenMRS 3.x instance running
- Admin access to OpenMRS
- Form Builder module installed (for protocol forms)
- curl and jq installed (for seeding script)

## Configuration Overview

The module uses predefined UUIDs (configured in `src/config-schema.ts`):

1. **Encounter Type UUIDs** - For tracking workflow stages
2. **Concept UUIDs** - For patient attributes (needs surgery)
3. **Form UUIDs** - For protocol forms (optional, created manually)
4. **Location UUID** (optional) - For encounter locations

### Default UUIDs

**Workflow Stages:**
- Registration: `aa001100-1234-5678-90ab-000000000001`
- Refraction: `aa001100-1234-5678-90ab-000000000002`
- Eye Exam: `aa001100-1234-5678-90ab-000000000003`
- Therapy: `aa001100-1234-5678-90ab-000000000004`
- Finished: `aa001100-1234-5678-90ab-000000000005`

**Concepts:**
- Needs Surgery: `aa002200-1234-5678-90ab-000000000002`

**Protocol Encounter Types:**
- Pre-Surgery: `aa003300-1234-5678-90ab-000000000011`
- Intra-Surgery: `aa003300-1234-5678-90ab-000000000012`
- Post-Surgery: `aa003300-1234-5678-90ab-000000000013`

## Manual Setup (Alternative)

If you prefer to create encounter types and concepts manually or need different UUIDs:

### Step 1: Create Encounter Types

Each workflow stage needs a corresponding encounter type in OpenMRS.

#### How to Create Encounter Types Manually

1. Log in to OpenMRS as admin
2. Navigate to: **System Administration → Advanced Administration → Manage Encounter Types**
3. Click **"Add Encounter Type"**
4. For each encounter type:
   - **Name**: Enter the name (e.g., "Augen Auf Registration")
   - **Description**: Enter a description
   - Click **"Save"**
5. After saving, click on the encounter type to view its details
6. **Copy the UUID** from the URL or the page
7. Update `src/config-schema.ts` with the new UUID

**Note:** If you use different UUIDs, you must update `src/config-schema.ts` and rebuild the module.

## Step 2: Create the "Needs Surgery" Concept

This concept is used to flag patients who need surgery.

### How to Create the Concept

1. Navigate to: **System Administration → Advanced Administration → Manage Concepts**
2. Click **"Add Concept"**
3. Fill in the details:
   - **Fully Specified Name**: "Needs Surgery"
   - **Short Name**: "Needs Surgery"
   - **Data Type**: Select **"Boolean"**
   - **Class**: Select **"Finding"** or **"Misc"**
4. Click **"Save"**
5. **Copy the UUID** from the concept details page

### Alternative: Use Existing Concept

If you have an existing Boolean concept for surgery indication, you can use that UUID instead.

## Step 3: Create Protocol Forms

Use the OpenMRS Form Builder to create forms for each protocol.

### Required Forms

1. **Pre-Surgery Protocol** - Pre-operative assessment
2. **Intra-Surgery Protocol** - Surgical procedure documentation
3. **Post-Surgery Protocol** - Post-operative follow-up

### How to Create Forms

1. Navigate to: **System Administration → Form Builder**
2. Click **"Create a new form"**
3. Design your form with the required fields
4. **Important**: Each form should have an associated encounter type
5. Save the form
6. **Copy the Form UUID** and **Encounter Type UUID**

### Form Structure Example

For the Pre-Surgery Protocol, you might include:
- Patient vitals
- Medical history questions
- Pre-operative checklist
- Consent documentation

## Step 4: Configure the Module

Once you have all the UUIDs, configure the module using one of these methods:

### Method 1: Frontend Configuration (Recommended)

Create or edit your `config.json` file in your OpenMRS frontend configuration:

```json
{
  "@augen-auf/openmrs-esm-augen-auf": {
    "workflowStages": [
      {
        "id": "registration",
        "label": "Registration",
        "color": "#E0E0E0",
        "encounterTypeUuid": "PUT-YOUR-REGISTRATION-ENCOUNTER-UUID-HERE"
      },
      {
        "id": "refraction",
        "label": "Refraction",
        "color": "#C0C0C0",
        "encounterTypeUuid": "PUT-YOUR-REFRACTION-ENCOUNTER-UUID-HERE"
      },
      {
        "id": "eye-exam",
        "label": "Eye Exam",
        "color": "#A0A0A0",
        "encounterTypeUuid": "PUT-YOUR-EYE-EXAM-ENCOUNTER-UUID-HERE"
      },
      {
        "id": "therapy",
        "label": "Therapy",
        "color": "#808080",
        "encounterTypeUuid": "PUT-YOUR-THERAPY-ENCOUNTER-UUID-HERE"
      },
      {
        "id": "finished",
        "label": "Finished",
        "color": "#90EE90",
        "encounterTypeUuid": "PUT-YOUR-FINISHED-ENCOUNTER-UUID-HERE"
      }
    ],
    "needsSurgeryConceptUuid": "PUT-YOUR-NEEDS-SURGERY-CONCEPT-UUID-HERE",
    "surgeryWorkflowConceptUuid": "",
    "protocols": {
      "protocol-1": {
        "name": "Pre-Surgery",
        "formUuid": "PUT-YOUR-PRE-SURGERY-FORM-UUID-HERE",
        "encounterTypeUuid": "PUT-YOUR-PRE-SURGERY-ENCOUNTER-UUID-HERE",
        "icon": "surgery",
        "color": "#FFA500"
      },
      "protocol-2": {
        "name": "Intra-Surgery",
        "formUuid": "PUT-YOUR-INTRA-SURGERY-FORM-UUID-HERE",
        "encounterTypeUuid": "PUT-YOUR-INTRA-SURGERY-ENCOUNTER-UUID-HERE",
        "icon": "eye",
        "color": "#FF8C00"
      },
      "protocol-3": {
        "name": "Post-Surgery",
        "formUuid": "PUT-YOUR-POST-SURGERY-FORM-UUID-HERE",
        "encounterTypeUuid": "PUT-YOUR-POST-SURGERY-ENCOUNTER-UUID-HERE",
        "icon": "checkmark",
        "color": "#FFD700"
      }
    }
  }
}
```

### Method 2: Admin UI Configuration

1. Log in to OpenMRS
2. Navigate to: **System Administration → Manage Module → Augen Auf Configuration**
3. Edit each configuration value through the UI
4. Save changes

### Method 3: Update Default Configuration in Code

Edit `src/config-schema.ts` and replace the empty strings with your UUIDs:

```typescript
export const configSchema = {
  workflowStages: {
    _default: [
      {
        id: "registration",
        label: "Registration",
        color: "#E0E0E0",
        encounterTypeUuid: "YOUR-UUID-HERE"
      },
      // ... etc
    ]
  },
  // ... rest of config
};
```

Then rebuild and redeploy the module.

## Step 5: Verify Configuration

After configuration, use the validation utility to check your setup:

1. Open the browser console
2. Navigate to the Surgery Workflow page
3. Check for any configuration warnings
4. Use the validation endpoint (if available)

You can also run the validation script:

```bash
yarn validate-config
```

## Optional: Location Configuration

If you want encounters to be associated with a specific location:

1. Navigate to: **System Administration → Manage Locations**
2. Find or create your location (e.g., "Eye Surgery Department")
3. Copy the Location UUID
4. Update the code to pass `locationUuid` in `movePatientToStage()` calls

## Testing Your Configuration

1. Create a test patient in OpenMRS
2. Open the Surgery Workflow module
3. Select the test patient
4. Try moving the patient through workflow stages
5. Verify encounters are created correctly:
   - Go to: **Patient Dashboard → Encounters**
   - Check that encounters have the correct type

## Troubleshooting

### Patients Not Showing Up

- Check that patients exist in your OpenMRS instance
- Verify the patient search API is working: `/openmrs/ws/rest/v1/patient?q=search`

### "No Encounter Type UUID" Error

- Verify all workflow stages have `encounterTypeUuid` configured
- Check that the UUIDs are valid and exist in OpenMRS

### Forms Not Loading

- Verify Form Builder module is installed
- Check form UUIDs are correct
- Ensure form encounter types match protocol encounter types

### Stage Transitions Not Working

- Check browser console for errors
- Verify encounter creation permissions
- Ensure UUIDs are in correct format (with hyphens)

## API Endpoints Reference

Here are the OpenMRS REST API endpoints used by the module:

- **Search patients**: `GET /openmrs/ws/rest/v1/patient?q={query}`
- **Get patient**: `GET /openmrs/ws/rest/v1/patient/{uuid}`
- **Get encounters**: `GET /openmrs/ws/rest/v1/encounter?patient={uuid}`
- **Create encounter**: `POST /openmrs/ws/rest/v1/encounter`
- **Get observations**: `GET /openmrs/ws/rest/v1/obs?patient={uuid}&concept={conceptUuid}`

## Need Help?

- Check the [OpenMRS Documentation](https://wiki.openmrs.org/)
- Visit the [OpenMRS Talk Forum](https://talk.openmrs.org/)
- Review the module README.md
- Check GitHub issues for known problems

## Next Steps

After configuration:
1. Train users on the workflow
2. Set up regular backups
3. Monitor encounter creation
4. Customize forms based on user feedback
