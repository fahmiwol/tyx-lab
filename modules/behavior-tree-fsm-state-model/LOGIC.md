# Behavior Tree & FSM State Model — Why This Exists

## The Problem

NPC behavior (standing idle, working, talking, reacting) is often hardcoded:
- Agent state scattered across variables (is_working, is_talking, animation_playing)
- Transitions buried in if/else logic (if is_working && task_done → set is_working = false → play_animation)
- No visual representation (impossible to debug NPC behavior without reading code)
- Not serializable (can't save NPC state to JSON and reload)
- Not composable (can't reuse behavior from one NPC in another)

## The Solution: Declarative State Machine

A **simple FSM** where:

1. **States are explicit** — idle, working, talking (no boolean flags)
2. **Transitions are named** — task_assigned, task_complete (events, not timers)
3. **Conditions are clear** — from state A to state B if condition C
4. **Actions are decoupled** — each state maps to animation, sound, particle effect
5. **Serializable** — entire FSM can be JSON; save NPC state, replay later

## Why This Shape (Not Behavior Trees)

**Behavior Trees** (hierarchical task planning) are for complex AI (large state spaces, many priorities). Example: "if no task assigned, wander; if low energy, rest; if enemy nearby, flee; if player talks, respond."

**FSM** (simple state + transition) is for presentational AI (NPC appearance, animation flow). Example: stand idle → start task → work → stop working → resume idle.

We chose FSM because:
- NPC behavior is usually **presentational** (looks good, feels responsive), not strategic
- FSM is **easy to visualize** (draw states as circles, transitions as arrows)
- FSM is **fast** (one hashmap lookup to find next state)
- BT is **overkill** (adds complexity, selector/sequence nodes, priority logic) for animation states

If your NPC needs BT (multi-goal planning, priority arbitration), wrap it: BT executes internally, outputs "state" that FSM consumes.

## Why This Shape

### states: [{ id, label }]
- `id`: unique state identifier (e.g., "idle", "working")
- `label`: human-readable name for UI/debugging

### transitions: [{ from, to, condition }]
- `from`, `to`: state IDs
- `condition`: event name (string, e.g., "task_assigned")
- **No timed delays** (if you need "wait 3s then transition", add a timer state or external timeout)

### actions: { state_id: { animation, sound, effects } }
- `animation`: animation clip name to play while in this state
- `sound`: optional sound effect (loop or one-shot)
- `effects`: optional visual effects (particle, lighting)
- Maps to rendering engine (not runtime logic)

### initial_state: string
- Which state the NPC starts in when loaded

## Trade-offs

✅ **Pros**
- Dead simple (3 JSON objects; no recursion, no priority logic)
- Visual (easily drawn as state diagram)
- Serializable (save & restore NPC state)
- Debuggable (print current state, see why transition didn't fire)
- Fast (O(1) state lookup)

❌ **Cons**
- No hierarchies (can't nest states, unlike BT)
- No priorities (can't interrupt one transition with another)
- No memory of history (if you need "came from this state", track it separately)
- Dumb (no goal-seeking, just react to events)

## How to Extend

### Add hierarchical states (substates):
```json
{
  "id": "working",
  "substates": [
    { "id": "thinking", "label": "Thinking" },
    { "id": "drawing", "label": "Drawing" }
  ],
  "initial_substate": "thinking"
}
```

### Add guarded transitions (condition evaluation):
```json
{
  "from": "working",
  "to": "idle",
  "condition": "task_complete",
  "guard": "task.priority < 5"  // only transition if priority is low
}
```

### Add timed transitions (auto-advance after delay):
```json
{
  "from": "working",
  "to": "idle",
  "condition": "task_complete",
  "timeout_ms": 0  // immediate
}
```

### Add entry/exit actions:
```json
{
  "id": "working",
  "on_enter": { "animation": "work_start" },
  "on_exit": { "animation": "work_end" }
}
```

---

Open source — use it wisely.
