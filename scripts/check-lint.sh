#!/bin/bash
# ESLint checker for code quality

set -e

echo "🔍 Checking code quality with ESLint..."

# Check if ESLint is configured
if [ ! -f ".eslintrc.js" ] && [ ! -f ".eslintrc.json" ] && ! grep -q "eslintConfig" package.json; then
  echo "⚠️  WARNING: ESLint not configured"
  echo "Skipping lint check (add .eslintrc.js to enable)"
  exit 0
fi

# Run ESLint
if yarn eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0 2>&1; then
  echo "✅ No lint issues found"
  exit 0
else
  echo "❌ Lint issues found (see above)"
  exit 1
fi
