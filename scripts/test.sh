#!/bin/bash
# Test runner for OpenMRS module
# Usage: ./scripts/test.sh [module] [--watch]
# Examples:
#   ./scripts/test.sh                    # Run all tests
#   ./scripts/test.sh Forms              # Run tests for Forms module
#   ./scripts/test.sh Forms --watch      # Watch mode for Forms tests

set -e

MODULE=${1:-all}
WATCH=$2

# Check if Jest is configured
if ! grep -q "\"test\"" package.json; then
  echo "❌ ERROR: Jest not configured in package.json"
  echo "Run: yarn add -D jest @testing-library/react @testing-library/jest-dom"
  exit 1
fi

# Build command
if [ "$MODULE" = "all" ]; then
  CMD="yarn test --passWithNoTests"
else
  CMD="yarn test --passWithNoTests -- $MODULE"
fi

# Add watch flag if requested
if [ "$WATCH" = "--watch" ]; then
  CMD="$CMD --watch"
fi

# Run tests with minimal output on GREEN, full output on RED
echo "🧪 Running tests for: $MODULE"

if $CMD 2>&1 | grep -qE "FAIL|Error|failed|Tests failed"; then
  echo ""
  echo "❌ RED: Tests failed for $MODULE"
  echo "Running with verbose output..."
  echo ""
  $CMD --verbose || exit 1
else
  echo "✅ GREEN: All tests pass for $MODULE"
  exit 0
fi
