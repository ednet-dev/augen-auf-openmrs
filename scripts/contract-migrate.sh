#!/usr/bin/env bash
#
# contract-migrate.sh - Migrate code to new contract version
#
# Usage: ./scripts/contract-migrate.sh <change-id>
#   change-id: CHANGE-001, CHANGE-002, etc. (from CHANGES.md)
#
# Agents update all code importing changed contract
#

set -e

CHANGE_ID="$1"

if [ -z "$CHANGE_ID" ]; then
  echo "Usage: $0 <change-id>"
  exit 1
fi

echo "🔄 Migrating code for contract change: $CHANGE_ID"

# Extract contract file from CHANGES.md
CONTRACT_FILE=$(grep -A 3 "## $CHANGE_ID:" contracts/CHANGES.md | grep "**Contract**:" | sed 's/.*: //')

if [ -z "$CONTRACT_FILE" ]; then
  echo "❌ Could not find contract file in CHANGES.md"
  exit 1
fi

echo "Contract: $CONTRACT_FILE"

# Find all files importing this contract
FILES_USING_CONTRACT=$(grep -rl "from.*$CONTRACT_FILE" src/ || echo "")

if [ -z "$FILES_USING_CONTRACT" ]; then
  echo "No files importing $CONTRACT_FILE (no migration needed)"
  exit 0
fi

echo "Files using contract: $(echo "$FILES_USING_CONTRACT" | wc -l)"

# For each file, agent should:
# 1. Read file
# 2. Identify usage of changed contract
# 3. Update to new contract API
# 4. Run tests to verify

echo ""
echo "⚠️  MIGRATION REQUIRED"
echo ""
echo "Agent will now update these files:"
echo "$FILES_USING_CONTRACT"
echo ""
echo "Process:"
echo "1. Update imports/types to match new contract"
echo "2. Update method calls if signature changed"
echo "3. Add TODO for deprecated methods (if breaking)"
echo "4. Run tests after each file"
echo ""
echo "This may require agent intervention for complex changes."

# Exit with code indicating migration needed
exit 2  # Special code: migration needed, agent should handle
