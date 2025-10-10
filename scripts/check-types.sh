#!/bin/bash
# TypeScript type checker
# Handles OpenMRS 5.8.1 dependency type issues by only checking src/ files

set -e

echo "🔍 Checking TypeScript types..."

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
  echo "❌ ERROR: TypeScript not installed"
  exit 1
fi

# Run TypeScript compiler in check mode
# --noEmit: Don't emit output, just check types
# --skipLibCheck: Skip type checking of declaration files (workaround for OpenMRS deps)
if npx tsc --noEmit --skipLibCheck 2>&1 | grep -v "node_modules" | grep -qE "error TS"; then
  echo ""
  echo "❌ Type errors found in source code:"
  npx tsc --noEmit --skipLibCheck 2>&1 | grep -v "node_modules" | grep "error TS" || true
  exit 1
else
  echo "✅ No type errors in source code"
  exit 0
fi
