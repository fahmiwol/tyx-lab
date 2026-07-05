const { chat } = require('@tiranyx/ai-router');
const reply = await chat({
  prompt: 'Explain quantum computing',
  maxTokens: 256
});
console.log(reply.text, reply.provider);