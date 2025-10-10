---
description: Start dev server and monitor browser for feedback
argument-hint: (none)
allowed-tools: Bash(yarn start), Bash(lsof*), Bash(kill*)
model: sonnet
---

# Dev Watch - Browser Feedback Loop

**Purpose**: Ensure fresh dev server running, monitor browser, collect feedback

**Arguments**: None

STARTER_SYMBOL=👁️

---

## Process

### 1. Check Existing Dev Server

```bash
# Check if port 8080 is in use (OpenMRS default)
PORT_PID=$(lsof -ti:8080 || echo "")

if [ -n "$PORT_PID" ]; then
  echo "⚠️  Dev server already running (PID: $PORT_PID)"
  echo "Kill and restart? (y/n)"
  # Wait for user input
  # If yes: kill $PORT_PID
fi
```

### 2. Start Fresh Dev Server

```bash
echo "🚀 Starting OpenMRS dev server..."
yarn start &
DEV_PID=$!

# Wait for server ready
echo "Waiting for dev server... (30 seconds)"
sleep 30

# Check if process still running
if ps -p $DEV_PID > /dev/null; then
  echo "✅ Dev server running (PID: $DEV_PID)"
  echo "📍 URL: http://localhost:8080/openmrs/spa/augen-auf"
else
  echo "❌ Dev server failed to start"
  exit 1
fi
```

### 3. Monitor Instructions

```markdown
## Browser Feedback Loop Active

**Dev Server**: Running (PID: $DEV_PID)
**URL**: http://localhost:8080/openmrs/spa/augen-auf
**Hot Reload**: Enabled

### Your Workflow:

1. **Open browser** → Navigate to URL above
2. **Make code changes** → Save files
3. **Watch browser** → See hot reload
4. **Report feedback**: Tell agent what you see

### Report Format:

"Browser shows: [what you see]"
"Expected: [what should happen]"
"Issue: [problem description]"

Agent will adjust code based on your feedback.

### Examples:

✅ "Browser shows bilateral form, left/right sections rendered"
   → Agent: Great, continuing

⚠️  "Browser shows error: 'validateBCVA is not defined'"
   → Agent: Will add missing validation

❌ "Browser shows blank page, console error: Cannot read property 'bcva'"
   → Agent: Will add null handling
```

### 4. Feedback Collection Loop

```markdown
**Agent monitors for**:
- User messages starting with "Browser shows:"
- User reports about UI/UX issues
- Console errors mentioned by user
- Performance feedback

**Agent actions**:
- Fix reported issues
- Re-run tests
- Verify fix in tests
- Ask user to check browser again
```

---

## Dev Server Management

### Restart Server

```bash
# Kill existing
kill $DEV_PID

# Start fresh
yarn start &
```

### Check Server Health

```bash
# Check port
lsof -ti:8080

# Check process
ps aux | grep "yarn start"

# Check logs
# yarn start outputs to terminal
```

---

## Browser Feedback Protocol

### User Reports Issue

```
User: "Browser shows error: Cannot read property 'left' of undefined"
```

**Agent Response**:
1. Identify source file from stack trace
2. Add null check
3. Write test for null handling
4. Run tests
5. Ask: "Please refresh browser - should show bilateral form now"

### User Confirms Fix

```
User: "Browser now shows form correctly"
```

**Agent Response**:
1. Mark issue resolved
2. Continue with next feature
3. Document fix in TDD_LOG.md

### User Requests Adjustment

```
User: "BCVA input should show 2 decimal places, currently shows 4"
```

**Agent Response**:
1. Update input formatting
2. Write test for decimal precision
3. Run tests
4. Ask: "Please check browser - BCVA should now show 0.00 format"

---

## Integration with TDD Workflow

```bash
# 1. Start dev server
/dev-watch

# 2. Write failing test (RED)
/tdd-red validateBCVA

# 3. Implement code (GREEN)
/tdd-green validateBCVA

# 4. Check browser
Agent: "Please check browser - BCVA validation should now show errors for invalid values"

# 5. User confirms
User: "Looks good, error message shows correctly"

# 6. Quality gate
/quality-gate

# 7. Commit
```

---

## Auto-Restart Scenarios

**Agent restarts dev server when**:
- User reports blank page (possible crash)
- Port conflicts detected
- Webpack compilation errors
- Memory issues

**Agent asks before restart**:
```
"⚠️  Dev server may have crashed. Restart? (y/n)"
```

---

## Output

Dev server: Running
URL: http://localhost:8080/openmrs/spa/augen-auf
Hot reload: Enabled
Feedback loop: Active
