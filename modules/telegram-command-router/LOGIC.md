# Telegram Command Router — Why This Exists

## The Problem

Telegram bots process incoming messages in many formats:
- Text commands (`/start`, `/help`)
- Callback queries (user clicks inline button)
- Regular text (context-dependent routing)
- Inline queries (bot mentioned in chat)

Without a routing abstraction, handlers become:
- Giant if/else or switch chains
- Scattered across files (message handler here, callback handler there)
- Duplicated button-building logic (copy-paste InlineKeyboardMarkup code)
- Hard to test (mock Telegram API deeply)

## The Solution: Declarative Router + Keyboard Builder

1. **Unified routing** — one place to register all command handlers
2. **Handler map** — { '/command': handler_fn } makes intent clear
3. **Async pipeline** — each handler can await external calls (DB, API)
4. **Keyboard builder** — fluent API for inline buttons, no manual JSON
5. **Context object** — handler receives userId, chatId, metadata automatically

## Why This Shape

### Handlers: { '/command': async (msg, ctx) => {} }
- Clear intent (command name is the key)
- Async-first (most handlers need to call APIs)
- Context includes userId, chatId, message history (if stored)
- Return value = Telegram update to send back

### Callback query handling
- Same router processes callback_query as text command
- Button action names are typically `action_param_param` (e.g., `delete_task_123`)
- Router extracts the action and routes to a `.on('callback:action', handler)` chain

### Keyboard builder
```javascript
new InlineKeyboard()
  .button('Label 1', 'callback_1')
  .button('Label 2', 'callback_2')
  .row()  // new row
  .button('Label 3', 'callback_3')
  .build()  // → InlineKeyboardMarkup
```

Better than:
```javascript
{
  inline_keyboard: [
    [{ text: 'Label 1', callback_data: 'callback_1' }, { text: 'Label 2', callback_data: 'callback_2' }],
    [{ text: 'Label 3', callback_data: 'callback_3' }]
  ]
}
```

## Trade-offs

✅ **Pros**
- Single entry point for all message types
- Testable (mock msg, ctx; no HTTP)
- Keyboard API is fluent (readable code)
- Error handling centralized (router catches, sends "Sorry" message)

❌ **Cons**
- Telegram-specific (not portable to Discord/Slack bots)
- Requires handler registration at startup (not hot-reload friendly)
- Callback data limited to 64 bytes (must compress action IDs)

## How to Extend

### Middleware:
```javascript
router.use(async (update, next) => {
  // log all updates
  console.log('Incoming:', update.message?.text);
  return next(update);
});
```

### Permissions:
```javascript
router.use(requireUser('admin'), async (update, next) => {
  // only allow admins past this point
  return next(update);
});

router.on('/secret', async (msg, ctx) => {
  return { text: 'Admin command' };
});
```

---

Open source — use it wisely.
