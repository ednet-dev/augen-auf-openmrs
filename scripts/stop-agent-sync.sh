#!/bin/bash
# Stop the background sync daemon

SYNC_PID_FILE=".agent_sync.pid"

if [ ! -f "$SYNC_PID_FILE" ]; then
  echo "⚠️  Sync daemon is not running (no PID file found)"
  exit 1
fi

PID=$(cat "$SYNC_PID_FILE")

if ps -p $PID > /dev/null 2>&1; then
  echo "🛑 Stopping sync daemon (PID: $PID)..."
  kill $PID
  rm -f "$SYNC_PID_FILE"
  echo "✅ Sync daemon stopped"
else
  echo "⚠️  Process $PID not found (may have already stopped)"
  rm -f "$SYNC_PID_FILE"
fi
