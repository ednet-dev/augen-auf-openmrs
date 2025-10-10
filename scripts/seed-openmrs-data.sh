#!/bin/bash

# Comprehensive seeding script for Augen Auf OpenMRS module
# Creates encounter types and concepts with predefined UUIDs
# These UUIDs match the hardcoded values in src/config-schema.ts

set -e

# Configuration
API_URL="${OPENMRS_API_URL:-https://dev3.openmrs.org/openmrs}"
USERNAME="${OPENMRS_USERNAME:-admin}"
PASSWORD="${OPENMRS_PASSWORD:-Admin123}"
BASE_URL="$API_URL/ws/rest/v1"

echo "==========================================="
echo "Augen Auf OpenMRS Data Seeding Script"
echo "==========================================="
echo "API URL: $API_URL"
echo "Username: $USERNAME"
echo ""

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3

    response=$(curl -s -u "$USERNAME:$PASSWORD" \
        -X "$method" \
        -H "Content-Type: application/json" \
        "$BASE_URL/$endpoint" \
        ${data:+-d "$data"})

    echo "$response"
}

echo "Step 1: Creating Workflow Stage Encounter Types"
echo "================================================="

# Registration
echo "Creating 'Augen Auf Registration' encounter type..."
api_call POST "encountertype" '{"name":"Augen Auf Registration","description":"Initial patient registration for Augen Auf surgery workflow","uuid":"aa001100-1234-5678-90ab-000000000001"}' > /dev/null
echo "✓ Registration: aa001100-1234-5678-90ab-000000000001"

# Refraction
echo "Creating 'Augen Auf Refraction' encounter type..."
api_call POST "encountertype" '{"name":"Augen Auf Refraction","description":"Refraction examination for Augen Auf surgery workflow","uuid":"aa001100-1234-5678-90ab-000000000002"}' > /dev/null
echo "✓ Refraction: aa001100-1234-5678-90ab-000000000002"

# Eye Exam
echo "Creating 'Augen Auf Eye Exam' encounter type..."
api_call POST "encountertype" '{"name":"Augen Auf Eye Exam","description":"Comprehensive eye examination for Augen Auf surgery workflow","uuid":"aa001100-1234-5678-90ab-000000000003"}' > /dev/null
echo "✓ Eye Exam: aa001100-1234-5678-90ab-000000000003"

# Therapy
echo "Creating 'Augen Auf Therapy' encounter type..."
api_call POST "encountertype" '{"name":"Augen Auf Therapy","description":"Therapy/treatment for Augen Auf surgery workflow","uuid":"aa001100-1234-5678-90ab-000000000004"}' > /dev/null
echo "✓ Therapy: aa001100-1234-5678-90ab-000000000004"

# Finished
echo "Creating 'Augen Auf Finished' encounter type..."
api_call POST "encountertype" '{"name":"Augen Auf Finished","description":"Final/discharge encounter for Augen Auf surgery workflow","uuid":"aa001100-1234-5678-90ab-000000000005"}' > /dev/null
echo "✓ Finished: aa001100-1234-5678-90ab-000000000005"

echo ""
echo "Step 2: Creating Concepts"
echo "========================="

# Get Boolean datatype and Finding concept class UUIDs
BOOLEAN_UUID="8d4a5cca-c2cc-11de-8d13-0010c6dffd0f"
FINDING_UUID="8d491a9a-c2cc-11de-8d13-0010c6dffd0f"

echo "Creating 'Needs Surgery' concept..."
api_call POST "concept" "{\"names\":[{\"name\":\"Needs Surgery\",\"locale\":\"en\",\"conceptNameType\":\"FULLY_SPECIFIED\"}],\"datatype\":\"$BOOLEAN_UUID\",\"conceptClass\":\"$FINDING_UUID\",\"uuid\":\"aa002200-1234-5678-90ab-000000000002\"}" > /dev/null
echo "✓ Needs Surgery (Boolean): aa002200-1234-5678-90ab-000000000002"

echo ""
echo "Step 3: Creating Protocol Encounter Types (Optional)"
echo "====================================================="
echo "Note: Protocol encounter types are optional."
echo "Forms need to be created manually in Form Builder."
echo ""

# Pre-Surgery Protocol
echo "Creating 'Augen Auf Pre-Surgery Protocol' encounter type..."
api_call POST "encountertype" '{"name":"Augen Auf Pre-Surgery Protocol","description":"Pre-operative assessment protocol","uuid":"aa003300-1234-5678-90ab-000000000011"}' > /dev/null
echo "✓ Pre-Surgery Protocol: aa003300-1234-5678-90ab-000000000011"

# Intra-Surgery Protocol
echo "Creating 'Augen Auf Intra-Surgery Protocol' encounter type..."
api_call POST "encountertype" '{"name":"Augen Auf Intra-Surgery Protocol","description":"Surgical procedure documentation protocol","uuid":"aa003300-1234-5678-90ab-000000000012"}' > /dev/null
echo "✓ Intra-Surgery Protocol: aa003300-1234-5678-90ab-000000000012"

# Post-Surgery Protocol
echo "Creating 'Augen Auf Post-Surgery Protocol' encounter type..."
api_call POST "encountertype" '{"name":"Augen Auf Post-Surgery Protocol","description":"Post-operative follow-up protocol","uuid":"aa003300-1234-5678-90ab-000000000013"}' > /dev/null
echo "✓ Post-Surgery Protocol: aa003300-1234-5678-90ab-000000000013"

echo ""
echo "==========================================="
echo "✓ Seeding Complete!"
echo "==========================================="
echo ""
echo "Summary:"
echo "--------"
echo "Created 5 workflow stage encounter types"
echo "Created 1 concept (Needs Surgery)"
echo "Created 3 protocol encounter types"
echo ""
echo "These UUIDs match the defaults in src/config-schema.ts"
echo "The module is now ready to work with this OpenMRS instance."
echo ""
echo "Next Steps:"
echo "1. Create forms in Form Builder for each protocol"
echo "2. Update form UUIDs in configuration if needed"
echo "3. Test the Surgery Workflow page"
echo ""
