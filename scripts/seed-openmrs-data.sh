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

echo "Step 1: Creating Visit Encounter Type"
echo "======================================"
echo "Note: We use a single encounter per patient visit (not per workflow stage)"
echo ""

# Visit Encounter Type
echo "Creating 'Augen Auf Visit' encounter type..."
api_call POST "encountertype" '{"name":"Augen Auf Visit","description":"Single encounter for entire patient visit across all workflow stages","uuid":"aa001100-1234-5678-90ab-000000000001"}' > /dev/null
echo "✓ Visit Encounter: aa001100-1234-5678-90ab-000000000001"

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
echo "Step 4: Creating Queues for Workflow Stages"
echo "============================================"

# Get default location UUID (Outpatient Clinic or first available)
DEFAULT_LOCATION="44c3efb0-2583-4c80-a79e-1f756a03c0a1"

# Use standard Triage service concept (works with OpenMRS queue module)
# Note: In production, you may want to create custom service concepts
SERVICE_UUID="d62d58e9-ec91-4108-9643-00f5f23bf51c"  # Triage service

echo "Creating 'Augen Auf Registration' queue..."
api_call POST "queue" "{\"name\":\"Augen Auf Registration\",\"description\":\"Queue for patients at registration stage\",\"location\":\"$DEFAULT_LOCATION\",\"service\":\"$SERVICE_UUID\",\"uuid\":\"aa004400-1234-5678-90ab-000000000001\"}" > /dev/null
echo "✓ Registration Queue: aa004400-1234-5678-90ab-000000000001"

echo "Creating 'Augen Auf Refraction' queue..."
api_call POST "queue" "{\"name\":\"Augen Auf Refraction\",\"description\":\"Queue for patients at refraction stage\",\"location\":\"$DEFAULT_LOCATION\",\"service\":\"$SERVICE_UUID\",\"uuid\":\"aa004400-1234-5678-90ab-000000000002\"}" > /dev/null
echo "✓ Refraction Queue: aa004400-1234-5678-90ab-000000000002"

echo "Creating 'Augen Auf Eye Exam' queue..."
api_call POST "queue" "{\"name\":\"Augen Auf Eye Exam\",\"description\":\"Queue for patients at eye exam stage\",\"location\":\"$DEFAULT_LOCATION\",\"service\":\"$SERVICE_UUID\",\"uuid\":\"aa004400-1234-5678-90ab-000000000003\"}" > /dev/null
echo "✓ Eye Exam Queue: aa004400-1234-5678-90ab-000000000003"

echo "Creating 'Augen Auf Therapy' queue..."
api_call POST "queue" "{\"name\":\"Augen Auf Therapy\",\"description\":\"Queue for patients at therapy stage\",\"location\":\"$DEFAULT_LOCATION\",\"service\":\"$SERVICE_UUID\",\"uuid\":\"aa004400-1234-5678-90ab-000000000004\"}" > /dev/null
echo "✓ Therapy Queue: aa004400-1234-5678-90ab-000000000004"

echo "Creating 'Augen Auf Finished' queue..."
api_call POST "queue" "{\"name\":\"Augen Auf Finished\",\"description\":\"Queue for patients at finished/discharge stage\",\"location\":\"$DEFAULT_LOCATION\",\"service\":\"$SERVICE_UUID\",\"uuid\":\"aa004400-1234-5678-90ab-000000000005\"}" > /dev/null
echo "✓ Finished Queue: aa004400-1234-5678-90ab-000000000005"

echo ""
echo "==========================================="
echo "✓ Seeding Complete!"
echo "==========================================="
echo ""
echo "Summary:"
echo "--------"
echo "Created 1 visit encounter type (single encounter per patient visit)"
echo "Created 1 concept (Needs Surgery boolean)"
echo "Created 3 protocol encounter types (for protocol forms)"
echo "Created 5 queues (one per workflow stage)"
echo ""
echo "Data Model:"
echo "-----------"
echo "- Workflow stages are managed via QUEUES (not encounters)"
echo "- Each patient visit has ONE encounter (aa001100-...0001)"
echo "- Protocol forms attach to the visit encounter"
echo "- Queue entries track which stage a patient is in"
echo ""
echo "Note: All queues use the standard 'Triage' service concept."
echo "These UUIDs match the defaults in src/config-schema.ts"
echo "The module is now ready to work with this OpenMRS instance."
echo ""
echo "Next Steps:"
echo "1. Create forms in Form Builder for each protocol"
echo "2. Update form UUIDs in configuration if needed"
echo "3. Test patient movement between stages"
echo "4. Verify queue entries are created correctly"
echo ""
