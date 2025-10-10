#!/bin/bash

# Import Augen Auf Forms to Local OpenMRS
# Usage: ./scripts/import-forms.sh [base_url] [username:password]

BASE_URL=${1:-"http://localhost:8080/openmrs"}
AUTH=${2:-"admin:Admin123"}

echo "📋 Importing Augen Auf Forms to OpenMRS"
echo "   Base URL: $BASE_URL"
echo ""

# Function to POST form
post_form() {
    local form_file=$1
    local schema_file=$2
    local form_name=$3

    # Read form JSON
    form_data=$(cat "$form_file")

    # Create form
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -u "$AUTH" \
        -d "$form_data" \
        "$BASE_URL/ws/rest/v1/form")

    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$status_code" -eq 201 ] || [ "$status_code" -eq 200 ]; then
        echo "✅ Created form: $form_name"

        # Extract form UUID from response
        form_uuid=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('uuid', ''))")

        if [ -f "$schema_file" ] && [ -n "$form_uuid" ]; then
            # Upload JSON schema as form resource
            schema_data=$(cat "$schema_file")

            resource_response=$(curl -s -w "\n%{http_code}" -X POST \
                -H "Content-Type: application/json" \
                -u "$AUTH" \
                -d "{\"name\":\"JSON schema\",\"dataType\":\"AmpathJsonSchema\",\"value\":$(cat "$schema_file")}" \
                "$BASE_URL/ws/rest/v1/form/$form_uuid/resource")

            resource_status=$(echo "$resource_response" | tail -n1)
            if [ "$resource_status" -eq 201 ] || [ "$resource_status" -eq 200 ]; then
                echo "   ✅ Uploaded JSON schema for $form_name"
            else
                echo "   ⚠️  Failed to upload schema (HTTP $resource_status)"
            fi
        fi
    elif echo "$body" | grep -q "already exists\|duplicate"; then
        echo "⚠️  Form $form_name already exists (skipped)"
    else
        echo "❌ Failed to create $form_name (HTTP $status_code)"
        echo "   Response: $body"
    fi
}

# Import forms
echo "📋 Importing Forms..."

# Get form UUID from file
get_form_uuid() {
    cat "$1" | python3 -c "import sys, json; print(json.load(sys.stdin).get('uuid', ''))"
}

# Simplified approach: POST form definitions with embedded schema
echo ""
echo "📝 Form 1: AUA Registration"
form_uuid_1=$(get_form_uuid "configuration/forms/form-aua-registration.json")
if [ -n "$form_uuid_1" ]; then
    post_form "configuration/forms/form-aua-registration.json" "configuration/forms/schema-aua-registration.json" "AUA Registration"
fi

echo ""
echo "📝 Form 2: Augen Auf Test"
form_uuid_2=$(get_form_uuid "configuration/forms/form-augen-auf-test.json")
if [ -n "$form_uuid_2" ]; then
    post_form "configuration/forms/form-augen-auf-test.json" "configuration/forms/schema-augen-auf-test.json" "Augen Auf Test"
fi

echo ""
echo "📝 Form 3: Ophthalmological Visit"
form_uuid_3=$(get_form_uuid "configuration/forms/form-ophthalmological.json")
if [ -n "$form_uuid_3" ]; then
    post_form "configuration/forms/form-ophthalmological.json" "configuration/forms/schema-ophthalmological.json" "Ophthalmological Visit"
fi

echo ""
echo "✅ Form import completed!"
echo ""
echo "View forms at: $BASE_URL/spa/forms"
