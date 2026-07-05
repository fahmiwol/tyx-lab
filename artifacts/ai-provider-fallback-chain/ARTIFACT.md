# AI Provider Fallback Chain with Circuit Breaker

**Problem:** Calls to a single LLM provider (OpenAI, Anthropic, etc.) fail due to:
- Rate limit reached
- API key expired
- Provider down/degraded
- Request timeout
Result: entire app breaks, no graceful fallback.

**Solution:** Fallback chain with circuit breaker:
Primary (Claude) → Secondary (OpenAI) → Tertiary (Mistral/Ollama)

Failed provider is skipped for cooldown period via circuit breaker.

## Chain Pattern

Providers (in order):
1. **Anthropic** (primary) - claude-opus
2. **OpenAI** (secondary) - gpt-4
3. **Mistral** (tertiary) - mistral-large
4. **Ollama** (local fallback) - neural-chat

Each provider has: model, apiKey, timeout, endpoint

## Core Implementation

### Provider Registry

var providers = {
  anthropic: { model: 'claude-opus', key: process.env.ANTHROPIC_KEY, timeout: 30000 },
  openai: { model: 'gpt-4', key: process.env.OPENAI_KEY, timeout: 30000 },
  mistral: { model: 'mistral-large', key: process.env.MISTRAL_KEY, timeout: 30000 },
  ollama: { model: 'neural-chat', endpoint: 'http://localhost:11434', timeout: 60000 }
};

### Fallback Function

async function callWithFallback(prompt) {
  var providers = ['anthropic', 'openai', 'mistral', 'ollama'];
  
  for (var i = 0; i < providers.length; i++) {
    var provider = providers[i];
    
    if (circuitBreaker.isOpen(provider)) {
      continue; // Skip if breaker open
    }
    
    try {
      var result = await callProvider(provider, prompt);
      circuitBreaker.recordSuccess(provider);
      return result;
    } catch(e) {
      circuitBreaker.recordFailure(provider);
      console.warn('Provider ' + provider + ' failed, trying next...');
    }
  }
  
  throw new Error('All providers failed');
}

### Circuit Breaker

class CircuitBreaker {
  constructor() {
    this.state = {}; // { [provider]: {state, failureCount, openedAt} }
  }
  
  isOpen(provider) {
    var status = this.state[provider] || { state: 'closed', failureCount: 0 };
    
    if (status.state === 'open') {
      if (Date.now() - status.openedAt > 60000) { // 60s cooldown
        this.state[provider].state = 'half-open';
        return false; // Try once in half-open
      }
      return true;
    }
    return false;
  }
  
  recordFailure(provider) {
    if (!this.state[provider]) {
      this.state[provider] = { state: 'closed', failureCount: 0, openedAt: null };
    }
    this.state[provider].failureCount++;
    
    if (this.state[provider].failureCount >= 3) {
      this.state[provider].state = 'open';
      this.state[provider].openedAt = Date.now();
    }
  }
  
  recordSuccess(provider) {
    this.state[provider] = { state: 'closed', failureCount: 0, openedAt: null };
  }
}

### Per-Provider Adapters

async function callAnthropicAPI(prompt) {
  var Anthropic = require('@anthropic-ai/sdk');
  var client = new Anthropic();
  var res = await client.messages.create({
    model: 'claude-opus',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  });
  return res.content[0].text;
}

async function callOpenAIAPI(prompt) {
  var OpenAI = require('openai');
  var client = new OpenAI();
  var res = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  return res.choices[0].message.content;
}

### Endpoint

app.post('/api/generate', async function(req, res) {
  try {
    var prompt = req.body.prompt;
    var result = await aiConnector.callWithFallback(prompt);
    res.json({ ok: true, data: { result: result } });
  } catch(e) {
    res.status(500).json({ ok: false, error: 'All providers failed: ' + e.message });
  }
});

## Benefits
1. Zero downtime: provider fails → seamless fallback
2. Cost optimization: use cheap providers (Ollama) when possible
3. Circuit breaker: prevent cascade failures
4. Logging: track which provider used (audit trail)
5. Transparent: app logic doesn't know which provider ran

## Anti-Patterns
❌ All-or-nothing: primary fails → crash
✅ Graceful: primary fails → secondary → tertiary → local

*Open source — use it wisely.*
