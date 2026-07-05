import { WorldLite } from './world-renderer.js';

const world = new WorldLite(document.getElementById('viewport'), {
  mode: 'view',
  bloom: true
});

world.on('paint', ({ tile, color }) => console.log('Floor painted:', tile, color));
world.loadScene(sceneJSON);