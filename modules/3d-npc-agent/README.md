# 3d-npc-agent

3D isometric NPC agent with random wander, state machine (idle/walking/working), and optional behavior tree integration.

## Features

- **State machine**: idle → walking → working cycles
- **Random wander**: stays within `wanderRadius` of home position
- **Customizable appearance**: color, hair color, role
- **Movement physics**: smooth interpolation toward target
- **Behavior tree ready**: `behaviorTreeId` for external orchestration
- **World-aware**: respects room walkability via `isInBounds()`

## Usage

```js
import { Agent } from './Agent.js';

const agentDef = {
  id: 'npc-001',
  name: 'Village Baker',
  role: 'Baker',
  color: '#e74c3c',
  hairColor: '#8b4513',
  startX: 10,
  startY: 5,
  wanderRadius: 4,
  behaviorTreeId: 'bt-baker-routine'
};

const agent = new Agent(agentDef, room);

// Each frame:
agent.update(deltaTime);
const pos = agent.getRenderPos(); // { x, y, z }
```

## State Transitions

```
idle (2-5s)
  ↓ (70% wander, 30% stay)
walking (move toward target)
  ↓ (reach target)
working (3-8s activity)
  ↓
idle
```

## Connect to Workflow

Set `agentId` (different from `id`) to link to an external agent system:
```js
const agentDef = {
  id: 'world-npc-001',
  agentId: 'workflow.baker-001', // for API ledger
  ...
};
```

Production upgrade: hook `state` changes to emit events for behavior trees or external orchestrators.

*Open source — use it wisely.*
