# Express API Gateway Response Wrapper Pattern

**Problem:** Multi-module Node.js backends have inconsistent error handling. Some endpoints return errors with 500 status + stack trace; others return 200 with error nested in body; clients can't reliably detect failures. Debugging requires deep log digging.

**Solution:** Wrap ALL Express endpoint handlers in a try/catch block that enforces a single response shape: `{ok: true, data: ...}` on success, `{ok: false, error: "message"}` on failure. Include logging, error codes, and deterministic HTTP status.

## The Pattern

### 1. Standardized Response Shape

**Success:**
```json
{
  "ok": true,
  "data": {
    "result": "...",
    "id": "...",
    "details": {}
  }
}
```

**Failure:**
```json
{
  "ok": false,
  "error": "User not found",
  "code": "ERR_NOT_FOUND",
  "details": {}
}
```

**HTTP Status:**
- 200: `ok: true`
- 400: `ok: false` + validation/user error
- 500: `ok: false` + server error
- 404: `ok: false` + resource not found

### 2. Try/Catch Wrapper

```javascript
// server/gateway.js (CommonJS)

var express = require('express');
var log = require('./logger'); // or simple console.log

var app = express();

// Endpoint pattern: always try/catch + res.json({ok, data|error})
app.post('/api/xxx/action', async function(req, res) {
  try {
    var body = req.body;
    var result = await someModule.doAction(body);
    res.json({ ok: true, data: result });
  } catch(e) {
    log('xxx action error: ' + e.message, 'warn');
    res.status(500).json({ 
      ok: false, 
      error: e.message,
      code: 'ERR_ACTION_FAILED'
    });
  }
});

// GET endpoint pattern
app.get('/api/xxx/status', async function(req, res) {
  try {
    var status = await someModule.getStatus();
    res.json({ ok: true, data: status });
  } catch(e) {
    log('xxx status error: ' + e.message, 'warn');
    res.status(500).json({ 
      ok: false, 
      error: e.message,
      code: 'ERR_STATUS_FAILED'
    });
  }
});

// Validation error pattern
app.post('/api/xxx/validate', async function(req, res) {
  try {
    var body = req.body;
    if (!body.name) {
      return res.status(400).json({ 
        ok: false, 
        error: 'name is required',
        code: 'ERR_VALIDATION'
      });
    }
    var result = await someModule.validate(body);
    res.json({ ok: true, data: result });
  } catch(e) {
    log('xxx validate error: ' + e.message, 'warn');
    res.status(500).json({ 
      ok: false, 
      error: e.message,
      code: 'ERR_VALIDATE_FAILED'
    });
  }
});
```

### 3. Error Codes Reference

Define a standard error code enum (or doc) at server top:

```javascript
var ERROR_CODES = {
  ERR_NOT_FOUND: 'Resource not found',
  ERR_VALIDATION: 'Validation error',
  ERR_UNAUTHORIZED: 'Unauthorized',
  ERR_FORBIDDEN: 'Forbidden',
  ERR_CONFLICT: 'Resource already exists',
  ERR_TIMEOUT: 'Operation timeout',
  ERR_ACTION_FAILED: 'Action failed',
  ERR_UNKNOWN: 'Unknown error'
};
```

### 4. Client-Side Usage

```javascript
// browser/client code (ES modules)

async function apiCall(endpoint, body) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    
    if (!data.ok) {
      console.error(`API Error (${data.code}): ${data.error}`);
      throw new Error(data.error);
    }
    
    return data.data;
  } catch(e) {
    console.error('Request failed:', e.message);
    throw e;
  }
}

// Usage
try {
  const result = await apiCall('/api/xxx/action', { param: 'value' });
  console.log('Success:', result);
} catch(e) {
  // Show user-friendly error
  alert('Operation failed: ' + e.message);
}
```

### 5. Logging Integration

```javascript
// server/logger.js (optional; or use console.log)

var fs = require('fs');
var path = require('path');

function log(msg, level) {
  level = level || 'info';
  var ts = new Date().toISOString();
  var line = `[${ts}] ${level.toUpperCase()}: ${msg}`;
  
  console.log(line); // stdout
  
  // Optional: write to file
  var logFile = path.join(__dirname, '.data', 'gateway.log');
  try {
    fs.appendFileSync(logFile, line + '\n');
  } catch(e) {
    // Ignore file write errors
  }
}

module.exports = { log };
```

### 6. Optional: Response Wrapper Middleware

For DRY endpoints, create a wrapper middleware:

```javascript
// server/response-wrapper.js

function asyncHandler(fn) {
  return async function(req, res, next) {
    try {
      await fn(req, res, next);
    } catch(e) {
      var log = require('./logger').log;
      log('Unhandled error: ' + e.message, 'error');
      res.status(500).json({ 
        ok: false, 
        error: e.message,
        code: 'ERR_UNKNOWN'
      });
    }
  };
}

module.exports = { asyncHandler };
```

Then use it:

```javascript
var { asyncHandler } = require('./response-wrapper');

app.post('/api/xxx/action', asyncHandler(async function(req, res) {
  var result = await someModule.doAction(req.body);
  res.json({ ok: true, data: result });
}));
```

## Benefits

1. **Consistent:** Every endpoint has predictable response shape
2. **Debuggable:** Error codes + messages in every failure
3. **Testable:** Client code can check `data.ok` once, not per-endpoint
4. **Auditable:** Logging layer captures all API calls with timestamps
5. **Graceful degradation:** Unhandled exceptions return proper error JSON, not HTML stack trace

## Anti-Patterns to Avoid

❌ Mixed response shapes: some endpoints return `{result}`, others return `{data}`, others return error HTML  
✅ Consistent: all return `{ok, data|error}`

❌ Swallowed errors: `catch(e) { res.json({}); }` (lose the error message)  
✅ Explicit: `catch(e) { res.json({ok:false, error: e.message}); }`

❌ Wrong HTTP status: 200 on error because body says `ok:false`  
✅ Correct: 400/500/404 status codes + `ok:false` body

❌ No error codes: only `error: "Something failed"`  
✅ Coded: `error: "...", code: "ERR_SOMETHING_FAILED"`

*Open source — use it wisely.*
