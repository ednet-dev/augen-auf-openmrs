#!/bin/bash
# task-claim.sh - Claim task with upstream sync + FCFS resolution
# Usage: ./scripts/task-claim.sh <line_number|task_number>

set -euo pipefail

BACKLOG="BACKLOG.md"
AGENT_ID_FILE=".agent_id"
INPUT="${1:-}"

# Validate input
if [[ -z "$INPUT" ]]; then
  echo "❌ Usage: $0 <line_number|task_number>"
  echo ""
  echo "Find tasks with: ./scripts/task-next.sh"
  exit 1
fi

[[ ! -f "$BACKLOG" ]] && echo "❌ BACKLOG.md not found" && exit 1

# Generate or load agent ID
if [[ ! -f "$AGENT_ID_FILE" ]]; then
  AGENT_ID="AGENT-$(date +%s)"
  echo "$AGENT_ID" > "$AGENT_ID_FILE"
  echo "🆔 Generated agent ID: $AGENT_ID"
else
  AGENT_ID=$(cat "$AGENT_ID_FILE")
  echo "🆔 Using agent ID: $AGENT_ID"
fi

# Get git user for attribution
GIT_USER=$(git config user.email 2>/dev/null || echo "unknown")

# Sync with upstream (FCFS resolution)
echo "🔄 Syncing with upstream..."
if ! git fetch origin main 2>/dev/null; then
  echo "⚠️  Could not fetch from origin (offline?)"
fi

# Check if we need to pull
if git rev-parse @{u} &>/dev/null; then
  LOCAL=$(git rev-parse @)
  REMOTE=$(git rev-parse @{u})

  if [[ "$LOCAL" != "$REMOTE" ]]; then
    # Check for uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
      echo "⚠️  Uncommitted changes detected. Stash and pull manually:"
      echo "    git stash && git pull --rebase && git stash pop"
      exit 1
    fi

    echo "📥 Pulling latest changes..."
    if ! git pull --rebase origin main; then
      echo "❌ Merge conflict detected. Resolve manually:"
      echo "    git status"
      echo "    # Fix conflicts in BACKLOG.md"
      echo "    git add BACKLOG.md"
      echo "    git rebase --continue"
      exit 1
    fi
  else
    echo "✅ Already up to date"
  fi
fi

# Resolve line number from task number (if applicable)
LINE_NUM=$INPUT
if [[ "$INPUT" -lt 100 ]]; then
  # Assume it's a task number from task-next.sh output
  # Find the Nth unclaimed task
  UNCLAIMED_LINES=$(grep -n "^- \[ \]" "$BACKLOG" | grep -v "🔒" | cut -d: -f1)
  LINE_NUM=$(echo "$UNCLAIMED_LINES" | sed -n "${INPUT}p")

  if [[ -z "$LINE_NUM" ]]; then
    echo "❌ Task #$INPUT not found"
    exit 1
  fi
fi

# Get task text
TASK_LINE=$(sed -n "${LINE_NUM}p" "$BACKLOG")

if [[ ! "$TASK_LINE" =~ ^-\ \[\ \]  ]]; then
  echo "❌ Line $LINE_NUM is not an unclaimed task:"
  echo "   $TASK_LINE"
  exit 1
fi

if echo "$TASK_LINE" | grep -q "🔒"; then
  echo "❌ Task already locked:"
  echo "   $TASK_LINE"
  echo ""
  echo "Check lock age with: ./scripts/task-status.sh"
  exit 1
fi

# Create lock with timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOCK_TEXT="- [ ] 🔒 [$AGENT_ID] $TIMESTAMP"

# Extract original task text (remove "- [ ] " prefix)
TASK_TEXT=$(echo "$TASK_LINE" | sed 's/^- \[ \] *//')

# Create new line with lock
NEW_LINE="$LOCK_TEXT $TASK_TEXT"

# Atomic update of BACKLOG.md
cp "$BACKLOG" "${BACKLOG}.bak"

if sed -i.tmp "${LINE_NUM}s|.*|$NEW_LINE|" "$BACKLOG" 2>/dev/null; then
  rm -f "${BACKLOG}.tmp"
elif sed -i '' "${LINE_NUM}s|.*|$NEW_LINE|" "$BACKLOG" 2>/dev/null; then
  # macOS sed
  true
else
  echo "❌ Failed to update BACKLOG.md"
  mv "${BACKLOG}.bak" "$BACKLOG"
  exit 1
fi

rm -f "${BACKLOG}.bak"

# Display result
echo ""
echo "✅ Claimed task:"
echo "   $TASK_TEXT"
echo ""
echo "🔒 Lock: [$AGENT_ID] @ $TIMESTAMP"
echo ""
echo "📋 Next steps:"
echo "   1. Start TDD: ./scripts/test.sh --watch"
echo "   2. Implement: Follow RED → GREEN → REFACTOR"
echo "   3. Complete: ./scripts/task-complete.sh"
echo ""
echo "💡 Tip: Use /task-status to see your active work"
