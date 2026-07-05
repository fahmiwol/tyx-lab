defineSkill({
  name: 'visual_design',
  description: 'Create visual design concepts with mood boards and color palettes',
  params: {
    topic: { type: 'string', description: 'Design topic or brief' },
    style: { type: 'string', enum: ['modern', 'vintage', 'minimalist'] }
  },
  handler: async (params) => {
    // implementation
    return { designs: [...] };
  }
});