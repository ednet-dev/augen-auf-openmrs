#!/bin/bash
# task-complete.sh - Mark task complete with quality gate + cleanup
# Usage: ./scripts/task-complete.sh [--skip-quality-gate]

set -euo pipefail

BACKLOG="BACKLOG.md"
AGENT_ID_FILE=".agent_id"
SKIP_QG="${1:-}"

[[ ! -f "$BACKLOG" ]] && echo "❌ BACKLOG.md not found" && exit 1
[[ ! -f "$AGENT_ID_FILE" ]] && echo "❌ No agent ID found. Claim a task first." && exit 1

AGENT_ID=$(cat "$AGENT_ID_FILE")

# Find locked task for this agent
LOCKED_LINE=$(grep -n "^- \[ \] 🔒 \[$AGENT_ID\]" "$BACKLOG" | head -1 || true)

if [[ -z "$LOCKED_LINE" ]]; then
  echo "❌ No locked task found for $AGENT_ID"
  echo ""
  echo "Current locks in BACKLOG:"
  grep "🔒" "$BACKLOG" || echo "  (none)"
  exit 1
fi

LINE_NUM=$(echo "$LOCKED_LINE" | cut -d: -f1)
TASK_LINE=$(echo "$LOCKED_LINE" | cut -d: -f2-)

# Extract task text (remove lock prefix)
TASK_TEXT=$(echo "$TASK_LINE" | sed -E 's/^- \[ \] 🔒 \[AGENT-[0-9]+\] [0-9T:Z-]+ //')

echo "📋 Completing task:"
echo "   $TASK_TEXT"
echo ""

# Run quality gate (unless skipped)
if [[ "$SKIP_QG" != "--skip-quality-gate" ]]; then
  echo "🔍 Running quality gate..."

  if [[ -x "./scripts/quality-gate.sh" ]]; then
    if ! ./scripts/quality-gate.sh; then
      echo ""
      echo "❌ Quality gate failed. Fix issues before completing."
      echo ""
      echo "Run manually: ./scripts/quality-gate.sh"
      echo "Skip check: $0 --skip-quality-gate (not recommended)"
      exit 1
    fi
    echo "✅ Quality gate passed"
  else
    echo "⚠️  quality-gate.sh not found, skipping checks"
  fi
else
  echo "⚠️  Skipping quality gate (not recommended)"
fi

echo ""

# Run cleanup
echo "🧹 Running cleanup..."
if [[ -x "./scripts/agent-cleanup.sh" ]]; then
  ./scripts/agent-cleanup.sh
  echo "✅ Cleanup complete"
else
  echo "⚠️  agent-cleanup.sh not found, skipping"
fi

echo ""

# Update BACKLOG: change [ ] to [x], remove lock, keep agent ID
COMPLETE_LINE="- [x] ✅ [$AGENT_ID] $TASK_TEXT"

cp "$BACKLOG" "${BACKLOG}.bak"

if sed -i.tmp "${LINE_NUM}s|.*|$COMPLETE_LINE|" "$BACKLOG" 2>/dev/null; then
  rm -f "${BACKLOG}.tmp"
elif sed -i '' "${LINE_NUM}s|.*|$COMPLETE_LINE|" "$BACKLOG" 2>/dev/null; then
  # macOS sed
  true
else
  echo "❌ Failed to update BACKLOG.md"
  mv "${BACKLOG}.bak" "$BACKLOG"
  exit 1
fi

rm -f "${BACKLOG}.bak"

echo "✅ Task marked complete!"
echo ""
echo "📋 Summary:"
echo "   Agent: $AGENT_ID"
echo "   Task: $TASK_TEXT"
echo ""
echo "📌 Next steps:"
echo "   1. Review changes: git status"
echo "   2. Commit: git commit -m \"Add <feature> to <achieve value>\""
echo "   3. Find next: ./scripts/task-next.sh"
echo ""
echo "💡 Tip: Follow commit format: {Action} {what} to {achieve value}"
