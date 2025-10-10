#!/bin/bash
# Sync with upstream to fetch other agents' work
# Runs every 5 minutes in background (use with watch or cron)
# Usage: ./scripts/sync-upstream.sh [--daemon]

set -e

DAEMON_MODE=false
if [ "$1" = "--daemon" ]; then
  DAEMON_MODE=true
fi

sync_once() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔄 Syncing with upstream at $(date '+%Y-%m-%d %H:%M:%S')"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # 1. Fetch all remote changes
  echo "📥 Fetching from origin..."
  if git fetch origin --prune --quiet; then
    echo "✅ Fetch complete"
  else
    echo "❌ Fetch failed"
    return 1
  fi

  # 2. Check if BACKLOG.md has changed upstream
  CURRENT_BRANCH=$(git branch --show-current)
  BACKLOG_CHANGED=false

  if git diff origin/$CURRENT_BRANCH...HEAD --name-only | grep -q "BACKLOG.md"; then
    BACKLOG_CHANGED=true
  fi

  # 3. Check for upstream commits not in local
  BEHIND=$(git rev-list HEAD..origin/$CURRENT_BRANCH --count 2>/dev/null || echo "0")
  AHEAD=$(git rev-list origin/$CURRENT_BRANCH..HEAD --count 2>/dev/null || echo "0")

  echo "📊 Status: $BEHIND commits behind, $AHEAD commits ahead"

  # 4. Pull if behind and no local changes
  if [ "$BEHIND" -gt 0 ]; then
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
      echo "⚠️  WARNING: Uncommitted local changes detected"
      echo "   Stash your changes or commit before pulling"
      echo "   Run: git stash && git pull && git stash pop"
      return 1
    fi

    echo "⬇️  Pulling $BEHIND new commits..."
    if git pull origin $CURRENT_BRANCH --rebase --quiet; then
      echo "✅ Pull complete"

      # 5. If BACKLOG changed, show summary
      if [ "$BACKLOG_CHANGED" = true ]; then
        echo ""
        echo "📋 BACKLOG.md updated by other agents:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        git log -1 --pretty=format:"  Author: %an%n  Date: %ar%n  Message: %s" origin/$CURRENT_BRANCH -- BACKLOG.md
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Review BACKLOG.md for newly completed tasks or conflicts"
      fi
    else
      echo "❌ Pull failed - resolve conflicts manually"
      return 1
    fi
  else
    echo "✅ Already up to date"
  fi

  # 6. Show recently completed tasks from other agents
  echo ""
  echo "📝 Recent activity from other agents:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Show commits from last 5 minutes
  git log --since="5 minutes ago" --pretty=format:"  %h %an: %s" --all | head -5 || echo "  (no recent activity)"
  echo ""

  # 7. Check for stale locks (>15 min old) in BACKLOG
  if [ -f "BACKLOG.md" ]; then
    STALE_LOCKS=$(grep -E "🔒 \[AGENT-[0-9]+\]" BACKLOG.md | wc -l || echo "0")
    if [ "$STALE_LOCKS" -gt 0 ]; then
      echo ""
      echo "⚠️  Found $STALE_LOCKS locked tasks in BACKLOG.md"
      echo "   Review for stale locks (>15 min = can be reclaimed)"
    fi
  fi

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
}

# Daemon mode: sync every 5 minutes
if [ "$DAEMON_MODE" = true ]; then
  echo "🤖 Starting sync daemon (every 5 minutes)"
  echo "   Press Ctrl+C to stop"
  echo ""

  while true; do
    sync_once || echo "⚠️  Sync failed - will retry in 5 minutes"
    sleep 300  # 5 minutes
  done
else
  # Single sync
  sync_once
fi
