#!/bin/bash
# Combined quality gate - MUST pass before commit
# Zero tolerance for warnings or errors

set -e

echo "🚦 Running quality gate checks..."
echo ""

FAILED=0

# 1. Type checking
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1/3: TypeScript Type Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ./scripts/check-types.sh; then
  echo "✅ PASS: Type check"
else
  echo "❌ FAIL: Type check"
  FAILED=1
fi
echo ""

# 2. Linting
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2/3: ESLint Code Quality"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ./scripts/check-lint.sh; then
  echo "✅ PASS: Lint check"
else
  echo "❌ FAIL: Lint check"
  FAILED=1
fi
echo ""

# 3. Tests
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3/3: Unit Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ./scripts/test.sh all; then
  echo "✅ PASS: All tests"
else
  echo "❌ FAIL: Tests"
  FAILED=1
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILED -eq 0 ]; then
  echo "✅ QUALITY GATE PASSED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "All checks passed. Safe to commit."
  exit 0
else
  echo "❌ QUALITY GATE FAILED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Fix the issues above before committing."
  exit 1
fi
