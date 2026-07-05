# Agentic Framework

Lightweight framework for building autonomous agents with tool use and planning.

## Features

- **Tool Registry** — Define and manage agent tools
- **Planning** — Automatic step-by-step task decomposition
- **Memory Management** — Conversation history and state
- **Multi-LLM Support** — OpenAI, Anthropic, local models
- **Extensible** — Custom tools, validators, processors
- **Async-First** — Non-blocking I/O for tool execution

## Setup

```bash
npm install
cp .env.example .env
# Fill in LLM API keys
npm start
```

## Quick Start

```javascript
import { Agent } from "./src/agents/Agent.js";
import { ToolRegistry } from "./src/tools/ToolRegistry.js";

const tools = new ToolRegistry();
tools.register({
  name: "get_weather",
  description: "Get weather for a location",
  async execute(location) {
    return { temp: 72, condition: "sunny" };
  },
});

const agent = new Agent({
  model: "gpt-4",
  tools,
  systemPrompt: "You are a helpful assistant.",
});

const result = await agent.run("What is the weather in Seattle?");
console.log(result);
// { response: "The weather in Seattle is sunny and 72°F.", thoughts: [...] }
```

## Defining Tools

```javascript
tools.register({
  name: "send_message",
  description: "Send a message to a user",
  parameters: {
    user_id: { type: "string", description: "User ID" },
    message: { type: "string", description: "Message text" },
  },
  async execute({ user_id, message }) {
    // implementation
    return { success: true, message_id: "msg_123" };
  },
});
```

## Agent Loop

Agents follow this loop:
1. **Plan** — Break down task into steps
2. **Think** — Decide which tool to use
3. **Act** — Execute tool
4. **Observe** — Process tool result
5. **Reflect** — Update state, repeat or conclude

## Environment

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=gpt-4
MAX_ITERATIONS=10
```

## Advanced

### Custom Memory

```javascript
const agent = new Agent({
  memory: new CustomMemory({
    maxSize: 100,
    strategy: "sliding-window",
  }),
});
```

### Tool Validation

```javascript
tools.register({
  validator: (params) => {
    if (!params.user_id) throw new Error("user_id required");
  },
  // ...
});
```

Open source — use it wisely.