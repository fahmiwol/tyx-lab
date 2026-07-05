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