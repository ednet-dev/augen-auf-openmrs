#!/bin/bash
# Pre-commit security and quality check
# Scans for sensitive data, runs quality gate

set -e

echo "🔒 Pre-commit security check..."
echo ""

FOUND_ISSUES=0

# 1. Scan for sensitive data patterns
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1/3: Security Scan"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SENSITIVE_PATTERNS=(
  "password\s*="
  "api[_-]?key\s*="
  "secret\s*="
  "token\s*="
  "private[_-]?key"
  "aws[_-]?access"
  "BEGIN RSA PRIVATE KEY"
  "BEGIN PRIVATE KEY"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  # Search in staged files only
  if git diff --cached --name-only | xargs grep -iE "$pattern" 2>/dev/null; then
    echo "❌ SECURITY: Found potentially sensitive data: $pattern"
    FOUND_ISSUES=1
  fi
done

# 2. Check for PHI/PII in logs or console.log
if git diff --cached | grep -iE "console\.(log|debug|info).*patient.*name|console\.(log|debug|info).*ssn|console\.(log|debug|info).*dob" 2>/dev/null; then
  echo "❌ SECURITY: Possible PHI/PII in console.log statements"
  FOUND_ISSUES=1
fi

if [ $FOUND_ISSUES -eq 0 ]; then
  echo "✅ No security issues found"
else
  echo ""
  echo "❌ Security issues detected - review changes before committing"
  exit 1
fi
echo ""

# 3. Run quality gate
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2/3: Quality Gate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ./scripts/quality-gate.sh; then
  echo "✅ Quality gate passed"
else
  echo "❌ Quality gate failed"
  exit 1
fi
echo ""

# 4. Verify commit message format (if provided)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3/3: Commit Message Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Remember: Use format '{Action} {what} to {achieve value}'"
echo "   Example: 'Add form validation to prevent data entry errors'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PRE-COMMIT CHECK PASSED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Safe to commit. Don't forget to use a descriptive commit message!"

exit 0
