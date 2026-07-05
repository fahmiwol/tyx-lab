# Telegram Command Router & Inline Keyboard Builder

Route incoming Telegram messages to command handlers and programmatically build inline keyboards with callback actions.

## Input
- message: Telegram Update object (text, callback_query, etc.)
- handlers: map of { '/command': async (msg, ctx) => {} }

## Output
- handler result; optional InlineKeyboardMarkup for UI buttons

## Example
```javascript
const router = new CommandRouter({
  '/start': async (msg, ctx) => ({
    text: 'Welcome!',
    keyboard: [
      [{ text: 'Button 1', callback_data: 'btn_1' }],
      [{ text: 'Button 2', callback_data: 'btn_2' }]
    ]
  }),
  '/help': async (msg, ctx) => ({ text: 'Help text' })
});

const result = await router.handle(update);
```

See LOGIC.md for routing strategy and keyboard construction.
