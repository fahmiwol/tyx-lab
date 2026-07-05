// Agent Cascade Router: 2-tier LLM dispatch.
// Controller selects tool + executor model; executor does work; result stored in memory.
const { callLLM } = require('./llm');

function controllerPrompt(agent, task, recalled) {
  const toolList = agent.tools.map(t => `- ${t}`).join('\n');
  const memBlock = recalled.length
    ? recalled.map(r => `• [${r.title}] (score ${r.score}): ${r.body.slice(0, 160).replace(/\n/g, ' ')}`).join('\n')
    : '(empty memory)';
  
  return `You are a CONTROLLER for agent "${agent.name}" (${agent.role}).
Your job: pick ONE tool and write a brief for the executor model. DO NOT do the work yourself.

AGENT MEMORY (RAG results):
${memBlock}

AVAILABLE TOOLS:
${toolList}

TASK: ${task}

Reply with valid JSON only:
{
  "thought": "brief reason for tool selection & how to use memory",
  "tool": "<tool name or 'none'>",
  "tool_args": { ... },
  "executor_brief": "concise instruction for the executor model, leverage memory if relevant"
}`;
}

async function routeTask(agent, task, memory, llmConfig) {
  // Recall relevant memory
  const recalled = memory.retrieve(agent.id, task, 3);
  
  // Call controller to decide
  const ctlResult = await callLLM({
    model: agent.controllerModel,
    system: 'You are a task router.',
    user: controllerPrompt(agent, task, recalled),
    json: true,
    temperature: 0.6,
    ...llmConfig
  });
  
  let decision = null;
  try {
    decision = JSON.parse(ctlResult);
  } catch (_) {
    const m = ctlResult.match(/\{[\s\S]*\}/);
    if (m) decision = JSON.parse(m[0]);
  }
  
  if (!decision || decision.tool === 'none') {
    return { ok: false, reason: 'Controller declined task', controller_thought: decision?.thought };
  }
  
  return {
    ok: true,
    agent: agent.name,
    selectedTool: decision.tool,
    toolArgs: decision.tool_args || {},
    executorBrief: decision.executor_brief,
    memory: recalled
  };
}

module.exports = { routeTask, controllerPrompt };
