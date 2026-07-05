// Agentic Framework - Core Agent Implementation

class Agent {
  constructor({ model, tools, systemPrompt, memory, maxIterations = 10 }) {
    this.model = model;
    this.tools = tools;
    this.systemPrompt = systemPrompt;
    this.memory = memory || new ConversationMemory();
    this.maxIterations = maxIterations;
  }

  async run(task) {
    const messages = [{ role: 'system', content: this.systemPrompt }];
    messages.push({ role: 'user', content: task });

    for (let i = 0; i < this.maxIterations; i++) {
      const response = await this.callLLM(messages);
      
      if (response.type === 'action') {
        const toolName = response.tool;
        const args = response.args;
        
        if (!this.tools.has(toolName)) {
          messages.push({ role: 'assistant', content: `Unknown tool: ${toolName}` });
          continue;
        }

        try {
          const result = await this.tools.execute(toolName, args);
          messages.push({
            role: 'user',
            content: `Tool result: ${JSON.stringify(result)}`
          });
        } catch (error) {
          messages.push({
            role: 'user',
            content: `Tool error: ${error.message}`
          });
        }
      } else if (response.type === 'response') {
        return { response: response.text, thoughts: messages };
      }
    }

    return { response: 'Max iterations reached', thoughts: messages };
  }

  async callLLM(messages) {
    // Implementation depends on LLM provider (OpenAI, Anthropic, etc.)
    const response = await fetch('/api/llm/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages })
    });
    return await response.json();
  }
}

class ConversationMemory {
  constructor(maxSize = 100) {
    this.messages = [];
    this.maxSize = maxSize;
  }

  add(message) {
    this.messages.push(message);
    if (this.messages.length > this.maxSize) {
      this.messages.shift();
    }
  }

  getAll() {
    return this.messages;
  }
}

class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(toolDef) {
    this.tools.set(toolDef.name, toolDef);
  }

  has(name) {
    return this.tools.has(name);
  }

  async execute(name, args) {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    return await tool.execute(args);
  }
}

export { Agent, ToolRegistry, ConversationMemory };
