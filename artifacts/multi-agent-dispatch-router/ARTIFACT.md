# Multi-Agent Intent-Based Dispatch Router

**Problem:** Systems with many AI agents need a way to route user requests to the right specialist. Without routing logic, either:
- Every request goes to one LLM (slow, expensive, wrong persona)
- User must know which agent to ask (bad UX)
- Each agent polls for work (fragmented, wasteful)

**Solution:** A dispatcher that detects user intent and routes to the best agent. Pattern: regex patterns for quick routing + LLM fallback for complex intent.

## Core Pattern

### 1. Agent Registry

Define all available agents with metadata:

```javascript
// server/agent-registry.js (CommonJS)

var agents = {
  researcher: {
    name: 'Trendi',
    description: 'Trending research, market analysis',
    intents: ['riset', 'research', 'market', 'trend', 'kompetitor'],
    endpoint: '/api/agents/trendi/command',
    model: 'claude-opus'
  },
  writer: {
    name: 'Kalinda',
    description: 'Content creation, copywriting',
    intents: ['tulis', 'write', 'konten', 'content', 'copy'],
    endpoint: '/api/agents/kalinda/command',
    model: 'claude-sonnet'
  },
  strategist: {
    name: 'Hafiz',
    description: 'Strategy, planning, workflow',
    intents: ['plan', 'strategy', 'workflow', 'organize', 'roadmap'],
    endpoint: '/api/agents/hafiz/command',
    model: 'claude-opus'
  }
};

function getAgent(agentId) {
  return agents[agentId];
}

module.exports = { agents, getAgent };
```

### 2. Intent Pattern Matching

```javascript
function detectIntent(userText) {
  var text = (userText || '').toLowerCase().trim();
  var patterns = [
    { intent: 'research', keywords: ['riset', 'research', 'trend'] },
    { intent: 'write', keywords: ['tulis', 'write', 'konten'] },
    { intent: 'plan', keywords: ['plan', 'strategy', 'workflow'] }
  ];
  
  for (var i = 0; i < patterns.length; i++) {
    var pattern = patterns[i];
    for (var j = 0; j < pattern.keywords.length; j++) {
      if (text.indexOf(pattern.keywords[j]) >= 0) {
        return pattern.intent;
      }
    }
  }
  return 'general';
}

module.exports = { detectIntent };
```

### 3. Router

```javascript
var { detectIntent } = require('./intent-detector');
var { agents } = require('./agent-registry');

function routeToAgent(userText) {
  var intent = detectIntent(userText);
  var agentId = 'general';
  
  if (intent === 'research') agentId = 'researcher';
  else if (intent === 'write') agentId = 'writer';
  else if (intent === 'plan') agentId = 'strategist';
  
  return {
    agentId: agentId,
    agent: agents[agentId],
    intent: intent,
    confidence: intent === 'general' ? 0.5 : 0.9
  };
}

module.exports = { routeToAgent };
```

### 4. Gateway Integration

```javascript
var express = require('express');
var { dispatchRequest } = require('./agent-dispatcher');

var app = express();

app.post('/api/dispatch', async function(req, res) {
  try {
    var userText = req.body.text || '';
    var route = await dispatchRequest(userText);
    
    var agent = route.agent;
    if (!agent) {
      return res.status(400).json({ ok: false, error: 'Agent not found' });
    }
    
    res.json({ 
      ok: true, 
      data: {
        agentId: route.agentId,
        agentName: agent.name,
        intent: route.intent,
        confidence: route.confidence
      }
    });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/agents', function(req, res) {
  var agentList = Object.values(agents).map(function(a) {
    return { name: a.name, description: a.description, intents: a.intents };
  });
  res.json({ ok: true, data: agentList });
});

app.listen(9797);
```

### 5. Client Usage

```javascript
async function onUserMessage(text) {
  const res = await fetch('http://localhost:9797/api/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text })
  });
  
  const data = await res.json();
  if (data.ok) {
    console.log(`Agent: ${data.data.agentName} (${data.data.intent})`);
  }
}
```

## Benefits

1. **Seamless:** User talks to one chat, system routes to best agent
2. **Scalable:** Add new agents without changing dispatcher
3. **Fast:** Pattern matching is instant; LLM fallback only if needed
4. **Observable:** Log intent + confidence per request
5. **Customizable:** Per-agent model, timeout, retry

*Open source — use it wisely.*
