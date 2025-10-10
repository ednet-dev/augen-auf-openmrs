#!/bin/bash
# Pre-commit cleanup script
# Removes ephemeral agent files and temporary artifacts
# Usage: ./scripts/agent-cleanup.sh [--dry-run]

DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE: Showing what would be deleted"
  echo ""
fi

echo "🧹 Cleaning up ephemeral files..."

# Patterns to clean
PATTERNS=(
  "*.tmp.md"
  "*.wip.md"
  "*.bak"
  ".agent/*/BACKLOG.md"
  ".agent/*/scratch/*"
  ".agent_id"
  "*.log"
  ".DS_Store"
)

FOUND=0

for pattern in "${PATTERNS[@]}"; do
  while IFS= read -r -d '' file; do
    FOUND=1
    if [ "$DRY_RUN" = true ]; then
      echo "Would delete: $file"
    else
      echo "Deleting: $file"
      rm -f "$file"
    fi
  done < <(find . -name "$pattern" -type f -print0 2>/dev/null)
done

# Clean empty .agent directories
if [ -d ".agent" ]; then
  while IFS= read -r -d '' dir; do
    if [ "$DRY_RUN" = true ]; then
      echo "Would remove empty directory: $dir"
    else
      echo "Removing empty directory: $dir"
      rmdir "$dir" 2>/dev/null || true
    fi
  done < <(find .agent -type d -empty -print0 2>/dev/null)
fi

if [ $FOUND -eq 0 ]; then
  echo "✨ No ephemeral files found - workspace is clean"
else
  if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "Run without --dry-run to actually delete these files"
  else
    echo "✅ Cleanup complete"
  fi
fi

exit 0
