#!/bin/bash

# Import QU01 Location and Tags to Local OpenMRS
# Usage: ./scripts/import-metadata.sh [base_url] [username:password]

BASE_URL=${1:-"http://localhost:8080/openmrs"}
AUTH=${2:-"admin:Admin123"}

echo "🏥 Importing QU01 Metadata to OpenMRS"
echo "   Base URL: $BASE_URL"
echo ""

# Function to POST data
post_data() {
    local endpoint=$1
    local data=$2
    local name=$3

    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -u "$AUTH" \
        -d "$data" \
        "$BASE_URL/ws/rest/v1/$endpoint")

    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$status_code" -eq 201 ] || [ "$status_code" -eq 200 ]; then
        echo "✅ Created $name"
    elif echo "$body" | grep -q "already exists\|duplicate"; then
        echo "⚠️  $name already exists (skipped)"
    else
        echo "❌ Failed to create $name (HTTP $status_code)"
        echo "   Response: $body"
    fi
}

# Import Location Tags
echo "📍 Importing Location Tags..."

post_data "locationtag" '{
  "uuid": "b8bbf83e-645f-451f-8efe-a0db56f09676",
  "name": "Login Location",
  "description": "When a user logs in and chooses a session location, they may only choose one with this tag"
}' "Login Location"

post_data "locationtag" '{
  "uuid": "2f847e8e-8faf-11f0-9802-aaf54c19edec",
  "name": "Queue Location"
}' "Queue Location"

post_data "locationtag" '{
  "uuid": "5ac55ca4-8faf-11f0-9802-aaf54c19edec",
  "name": "Appointment Location",
  "description": "When a user user creates a appointment service and chooses a location, they may only choose one with this tag"
}' "Appointment Location"

post_data "locationtag" '{
  "uuid": "a2327745-2970-4752-ac8a-dd0ba131f40e",
  "name": "Facility Location"
}' "Facility Location"

echo ""
echo "🏢 Importing Locations..."

# Parent location first
post_data "location" '{
  "uuid": "9e922f7d-f112-453b-8596-07fe1c92a8a6",
  "name": "Augen Auf",
  "country": "Guatemala",
  "tags": [
    {"uuid": "b8bbf83e-645f-451f-8efe-a0db56f09676"}
  ]
}' "Augen Auf (parent)"

# QU01 location
post_data "location" '{
  "uuid": "e719c02c-18d8-45b8-b5b9-45184e501705",
  "name": "QU01",
  "description": "Quetzaltenango Outpatient Clinic",
  "cityVillage": "Quetzaltenango",
  "country": "Guatemala",
  "parentLocation": "9e922f7d-f112-453b-8596-07fe1c92a8a6",
  "tags": [
    {"uuid": "2f847e8e-8faf-11f0-9802-aaf54c19edec"},
    {"uuid": "5ac55ca4-8faf-11f0-9802-aaf54c19edec"},
    {"uuid": "b8bbf83e-645f-451f-8efe-a0db56f09676"},
    {"uuid": "a2327745-2970-4752-ac8a-dd0ba131f40e"}
  ]
}' "QU01"

echo ""
echo "✅ Import completed!"
echo ""
echo "Verify at: $BASE_URL/spa/login/location"
