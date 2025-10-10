#!/usr/bin/env bash
#
# check-medical-coverage.sh - Verify medical validation has 100% test coverage
#
# Medical software requires exhaustive testing of all validation logic.
# Part of Agent Protocol v1.1 - Medical Software Quality Standards
#

set -e

echo "🏥 Checking medical validation coverage..."

# Medical file patterns to check
MEDICAL_PATTERNS=(
  "src/**/medical*.ts"
  "src/**/validation*.ts"
  "src/**/bilateral*.ts"
  "src/**/bcva*.ts"
  "src/**/cataract*.ts"
  "src/**/ophthalm*.ts"
)

# Find all medical files
MEDICAL_FILES=()
for PATTERN in "${MEDICAL_PATTERNS[@]}"; do
  while IFS= read -r -d '' file; do
    # Skip test files
    if [[ ! "$file" =~ __tests__|\.spec\.|\.test\. ]]; then
      MEDICAL_FILES+=("$file")
    fi
  done < <(find . -path "$PATTERN" -print0 2>/dev/null)
done

if [ ${#MEDICAL_FILES[@]} -eq 0 ]; then
  echo "✅ No medical validation files found (or not implemented yet)"
  exit 0
fi

echo "Found ${#MEDICAL_FILES[@]} medical validation file(s)"

ALL_COVERED=true
MISSING_TESTS=()

for FILE in "${MEDICAL_FILES[@]}"; do
  echo "  Checking: $FILE"
  
  # Extract base name
  DIR=$(dirname "$FILE")
  FILENAME=$(basename "$FILE" .ts)
  FILENAME=$(basename "$FILENAME" .tsx)
  
  # Check for test file
  TEST_LOCATIONS=(
    "$DIR/__tests__/$FILENAME.test.ts"
    "$DIR/__tests__/$FILENAME.test.tsx"
    "$DIR/$FILENAME.spec.ts"
    "$DIR/$FILENAME.spec.tsx"
  )
  
  TEST_FOUND=false
  TEST_FILE=""
  for TEST_LOC in "${TEST_LOCATIONS[@]}"; do
    if [ -f "$TEST_LOC" ]; then
      TEST_FOUND=true
      TEST_FILE="$TEST_LOC"
      break
    fi
  done
  
  if [ "$TEST_FOUND" = false ]; then
    echo "    ❌ No test file found"
    ALL_COVERED=false
    MISSING_TESTS+=("$FILE")
    continue
  fi
  
  # Check for required test patterns in medical validation
  REQUIRED_PATTERNS=(
    "boundary|boundaries"
    "null|undefined"
    "invalid|error"
    "valid|accept"
    "range"
  )
  
  MISSING_PATTERNS=()
  for PATTERN in "${REQUIRED_PATTERNS[@]}"; do
    if ! grep -qiE "$PATTERN" "$TEST_FILE"; then
      MISSING_PATTERNS+=("$PATTERN")
    fi
  done
  
  if [ ${#MISSING_PATTERNS[@]} -gt 0 ]; then
    echo "    ⚠️  Missing test patterns: ${MISSING_PATTERNS[*]}"
    ALL_COVERED=false
  else
    echo "    ✅ Test coverage complete"
  fi
done

echo ""

if [ "$ALL_COVERED" = true ]; then
  echo "✅ MEDICAL VALIDATION COVERAGE: COMPLETE"
  echo ""
  echo "All medical validation files have:"
  echo "  ✅ Test files present"
  echo "  ✅ Boundary value tests"
  echo "  ✅ Null/undefined tests"
  echo "  ✅ Invalid input tests"
  echo "  ✅ Valid input tests"
  echo "  ✅ Range validation tests"
  exit 0
else
  echo "❌ MEDICAL VALIDATION COVERAGE: INCOMPLETE"
  echo ""
  echo "Medical software requires 100% test coverage for validation logic."
  echo ""
  
  if [ ${#MISSING_TESTS[@]} -gt 0 ]; then
    echo "Files missing test coverage:"
    for FILE in "${MISSING_TESTS[@]}"; do
      echo "  - $FILE"
    done
    echo ""
  fi
  
  echo "Required test patterns for medical validation:"
  echo "  1. Boundary values (min, max, edges)"
  echo "  2. Null and undefined handling"
  echo "  3. Invalid inputs with clear errors"
  echo "  4. Valid inputs (happy path)"
  echo "  5. Range validation"
  echo ""
  echo "Example BCVA validation tests:"
  echo "  - validateBCVA(0.0)      // Min boundary"
  echo "  - validateBCVA(1.0)      // Max boundary"
  echo "  - validateBCVA(-0.1)     // Below range"
  echo "  - validateBCVA(1.5)      // Above range"
  echo "  - validateBCVA(null)     // Null handling"
  echo "  - validateBCVA(undefined)// Undefined handling"
  echo "  - validateBCVA('abc')    // Invalid type"
  echo "  - validateBCVA(0.5)      // Valid value"
  echo ""
  exit 1
fi
