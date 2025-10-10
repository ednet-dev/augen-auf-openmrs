#!/bin/bash
# task-status.sh - Show current work + team activity
# Usage: ./scripts/task-status.sh [--verbose]

set -euo pipefail

BACKLOG="BACKLOG.md"
AGENT_ID_FILE=".agent_id"
VERBOSE="${1:-}"

[[ ! -f "$BACKLOG" ]] && echo "❌ BACKLOG.md not found" && exit 1

# Get agent ID if exists
MY_AGENT_ID=""
if [[ -f "$AGENT_ID_FILE" ]]; then
  MY_AGENT_ID=$(cat "$AGENT_ID_FILE")
fi

# Parse timestamps and check staleness
check_lock_age() {
  local timestamp=$1
  local now_sec=$(date +%s)

  # Parse ISO8601 timestamp
  if date -j -f "%Y-%m-%dT%H:%M:%SZ" "$timestamp" +%s &>/dev/null; then
    # macOS date
    lock_sec=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$timestamp" +%s)
  elif date -d "$timestamp" +%s &>/dev/null; then
    # GNU date
    lock_sec=$(date -d "$timestamp" +%s)
  else
    echo "unknown"
    return
  fi

  age_min=$(( (now_sec - lock_sec) / 60 ))

  if [[ $age_min -gt 15 ]]; then
    echo "stale:$age_min"
  else
    echo "active:$age_min"
  fi
}

echo "📊 Task Status Dashboard"
echo ""

# My current work
if [[ -n "$MY_AGENT_ID" ]]; then
  echo "👤 Your Work ($MY_AGENT_ID):"
  MY_TASK=$(grep "🔒 \[$MY_AGENT_ID\]" "$BACKLOG" | head -1 || true)

  if [[ -n "$MY_TASK" ]]; then
    TASK_TEXT=$(echo "$MY_TASK" | sed -E 's/.*🔒 \[AGENT-[0-9]+\] [0-9T:Z-]+ //')
    TIMESTAMP=$(echo "$MY_TASK" | sed -E 's/.*🔒 \[AGENT-[0-9]+\] ([0-9T:Z-]+) .*/\1/')
    AGE=$(check_lock_age "$TIMESTAMP")

    echo "  🔒 $TASK_TEXT"
    if [[ "$AGE" == stale:* ]]; then
      MIN=$(echo "$AGE" | cut -d: -f2)
      echo "     ⏰ Locked ${MIN} min ago (stale - commit soon!)"
    elif [[ "$AGE" == active:* ]]; then
      MIN=$(echo "$AGE" | cut -d: -f2)
      echo "     ✅ Locked ${MIN} min ago (active)"
    fi
  else
    echo "  (no active task)"
    echo ""
    echo "  💡 Find work: ./scripts/task-next.sh"
  fi

  echo ""
fi

# All active locks
echo "🔒 All Active Locks:"
LOCKS=$(grep -n "^- \[ \] 🔒 \[AGENT-" "$BACKLOG" || true)

if [[ -z "$LOCKS" ]]; then
  echo "  (none)"
else
  while IFS= read -r lock; do
    [[ -z "$lock" ]] && continue

    AGENT=$(echo "$lock" | sed -E 's/.*🔒 \[(AGENT-[0-9]+)\].*/\1/')
    TIMESTAMP=$(echo "$lock" | sed -E 's/.*🔒 \[AGENT-[0-9]+\] ([0-9T:Z-]+) .*/\1/')
    TASK=$(echo "$lock" | sed -E 's/.*🔒 \[AGENT-[0-9]+\] [0-9T:Z-]+ //')

    AGE=$(check_lock_age "$TIMESTAMP")

    if [[ "$AGENT" == "$MY_AGENT_ID" ]]; then
      PREFIX="  → [YOU]"
    else
      PREFIX="  •"
    fi

    if [[ "$AGE" == stale:* ]]; then
      MIN=$(echo "$AGE" | cut -d: -f2)
      echo "$PREFIX $AGENT: $TASK"
      echo "         ⏰ Stale (${MIN} min) - may be claimed"
    elif [[ "$AGE" == active:* ]]; then
      MIN=$(echo "$AGE" | cut -d: -f2)
      echo "$PREFIX $AGENT: $TASK"
      echo "         ✅ Active (${MIN} min)"
    else
      echo "$PREFIX $AGENT: $TASK"
      echo "         ⚠️  Unknown age"
    fi
  done <<< "$LOCKS"
fi

echo ""

# Summary stats
UNCLAIMED=$(grep "^- \[ \]" "$BACKLOG" | grep -v "🔒" | wc -l | tr -d ' ')
CLAIMED=$(grep "^- \[ \] 🔒 \[AGENT-" "$BACKLOG" | wc -l | tr -d ' ')
COMPLETED=$(grep "^- \[x\]" "$BACKLOG" | wc -l | tr -d ' ')
TOTAL=$((UNCLAIMED + CLAIMED + COMPLETED))

if [[ $TOTAL -gt 0 ]]; then
  PERCENT_DONE=$((COMPLETED * 100 / TOTAL))
else
  PERCENT_DONE=0
fi

echo "📈 Progress:"
echo "  Total: $TOTAL tasks"
echo "  ✅ Completed: $COMPLETED ($PERCENT_DONE%)"
echo "  🔒 Active: $CLAIMED"
echo "  📋 Available: $UNCLAIMED"

echo ""

# Recent team activity (if verbose)
if [[ "$VERBOSE" == "--verbose" ]] && command -v git &>/dev/null; then
  echo "👥 Recent Team Activity (Last 2 hours):"

  RECENT=$(git log --all --since="2 hours ago" --format="%h %an <%ae> %ar: %s" | head -10 || true)

  if [[ -z "$RECENT" ]]; then
    echo "  (no recent commits)"
  else
    echo "$RECENT" | while IFS= read -r line; do
      echo "  • $line"
    done
  fi

  echo ""
fi

# Next actions
echo "💡 Next Actions:"
if [[ -n "$MY_AGENT_ID" ]] && [[ -n "$MY_TASK" ]]; then
  echo "  1. Continue: ./scripts/test.sh --watch"
  echo "  2. Complete: ./scripts/task-complete.sh"
else
  echo "  1. Find task: ./scripts/task-next.sh"
  echo "  2. Claim task: ./scripts/task-claim.sh <#>"
fi

if [[ "$VERBOSE" != "--verbose" ]]; then
  echo ""
  echo "Show team activity: $0 --verbose"
fi
