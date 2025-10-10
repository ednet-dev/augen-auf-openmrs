#!/bin/bash
# Start background sync daemon for multi-agent coordination
# This runs sync-upstream.sh every 5 minutes in the background

SYNC_PID_FILE=".agent_sync.pid"

# Check if already running
if [ -f "$SYNC_PID_FILE" ]; then
  OLD_PID=$(cat "$SYNC_PID_FILE")
  if ps -p $OLD_PID > /dev/null 2>&1; then
    echo "⚠️  Sync daemon already running (PID: $OLD_PID)"
    echo "   Stop it first with: ./scripts/stop-agent-sync.sh"
    exit 1
  else
    # Stale PID file, remove it
    rm -f "$SYNC_PID_FILE"
  fi
fi

echo "🚀 Starting multi-agent sync daemon..."

# Start sync daemon in background
nohup ./scripts/sync-upstream.sh --daemon > .agent_sync.log 2>&1 &
SYNC_PID=$!

# Save PID
echo $SYNC_PID > "$SYNC_PID_FILE"

echo "✅ Sync daemon started (PID: $SYNC_PID)"
echo "   Logs: tail -f .agent_sync.log"
echo "   Stop: ./scripts/stop-agent-sync.sh"
echo ""
echo "The daemon will:"
echo "  • Fetch from origin every 5 minutes"
echo "  • Pull new commits automatically"
echo "  • Alert on BACKLOG.md changes"
echo "  • Show recent agent activity"
