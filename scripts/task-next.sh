#!/bin/bash
# task-next.sh - Find next available task with dependency awareness
# Usage: ./scripts/task-next.sh [--all]

set -euo pipefail

BACKLOG="BACKLOG.md"
SHOW_ALL="${1:-}"

# Validate BACKLOG exists
[[ ! -f "$BACKLOG" ]] && echo "❌ BACKLOG.md not found" && exit 1

# Extract tasks: parses "- [ ] Task" and "- [ ] 🔒 [AGENT-X] Task"
get_unclaimed_tasks() {
  grep -n "^- \[ \]" "$BACKLOG" | grep -v "🔒" || true
}

get_claimed_tasks() {
  grep -n "^- \[ \] 🔒" "$BACKLOG" || true
}

get_completed_tasks() {
  grep -n "^- \[x\]" "$BACKLOG" || true
}

# Extract stream info: "### STREAM X: NAME"
get_stream_info() {
  local line_num=$1
  # Find nearest preceding stream header
  awk -v ln="$line_num" 'NR < ln && /^### STREAM [0-9]+:/ {stream=$0} END {print stream}' "$BACKLOG"
}

# Check if dependencies satisfied (simplified: check if STREAM in deps is locked/completed)
check_dependencies() {
  local stream_section=$1
  # Extract "Dependencies: X, Y" line
  local deps=$(echo "$stream_section" | grep -i "Dependencies:" | head -1 || echo "")

  if echo "$deps" | grep -qi "None"; then
    echo "ready"
    return
  fi

  # Extract dependency stream names (e.g., "INFRA", "DATA")
  local dep_names=$(echo "$deps" | sed -E 's/.*Dependencies: *//i' | tr ',' '\n' | sed 's/[^A-Z-]//g')

  if [[ -z "$dep_names" ]]; then
    echo "ready"
    return
  fi

  # Check if all dependency streams are completed
  for dep in $dep_names; do
    if ! grep -q "### STREAM.*$dep" "$BACKLOG"; then
      continue # Not found, assume satisfied
    fi

    # Check if this stream has uncompleted tasks
    local dep_section=$(awk "/### STREAM.*$dep/,/^###/" "$BACKLOG")
    if echo "$dep_section" | grep -q "^- \[ \]"; then
      echo "blocked:$dep"
      return
    fi
  done

  echo "ready"
}

# Main output
echo "🔍 Next Available Tasks"
echo ""

unclaimed=$(get_unclaimed_tasks)
claimed=$(get_claimed_tasks)
completed=$(get_completed_tasks)

if [[ -z "$unclaimed" ]]; then
  echo "✅ No unclaimed tasks found!"
  echo ""
  echo "📊 Summary:"
  echo "  Claimed: $(echo "$claimed" | wc -l | tr -d ' ')"
  echo "  Completed: $(echo "$completed" | wc -l | tr -d ' ')"
  exit 0
fi

# Parse and display unclaimed tasks
task_num=1
best_task=""
best_task_line=""

while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  line_num=$(echo "$line" | cut -d: -f1)
  task_text=$(echo "$line" | cut -d: -f2- | sed 's/^- \[ \] *//')

  # Get stream context
  stream_info=$(get_stream_info "$line_num")
  stream_name=$(echo "$stream_info" | sed -E 's/### (STREAM [0-9]+: [A-Z-]+).*/\1/')

  # Get full stream section for dependency check
  stream_section=$(awk "/^### STREAM/,/^###/" "$BACKLOG" | awk "/$stream_name/,/^###/")
  dep_status=$(check_dependencies "$stream_section")

  status_icon="✅"
  status_text="Ready"

  if [[ "$dep_status" != "ready" ]]; then
    status_icon="⏸️"
    blocked_dep=$(echo "$dep_status" | cut -d: -f2)
    status_text="Blocked (needs $blocked_dep)"
  fi

  # Show task
  if [[ "$SHOW_ALL" == "--all" ]] || [[ "$dep_status" == "ready" ]]; then
    echo "[$task_num] $status_icon $stream_name"
    echo "    Task: $task_text"
    echo "    Status: $status_text"
    echo ""

    # Track best (first ready task)
    if [[ -z "$best_task" ]] && [[ "$dep_status" == "ready" ]]; then
      best_task=$task_num
      best_task_line=$line_num
    fi

    task_num=$((task_num + 1))
  fi
done <<< "$unclaimed"

# Recommendation
if [[ -n "$best_task" ]]; then
  echo "💡 Recommended: Task #$best_task"
  echo ""
  echo "Claim with:"
  echo "  ./scripts/task-claim.sh $best_task_line"
  echo "  # OR"
  echo "  /claim-task $best_task"
else
  echo "⏸️  All ready tasks claimed. Check back or use --all to see blocked tasks."
fi

echo ""
echo "📊 Summary:"
echo "  Available: $(echo "$unclaimed" | wc -l | tr -d ' ')"
echo "  Active: $(echo "$claimed" | wc -l | tr -d ' ')"
echo "  Done: $(echo "$completed" | wc -l | tr -d ' ')"
