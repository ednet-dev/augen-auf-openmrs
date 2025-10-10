#!/usr/bin/env bash
#
# contract-validate.sh - Validate implementation matches published contracts
#
# Usage: ./scripts/contract-validate.sh <stream>
#   stream: foundation | layout | forms | workflows | all
#
# Part of Contract-First Development Protocol
#

set -e

STREAM="$1"

if [ -z "$STREAM" ]; then
  echo "Usage: $0 <stream|all>"
  exit 1
fi

echo "🔍 Validating contract compliance for stream: $STREAM"

# Function to validate single contract
validate_contract() {
  local CONTRACT_FILE="$1"
  local CONTRACT_NAME=$(basename "$CONTRACT_FILE" .ts)
  
  echo "  Checking: $CONTRACT_FILE"
  
  # Check contract exists
  if [ ! -f "$CONTRACT_FILE" ]; then
    echo "    ⚠️  Contract not found (not defined yet)"
    return 0
  fi
  
  # Check if frozen
  if ! grep -q "@status FROZEN" "$CONTRACT_FILE"; then
    echo "    🟡 Contract still DRAFT (compliance check skipped)"
    return 0
  fi
  
  # Extract exports from contract
  EXPORTS=$(grep -E "^export (interface|type|const|function)" "$CONTRACT_FILE" | sed 's/export //' | awk '{print $2}')
  
  # Check if exports are implemented in src/
  ALL_FOUND=true
  while IFS= read -r EXPORT; do
    EXPORT_NAME=$(echo "$EXPORT" | sed 's/[<({].*//')
    
    if ! grep -rq "export.*$EXPORT_NAME" src/; then
      echo "    ❌ Missing export: $EXPORT_NAME"
      ALL_FOUND=false
    fi
  done <<< "$EXPORTS"
  
  if [ "$ALL_FOUND" = true ]; then
    echo "    ✅ All contract exports implemented"
  fi
  
  return 0
}

# Validate streams
if [ "$STREAM" = "all" ]; then
  STREAMS=("foundation" "layout" "forms" "workflows")
else
  STREAMS=("$STREAM")
fi

TOTAL_CONTRACTS=0
COMPLIANT_CONTRACTS=0

for S in "${STREAMS[@]}"; do
  if [ ! -d "contracts/$S" ]; then
    echo "Stream $S: No contracts directory (not started)"
    continue
  fi
  
  echo "Stream $S:"
  
  for CONTRACT in contracts/$S/*.ts; do
    if [ -f "$CONTRACT" ]; then
      ((TOTAL_CONTRACTS++))
      if validate_contract "$CONTRACT"; then
        ((COMPLIANT_CONTRACTS++))
      fi
    fi
  done
done

echo ""
echo "Summary:"
echo "  Total contracts: $TOTAL_CONTRACTS"
echo "  Compliant: $COMPLIANT_CONTRACTS/$TOTAL_CONTRACTS"

if [ $COMPLIANT_CONTRACTS -eq $TOTAL_CONTRACTS ]; then
  echo ""
  echo "✅ CONTRACT COMPLIANCE: PASSED"
  exit 0
else
  echo ""
  echo "❌ CONTRACT COMPLIANCE: FAILED"
  echo ""
  echo "Fix missing exports before committing."
  exit 1
fi
