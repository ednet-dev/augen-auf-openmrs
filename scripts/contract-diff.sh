#!/usr/bin/env bash
#
# contract-diff.sh - Generate contract diff and classify changes
#
# Usage: ./scripts/contract-diff.sh <before-file> <after-file>
#   Or: ./scripts/contract-diff.sh <contract-file> (uses git diff)
#
# Output: Diff with classification (BREAKING | ADDITIVE | REFACTOR)
#

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <contract-file> or $0 <before-file> <after-file>"
  exit 1
fi

if [ -z "$2" ]; then
  # Single file - use git diff
  CONTRACT_FILE="$1"
  
  if ! git diff --quiet HEAD -- "$CONTRACT_FILE"; then
    echo "📊 Contract Diff: $CONTRACT_FILE"
    echo ""
    git diff HEAD -- "$CONTRACT_FILE"
    echo ""
    
    # Classify change
    if git diff HEAD -- "$CONTRACT_FILE" | grep -qE "^-.*export (interface|type).*\{|^-  [a-zA-Z]+.*:"; then
      echo "⚠️  BREAKING CHANGE DETECTED"
      echo "  - Removed interface/type/method"
      echo "  - Requires ALL consumer approval"
    elif git diff HEAD -- "$CONTRACT_FILE" | grep -qE "^\+.*\?:"; then
      echo "✅ ADDITIVE CHANGE (optional property/method)"
      echo "  - Non-breaking"
      echo "  - Requires owner approval"
    else
      echo "✅ REFACTOR (no API changes)"
      echo "  - Non-breaking"
      echo "  - Owner can approve"
    fi
  else
    echo "No changes in $CONTRACT_FILE"
  fi
else
  # Two files - diff them
  BEFORE="$1"
  AFTER="$2"
  
  diff "$BEFORE" "$AFTER" || true
fi
