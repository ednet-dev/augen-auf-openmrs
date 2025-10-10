#!/usr/bin/env bash
#
# check-test-exists.sh - Enforce test-first development (TDD RED phase required)
#
# This hook verifies that tests exist before allowing production code to be written.
# Part of Agent Protocol v1.1 - Medical Software TDD Enforcement
#

set -e

# Get the file being written from tool input
FILE_PATH="$1"

# If no file specified, exit success (nothing to check)
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Skip if file is already a test file
if [[ "$FILE_PATH" =~ __tests__|\.spec\.|\.test\. ]]; then
  exit 0
fi

# Skip excluded patterns
if [[ "$FILE_PATH" =~ index\.ts$|types\.ts$|constants\.ts$ ]]; then
  exit 0
fi

# Only check source files
if [[ ! "$FILE_PATH" =~ ^src/.*\.(ts|tsx)$ ]]; then
  exit 0
fi

# Extract directory and filename
DIR=$(dirname "$FILE_PATH")
FILENAME=$(basename "$FILE_PATH" .tsx)
FILENAME=$(basename "$FILENAME" .ts)

# Check for test file in multiple possible locations
TEST_LOCATIONS=(
  "$DIR/__tests__/$FILENAME.test.ts"
  "$DIR/__tests__/$FILENAME.test.tsx"
  "$DIR/$FILENAME.spec.ts"
  "$DIR/$FILENAME.spec.tsx"
  "${DIR}/__tests__/$(echo $FILENAME | sed 's/\./-/g').test.ts"
  "${DIR}/__tests__/$(echo $FILENAME | sed 's/\./-/g').test.tsx"
)

TEST_EXISTS=false
for TEST_FILE in "${TEST_LOCATIONS[@]}"; do
  if [ -f "$TEST_FILE" ]; then
    TEST_EXISTS=true
    break
  fi
done

if [ "$TEST_EXISTS" = false ]; then
  echo "❌ TDD ENFORCEMENT: Test file missing for $FILE_PATH"
  echo ""
  echo "This is medical software - tests must be written BEFORE implementation."
  echo ""
  echo "Expected test file (one of):"
  for TEST_FILE in "${TEST_LOCATIONS[@]}"; do
    echo "  - $TEST_FILE"
  done
  echo ""
  echo "Next steps:"
  echo "1. Run: /tdd-red $FILENAME"
  echo "2. Write failing test (RED phase)"
  echo "3. Verify test fails"
  echo "4. Then write implementation (GREEN phase)"
  echo ""
  exit 1
fi

# Test exists - allow write
exit 0
