# Behavior Tree & FSM State Model

Declarative model for NPC behaviors using finite state machines: define states (idle, working, talking), transitions (conditions), and actions (animations, dialog). Serializable and composable.

## Input
- Behavior definition: { states, transitions, initial_state, actions }

## Output
- Validated state machine; ready for runtime interpreter

## Example
```json
{
  "name": "designer-behavior",
  "states": [
    { "id": "idle", "label": "Idle" },
    { "id": "working", "label": "Working on design" },
    { "id": "talking", "label": "Talking with user" }
  ],
  "transitions": [
    { "from": "idle", "to": "working", "condition": "task_assigned" },
    { "from": "working", "to": "idle", "condition": "task_complete" },
    { "from": "working", "to": "talking", "condition": "user_interrupts" }
  ],
  "actions": {
    "idle": { "animation": "idle_loop", "sound": null },
    "working": { "animation": "work_motion", "sound": "typing" },
    "talking": { "animation": "talk_gesture", "sound": "voice_response" }
  },
  "initial_state": "idle"
}
```

See LOGIC.md for state machine design patterns.
