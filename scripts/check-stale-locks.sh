#!/usr/bin/env bash
#
# check-stale-locks.sh - Detect stale task locks in BACKLOG.md
#
# Task locks expire after 15 minutes of inactivity.
# Part of Agent Protocol v1.1 - Multi-Agent Coordination
#

set -e

LOCK_TIMEOUT=900  # 15 minutes in seconds
CURRENT_TIME=$(date +%s)

echo "🔍 Checking for stale locks in BACKLOG.md..."

if [ ! -f "BACKLOG.md" ]; then
  echo "✅ No BACKLOG.md found"
  exit 0
fi

# Extract locked tasks with timestamps
LOCKED_TASKS=$(grep -n "🔒\|🔐" BACKLOG.md 2>/dev/null || true)

if [ -z "$LOCKED_TASKS" ]; then
  echo "✅ No locked tasks found"
  exit 0
fi

STALE_COUNT=0
ACTIVE_COUNT=0

while IFS= read -r line; do
  # Extract line number, agent ID, and timestamp
  LINE_NUM=$(echo "$line" | cut -d: -f1)
  AGENT_ID=$(echo "$line" | grep -oE 'AGENT-[0-9]+' || echo "UNKNOWN")
  
  # Try to extract timestamp (ISO 8601 format)
  TIMESTAMP=$(echo "$line" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}' || echo "")
  
  if [ -z "$TIMESTAMP" ]; then
    echo "⚠️  Line $LINE_NUM: Lock by $AGENT_ID has no timestamp (consider stale)"
    ((STALE_COUNT++))
    continue
  fi
  
  # Convert timestamp to epoch
  if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCK_TIME=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$TIMESTAMP" +%s 2>/dev/null || echo "0")
  else
    LOCK_TIME=$(date -d "$TIMESTAMP" +%s 2>/dev/null || echo "0")
  fi
  
  if [ "$LOCK_TIME" -eq 0 ]; then
    echo "⚠️  Line $LINE_NUM: Could not parse timestamp for $AGENT_ID"
    ((STALE_COUNT++))
    continue
  fi
  
  # Calculate age
  AGE=$((CURRENT_TIME - LOCK_TIME))
  AGE_MIN=$((AGE / 60))
  
  if [ $AGE -gt $LOCK_TIMEOUT ]; then
    echo "❌ Line $LINE_NUM: STALE lock by $AGENT_ID (${AGE_MIN} minutes old)"
    ((STALE_COUNT++))
  else
    echo "✅ Line $LINE_NUM: Active lock by $AGENT_ID (${AGE_MIN} minutes old)"
    ((ACTIVE_COUNT++))
  fi
  
done <<< "$LOCKED_TASKS"

echo ""
echo "Summary:"
echo "  Active locks: $ACTIVE_COUNT"
echo "  Stale locks: $STALE_COUNT"

if [ $STALE_COUNT -gt 0 ]; then
  echo ""
  echo "⚠️  Stale locks detected (>15 minutes old)"
  echo ""
  echo "Options:"
  echo "1. Assume abandoned - claim these tasks"
  echo "2. Check with team - might be complex task still in progress"
  echo "3. Add blocker comment in BACKLOG.md if waiting for dependency"
  exit 1
else
  echo ""
  echo "✅ All locks are active"
  exit 0
fi
