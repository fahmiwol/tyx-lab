# Raycaster Object Picker

Three.js mouse/touch 3D object selection via raycasting.

## Features

- **Click-to-pick**: Left-click or tap on 3D objects to select them.
- **Hover highlighting**: Optional auto-highlight on hover with configurable color.
- **Event-driven**: pick, hover, unhover callbacks.
- **Material preservation**: Saves and restores original colors without mangling material state.
- **Touch support**: Works on mobile and desktop.
- **Custom tags**: Mark objects as pickable via userData tag.

## Usage

```javascript
import { RaycastPicker } from './index.js';

const picker = new RaycastPicker(camera, scene, {
  enableHover: true,
  hoverColor: 0x00ff00  // Green on hover
});

picker.on('pick', (obj) => {
  console.log('Selected:', obj.name);
  // Open dialog, play animation, etc.
});

picker.on('hover', (obj) => {
  console.log('Hovering:', obj.name);
});

picker.on('unhover', (obj) => {
  console.log('Left:', obj.name);
});

// Mark objects as pickable:
const npc = new THREE.Mesh(...);
npc.userData.pickable = true;
scene.add(npc);

// In render loop:
// picker.update() is automatic, but you can query state:
const hovered = picker.getHovered();
const selected = picker.getPicked();
```

## Marking Objects as Pickable

```javascript
obj.userData.pickable = true;  // Default tag
// or
obj.userData.interactable = true;
picker.setPickableTag('interactable');
```

## Performance

Raycasting is fast for reasonably-sized scenes (< 10k objects). For very large scenes, use frustum culling or spatial partitioning to reduce raycast targets.

## Limitations

- Only works with renderers that support raycasting (Three.js WebGL, Canvas).
- Raycast origin is camera position; works best with perspective cameras.
- Transparency and semi-transparent materials don't block raycasts by default (use appropriate material properties).

*Open source — use it wisely.*
